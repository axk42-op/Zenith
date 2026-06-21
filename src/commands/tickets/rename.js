import { SlashCommandBuilder } from 'discord.js';
import db from '../../database/db.js';
import { isStaff } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename the current ticket channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('New channel name')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'This is not a ticket channel.')], ephemeral: true });
    }

    const isOwner = ticket.user_id === interaction.user.id;
    if (!isOwner && !isStaff(interaction.member, config)) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', 'You cannot rename this ticket.')], ephemeral: true });
    }

    const name = interaction.options.getString('name').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100);
    const newName = name.startsWith('ticket-') ? name : `ticket-${name}`;

    await interaction.channel.setName(newName);

    await interaction.reply({
      embeds: [successEmbed('Ticket Renamed', `Channel renamed to **${newName}**.`)],
      ephemeral: true
    });
  }
};
