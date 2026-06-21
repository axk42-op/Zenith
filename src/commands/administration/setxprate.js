import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setXpRate } from '../../database/settings.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setxprate')
    .setDescription('Set the XP multiplier for the leveling system')
    .addNumberOption(option =>
      option.setName('rate')
        .setDescription('XP multiplier (0.1 - 5.0)')
        .setRequired(true)
        .setMinValue(0.1)
        .setMaxValue(5.0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const rate = interaction.options.getNumber('rate');
    setXpRate(interaction.guild.id, rate);

    await interaction.reply({
      embeds: [successEmbed('XP Rate Updated', `XP multiplier set to **${rate}x**.`)],
      ephemeral: true
    });
  }
};
