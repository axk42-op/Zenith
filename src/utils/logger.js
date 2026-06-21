import { getSetting } from '../database/settings.js';
import config from '../config/loadConfig.js';

export async function sendLog(guild, client, title, fields = [], color = config.colors.primary) {
  const logChannelId = getSetting(guild.id, 'log_channel', config.logChannel);
  if (!logChannelId) return;

  const channel = guild.channels.cache.get(logChannelId) ||
    await guild.channels.fetch(logChannelId).catch(() => null);

  if (!channel?.isTextBased()) return;

  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  await channel.send({ embeds: [embed] }).catch(err => {
    console.error('[Logger] Failed to send log:', err.message);
  });
}

export async function sendTicketLog(guild, client, title, fields = []) {
  const channelId = getSetting(guild.id, 'ticket_log_channel', config.ticketLogChannel);
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId) ||
    await guild.channels.fetch(channelId).catch(() => null);

  if (!channel?.isTextBased()) return;

  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(title)
    .addFields(fields)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(err => {
    console.error('[Logger] Failed to send ticket log:', err.message);
  });
}

export function logError(context, error) {
  console.error(`[${context}]`, error?.stack || error);
}

export function logInfo(message) {
  console.log(`[Zenith Bot] ${message}`);
}
