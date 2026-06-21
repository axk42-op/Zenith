import { Events, ActivityType } from 'discord.js';
import { initializeDatabase } from '../../database/db.js';
import { restoreGiveawayTimers } from '../../utils/giveaway.js';
import { logInfo } from '../../utils/logger.js';

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    initializeDatabase();
    logInfo(`Logged in as ${client.user.tag}`);
    logInfo(`Serving ${client.guilds.cache.size} guild(s)`);

    client.user.setActivity('Zenith Crest', { type: ActivityType.Watching });

    restoreGiveawayTimers(client);
  }
};
