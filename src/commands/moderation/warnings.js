import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import db from '../../database/db.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to check').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    const warnings = db.prepare(`
      SELECT * FROM warnings WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC
    `).all(user.id, interaction.guild.id);

    if (!warnings.length) {
      return interaction.reply({
        content: `${user.tag} has no warnings.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(`Warnings for ${user.tag}`)
      .setDescription(`Total: **${warnings.length}** warning(s)`)
      .setTimestamp();

    warnings.slice(0, 10).forEach((w, i) => {
      embed.addFields({
        name: `#${i + 1} — <t:${w.created_at}:f>`,
        value: `**Moderator:** <@${w.moderator_id}>\n**Reason:** ${w.reason}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
