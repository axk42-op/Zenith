import { Events } from 'discord.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.ChannelDelete,

  async execute(channel, client) {
    if (!channel.guild) return;

    await sendLog(channel.guild, client, '🗑️ Channel Deleted', [
      { name: 'Channel', value: `#${channel.name} (\`${channel.id}\`)`, inline: true },
      { name: 'Type', value: channel.type.toString(), inline: true }
    ], config.colors.error);
  }
};
