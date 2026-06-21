import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: false,
      AddReactions: false
    });

    await sendLog(interaction.guild, interaction.client, '🔒 Channel Locked', [
      { name: 'Channel', value: `${channel}`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true }
    ]);

    await interaction.reply({
      embeds: [successEmbed('Channel Locked', `${channel} has been locked.`)],
      ephemeral: true
    });
  }
};
