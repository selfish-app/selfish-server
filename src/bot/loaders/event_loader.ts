import { Event } from '../utils/types/Events'; // Assuming you have a 'types.ts' file defining the Event type
import fs from 'node:fs';
import path from 'node:path';
import { Bot } from '../utils/classes/Bot';

const baseBot = Bot.getBaseInstance();

export async function loadEvents(bot = baseBot) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFileNames = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

  console.log("Loading events".bgCyan);
  for (const fileName of eventFileNames) {
    const filePath = path.join(eventsPath, fileName)
    const event: Event = (await import(filePath)).default;

    const callType = event.once ? "once" : "on";
    bot[
      callType
    ](event.name, (...params) => event.execute(bot, ...params));

    console.log(`\t${callType}: ${event.name} => ... Loaded`.green)
  }
}