import { Events } from 'discord.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.ChannelCreate,

  async execute(channel, client) {
    if (!channel.guild) return;

    await sendLog(channel.guild, client, '📁 Channel Created', [
      { name: 'Channel', value: `${channel} (\`${channel.id}\`)`, inline: true },
      { name: 'Type', value: channel.type.toString(), inline: true }
    ], config.colors.success);
  }
};
