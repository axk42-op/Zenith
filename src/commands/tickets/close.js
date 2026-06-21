import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import db from '../../database/db.js';
import { isStaff } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendTicketLog } from '../../utils/logger.js';
import { generateTranscript } from '../../utils/transcript.js';
import { getSetting } from '../../database/settings.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the current ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing')
        .setRequired(false)
    ),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'This is not a ticket channel.')], ephemeral: true });
    }

    const isOwner = ticket.user_id === interaction.user.id;
    if (!isOwner && !isStaff(interaction.member, config)) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', 'Only the ticket owner or staff can close this ticket.')], ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.reply({
      embeds: [successEmbed('Closing Ticket', 'Generating transcript and closing ticket in 5 seconds...')]
    });

    const transcript = await generateTranscript(interaction.channel, {
      type: ticket.type,
      userId: ticket.user_id
    });

    await sendTicketLog(interaction.guild, interaction.client, '🎫 Ticket Closed', [
      { name: 'Ticket', value: `#${interaction.channel.name}`, inline: true },
      { name: 'Closed By', value: `${interaction.user}`, inline: true },
      { name: 'Reason', value: reason, inline: false },
      { name: 'Messages', value: `${transcript.messageCount}`, inline: true }
    ]);

    const logChannelId = getSetting(interaction.guild.id, 'ticket_log_channel', config.ticketLogChannel);
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel?.isTextBased()) {
        const attachment = new AttachmentBuilder(transcript.filepath, { name: transcript.filename });
        await logChannel.send({
          content: `Transcript for ticket **${interaction.channel.name}**`,
          files: [attachment]
        }).catch(() => {});
      }
    }

    db.prepare('DELETE FROM tickets WHERE channel_id = ?').run(interaction.channel.id);

    setTimeout(() => {
      interaction.channel.delete('Ticket closed').catch(() => {});
    }, 5000);
  }
};
