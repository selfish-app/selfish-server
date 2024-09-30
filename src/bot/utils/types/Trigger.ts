import { ClientEvents } from "discord.js"
import { Bot } from "../classes/Bot"

export type Trigger = {
    name: string
    description?: string
    file?: string
    event: keyof ClientEvents
    conditionCheck: ConditionCheck
    execute: TriggerExecutor
}

type ConditionCheck = (bot: Bot, ...args: any) => boolean | Promise<boolean>;
type TriggerExecutor = (bot: Bot, ...args: any) => void | Promise<void>;