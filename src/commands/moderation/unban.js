import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The user ID to unban')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid').replace(/[<@!>]/g, '');

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({ embeds: [errorEmbed('Invalid ID', 'Please provide a valid user ID.')], ephemeral: true });
    }

    try {
      await interaction.guild.members.unban(userId, `${interaction.user.tag}: Unbanned`);

      await sendLog(interaction.guild, interaction.client, '✅ User Unbanned', [
        { name: 'User ID', value: userId, inline: true },
        { name: 'Moderator', value: `${interaction.user}`, inline: true }
      ], config.colors.success);

      await interaction.reply({
        embeds: [successEmbed('User Unbanned', `User \`${userId}\` has been unbanned.`)],
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        embeds: [errorEmbed('Error', 'Could not unban this user. They may not be banned.')],
        ephemeral: true
      });
    }
  }
};
