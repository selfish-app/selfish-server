import type { ApplicationCommand } from "discord.js";
import type{ MessageCommand } from "../types/Command.ts";
import { Bot } from "../classes/Bot.ts";


const mainBot = Bot.getBaseInstance(); 

/**
 * Fetches a command on a client and return a mentionable resolvable SlashCmmand
 * @param bot Client to search commands in
 * @param query Name or ID of the command to resolve
 * @returns resolvable Command
 */
export function resolveSlashCommand (bot: Bot, { name, id, returnId }: { name?: string, id?: string, returnId?: boolean}) {
  let toResolve: ApplicationCommand | undefined;

  if (id) 
    toResolve = bot.application?.commands.cache.find(cmd => cmd.id == id);

  if (name) 
    toResolve = bot.application!.commands.cache.find(cmd => cmd.name == name);

  return toResolve ? 
          returnId ? toResolve.id : `</${toResolve.name}:${toResolve.id}>` : 
          "/NOT_FOUND";
  
}


/**
 * Formats a text correctly to show the correct way to use a command
 * @param command Command to show the correct use from
 * @param bot Bot class to extract the prefix from
 */
export function correctUse(command: MessageCommand, bot: Bot = mainBot) {
  let reply = `\n🔹 The correct use is: **\`${bot.config.prefix} ${command.name} ${command.settings.expectedArgs}\`**`;

  const aliases = command.settings.aliases;
  const expectedArgs = command.settings.expectedArgs;
  if (aliases && aliases.length > 0) {
    reply += `\n🔹 You could also use abreviations:`;

    aliases.forEach((alias) => {
      reply += ` **\`${bot.config.prefix} ${alias}${expectedArgs? " "+expectedArgs: ""}\`**`;
    });
  }
  return (reply += `\n✅ Extra: **\`<required> [optional]\`**.`);
}