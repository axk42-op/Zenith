import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Get information about a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to inspect')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory)
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`#${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: ChannelType[channel.type] || 'Unknown', inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    if (channel.isTextBased()) {
      embed.addFields(
        { name: 'Topic', value: channel.topic || 'None', inline: false },
        { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: 'Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
};
