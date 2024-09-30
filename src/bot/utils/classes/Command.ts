import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandSettings, MessageExecutor, InteractionExecutor, CommandType } from '../types/Command';

export default class Command {
  name?: string
  description?: string
  category?: string
  file?: string
  data: SlashCommandBuilder = new SlashCommandBuilder()
  settings: CommandSettings = {}

  messageExecute?: MessageExecutor
  interactionExecute?: InteractionExecutor
  autocomplete?: InteractionExecutor

  public type(): CommandType {
    return this.messageExecute && this.interactionExecute ? CommandType.HYBRID :
      this.messageExecute ? CommandType.MESSAGE :
      this.interactionExecute ? CommandType.SLASH :
      CommandType.INVALID;
  }

  public supportsSlashCommand(): boolean {
    // i know this looks redundant but somehow it wouldnt accept it only with the && logic operator
    return this.data && this.interactionExecute ? true : false;
  }
}
