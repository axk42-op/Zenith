import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logInfo, logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands(client) {
  client.commands = new Map();
  client.commandData = [];

  const categories = readdirSync(join(__dirname, '../commands'));

  for (const category of categories) {
    const categoryPath = join(__dirname, '../commands', category);
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const filePath = join(categoryPath, file);
        const command = await import(`file://${filePath}`);

        if (!command.default?.data || !command.default?.execute) {
          logError('CommandHandler', `Command ${file} is missing data or execute export.`);
          continue;
        }

        command.default.category = category;
        client.commands.set(command.default.data.name, command.default);
        client.commandData.push(command.default.data.toJSON());
        logInfo(`Loaded command: /${command.default.data.name}`);
      } catch (error) {
        logError('CommandHandler', `Failed to load ${file}: ${error.message}`);
      }
    }
  }
}

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const categories = readdirSync(eventsPath);

  for (const category of categories) {
    const categoryPath = join(eventsPath, category);
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const filePath = join(categoryPath, file);
        const event = await import(`file://${filePath}`);

        if (!event.default?.name || !event.default?.execute) {
          logError('EventHandler', `Event ${file} is missing name or execute export.`);
          continue;
        }

        if (event.default.once) {
          client.once(event.default.name, (...args) => event.default.execute(...args, client));
        } else {
          client.on(event.default.name, (...args) => event.default.execute(...args, client));
        }

        logInfo(`Loaded event: ${event.default.name} (${category}/${file})`);
      } catch (error) {
        logError('EventHandler', `Failed to load ${file}: ${error.message}`);
      }
    }
  }
}
