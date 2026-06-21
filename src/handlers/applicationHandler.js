import db from '../database/db.js';
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { applicationReviewEmbed } from '../utils/embeds.js';
import { sendLog } from '../utils/logger.js';
import config from '../config/loadConfig.js';
import { getSetting } from '../database/settings.js';

export function createModApplicationModal() {
  const modal = new ModalBuilder()
    .setCustomId('mod_application_modal')
    .setTitle('Moderator Application');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('app_age')
        .setLabel('Age')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(3)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('app_timezone')
        .setLabel('Timezone')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('app_experience')
        .setLabel('Previous Experience')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('app_reason')
        .setLabel('Why should we choose you?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('app_activity')
        .setLabel('Activity per day')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100)
    )
  );

  return modal;
}

export async function handleModApplicationSubmit(interaction) {
  const data = {
    age: interaction.fields.getTextInputValue('app_age'),
    timezone: interaction.fields.getTextInputValue('app_timezone'),
    experience: interaction.fields.getTextInputValue('app_experience'),
    reason: interaction.fields.getTextInputValue('app_reason'),
    activity: interaction.fields.getTextInputValue('app_activity')
  };

  const result = db.prepare(`
    INSERT INTO applications (user_id, guild_id, age, timezone, experience, reason, activity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    interaction.user.id,
    interaction.guild.id,
    data.age,
    data.timezone,
    data.experience,
    data.reason,
    data.activity
  );

  const applicationId = result.lastInsertRowid;
  const embed = applicationReviewEmbed(interaction.user, data);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`app_accept_${applicationId}`)
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`app_reject_${applicationId}`)
      .setLabel('Reject')
      .setStyle(ButtonStyle.Danger)
  );

  const appChannelId = getSetting(interaction.guild.id, 'application_channel', config.applicationChannel);
  if (!appChannelId) {
    return interaction.reply({
      content: 'Application submitted, but no review channel is configured. Contact an administrator.',
      ephemeral: true
    });
  }

  const appChannel = interaction.guild.channels.cache.get(appChannelId) ||
    await interaction.guild.channels.fetch(appChannelId).catch(() => null);

  if (!appChannel?.isTextBased()) {
    return interaction.reply({
      content: 'Application submitted, but the review channel could not be found.',
      ephemeral: true
    });
  }

  const message = await appChannel.send({ embeds: [embed], components: [row] });

  db.prepare('UPDATE applications SET message_id = ? WHERE id = ?').run(message.id, applicationId);

  await interaction.reply({
    content: '✅ Your moderator application has been submitted! You will be notified of the decision.',
    ephemeral: true
  });
}

export async function handleApplicationDecision(interaction, accepted) {
  const applicationId = interaction.customId.split('_').pop();
  const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId);

  if (!application) {
    return interaction.reply({ content: 'Application not found.', ephemeral: true });
  }

  if (application.status !== 'pending') {
    return interaction.reply({ content: 'This application has already been reviewed.', ephemeral: true });
  }

  const status = accepted ? 'accepted' : 'rejected';
  db.prepare(`
    UPDATE applications SET status = ?, reviewer_id = ? WHERE id = ?
  `).run(status, interaction.user.id, applicationId);

  const user = await interaction.client.users.fetch(application.user_id).catch(() => null);

  if (accepted) {
    const modRoleId = config.moderatorRole;
    const member = await interaction.guild.members.fetch(application.user_id).catch(() => null);

    if (modRoleId && member) {
      await member.roles.add(modRoleId).catch(() => {});
    }

    if (user) {
      await user.send({
        embeds: [{
          color: 0x57f287,
          title: 'Application Accepted!',
          description: `Congratulations! Your moderator application for **${interaction.guild.name}** has been **accepted**. Welcome to the team!`
        }]
      }).catch(() => {});
    }
  } else if (user) {
    await user.send({
      embeds: [{
        color: 0xed4245,
        title: 'Application Rejected',
        description: `Your moderator application for **${interaction.guild.name}** was not accepted at this time. Thank you for applying.`
      }]
    }).catch(() => {});
  }

  await sendLog(interaction.guild, interaction.client, accepted ? '✅ Application Accepted' : '❌ Application Rejected', [
    { name: 'Applicant', value: `<@${application.user_id}>`, inline: true },
    { name: 'Reviewer', value: `${interaction.user}`, inline: true },
    { name: 'Application ID', value: `${applicationId}`, inline: true }
  ], accepted ? config.colors.success : config.colors.error);

  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('app_accept_disabled')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('app_reject_disabled')
      .setLabel('Reject')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true)
  );

  await interaction.update({
    components: [disabledRow],
    content: `${interaction.message.content || ''}\n\n**${accepted ? '✅ Accepted' : '❌ Rejected'}** by ${interaction.user}`
  });
}
