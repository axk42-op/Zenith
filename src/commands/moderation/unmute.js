import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { canModerate, botCanModerate } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'User not found.')], ephemeral: true });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'This user is not muted.')], ephemeral: true });
    }

    const check = canModerate(interaction.member, member, config);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', check.reason)], ephemeral: true });
    }

    await member.timeout(null, `${interaction.user.tag}: Unmuted`);

    await sendLog(interaction.guild, interaction.client, '🔊 User Unmuted', [
      { name: 'User', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true }
    ], config.colors.success);

    await interaction.reply({
      embeds: [successEmbed('User Unmuted', `${user} has been unmuted.`)],
      ephemeral: true
    });
  }
};
