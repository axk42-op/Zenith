import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import ms from 'ms';
import { giveawayEmbed } from '../../utils/embeds.js';
import { createGiveaway, getGiveaway, scheduleGiveawayEnd, processGiveawayEnd, rerollGiveaway } from '../../utils/giveaway.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 1d)').setRequired(true))
        .addStringOption(o => o.setName('prize').setDescription('Prize description').setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(true).setMinValue(1).setMaxValue(20))
    )
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End a giveaway early')
        .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reroll')
        .setDescription('Reroll giveaway winners')
        .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const durationStr = interaction.options.getString('duration');
      const prize = interaction.options.getString('prize');
      const winners = interaction.options.getInteger('winners');
      const duration = ms(durationStr);

      if (!duration || duration < 10000) {
        return interaction.reply({
          embeds: [errorEmbed('Invalid Duration', 'Please provide a valid duration (minimum 10 seconds).')],
          ephemeral: true
        });
      }

      const endsAt = Math.floor((Date.now() + duration) / 1000);

      const embed = giveawayEmbed(prize, interaction.user, endsAt * 1000, winners);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_enter')
          .setLabel('Enter Giveaway')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎉')
      );

      const message = await interaction.channel.send({ embeds: [embed], components: [row] });
      await message.react('🎉');

      createGiveaway({
        messageId: message.id,
        channelId: message.channel.id,
        guildId: interaction.guild.id,
        prize,
        winnersCount: winners,
        hostId: interaction.user.id,
        endsAt
      });

      scheduleGiveawayEnd(interaction.client, {
        message_id: message.id,
        ends_at: endsAt
      });

      await interaction.reply({
        embeds: [successEmbed('Giveaway Started', `Giveaway created in ${interaction.channel}.`)],
        ephemeral: true
      });
    }

    if (sub === 'end') {
      const messageId = interaction.options.getString('message_id');
      const giveaway = getGiveaway(messageId);

      if (!giveaway) {
        return interaction.reply({ embeds: [errorEmbed('Not Found', 'Giveaway not found.')], ephemeral: true });
      }

      if (giveaway.ended) {
        return interaction.reply({ embeds: [errorEmbed('Already Ended', 'This giveaway has already ended.')], ephemeral: true });
      }

      await processGiveawayEnd(interaction.client, messageId);

      await interaction.reply({
        embeds: [successEmbed('Giveaway Ended', 'The giveaway has been ended early.')],
        ephemeral: true
      });
    }

    if (sub === 'reroll') {
      const messageId = interaction.options.getString('message_id');
      const result = await rerollGiveaway(interaction.client, messageId);

      if (!result.success) {
        return interaction.reply({ embeds: [errorEmbed('Error', result.error)], ephemeral: true });
      }

      const winnerMention = result.winners.length
        ? result.winners.map(id => `<@${id}>`).join(', ')
        : 'No valid entries';

      await result.channel.send({
        content: `🎉 New winner(s) for **${result.prize}**: ${winnerMention}!`,
        allowedMentions: { users: result.winners }
      });

      await interaction.reply({
        embeds: [successEmbed('Giveaway Rerolled', `New winners: ${winnerMention}`)],
        ephemeral: true
      });
    }
  }
};
