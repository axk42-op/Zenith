import { Events } from 'discord.js';
import { welcomeEmbed } from '../../utils/embeds.js';
import { getSetting } from '../../database/settings.js';
import config from '../../config/loadConfig.js';
import db from '../../database/db.js';
import { sendLog } from '../../utils/logger.js';

export default {
  name: Events.GuildMemberAdd,

  async execute(member, client) {
    db.prepare(`
      INSERT OR IGNORE INTO users (user_id, guild_id) VALUES (?, ?)
    `).run(member.id, member.guild.id);

    const welcomeChannelId = getSetting(member.guild.id, 'welcome_channel', config.welcomeChannel);
    const memberRoleId = getSetting(member.guild.id, 'member_role', config.memberRole);

    if (memberRoleId) {
      const role = member.guild.roles.cache.get(memberRoleId);
      if (role) {
        await member.roles.add(role).catch(err => {
          console.error('[Welcome] Failed to assign member role:', err.message);
        });
      }
    }

    if (welcomeChannelId) {
      const channel = member.guild.channels.cache.get(welcomeChannelId) ||
        await member.guild.channels.fetch(welcomeChannelId).catch(() => null);

      if (channel?.isTextBased()) {
        const embed = welcomeEmbed(member, member.guild.memberCount);
        await channel.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
      }
    }

    await sendLog(member.guild, client, '👋 Member Joined', [
      { name: 'User', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
    ], config.colors.success);
  }
};
