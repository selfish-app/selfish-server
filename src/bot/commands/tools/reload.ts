import { CommandInteractionOptionResolver, SlashCommandSubcommandBuilder } from "discord.js";
import Command from "../../utils/classes/Command";
import { CommandBuilder } from "../../utils/classes/CommandBuilder";
import { loadSingleCommand } from "../../loaders/command_loader";
import { resolveSlashCommand } from "../../utils/functions/commands";
import { loadSingleTrigger } from "../../loaders/trigger_loader";


export default new CommandBuilder()
  .setName('reload')
  .setDescription('Reloads a command.')
  .setOnlyOwner(true)
  .setSlashCommandData(data => data
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("command")
        .setDescription("Reloads a command file to the cache")
        .addStringOption(option =>
          option.setName('target')
            .setDescription('The command to reload.')
            .setAutocomplete(true)
            .setRequired(true))
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("trigger")
        .setDescription("Reloads a trigger file to the cache")
        .addStringOption(option =>
          option.setName('target')
            .setDescription('The trigger to reload.')
            .setAutocomplete(true)
            .setRequired(true))
    )
    

  )
  .setAutocomplete(
    async function ({ interaction, bot }) {
      const options = interaction.options as CommandInteractionOptionResolver;
      const focused = options.getFocused();
      const type = options.getSubcommand();

      switch (type) {
        case "command": {
          const results = bot.commands.filter(cmd => cmd.name?.startsWith(focused));
          const resultOptions = results.map(res => ({ name: res.name!, value: res.file! }));
          return interaction.respond(resultOptions);
        }
        case "trigger": {
          let results = bot.triggers.map(trgs => trgs.map(trgs => trgs)).flat()
            .filter(trg => trg.name.startsWith(focused));
          const resultOptions = results.map(res => ({ name: res.name!, value: res.file! }));
          return interaction.respond(resultOptions);
        }
      }
    }
  )
  .setInteractionExecutor(
    async function ({ interaction, bot }) {
      const options = interaction.options as CommandInteractionOptionResolver;
      const value = interaction.options.get("target")?.value as string;
      const sub = options.getSubcommand();

      delete require.cache[require.resolve(value)];

      switch (sub) {
        case "command": {
          const command = await loadSingleCommand(value, bot);
          if (command?.supportsSlashCommand()) {
            interaction.client.application.commands.edit(
              resolveSlashCommand(bot, {name: command.data.name, returnId: true}),
              command.data
            )
          }
          return interaction.reply({ content: `Command ${command?.data.name} reloaded successfuly`, ephemeral: true});
        }
        case "trigger": {
          const trigger = await loadSingleTrigger(value, bot);
          return interaction.reply({ content: `Trigger ${trigger.name} reloaded successfuly`, ephemeral: true});
        }
      }
    }
  )



  .build() as Command;
