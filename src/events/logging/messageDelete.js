import { Events } from 'discord.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.MessageDelete,

  async execute(message, client) {
    if (message.partial) {
      try { await message.fetch(); } catch { return; }
    }

    if (!message.guild || message.author?.bot) return;

    const content = message.content?.slice(0, 1024) || '*No text content*';

    await sendLog(message.guild, client, '🗑️ Message Deleted', [
      { name: 'Author', value: `${message.author?.tag || 'Unknown'} (\`${message.author?.id || 'Unknown'}\`)`, inline: true },
      { name: 'Channel', value: `${message.channel}`, inline: true },
      { name: 'Content', value: content, inline: false }
    ], config.colors.error);
  }
};
