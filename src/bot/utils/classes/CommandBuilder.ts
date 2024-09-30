import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/Command";
import { InDMs, InGuild, InteractionExecutor, InTextChannel, MessageExecutor } from '../types/Command'
import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction } from "discord.js";

/**
 * @T Context atributes for commands:  check `../types/Command`
 */
export class CommandBuilder<T extends {} = {}> {
  private command: Command = new Command();
  readonly isBuilder = true;

  public constructor (command?: Command) {
    if (command) this.command = command; // for clonning and editing, maybe this is useless

  }

  setName(name: string) {
    this.command.name = name;
    this.command.data.setName(name);
    return this;
  }

  setDescription(description: string) {
    this.command.description = description;
    
    this.command.data.setDescription(description);
    return this;
  }

  setCategory(category: string) {
    this.command.category = category;
    return this;
  }

  setAliases(...aliases: string[]) {
    this.command.settings.aliases = aliases;

    return this;
  }

  setGuildOnly(value: boolean = true) {
    this.command.settings.guildOnly = value;
    return value? this as CommandBuilder<T & InGuild> : this ;
  }
  
  setTextChannelOnly(value: boolean = true) {
    if(!this.command.settings.guildOnly) this.command.settings.guildOnly = value;
    
    this.command.settings.textChannelOnly = value;
    return value ? this as CommandBuilder<T & InTextChannel & InGuild> :   this ;
  }

  setDMOnly(value: boolean = true) {
    this.command.settings.dmOnly = value;

    return value ? this as CommandBuilder<T & InDMs> : this;
  }

  setOnlyOwner(value: boolean) {
    this.command.settings.onlyOwner = value;
    return this;
  }

  setPermissions(...permissions: string[]) {
    this.command.settings.permissions = permissions
    return this.setGuildOnly(true);
  }
  // I kinda never used this but meh
  setPermissionsError(permissionError: string) {
    this.command.settings.permissionError = permissionError
    return this.setGuildOnly(true);
  }

  setRequireRoles(...requiredRoles: string[]) {
    if (requiredRoles.some(role => typeof role !== 'string')) {
      throw new Error('Roles in requiredRoles must be string')
    }
    
    this.command.settings.requiredRoles = requiredRoles
    return this.setGuildOnly(true);
  }

  setMinArgs(minArgs: number) {
    if(!this.command.settings) this.command.settings = {};
    this.command.settings.minArgs = minArgs
    return this;
  }

  setMaxArgs(maxArgs: number) {
    if(!this.command.settings) this.command.settings = {};
    this.command.settings.maxArgs = maxArgs
    return this;
  }

  setMentionChannels(mentionChannels: boolean) {
    if(!this.command.settings?.guildOnly) this.setGuildOnly(true);

    if(!this.command.settings) this.command.settings = {};
    this.command.settings.mentionChannels = mentionChannels
    return this;
  }

  setExpectedArgs(expectedArgs: string) {
    if(!this.command.settings) this.command.settings = {};
    this.command.settings.expectedArgs = expectedArgs
    return this;
  }

  setSlashCommandData (builder: SlashCommandBuilder | ((data: SlashCommandBuilder) => void)) {
    if (typeof builder === "function") {
      builder(this.command.data as SlashCommandBuilder);
    }
    else this.command.data = builder;
    return this;
  }

  setMessageExecutor (executor: MessageExecutor<T>) {
    this.command.messageExecute = executor;
    return this
  }

  setInteractionExecutor (
    executor: InteractionExecutor<T & (
      T extends InTextChannel 
        ? ChatInputCommandInteraction 
        : CommandInteraction
    )>) {
    this.command.interactionExecute = executor;
    return this
  }

  setAutocomplete (executor: InteractionExecutor<T & AutocompleteInteraction>) {
    this.command.autocomplete = executor;
    return this;
  }

  build() : Command {

    const cmd = this.command;
    // Validate that the required properties are set before building the command
    // No names
    if (!cmd.name && !cmd.data?.name) 
      throw new Error ('Invalid command structure, no name was defined');
    // Blank strings names
    if (cmd.name?.trim().length! < 1 || cmd.data?.name.trim().length! < 1)
      throw new Error ('Invalid command structure, one of the names was found empty');

    // No executors
    if (!cmd.interactionExecute && !cmd.messageExecute)
      throw new Error ('Invalid command structure, no executor specified at all');


    return this.command;
  }
}
/**
 * The way this class works right now, makes you use the build method to comprove you filled the required atributes
 * and to actually get the command from the return
 */


// Usage example:
/* const commandcommand = new MessageCommandBuilder()
  .setName('blablabla')
  .setAliases('bla', 'blabla')
  .setGuildOnly(true)
  .setOnlyOwner(false) // etc
  .build();
 */