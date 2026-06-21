import { SlashCommandBuilder } from 'discord.js';
import db from '../../database/db.js';
import { isStaff } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removeuser')
    .setDescription('Remove a user from the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'This is not a ticket channel.')], ephemeral: true });
    }

    if (!isStaff(interaction.member, config)) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', 'Only staff can remove users from tickets.')], ephemeral: true });
    }

    const user = interaction.options.getUser('user');

    if (user.id === ticket.user_id) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'Cannot remove the ticket owner.')], ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.delete(user.id);

    await interaction.reply({
      embeds: [successEmbed('User Removed', `${user} has been removed from this ticket.`)],
    });
  }
};
