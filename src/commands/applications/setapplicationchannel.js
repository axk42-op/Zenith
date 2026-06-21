import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setSetting } from '../../database/settings.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setapplicationchannel')
    .setDescription('Set the channel for moderator application reviews')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Application review channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    setSetting(interaction.guild.id, 'application_channel', channel.id);

    await interaction.reply({
      embeds: [successEmbed('Application Channel Set', `Applications will be sent to ${channel}.`)],
      ephemeral: true
    });
  }
};
