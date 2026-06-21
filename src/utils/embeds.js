import { EmbedBuilder } from 'discord.js';
import config from '../config/loadConfig.js';

export function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

export function warningEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

export function logEmbed(title, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(title)
    .setTimestamp();

  if (fields.length) {
    embed.addFields(fields);
  }

  return embed;
}

export function welcomeEmbed(member, memberCount) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('Welcome to Zenith Crest!')
    .setDescription(`Welcome ${member}, we're glad to have you here!`)
    .addFields(
      { name: 'Member', value: `${member}`, inline: true },
      { name: 'Member Count', value: `${memberCount}`, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: 'Zenith Crest Community' })
    .setTimestamp();
}

export function goodbyeEmbed(member, memberCount) {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('Goodbye')
    .setDescription(`${member.user.tag} has left the server.`)
    .addFields(
      { name: 'Member Count', value: `${memberCount}`, inline: true },
      { name: 'Joined', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setTimestamp();
}

export function moderationEmbed(action, target, moderator, reason) {
  return logEmbed(`Moderation: ${action}`, [
    { name: 'User', value: `${target} (\`${target.id}\`)`, inline: true },
    { name: 'Moderator', value: `${moderator}`, inline: true },
    { name: 'Reason', value: reason || 'No reason provided', inline: false }
  ]);
}

export function ticketEmbed(type, user) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`Ticket: ${type}`)
    .setDescription(`Welcome ${user}! A staff member will assist you shortly.`)
    .addFields(
      { name: 'Created By', value: `${user}`, inline: true },
      { name: 'Type', value: type, inline: true }
    )
    .setTimestamp();
}

export function applicationReviewEmbed(user, data) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('Moderator Application')
    .setDescription(`Application from ${user}`)
    .addFields(
      { name: 'Age', value: data.age, inline: true },
      { name: 'Timezone', value: data.timezone, inline: true },
      { name: 'Activity/Day', value: data.activity, inline: true },
      { name: 'Previous Experience', value: data.experience, inline: false },
      { name: 'Why should we choose you?', value: data.reason, inline: false }
    )
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .setTimestamp();
}

export function suggestionEmbed(user, content, upvotes = 0, downvotes = 0) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('New Suggestion')
    .setDescription(content)
    .addFields(
      { name: 'Suggested By', value: `${user}`, inline: true },
      { name: 'Upvotes', value: `${upvotes}`, inline: true },
      { name: 'Downvotes', value: `${downvotes}`, inline: true }
    )
    .setTimestamp();
}

export function rankEmbed(member, rank, xp, level, nextLevelXp) {
  const progress = Math.floor((xp / nextLevelXp) * 100);
  const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`${member.user.username}'s Rank`)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'Level', value: `${level}`, inline: true },
      { name: 'Rank', value: `#${rank}`, inline: true },
      { name: 'XP', value: `${xp} / ${nextLevelXp}`, inline: true },
      { name: 'Progress', value: `\`${bar}\` ${progress}%`, inline: false }
    )
    .setTimestamp();
}

export function giveawayEmbed(prize, host, endsAt, winnersCount, ended = false) {
  const embed = new EmbedBuilder()
    .setColor(ended ? config.colors.error : config.colors.success)
    .setTitle(ended ? 'Giveaway Ended' : '🎉 Giveaway')
    .setDescription(`**Prize:** ${prize}`)
    .addFields(
      { name: 'Hosted By', value: `${host}`, inline: true },
      { name: 'Winners', value: `${winnersCount}`, inline: true },
      { name: ended ? 'Ended' : 'Ends', value: `<t:${Math.floor(endsAt / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  if (!ended) {
    embed.setFooter({ text: 'React with 🎉 or click the button to enter!' });
  }

  return embed;
}
