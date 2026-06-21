import { Events } from 'discord.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.GuildRoleDelete,

  async execute(role, client) {
    await sendLog(role.guild, client, '🗑️ Role Deleted', [
      { name: 'Role', value: `${role.name} (\`${role.id}\`)`, inline: true },
      { name: 'Color', value: role.hexColor, inline: true }
    ], config.colors.error);
  }
};
