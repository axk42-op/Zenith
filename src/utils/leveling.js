import db from '../database/db.js';
import { getXpRate } from '../database/settings.js';
import config from '../config/loadConfig.js';

export function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

export function levelFromXp(xp) {
  let level = 0;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
  }
  return { level, remainingXp: xp };
}

export function getUserLevel(userId, guildId) {
  let row = db.prepare('SELECT * FROM levels WHERE user_id = ? AND guild_id = ?').get(userId, guildId);

  if (!row) {
    db.prepare('INSERT INTO levels (user_id, guild_id, xp, level) VALUES (?, ?, 0, 0)').run(userId, guildId);
    row = { user_id: userId, guild_id: guildId, xp: 0, level: 0, last_xp_at: 0 };
  }

  return row;
}

export function addXp(userId, guildId) {
  const rate = getXpRate(guildId);
  const amount = Math.floor((Math.random() * (config.xp.max - config.xp.min + 1) + config.xp.min) * rate);

  const user = getUserLevel(userId, guildId);
  let totalXp = user.xp + amount;
  let level = user.level;

  while (totalXp >= xpForLevel(level)) {
    totalXp -= xpForLevel(level);
    level++;
  }

  db.prepare(`
    UPDATE levels SET xp = ?, level = ?, last_xp_at = ? WHERE user_id = ? AND guild_id = ?
  `).run(totalXp, level, Date.now(), userId, guildId);

  const oldLevel = user.level;
  return { amount, level, leveledUp: level > oldLevel, oldLevel };
}

export function getLeaderboard(guildId, limit = 10) {
  return db.prepare(`
    SELECT user_id, xp, level FROM levels
    WHERE guild_id = ?
    ORDER BY level DESC, xp DESC
    LIMIT ?
  `).all(guildId, limit);
}

export function getUserRank(userId, guildId) {
  const rows = db.prepare(`
    SELECT user_id, level, xp FROM levels
    WHERE guild_id = ?
    ORDER BY level DESC, xp DESC
  `).all(guildId);

  const index = rows.findIndex(r => r.user_id === userId);
  return index === -1 ? null : index + 1;
}
