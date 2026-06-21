import { Events } from 'discord.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.MessageUpdate,

  async execute(oldMessage, newMessage, client) {
    if (oldMessage.partial) {
      try { await oldMessage.fetch(); } catch { return; }
    }
    if (newMessage.partial) {
      try { await newMessage.fetch(); } catch { return; }
    }

    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    await sendLog(newMessage.guild, client, '✏️ Message Edited', [
      { name: 'Author', value: `${newMessage.author.tag} (\`${newMessage.author.id}\`)`, inline: true },
      { name: 'Channel', value: `${newMessage.channel}`, inline: true },
      { name: 'Before', value: (oldMessage.content || '*Empty*').slice(0, 1024), inline: false },
      { name: 'After', value: (newMessage.content || '*Empty*').slice(0, 1024), inline: false },
      { name: 'Jump', value: `[Go to message](${newMessage.url})`, inline: false }
    ], config.colors.warning);
  }
};
