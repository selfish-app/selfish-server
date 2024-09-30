import { Event } from "../utils/types/Events.js";

import { Events }  from  'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(bot) {
    console.log(`Ready! Logged in as ${bot.user?.username}`);

    // setting commands
    await bot.application!.commands.set(
      Array.from(
        bot.commands.filter(cmd => cmd.supportsSlashCommand()).values()
      ).map(cmd => cmd.data)
    )
  },
} as Event;