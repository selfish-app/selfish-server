/** 
 * Class dedicated to create a bot client with needed permissions on the Discord API
 * and some collections to store bot funcitonality data.
 * Used as a singleton so it can just be imported trough as a module and not by passing it trough parameters.
 * even so, it also provides a function to get an independent instance
 */

import { Client, GatewayIntentBits, Collection, ClientEvents } from 'discord.js'
import Command from '../classes/Command';
import * as baseConfig from '../../config';
import { Trigger } from '../types/Trigger';

export class Bot extends Client {
    private static instance: Bot;
    private static intents: GatewayIntentBits[] = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ]

    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, string> = new Collection();
    public triggers: Collection<keyof ClientEvents, Collection<string, Trigger>> = new Collection();
    public config: typeof baseConfig;

    private constructor(intents = Bot.intents, config = baseConfig) {
        super({ intents });
        this.config = config;
    }

    public static getBaseInstance(intents = Bot.intents, config = baseConfig): Bot {
        if (!Bot.instance)
            Bot.instance = new Bot(intents, config);

        return Bot.instance;
    }

    public static getIndependentInstance(intents = Bot.intents, config = baseConfig): Bot {
        return new Bot(intents = Bot.intents, config = baseConfig);
    }



}