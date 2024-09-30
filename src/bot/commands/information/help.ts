import { EmbedBuilder } from "discord.js";
import { CommandBuilder } from "../../utils/classes/CommandBuilder.js";
import Command from "../../utils/classes/Command.js";
import { resolveSlashCommand } from "../../utils/functions/commands.js";

export default new CommandBuilder()
  .setName('help')
  .setDescription('Displays some help and information about this bot')
  .setSlashCommandData( data => data 
    .addStringOption(option => option
      .setName('command')
      .setDescription('The command you want information about')
    )
    .addStringOption(option => option
      .setName('trigger')
      .setDescription('The trigger you want information about')
    )
  )
  .setInteractionExecutor (

    async function({ interaction, bot }) {
  
      const informationEmbed = new EmbedBuilder()
        .setTitle('About me')
        .setAuthor({ name: bot.user!.username, iconURL: bot.user!.displayAvatarURL() })
        .setDescription('I\'m a general purpose bot, I am designed to serve you with all my electronical soul.\n' +
          'For that I provide you a list of the functions I can exercise. `' + bot.ws.ping + 'ms`')
        .setColor(0x33ddff);

      const categories = new Set(bot.commands.map(cmd => cmd.category!).filter(cat => !cat.toUpperCase().includes("SECRET")));
  
  
      for (const category of categories) {
        const commands = bot.commands.filter(cmd => cmd.category == category).map(
          cmd => {
            let text: string = "";
            if (cmd.supportsSlashCommand()) 
              text += resolveSlashCommand(bot, {name: cmd.data.name});
            if (cmd.messageExecute) 
              text += " `" + bot.config.prefix + cmd.name + "`";
            return text.trim();
          }
        );
        informationEmbed.addFields({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: commands.join('\n')
        })
      }

      informationEmbed.addFields({
        name: "Secret commands",
        value: "`[Comming soon]`. A system to allow external users access secret configuration is being developed"
      })
  
      interaction.reply({ embeds: [informationEmbed] })
  
    }
  )
  .build() as Command;