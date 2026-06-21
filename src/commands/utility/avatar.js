import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View a user\'s avatar')
    .addUserOption(option =>
      option.setName('user').setDescription('User to view').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const url = user.displayAvatarURL({ size: 4096, extension: 'png' });

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(url)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
