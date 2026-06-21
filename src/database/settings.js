import db from '../database/db.js';

export function getSetting(guildId, key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE guild_id = ? AND key = ?').get(guildId, key);
  return row ? row.value : fallback;
}

export function setSetting(guildId, key, value) {
  db.prepare(`
    INSERT INTO settings (guild_id, key, value)
    VALUES (?, ?, ?)
    ON CONFLICT(guild_id, key) DO UPDATE SET value = excluded.value
  `).run(guildId, key, String(value));
}

export function getGuildSettings(guildId) {
  const rows = db.prepare('SELECT key, value FROM settings WHERE guild_id = ?').all(guildId);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export function isAutomodEnabled(guildId) {
  return getSetting(guildId, 'automod_enabled', 'true') === 'true';
}

export function setAutomodEnabled(guildId, enabled) {
  setSetting(guildId, 'automod_enabled', enabled ? 'true' : 'false');
}

export function getXpRate(guildId) {
  const rate = getSetting(guildId, 'xp_rate', '1');
  return parseFloat(rate) || 1;
}

export function setXpRate(guildId, rate) {
  setSetting(guildId, 'xp_rate', String(rate));
}
