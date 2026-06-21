import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config/loadConfig.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('View a user\'s banner')
    .addUserOption(option =>
      option.setName('user').setDescription('User to view').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const fetched = await user.fetch(true);
    const banner = fetched.bannerURL({ size: 4096 });

    if (!banner) {
      return interaction.reply({
        embeds: [errorEmbed('No Banner', `${user.tag} does not have a banner.`)],
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${user.tag}'s Banner`)
      .setImage(banner)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
