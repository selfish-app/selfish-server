import { Event } from "../utils/types/Events.js";

import { Events, TextChannel } from 'discord.js';
import { prefix, logChannelId } from '../config';
import { commandCheck, CommandCheckError, messageCommandCheck } from '../utils/functions/command_checks';
import { MessageCommand, Message } from "../utils/types/Command";

export default {
  name: Events.MessageCreate,
  async execute(bot, message: Message) {

    if (message.author.id == bot.user?.id) return;  // Bucle prevention
    
    // Log channel setting
    const logChannel = bot.channels.cache.find(ch => ch.id == logChannelId) as TextChannel;
    if (!logChannel)
      console.log("The logging channel couldn't be found in bot's cache");
    
    // Ignore non prefix
    if (!message.content.toLowerCase().startsWith(prefix)) { return }

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase() || "";
    if (cmd.length === 0) { return }
    let command = bot.commands.get(cmd);

    if (!command) { command = bot.commands.get(bot.aliases.get(cmd) ?? "") }

    if (command && command.messageExecute) {

      let parameters = { command: command as MessageCommand, 
        message, bot, args, text: args.join(" "), prefix, cmd }

      try {
        // Execution time "type guards"
        const pass : boolean = 
          commandCheck({ command, reference: message, bot }) &&
          messageCommandCheck({ command: command as MessageCommand, bot, message, args });

        if (!pass) return;
        await command.messageExecute(parameters);
      }

      catch (error: any) { // any 😭
        if (error instanceof CommandCheckError) {
          return await message.reply(error.message);
        }

        console.error(error);
        logChannel?.send(`
        El error fue **\`${error?.message ?? error}\`** en el comando **\`${command.name}\`**.
        En el canal <#${message.channel.id}>.
        `);
      }
    
    }

  }
} as Event;