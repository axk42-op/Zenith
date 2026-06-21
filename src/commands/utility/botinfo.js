import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';
import config from '../../config/loadConfig.js';

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Information about Zenith Bot'),

  async execute(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('Zenith Bot')
      .setDescription('Production Discord bot for **Zenith Crest** community.')
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: 'Discord.js', value: `v${djsVersion}`, inline: true },
        { name: 'Node.js', value: process.version, inline: true }
      )
      .setFooter({ text: 'Zenith Crest Community' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
