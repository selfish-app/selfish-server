import fs from 'node:fs';
import path from 'node:path';
import { Bot } from '../utils/classes/Bot';
import { Collection } from 'discord.js';
const baseBot = Bot.getBaseInstance();

export async function loadTriggers(bot: Bot = baseBot) {

  console.log('Loading triggers executors'.bgCyan);
  const triggersPath = path.join(__dirname, '..', 'triggers', 'executors');
  
  if (!fs.existsSync(triggersPath)) return;
  loadTriggersFromDir(triggersPath)
  

  // This is basically a copy paste from event_loader, but well, technically these events are reserved only for the triggers
  console.log('Loading trigger listeners'.bgCyan);
  const listenersPath = path.join(__dirname, '..', 'triggers', 'listeners');
  if (!fs.existsSync(listenersPath)) return;
  const listenerFiles = fs.readdirSync(listenersPath).filter(f => f.endsWith(".js"));

  for (const file of listenerFiles) {
    const listener = (await import(path.join(listenersPath, file))).default;

    const callType = listener.once ? "once" : "on";
    bot[
      callType
    ](listener.name, (...params) => listener.execute(bot, ...params));

    const triggers = bot.triggers.get(listener.name);

    console.log(`\t${listener.name} listening for => ${triggers?.size} triggers`.green)
    if (!triggers?.size) return;

    for (let trigger of triggers.values())
      console.log(`\t --- ${trigger.name}`.blue)

  }

}

export async function loadTriggersFromDir(dirPath:string, bot = baseBot) {
  const triggerFiles = fs.readdirSync(dirPath).filter(f => f.endsWith(".js"));
  for (const file of triggerFiles) {
    const triggerPath = path.join(dirPath, file);

    await loadSingleTrigger(triggerPath);
    
  }
  
}

export async function loadSingleTrigger(triggerPath: string, bot = baseBot) {
  const trigger = (await import(triggerPath)).default;
  trigger.file = triggerPath

  if (bot.triggers.has(trigger.event))
    bot.triggers.get(trigger.event)!.set(trigger.name, trigger);
  else {
    const collection = new Collection();
    collection.set(trigger.name, trigger);
    bot.triggers.set(trigger.event, collection as any); // sorry for the any
  }

  console.log(`\t${trigger.name} on '${trigger.event}'`.green);
  return trigger;
}