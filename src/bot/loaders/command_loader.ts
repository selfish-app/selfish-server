import 'dotenv/config'
import * as fs from 'node:fs'
import path from 'node:path'
import Command from '../utils/classes/Command';
import { CommandType } from '../utils/types/Command';

import { Bot } from '../utils/classes/Bot';
import { validatePermissions } from '../utils/functions/validatePermissions';
const baseBot = Bot.getBaseInstance();

// Rest of your code

export async function loadCommands(bot = baseBot) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandCategories = fs.readdirSync(commandsPath);

  /**
   * Extracting first the categories, this is unefficient but 
   * its in order to log the importation of each commands easily
   */
  console.log('Loading commands'.bgCyan);
  for (const category of commandCategories) {
    console.log(`--> ${category}`.white);
    const categoryPath = path.join(commandsPath, category);
    await loadCommandsFromDir(categoryPath, bot);

  }
}

export async function loadCommandsFromDir(dirPath: string, bot: Bot = baseBot) {
  const commandFiles = fs.readdirSync(dirPath).filter(x => x.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(dirPath, file);
    await loadSingleCommand(filePath);
  }
}

export async function loadSingleCommand(filePath: string, bot = baseBot) {
  const file = path.basename(filePath);
  const dirPath = path.dirname(filePath);
  const command: Command = (await import(filePath)).default;
    if ((command as any).isBuilder) {
      // should i do command = command.build() and catch the error instead?
      console.error(
        `ERROR: ${file} exported a command builder but not a command. Do .build() or export a real Command object`.red
      )
    }
    const category = path.basename(dirPath);
    command.category = category;
    command.file = filePath;

    // FIRST, CHECK THERE IS NO EXISTING COMMAND WITH THE NAME, CZ IT WOULD OVERWRITE
    if (bot.commands.find(
      (_, name) => name == command.name || name == command.data?.name)
    ) {
      console.error(
        'ERROR name coinsidence. There was found more than one commands with equals names on different files.' +
        '\nThis could provoke different errors. The file was ' + filePath.red)
      return;
    }

    // SECOND, CHECK THERE ARE NO ALIASES WITH THE SAME NAME CZ IT WOULD OVERWRITE
    if (
      command.settings?.aliases?.some(alias =>
        bot.commands.find(
          (cmd, name) => name == alias || cmd.settings?.aliases?.includes(alias)
        )
      )
    ) {
      console.error(
        'ERROR alias coinsidence. This command has an alias already used as name or alias for another command.' +
        '\nThe command in fact is in the file ' + filePath.red
      );
      return;
    }

    // THIRD, CHECK THE PERMISSIONS NAMES ARE CORRECT FOR COMMANDS THAT REQUIRES THEM
    if (command.settings?.permissions?.length) {
      // todo: instead of using strings, maybe use PermissionFlagsBits
      validatePermissions(command.settings.permissions); // throws an error if the name of the permissions is not valid
    }


    // IMPORT THE COMMAND PROPERLY + ALIASES
    if (command.name) {
      bot.commands.set(command.name, command);
      if (command.settings?.aliases) {
        command.settings.aliases.forEach(alias => bot.aliases.set(alias, command.name!))
      }
    }

    // SCRAPPED: command.data?.name && (!command.name || command.data.name == command.name)
    if (command.data?.name) {
      bot.commands.set(command.data.name, command);
    }


    // LOG MESSAGE
    let loadMessage: string;

    switch (command.type()) {
      case CommandType.HYBRID:
        loadMessage = `\t${command.name} & /${command.data!.name} [${command.type()}]`.green;
        break;
      case CommandType.MESSAGE:
        loadMessage = `\t${command.name} [${command.type()}]`.blue;
        break;
      case CommandType.SLASH:
        loadMessage = `\t${command.data?.name} [${command.type()}]`.blue;
        break;
      case CommandType.INVALID:
        loadMessage = `\t${file} [${command.type()}]`.yellow;
        break;
    }

    console.log(loadMessage);
    if (command.settings?.aliases)
      console.log("\t  · Aliases: " + command.settings.aliases.join(" | "))

    return command;

}