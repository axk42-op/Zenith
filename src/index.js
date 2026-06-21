import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import config from './config/loadConfig.js';
import { loadCommands, loadEvents } from './handlers/handler.js';
import { initializeDatabase } from './database/db.js';
import { logInfo, logError } from './utils/logger.js';

if (!config.token) {
  console.error('Missing TOKEN in environment or config. Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember
  ]
});

client.commands = new Collection();
client.commandData = [];

initializeDatabase();

await loadCommands(client);
await loadEvents(client);

client.on('error', error => logError('Client', error));
process.on('unhandledRejection', error => logError('UnhandledRejection', error));
process.on('uncaughtException', error => logError('UncaughtException', error));

logInfo('Starting Zenith Bot...');
client.login(config.token);
