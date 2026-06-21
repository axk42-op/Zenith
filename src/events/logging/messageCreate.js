import { Events } from 'discord.js';
import { isAutomodEnabled } from '../../database/settings.js';
import { runAutomodChecks, handleAutomodViolation } from '../../utils/automod.js';
import { isStaff } from '../../utils/permissions.js';
import { checkXpCooldown } from '../../utils/cooldown.js';
import { addXp } from '../../utils/leveling.js';
import config from '../../config/loadConfig.js';

export default {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    if (isAutomodEnabled(message.guild.id) && !isStaff(message.member, config)) {
      const violations = runAutomodChecks(message);
      if (violations.length) {
        await handleAutomodViolation(message, violations);
        return;
      }
    }

    if (checkXpCooldown(message.author.id, message.guild.id, config.xp.cooldown)) {
      const result = addXp(message.author.id, message.guild.id);

      if (result.leveledUp) {
        try {
          await message.channel.send({
            content: `🎉 Congratulations ${message.author}! You've reached **Level ${result.level}**!`
          });
        } catch {}
      }
    }
  }
};
