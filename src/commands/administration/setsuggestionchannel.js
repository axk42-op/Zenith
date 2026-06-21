import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setSetting } from '../../database/settings.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setsuggestionchannel')
    .setDescription('Set the channel for suggestions')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Suggestion channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    setSetting(interaction.guild.id, 'suggestion_channel', channel.id);

    await interaction.reply({
      embeds: [successEmbed('Suggestion Channel Set', `Suggestions will be posted in ${channel}.`)],
      ephemeral: true
    });
  }
};
