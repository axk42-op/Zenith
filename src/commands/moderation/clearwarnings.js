import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import db from '../../database/db.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear all warnings for a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to clear warnings for').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    const result = db.prepare(`
      DELETE FROM warnings WHERE user_id = ? AND guild_id = ?
    `).run(user.id, interaction.guild.id);

    await sendLog(interaction.guild, interaction.client, '🧹 Warnings Cleared', [
      { name: 'User', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true },
      { name: 'Removed', value: `${result.changes} warning(s)`, inline: true }
    ]);

    await interaction.reply({
      embeds: [successEmbed('Warnings Cleared', `Removed **${result.changes}** warning(s) from ${user}.`)],
      ephemeral: true
    });
  }
};
