import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setAutomodEnabled, isAutomodEnabled } from '../../database/settings.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Enable or disable the automod system')
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable automod')
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable automod')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'enable') {
      setAutomodEnabled(interaction.guild.id, true);
      await interaction.reply({
        embeds: [successEmbed('Automod Enabled', 'Automod is now active.')],
        ephemeral: true
      });
    } else {
      setAutomodEnabled(interaction.guild.id, false);
      await interaction.reply({
        embeds: [successEmbed('Automod Disabled', 'Automod has been turned off.')],
        ephemeral: true
      });
    }
  }
};
