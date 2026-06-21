import { SlashCommandBuilder } from 'discord.js';
import { getUserLevel, getUserRank, xpForLevel } from '../../utils/leveling.js';
import { rankEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your or another user\'s rank')
    .addUserOption(option =>
      option.setName('user').setDescription('User to check').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    const data = getUserLevel(user.id, interaction.guild.id);
    const rank = getUserRank(user.id, interaction.guild.id) || 'N/A';
    const nextLevelXp = xpForLevel(data.level);

    await interaction.reply({
      embeds: [rankEmbed(member, rank, data.xp, data.level, nextLevelXp)]
    });
  }
};
