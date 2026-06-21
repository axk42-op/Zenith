import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { canModerate, botCanModerate } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user').setDescription('User to kick').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the kick').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'User not found.')], ephemeral: true });
    }

    const check = canModerate(interaction.member, member, config);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', check.reason)], ephemeral: true });
    }

    if (!botCanModerate(interaction.guild, member)) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'I cannot kick this user due to role hierarchy.')], ephemeral: true });
    }

    try {
      await user.send({ embeds: [errorEmbed('Kicked', `You were kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] });
    } catch {}

    await member.kick(`${interaction.user.tag}: ${reason}`);

    await sendLog(interaction.guild, interaction.client, '👢 User Kicked', [
      { name: 'User', value: `${user} (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true },
      { name: 'Reason', value: reason, inline: false }
    ], config.colors.error);

    await interaction.reply({
      embeds: [successEmbed('User Kicked', `${user.tag} has been kicked.`)],
      ephemeral: true
    });
  }
};
