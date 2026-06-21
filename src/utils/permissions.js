import { PermissionFlagsBits } from 'discord.js';

export function hasPermission(member, permission) {
  return member.permissions.has(permission);
}

export function isStaff(member, config) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (config.staffRole && member.roles.cache.has(config.staffRole)) return true;
  if (config.moderatorRole && member.roles.cache.has(config.moderatorRole)) return true;
  return false;
}

export function isModerator(member, config) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (config.moderatorRole && member.roles.cache.has(config.moderatorRole)) return true;
  return false;
}

export function canModerate(executor, target, config) {
  if (target.id === executor.id) {
    return { allowed: false, reason: 'You cannot moderate yourself.' };
  }

  if (target.user?.bot || target.bot) {
    return { allowed: false, reason: 'You cannot moderate bots.' };
  }

  const targetMember = target.guild ? target : executor.guild.members.cache.get(target.id);

  if (targetMember?.permissions?.has(PermissionFlagsBits.Administrator)) {
    return { allowed: false, reason: 'You cannot moderate administrators.' };
  }

  if (executor.id === executor.guild.ownerId) {
    return { allowed: true };
  }

  if (targetMember && executor.roles.highest.position <= targetMember.roles.highest.position) {
    return { allowed: false, reason: 'You cannot moderate someone with an equal or higher role.' };
  }

  if (!isModerator(executor, config) && !executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return { allowed: false, reason: 'You do not have permission to use this command.' };
  }

  return { allowed: true };
}

export function canManageRole(executor, role) {
  if (executor.id === executor.guild.ownerId) return true;
  if (role.managed) return false;
  if (role.position >= executor.roles.highest.position) return false;
  return true;
}

export function botCanModerate(guild, targetMember) {
  const me = guild.members.me;
  if (!me) return false;
  if (targetMember.roles.highest.position >= me.roles.highest.position) return false;
  return true;
}
