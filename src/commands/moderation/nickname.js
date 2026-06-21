import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { canModerate, botCanModerate } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendLog } from '../../utils/logger.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user\'s nickname')
    .addUserOption(option =>
      option.setName('user').setDescription('User to rename').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('New nickname (leave empty to reset)').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const name = interaction.options.getString('name');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'User not found.')], ephemeral: true });
    }

    const check = canModerate(interaction.member, member, config);
    if (!check.allowed) {
      return interaction.reply({ embeds: [errorEmbed('Permission Denied', check.reason)], ephemeral: true });
    }

    if (!botCanModerate(interaction.guild, member)) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'I cannot change this user\'s nickname due to role hierarchy.')], ephemeral: true });
    }

    if (name && name.length > 32) {
      return interaction.reply({ embeds: [errorEmbed('Error', 'Nickname must be 32 characters or less.')], ephemeral: true });
    }

    await member.setNickname(name || null, `${interaction.user.tag}: Nickname changed`);

    await sendLog(interaction.guild, interaction.client, '✏️ Nickname Changed', [
      { name: 'User', value: `${user}`, inline: true },
      { name: 'Moderator', value: `${interaction.user}`, inline: true },
      { name: 'New Nickname', value: name || '*Reset to username*', inline: false }
    ]);

    await interaction.reply({
      embeds: [successEmbed('Nickname Updated', `${user}'s nickname has been ${name ? `set to **${name}**` : 'reset'}.`)],
      ephemeral: true
    });
  }
};
