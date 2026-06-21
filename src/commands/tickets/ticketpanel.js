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
    .setName('ticketpanel')
    .setDescription('Send the ticket panel with category buttons')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🎫 Zenith Crest Support')
      .setDescription(
        'Need help? Click a button below to open a private ticket.\n\n' +
        '🛠️ **Support** — General help and questions\n' +
        '🛡️ **Moderator Application** — Apply to join our staff team\n' +
        '🚨 **Report User** — Report rule violations\n' +
        '🤝 **Partnership Request** — Business and partnership inquiries'
      )
      .setFooter({ text: 'Zenith Crest Community' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_support')
        .setLabel('Support')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛠️'),
      new ButtonBuilder()
        .setCustomId('ticket_modapp')
        .setLabel('Moderator Application')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛡️'),
      new ButtonBuilder()
        .setCustomId('ticket_report')
        .setLabel('Report User')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚨'),
      new ButtonBuilder()
        .setCustomId('ticket_partnership')
        .setLabel('Partnership')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🤝')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      embeds: [successEmbed('Ticket Panel', 'Ticket panel has been posted.')],
      ephemeral: true
    });
  }
};
