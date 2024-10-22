import type { CommandInteractionOptionResolver } from "discord.js";
import type Command from "../../utils/classes/Command.ts";
import { CommandBuilder } from "../../utils/classes/CommandBuilder.ts";
import { loadSingleCommand } from "../../loaders/command_loader.ts";
import { resolveSlashCommand } from "../../utils/functions/commands.ts";
import { loadSingleTrigger } from "../../loaders/trigger_loader.ts";


export default new CommandBuilder()
  .setName('reload')
  .setDescription('Reloads a command.')
  .setOnlyOwner(true)
  .setSlashCommandData(data => data
    .addSubcommand( sub => sub
        .setName("command")
        .setDescription("Reloads a command file to the cache")
        .addStringOption(option =>
          option.setName('target')
            .setDescription('The command to reload.')
            .setAutocomplete(true)
            .setRequired(true))
    )
    .addSubcommand( sub => sub
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
    function ({ interaction, bot }) {
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
          const results = bot.triggers.map(trgs => trgs.map(trgs => trgs)).flat()
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
      const path = interaction.options.get("target")?.value as string;
      const sub = options.getSubcommand();

      const modulePath = `${path}?cacheBust=${Date.now()}`;
      
      switch (sub) {
        case "command": {
          const command = await loadSingleCommand(modulePath, bot);
          if (!command)
            return interaction.reply({ content: `The command coultn't be loaded, it probably didn't pass the check errors.`, ephemeral: true});
          if (command.supportsSlashCommand()) {
            interaction.client.application.commands.edit(
              resolveSlashCommand(bot, {name: command.data.name, returnId: true}),
              command.data
            )
          }
          return interaction.reply({ content: `Command ${command?.data.name} reloaded successfuly`, ephemeral: true});
        }
        case "trigger": {
          const trigger = await loadSingleTrigger(modulePath, bot);
          return interaction.reply({ content: `Trigger ${trigger.name} reloaded successfuly`, ephemeral: true});
        }
      }
    }
  )



  .build() as Command;
