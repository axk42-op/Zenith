import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setSetting } from '../../database/settings.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setautorole')
    .setDescription('Set the role automatically assigned to new members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The member role to assign')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    setSetting(interaction.guild.id, 'member_role', role.id);

    await interaction.reply({
      embeds: [successEmbed('Auto Role Set', `New members will receive the ${role} role.`)],
      ephemeral: true
    });
  }
};
