import { ClientEvents } from "discord.js"
import { Bot } from "../classes/Bot"

export type Event = {
    name: keyof ClientEvents,
    once?: boolean,
    execute: EventExecutor
}

type EventExecutor = (
    bot: Bot,
    ...params: any
) => Promise<void> | void;