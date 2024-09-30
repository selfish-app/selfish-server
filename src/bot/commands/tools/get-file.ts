import { AttachmentBuilder, CommandInteractionOptionResolver } from "discord.js";
import Command from "../../utils/classes/Command";
import { CommandBuilder } from "../../utils/classes/CommandBuilder";
import { getJSFiles } from "../../utils/functions/files";

export default new CommandBuilder() 
  .setName("get-file")
  .setDescription("Returns a file attachment with the file content")
  .setOnlyOwner(true)
  .setDMOnly(true)
  .setSlashCommandData(data => data
    .addStringOption(opt => opt
      .setName("path")
      .setDescription("File resource path")
      .setRequired(true)
      .setAutocomplete(true)
    )
    .addBooleanOption(opt=>opt
      .setName("internal")
      .setDescription("Ensures the file is from an internal bot file")
    )
  )
  .setAutocomplete(
    async function ({ interaction, bot}) {
      const options = interaction.options as CommandInteractionOptionResolver;
      const focused = options.getFocused();
      let result = (await getJSFiles(focused)).map(file => ({name: file.rootRelative, value: file.absolute}));
      result = result.length > 25 ? result.splice(0,25) : result;

      return interaction.respond(result);
    }
  )

  .setInteractionExecutor(
    async function ({ interaction, bot}) {
      let value = interaction.options.get("path")?.value as string;
      const internal = interaction.options.get("internal")?.value;

      if (internal) {
        value = value.replace("\\dist\\", "\\src\\").replace(".js", ".ts");
      }


      try {
        const attachment = new AttachmentBuilder(value);
        await interaction.reply("Here is the content for "+value);
        await interaction.user.send({ files: [attachment] });
      } catch (error) {
        if (interaction.replied) 
          await interaction.followUp("There was an error executing this command");
        else 
          await interaction.reply("There was an error executing this command");
        throw error; // this will be handled by catch on interactionCreate event
      }
    }
  )

  .build() as Command;