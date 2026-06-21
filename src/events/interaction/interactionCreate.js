import { Events } from 'discord.js';
import { checkCooldown } from '../../utils/cooldown.js';
import { errorEmbed, successEmbed, suggestionEmbed } from '../../utils/embeds.js';
import { logError } from '../../utils/logger.js';
import { handleTicketButton, handleTicketCloseButton } from '../../handlers/ticketHandler.js';
import {
  handleModApplicationSubmit,
  handleApplicationDecision
} from '../../handlers/applicationHandler.js';
import { getSetting } from '../../database/settings.js';
import config from '../../config/loadConfig.js';
import db from '../../database/db.js';
import { getGiveaway } from '../../utils/giveaway.js';
import { isStaff } from '../../utils/permissions.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        await handleButton(interaction, client);
        return;
      }

      if (interaction.isModalSubmit()) {
        await handleModal(interaction);
        return;
      }
    } catch (error) {
      logError('InteractionCreate', error);

      const reply = {
        embeds: [errorEmbed('Error', 'An unexpected error occurred while processing your request.')],
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  }
};

async function handleSlashCommand(interaction, client) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const cooldown = checkCooldown(interaction.user.id, interaction.commandName, 3000);
  if (cooldown.onCooldown) {
    return interaction.reply({
      embeds: [errorEmbed('Cooldown', `Please wait **${cooldown.remaining}s** before using this command again.`)],
      ephemeral: true
    });
  }

  await command.execute(interaction, client);
}

async function handleButton(interaction, client) {
  const { customId } = interaction;

  if (customId === 'verify_button') {
    const roleId = getSetting(interaction.guild.id, 'verification_role', config.verificationRole);
    if (!roleId) {
      return interaction.reply({
        embeds: [errorEmbed('Not Configured', 'Verification role is not configured.')],
        ephemeral: true
      });
    }

    const member = interaction.member;
    if (member.roles.cache.has(roleId)) {
      return interaction.reply({
        embeds: [errorEmbed('Already Verified', 'You are already verified.')],
        ephemeral: true
      });
    }

    await member.roles.add(roleId);
    return interaction.reply({
      embeds: [successEmbed('Verified!', 'You have been verified. Welcome to Zenith Crest!')],
      ephemeral: true
    });
  }

  if (customId.startsWith('ticket_')) {
    if (customId === 'ticket_close_btn') {
      return handleTicketCloseButton(interaction);
    }
    return handleTicketButton(interaction);
  }

  if (customId.startsWith('app_accept_')) {
    if (!isStaff(interaction.member, config)) {
      return interaction.reply({ content: 'Only staff can review applications.', ephemeral: true });
    }
    return handleApplicationDecision(interaction, true);
  }

  if (customId.startsWith('app_reject_')) {
    if (!isStaff(interaction.member, config)) {
      return interaction.reply({ content: 'Only staff can review applications.', ephemeral: true });
    }
    return handleApplicationDecision(interaction, false);
  }

  if (customId === 'suggest_upvote' || customId === 'suggest_downvote') {
    return handleSuggestionVote(interaction, customId === 'suggest_upvote' ? 'up' : 'down');
  }

  if (customId === 'giveaway_enter') {
    const giveaway = getGiveaway(interaction.message.id);
    if (!giveaway || giveaway.ended) {
      return interaction.reply({ content: 'This giveaway has ended.', ephemeral: true });
    }

    await interaction.message.react('🎉').catch(() => {});
    return interaction.reply({ content: '🎉 You have entered the giveaway!', ephemeral: true });
  }
}

async function handleSuggestionVote(interaction, voteType) {
  const suggestion = db.prepare('SELECT * FROM suggestions WHERE message_id = ?').get(interaction.message.id);

  if (!suggestion) {
    return interaction.reply({ content: 'Suggestion not found.', ephemeral: true });
  }

  const existing = db.prepare(`
    SELECT vote FROM suggestion_votes WHERE message_id = ? AND user_id = ?
  `).get(interaction.message.id, interaction.user.id);

  let upvotes = suggestion.upvotes;
  let downvotes = suggestion.downvotes;

  if (existing) {
    if (existing.vote === voteType) {
      db.prepare('DELETE FROM suggestion_votes WHERE message_id = ? AND user_id = ?')
        .run(interaction.message.id, interaction.user.id);
      if (voteType === 'up') upvotes--;
      else downvotes--;
    } else {
      db.prepare('UPDATE suggestion_votes SET vote = ? WHERE message_id = ? AND user_id = ?')
        .run(voteType, interaction.message.id, interaction.user.id);
      if (voteType === 'up') {
        upvotes++;
        downvotes--;
      } else {
        downvotes++;
        upvotes--;
      }
    }
  } else {
    db.prepare(`
      INSERT INTO suggestion_votes (message_id, user_id, vote) VALUES (?, ?, ?)
    `).run(interaction.message.id, interaction.user.id, voteType);
    if (voteType === 'up') upvotes++;
    else downvotes++;
  }

  db.prepare('UPDATE suggestions SET upvotes = ?, downvotes = ? WHERE message_id = ?')
    .run(upvotes, downvotes, interaction.message.id);

  const user = await interaction.client.users.fetch(suggestion.user_id);
  const embed = suggestionEmbed(user, suggestion.content, upvotes, downvotes);

  await interaction.update({ embeds: [embed], components: interaction.message.components });
}

async function handleModal(interaction) {
  if (interaction.customId === 'mod_application_modal') {
    await handleModApplicationSubmit(interaction);
  }
}
