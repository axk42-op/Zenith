import db from '../database/db.js';
import { giveawayEmbed } from './embeds.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const activeTimers = new Map();

export function createGiveaway(giveaway) {
  db.prepare(`
    INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winners_count, host_id, ends_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    giveaway.messageId,
    giveaway.channelId,
    giveaway.guildId,
    giveaway.prize,
    giveaway.winnersCount,
    giveaway.hostId,
    giveaway.endsAt
  );
}

export function getGiveaway(messageId) {
  return db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
}

export function getActiveGiveaways() {
  return db.prepare('SELECT * FROM giveaways WHERE ended = 0').all();
}

export function endGiveaway(messageId, winners) {
  db.prepare(`
    UPDATE giveaways SET ended = 1, winners = ? WHERE message_id = ?
  `).run(JSON.stringify(winners), messageId);
}

export function scheduleGiveawayEnd(client, giveaway) {
  const remaining = giveaway.ends_at * 1000 - Date.now();

  if (remaining <= 0) {
    processGiveawayEnd(client, giveaway.message_id);
    return;
  }

  if (activeTimers.has(giveaway.message_id)) {
    clearTimeout(activeTimers.get(giveaway.message_id));
  }

  const timer = setTimeout(() => {
    processGiveawayEnd(client, giveaway.message_id);
    activeTimers.delete(giveaway.message_id);
  }, remaining);

  activeTimers.set(giveaway.message_id, timer);
}

export async function processGiveawayEnd(client, messageId) {
  const giveaway = getGiveaway(messageId);
  if (!giveaway || giveaway.ended) return;

  try {
    const channel = await client.channels.fetch(giveaway.channel_id);
    if (!channel?.isTextBased()) return;

    const message = await channel.messages.fetch(messageId);
    const host = await client.users.fetch(giveaway.host_id).catch(() => ({ tag: 'Unknown' }));

    const entrants = await getGiveawayEntrants(message);
    const winners = pickWinners(entrants, giveaway.winners_count);

    endGiveaway(messageId, winners);

    const winnerMention = winners.length
      ? winners.map(id => `<@${id}>`).join(', ')
      : 'No valid entries';

    const embed = giveawayEmbed(giveaway.prize, host, giveaway.ends_at * 1000, giveaway.winners_count, true);
    embed.addFields({ name: 'Winners', value: winnerMention });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Ended')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
        .setEmoji('🎉')
    );

    await message.edit({ embeds: [embed], components: [row] });

    if (winners.length) {
      await channel.send({
        content: `🎉 Congratulations ${winnerMention}! You won **${giveaway.prize}**!`,
        allowedMentions: { users: winners }
      });
    }
  } catch (error) {
    console.error('[Giveaway] Failed to end giveaway:', error.message);
  }
}

async function getGiveawayEntrants(message) {
  const entrants = new Set();

  const reaction = message.reactions.cache.get('🎉');
  if (reaction) {
    const users = await reaction.users.fetch();
    users.filter(u => !u.bot).forEach(u => entrants.add(u.id));
  }

  return [...entrants];
}

function pickWinners(entrants, count) {
  if (!entrants.length) return [];
  const shuffled = [...entrants].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function restoreGiveawayTimers(client) {
  const active = getActiveGiveaways();
  for (const giveaway of active) {
    scheduleGiveawayEnd(client, giveaway);
  }
  console.log(`[Giveaway] Restored ${active.length} active giveaway(s).`);
}

export async function rerollGiveaway(client, messageId) {
  const giveaway = getGiveaway(messageId);
  if (!giveaway) return { success: false, error: 'Giveaway not found.' };
  if (!giveaway.ended) return { success: false, error: 'Giveaway has not ended yet.' };

  const channel = await client.channels.fetch(giveaway.channel_id);
  const message = await channel.messages.fetch(messageId);
  const entrants = await getGiveawayEntrants(message);
  const previousWinners = JSON.parse(giveaway.winners || '[]');
  const eligible = entrants.filter(id => !previousWinners.includes(id));
  const pool = eligible.length ? eligible : entrants;
  const winners = pickWinners(pool, giveaway.winners_count);

  return { success: true, winners, prize: giveaway.prize, channel };
}
