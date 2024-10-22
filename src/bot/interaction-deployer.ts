import fs from 'node:fs'
import path from 'node:path'
import 'colors'
import { dirname, fromFileUrl } from "path/mod.ts";

import { REST, Routes } from 'discord.js';
import type Command  from './utils/classes/Command.ts';
import type { CommandData } from './utils/types/Command.ts';

import 'dotenv/config'

const args = Deno.args;
const isTesting = args.includes('--test');
const token = isTesting ? Deno.env.get("TESTING_TOKEN") : Deno.env.get("BOT_TOKEN");
const clientId = isTesting ? Deno.env.get("TESTING_CLIENT_ID") : Deno.env.get("BOT_ID");
const __dirname = dirname(fromFileUrl(import.meta.url))

const categoriesPath = path.join(__dirname, 'commands');
const commands: CommandData[] = [];

for (const categorie of fs.readdirSync(categoriesPath)) {
  const commandsPath = path.join(__dirname, 'commands', categorie);

  for (const file of fs.readdirSync(commandsPath)) {
    const filePath = path.join(commandsPath, file);
    const command: Command = (await import(filePath)).default;
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