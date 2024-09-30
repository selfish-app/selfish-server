import fs from 'node:fs'
import path from 'node:path'
import 'colors'

import { REST, Routes } from 'discord.js';
import  Command  from './utils/classes/Command';
import { CommandData } from './utils/types/Command';

import 'dotenv/config'

const args = process.argv.slice(2);
const isTesting = args.includes('--test');
const token = isTesting ? process.env.TESTING_TOKEN : process.env.BOT_TOKEN;
const clientId = isTesting ? process.env.TESTING_CLIENT_ID : process.env.BOT_ID;

const categoriesPath = path.join(__dirname, 'commands');
const commands: CommandData[] = [];

for (const categorie of fs.readdirSync(categoriesPath)) {
  const commandsPath = path.join(__dirname, 'commands', categorie);

  for (const file of fs.readdirSync(commandsPath)) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath).default;
    if (command.supportsSlashCommand()) {
      commands.push(command.data!);
      console.log(`\tDone: ${categorie + '/' + command.data!.name}`.green);
    } else {
      console.log(`[WARNING] The command at ${filePath} doesnt support slash commands`.yellow);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token!);

// Deploy commands
(async () => {
  try {
    console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set

    const data = await rest.put(
      Routes.applicationCommands(clientId!),
      { body: commands },
    ) as typeof commands; // I dont like casting, but this seemed fair for me

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // Catch and log any errors!
    console.error(error);
  }
})();