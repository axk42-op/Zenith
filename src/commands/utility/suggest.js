import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import db from '../../database/db.js';
import { suggestionEmbed } from '../../utils/embeds.js';
import { getSetting } from '../../database/settings.js';
import config from '../../config/loadConfig.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Your suggestion')
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction) {
    const content = interaction.options.getString('suggestion');
    const channelId = getSetting(interaction.guild.id, 'suggestion_channel', config.suggestionChannel);

    if (!channelId) {
      return interaction.reply({
        embeds: [errorEmbed('Not Configured', 'Suggestion channel is not configured. Ask an admin to set it up.')],
        ephemeral: true
      });
    }

    const channel = interaction.guild.channels.cache.get(channelId) ||
      await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel?.isTextBased()) {
      return interaction.reply({
        embeds: [errorEmbed('Error', 'Suggestion channel could not be found.')],
        ephemeral: true
      });
    }

    const embed = suggestionEmbed(interaction.user, content);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('suggest_upvote')
        .setLabel('Upvote')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId('suggest_downvote')
        .setLabel('Downvote')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    const message = await channel.send({ embeds: [embed], components: [row] });

    db.prepare(`
      INSERT INTO suggestions (message_id, channel_id, guild_id, user_id, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(message.id, channel.id, interaction.guild.id, interaction.user.id, content);

    await interaction.reply({
      embeds: [successEmbed('Suggestion Submitted', `Your suggestion was posted in ${channel}.`)],
      ephemeral: true
    });
  }
};
