import { Events, BaseInteraction } from 'discord.js'
import { Bot } from '../utils/classes/Bot';
import { commandCheck, CommandCheckError, slashCommandCheck } from '../utils/functions/command_checks'
import { Event } from '../utils/types/Events';
import { SlashCommand } from '../utils/types/Command';

export default {
  name: Events.InteractionCreate,
  async execute(bot: Bot, interaction: BaseInteraction) {

    // todo: maybe make a zone to handle other kind of interacions

    // commandInteractionOnly zone
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
    let command = bot.commands.get(interaction.commandName);

    if (interaction.isCommand()) {
      if (!command) {
        interaction.reply('The command wasn\'t found, there is a problem right with commands that were added by accident\nPlease be patient and try antother command')
        return console.error(`No command named "${interaction.commandName}" was found.`)
      }
  
      if (!command.interactionExecute){
        interaction.reply("There was an error trying to execute this command. Please communicate this to a developer")
        return console.error(`No executor found on "${command.name}"`)
      }

      try {
        // Verify the command properties to match with the command requeriments (permissions, roles, guildOnly, etc)
        const pass: boolean = 
          commandCheck({ command, reference: interaction, bot }) && 
          slashCommandCheck({ command: command as SlashCommand, interaction, bot })
    
        if (!pass) return;
        await command.interactionExecute({ interaction, bot });
  
      } catch (error) {
        const replyCaller = interaction.replied ? "followUp": "reply"
        if (error instanceof CommandCheckError) {
          return await interaction[replyCaller](error.message);
        }
  
        console.error(`Error executing /${interaction.commandName}`);
        console.error(error);
        await interaction[replyCaller]({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }

    else if (interaction.isAutocomplete()) {
      if (!command || !command.autocomplete) {
        return interaction.respond([{ name: "No handler found for this autocomplete", value: "NO HANDLER FOUND" }]);
      }

      try {
        // Verify the command properties to match with the command requeriments (permissions, roles, guildOnly, etc)
        const pass: boolean = commandCheck({ command, reference: interaction, bot }); 
          // && slashCommandCheck({ command: command as SlashCommand, interaction, bot })
    
        if (!pass) return;
        await command.autocomplete({ interaction, bot });
  
      } catch (error) {
        if (error instanceof CommandCheckError) {
          return await interaction.respond([{name: error.message, value: "CHECK ERROR"}]);
        }
  
        console.error(`Error autocompleting /${interaction.commandName}`);
        console.error(error);
        await interaction.respond([{ name: 'There was an error while autocompleting this command!', value: "CODE ERROR" }]);
      }
    }

    
    
 
    
  },
} as Event;