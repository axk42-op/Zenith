import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../../config/loadConfig.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('verificationpanel')
    .setDescription('Send the verification panel with a verify button')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('✅ Verification')
      .setDescription(
        'Welcome to **Zenith Crest**!\n\n' +
        'Click the button below to verify your account and gain access to the server.'
      )
      .setFooter({ text: 'Zenith Crest Community' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      embeds: [successEmbed('Verification Panel', 'Verification panel has been posted.')],
      ephemeral: true
    });
  }
};
