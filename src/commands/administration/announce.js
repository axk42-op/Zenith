import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to announce in')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Announcement message')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const title = interaction.options.getString('title') || '📢 Announcement';

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(title)
      .setDescription(message)
      .setFooter({ text: `Announced by ${interaction.user.tag}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      embeds: [successEmbed('Announcement Sent', `Your announcement was posted in ${channel}.`)],
      ephemeral: true
    });
  }
};
