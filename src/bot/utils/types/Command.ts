import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandOptionsOnlyBuilder,
    ContextMenuCommandBuilder,
    Message as DiscordMessage,
    ChatInputCommandInteraction,
    Embed,
    BaseInteraction,
    GuildManager,
    Guild,
    TextChannel,
    DMChannel,
    PartialGroupDMChannel,
    VoiceChannel
} from "discord.js";

import { Bot } from "../classes/Bot";
import Command from "../classes/Command";


export enum CommandType {
    HYBRID = 'hybrid',
    MESSAGE = 'message',
    SLASH = 'slash',
    INVALID = 'invalid'
}

export type CommandSettings = {
    aliases?: string[],           // messagae
    guildOnly?: boolean,          // hybrid
    textChannelOnly?: boolean,    // hybrid
    onlyOwner?: boolean,          // hybrid
    permissions?: string[],       // hybrid
    permissionError?: string,     // hybrid
    requiredRoles?: string[],     // hybrid
    minArgs?: number,             // message
    maxArgs?: number,             // message
    mentionChannels?: boolean,    // message
    mentionUsers?: boolean,       // message
    expectedArgs?: string,        // message
    dmOnly?: boolean
    guideEmbed?: typeof Embed     // hybrid
}

//! this type kinda doesnt work, cz it contradiits itself
export type CommandData =
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | ContextMenuCommandBuilder;



//* TYPED INTERACTION / MESSAGES ZONE
/*
 * I had to implement this in order to easily manage types from discordjs 14.16
 * It is a pain in the ass (sorry but its true), now i have to manually tell TS that the interaction must contain a group of properties.
 * This becomes a little bit more verbosed but its ok
 */

//* old way:
//export type Interaction<T extends {}[] = [{}]> = BaseInteraction & UnionToIntersection<T[number]>;
//export type Message<T extends {}[] = {}[]> = DiscordMessage & UnionToIntersection<T[number]>;
// ? This way it still has to be with Merge because Merge transforms the items to any 
// ? so the compiler ignores if its even compatible to Intersect. Kinda unsafe, but it saves some time typing lol

//* new way:
export type Interaction<T extends {} = {}> = Merge<T extends BaseInteraction ? T : BaseInteraction & T>;
export type Message<T extends {} = {}> = Merge<DiscordMessage & T>; // DiscordMessage = Message form djs

/*
 * Context types for interactions
 * I got no idea if InVoice or InDMs makes any sense. Can you even run commands for voice channels???
 * I had to do this cz somehow discordjs deduced that message.channel could be a VoiceChannel or stuff like that
*/
export type InGuild = { guild: GuildManager | Guild }
export type InTextChannel = { channel: TextChannel }
export type InDMs = { channel: DMChannel | PartialGroupDMChannel }
export type InVoice = { channel: VoiceChannel }

/*
 * I found this on google, pretty extrange but useful
 * I stopped using this cz it makes look types very complex even if they arent.
 * So now im replasing this for normal manual joins &, it even takes less characters lol
 * I'll keep the code commented cz i really liked doing this, made me learn a lot about generics.
*/
//? past name: type UnionToIntersection<U> = 
type Merge<U> =
    (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

//* Usage example:   Interaction<InGuild & InTextChannel> ez solve for interaction.channel.send


export interface SlashCommand extends Command {
    data: SlashCommandBuilder
    interactionExecute: InteractionExecutor
}

export interface MessageCommand extends Command {
    name: string
    settings: CommandSettings
    messageExecute: MessageExecutor
}

export type InteractionExecutor<T extends {} = {}> = (params: {
    interaction: Interaction<T>,
    bot: Bot
},
    test?: boolean) => any;

export type MessageExecutor<T extends {} = {}> = (params: {
    message: Message<T>,
    bot: Bot,
    args: string[],
    text: string,
    prefix: string,
    cmd: string
},
    test?: boolean) => any;


