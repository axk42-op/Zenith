import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLeaderboard } from '../../utils/leveling.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server XP leaderboard'),

  async execute(interaction) {
    const rows = getLeaderboard(interaction.guild.id, 10);

    if (!rows.length) {
      return interaction.reply({ content: 'No leveling data yet. Start chatting to earn XP!', ephemeral: true });
    }

    const lines = await Promise.all(rows.map(async (row, i) => {
      const user = await interaction.client.users.fetch(row.user_id).catch(() => ({ username: 'Unknown' }));
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      return `${medal} ${user.username} — Level **${row.level}** (${row.xp} XP)`;
    }));

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🏆 Leaderboard')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Zenith Crest Community' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
