import type { Event } from '../utils/types/Events.ts'; // Assuming you have a 'types.ts' file defining the Event type
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL  } from "node:url";
import { dirname, fromFileUrl } from "path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));
import { Bot } from '../utils/classes/Bot.ts';

const baseBot = Bot.getBaseInstance();

export async function loadEvents(bot = baseBot) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFileNames = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts"));

  console.log("Loading events".bgCyan);
  for (const fileName of eventFileNames) {
    const filePath = pathToFileURL(path.join(eventsPath, fileName)).href
    const event: Event = (await import(filePath)).default;

    const callType = event.once ? "once" : "on";
    bot[
      callType
    ](event.name, (...params) => event.execute(bot, ...params));

    console.log(`\t${callType}: ${event.name} => ... Loaded`.green)
  }
}