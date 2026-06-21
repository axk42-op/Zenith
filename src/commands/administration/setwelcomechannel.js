import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setSetting } from '../../database/settings.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setwelcomechannel')
    .setDescription('Set the channel for welcome and goodbye messages')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The welcome channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    setSetting(interaction.guild.id, 'welcome_channel', channel.id);

    await interaction.reply({
      embeds: [successEmbed('Welcome Channel Set', `Welcome messages will be sent to ${channel}.`)],
      ephemeral: true
    });
  }
};
