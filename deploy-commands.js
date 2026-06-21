import { REST, Routes } from 'discord.js';
import config from './src/config/loadConfig.js';
import { loadCommands } from './src/handlers/handler.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

await loadCommands(client);

if (!config.token || !config.clientId || !config.guildId) {
  console.error('Missing TOKEN, CLIENT_ID, or GUILD_ID. Check your .env file.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  console.log(`Deploying ${client.commandData.length} slash command(s)...`);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: client.commandData }
  );

  console.log('Successfully deployed slash commands!');
} catch (error) {
  console.error('Failed to deploy commands:', error);
  process.exit(1);
}
