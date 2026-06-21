import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { canModerate, botCanModerate } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the mute').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = ms(durationStr);

    if (!duration || duration < 1000 || duration > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        embeds: [errorEmbed('Invalid Duration', 'Duration must be between 1 second and 28 days (e.g. 10m, 1h, 1d).')],
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'User not found.')], ephemeral: true });
    }

    const check = canModerate(interaction.member, member, config);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', check.reason)], ephemeral: true });
    }

    if (!botCanModerate(interaction.guild, member)) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'I cannot mute this user due to role hierarchy.')], ephemeral: true });
    }

    await member.timeout(duration, `${interaction.user.tag}: ${reason}`);

    await sendLog(interaction.guild, interaction.client, '🔇 User Muted', [
      { name: 'User', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true },
      { name: 'Duration', value: durationStr, inline: true },
      { name: 'Reason', value: reason, inline: false }
    ], config.colors.warning);

    await interaction.reply({
      embeds: [successEmbed('User Muted', `${user} has been muted for **${durationStr}**.`)],
      ephemeral: true
    });
  }
};
