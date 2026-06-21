import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileConfig = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

const config = {
  guildId: process.env.GUILD_ID || fileConfig.guildId,
  clientId: process.env.CLIENT_ID || fileConfig.clientId,
  token: process.env.TOKEN || fileConfig.token,
  welcomeChannel: process.env.WELCOME_CHANNEL || fileConfig.welcomeChannel,
  logChannel: process.env.LOG_CHANNEL || fileConfig.logChannel,
  ticketCategory: process.env.TICKET_CATEGORY || fileConfig.ticketCategory,
  ticketLogChannel: process.env.TICKET_LOG_CHANNEL || fileConfig.ticketLogChannel,
  applicationChannel: process.env.APPLICATION_CHANNEL || fileConfig.applicationChannel,
  verificationRole: process.env.VERIFICATION_ROLE || fileConfig.verificationRole,
  memberRole: process.env.MEMBER_ROLE || fileConfig.memberRole,
  staffRole: process.env.STAFF_ROLE || fileConfig.staffRole,
  moderatorRole: process.env.MODERATOR_ROLE || fileConfig.moderatorRole,
  suggestionChannel: process.env.SUGGESTION_CHANNEL || fileConfig.suggestionChannel,
  colors: {
    primary: 0x5865f2,
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
    info: 0x5865f2
  },
  xp: {
    min: 15,
    max: 25,
    cooldown: 60000
  }
};

export default config;
