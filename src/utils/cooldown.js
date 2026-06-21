const cooldowns = new Map();

export function checkCooldown(userId, commandName, duration = 3000) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Map());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const expiration = timestamps.get(userId);

  if (expiration && now < expiration) {
    const remaining = ((expiration - now) / 1000).toFixed(1);
    return { onCooldown: true, remaining };
  }

  timestamps.set(userId, now + duration);
  setTimeout(() => timestamps.delete(userId), duration);
  return { onCooldown: false };
}

const xpCooldowns = new Map();

export function checkXpCooldown(userId, guildId, duration = 60000) {
  const key = `${guildId}:${userId}`;
  const now = Date.now();
  const expiration = xpCooldowns.get(key);

  if (expiration && now < expiration) {
    return false;
  }

  xpCooldowns.set(key, now + duration);
  return true;
}

export function clearXpCooldown(userId, guildId) {
  xpCooldowns.delete(`${guildId}:${userId}`);
}
