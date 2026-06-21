import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setSetting } from '../../database/settings.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set the channel for server logs')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Log channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    setSetting(interaction.guild.id, 'log_channel', channel.id);

    await interaction.reply({
      embeds: [successEmbed('Log Channel Set', `Logs will be sent to ${channel}.`)],
      ephemeral: true
    });
  }
};
