import db from '../database/db.js';
import { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ticketEmbed } from '../utils/embeds.js';
import { sendTicketLog } from '../utils/logger.js';
import config from '../config/loadConfig.js';
import { getSetting } from '../database/settings.js';
import { createModApplicationModal } from './applicationHandler.js';

const TICKET_TYPES = {
  ticket_support: 'Support',
  ticket_modapp: 'Moderator Application',
  ticket_report: 'Report User',
  ticket_partnership: 'Partnership Request'
};

export async function handleTicketButton(interaction) {
  const type = TICKET_TYPES[interaction.customId];
  if (!type) return false;

  if (interaction.customId === 'ticket_modapp') {
    return interaction.showModal(createModApplicationModal());
  }

  const existing = db.prepare(`
    SELECT * FROM tickets WHERE user_id = ? AND guild_id = ?
  `).all(interaction.user.id, interaction.guild.id);

  for (const ticket of existing) {
    const channel = interaction.guild.channels.cache.get(ticket.channel_id);
    if (channel) {
      return interaction.reply({
        content: `You already have an open ticket: ${channel}`,
        ephemeral: true
      });
    }
    db.prepare('DELETE FROM tickets WHERE id = ?').run(ticket.id);
  }

  const categoryId = getSetting(interaction.guild.id, 'ticket_category', config.ticketCategory);
  const staffRoleId = config.staffRole;

  const permissionOverwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles
      ]
    },
    {
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels
      ]
    }
  ];

  if (staffRoleId) {
    permissionOverwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  const channelName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100);

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites,
    topic: `Ticket for ${interaction.user.tag} | Type: ${type}`
  });

  db.prepare(`
    INSERT INTO tickets (channel_id, user_id, guild_id, type)
    VALUES (?, ?, ?, ?)
  `).run(channel.id, interaction.user.id, interaction.guild.id, type);

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close_btn')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  await channel.send({
    content: staffRoleId ? `<@${interaction.user.id}> <@&${staffRoleId}>` : `<@${interaction.user.id}>`,
    embeds: [ticketEmbed(type, interaction.user)],
    components: [closeRow]
  });

  await sendTicketLog(interaction.guild, interaction.client, '🎫 Ticket Created', [
    { name: 'User', value: `${interaction.user}`, inline: true },
    { name: 'Type', value: type, inline: true },
    { name: 'Channel', value: `${channel}`, inline: true }
  ]);

  await interaction.reply({
    content: `Your ticket has been created: ${channel}`,
    ephemeral: true
  });

  return true;
}

export async function handleTicketCloseButton(interaction) {
  const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
  }

  await interaction.reply({
    content: 'Use `/close` to close this ticket with a transcript.',
    ephemeral: true
  });
}
