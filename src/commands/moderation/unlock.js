import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: null,
      AddReactions: null
    });

    await sendLog(interaction.guild, interaction.client, '🔓 Channel Unlocked', [
      { name: 'Channel', value: `${channel}`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true }
    ]);

    await interaction.reply({
      embeds: [successEmbed('Channel Unlocked', `${channel} has been unlocked.`)],
      ephemeral: true
    });
  }
};
