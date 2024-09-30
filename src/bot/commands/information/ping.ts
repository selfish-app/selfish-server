import Command from '../../utils/classes/Command';
import { CommandBuilder } from '../../utils/classes/CommandBuilder';

export default new CommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')
    
  .setInteractionExecutor(
    async function ({ interaction }) {
      await interaction.reply({
        content: `Pong :D **${interaction.client.ws.ping}ms**`,
        ephemeral: true
      });
    }
  )
  .setMessageExecutor(
    async function ({ message }) {
      await message.reply(`Pong :D **${message.client.ws.ping}ms**`)
    }
  )

  .build() as Command;
 