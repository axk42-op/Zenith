import { Events } from 'discord.js';
import { goodbyeEmbed } from '../../utils/embeds.js';
import { getSetting } from '../../database/settings.js';
import config from '../../config/loadConfig.js';
import { sendLog } from '../../utils/logger.js';

export default {
  name: Events.GuildMemberRemove,

  async execute(member, client) {
    const welcomeChannelId = getSetting(member.guild.id, 'welcome_channel', config.welcomeChannel);

    if (welcomeChannelId) {
      const channel = member.guild.channels.cache.get(welcomeChannelId) ||
        await member.guild.channels.fetch(welcomeChannelId).catch(() => null);

      if (channel?.isTextBased()) {
        const embed = goodbyeEmbed(member, member.guild.memberCount);
        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    await sendLog(member.guild, client, '👋 Member Left', [
      { name: 'User', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
      { name: 'Joined', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
    ], config.colors.error);
  }
};
