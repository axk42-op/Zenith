const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'cunt', 'dick', 'pussy', 'nigger', 'nigga', 'faggot', 'retard'
];

const inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/[^\s]+/gi;
const mentionRegex = /<@[!&]?\d+>/g;

const spamTracker = new Map();

export function checkBadWords(content) {
  const lower = content.toLowerCase();
  return BAD_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

export function checkInviteLinks(content) {
  return inviteRegex.test(content);
}

export function checkMassMentions(content) {
  const mentions = content.match(mentionRegex);
  return mentions && mentions.length >= 5;
}

export function checkCapsSpam(content) {
  if (content.length < 10) return false;
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 10) return false;
  const caps = letters.replace(/[^A-Z]/g, '').length;
  return (caps / letters.length) > 0.7;
}

export function checkSpam(userId, guildId) {
  const key = `${guildId}:${userId}`;
  const now = Date.now();
  const window = 5000;
  const maxMessages = 5;

  if (!spamTracker.has(key)) {
    spamTracker.set(key, []);
  }

  const timestamps = spamTracker.get(key).filter(t => now - t < window);
  timestamps.push(now);
  spamTracker.set(key, timestamps);

  return timestamps.length > maxMessages;
}

export function runAutomodChecks(message) {
  const content = message.content;
  const violations = [];

  if (checkSpam(message.author.id, message.guild.id)) {
    violations.push('Anti-Spam');
  }

  if (checkInviteLinks(content)) {
    violations.push('Invite Links');
  }

  if (checkMassMentions(content)) {
    violations.push('Mass Mentions');
  }

  if (checkCapsSpam(content)) {
    violations.push('Caps Spam');
  }

  if (checkBadWords(content)) {
    violations.push('Bad Words');
  }

  return violations;
}

export async function handleAutomodViolation(message, violations) {
  try {
    await message.delete();

    const warning = await message.channel.send({
      content: `${message.author}, your message was removed: **${violations.join(', ')}**`
    });

    setTimeout(() => warning.delete().catch(() => {}), 5000);
  } catch (error) {
    console.error('[Automod] Failed to handle violation:', error.message);
  }
}
