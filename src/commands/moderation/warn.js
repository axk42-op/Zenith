import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import db from '../../database/db.js';
import { canModerate, botCanModerate } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the warning').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'User not found in this server.')], ephemeral: true });
    }

    const check = canModerate(interaction.member, member, config);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', check.reason)], ephemeral: true });
    }

    db.prepare(`
      INSERT INTO warnings (user_id, guild_id, moderator_id, reason)
      VALUES (?, ?, ?, ?)
    `).run(user.id, interaction.guild.id, interaction.user.id, reason);

    const count = db.prepare(`
      SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND guild_id = ?
    `).get(user.id, interaction.guild.id).count;

    await sendLog(interaction.guild, interaction.client, '⚠️ User Warned', [
      { name: 'User', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true },
      { name: 'Reason', value: reason, inline: false },
      { name: 'Total Warnings', value: `${count}`, inline: true }
    ], config.colors.warning);

    try {
      await user.send({
        embeds: [errorEmbed('Warning Received', `You were warned in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total Warnings:** ${count}`)]
      });
    } catch {}

    await interaction.reply({
      embeds: [successEmbed('User Warned', `${user} has been warned. They now have **${count}** warning(s).`)],
      ephemeral: true
    });
  }
};
