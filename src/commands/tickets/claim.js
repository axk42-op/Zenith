import { SlashCommandBuilder } from 'discord.js';
import db from '../../database/db.js';
import { isStaff } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendTicketLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim the current ticket'),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'This is not a ticket channel.')], ephemeral: true });
    }

    if (!isStaff(interaction.member, config)) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', 'Only staff can claim tickets.')], ephemeral: true });
    }

    if (ticket.claimed_by) {
      return interaction.reply({
        embeds: [errorEmbed('Already Claimed', `This ticket is claimed by <@${ticket.claimed_by}>.`)],
        ephemeral: true
      });
    }

    db.prepare('UPDATE tickets SET claimed_by = ? WHERE channel_id = ?').run(interaction.user.id, interaction.channel.id);

    await sendTicketLog(interaction.guild, interaction.client, '🎫 Ticket Claimed', [
      { name: 'Ticket', value: `${interaction.channel}`, inline: true },
      { name: 'Claimed By', value: `${interaction.user}`, inline: true }
    ]);

    await interaction.reply({
      embeds: [successEmbed('Ticket Claimed', `${interaction.user} has claimed this ticket.`)],
    });
  }
};
