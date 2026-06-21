# Zenith Bot

Production-ready Discord bot for the **Zenith Crest** community server.

Built with Node.js, Discord.js v14, and SQLite.

## Features

- **Welcome System** — Welcome/goodbye embeds, auto-role, member count
- **Moderation** — Warn, kick, ban, mute, purge, lock/unlock, nicknames
- **Tickets** — Support, mod applications, reports, partnerships with HTML transcripts
- **Moderator Applications** — Discord modals with accept/reject workflow
- **Verification** — Button-based role verification
- **Leveling** — XP from messages, ranks, leaderboard
- **Giveaways** — Timed giveaways with auto-end and reroll
- **Suggestions** — Upvote/downvote suggestion system
- **Logging** — Message edits/deletes, joins/leaves, channel/role changes
- **Automod** — Anti-spam, invite links, mass mentions, caps, bad words
- **Utility** — User/server info, avatar, banner, ping, and more
- **Staff Tools** — Announce, embed builder, say commands

## Requirements

- Node.js 18 or higher
- A Discord bot application ([Discord Developer Portal](https://discord.com/developers/applications))

## Bot Permissions

Invite the bot with these permissions:

- Manage Channels
- Manage Roles
- Manage Messages
- Kick Members
- Ban Members
- Moderate Members
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Application Commands

**Required Intents** (enable in Developer Portal):

- Server Members Intent
- Message Content Intent

## Installation

```bash
# Clone or navigate to the project
cd zenith-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## Configuration

### 1. Environment Variables (`.env`)

```env
TOKEN=your_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_discord_server_id
```

Optional overrides:

```env
WELCOME_CHANNEL=
LOG_CHANNEL=
TICKET_CATEGORY=
TICKET_LOG_CHANNEL=
APPLICATION_CHANNEL=
VERIFICATION_ROLE=
MEMBER_ROLE=
STAFF_ROLE=
MODERATOR_ROLE=
SUGGESTION_CHANNEL=
```

### 2. Config File (`src/config/config.json`)

Fill in IDs for your Zenith Crest server:

```json
{
  "guildId": "YOUR_GUILD_ID",
  "clientId": "YOUR_CLIENT_ID",
  "token": "",
  "welcomeChannel": "WELCOME_CHANNEL_ID",
  "logChannel": "LOG_CHANNEL_ID",
  "ticketCategory": "TICKET_CATEGORY_ID",
  "ticketLogChannel": "TICKET_LOG_CHANNEL_ID",
  "applicationChannel": "APPLICATION_REVIEW_CHANNEL_ID",
  "verificationRole": "VERIFIED_ROLE_ID",
  "memberRole": "MEMBER_ROLE_ID",
  "staffRole": "STAFF_ROLE_ID",
  "moderatorRole": "MODERATOR_ROLE_ID",
  "suggestionChannel": "SUGGESTION_CHANNEL_ID"
}
```

> **Note:** Store your bot token in `.env` only — never commit it to version control.

### 3. Deploy Slash Commands

```bash
npm run deploy
```

### 4. Start the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## Setup Checklist

1. Create roles: Member, Verified, Staff, Moderator
2. Create channels: welcome, logs, ticket-log, applications, suggestions
3. Create a ticket category
4. Fill in `config.json` and `.env`
5. Run `npm run deploy`
6. Run `npm start`
7. Use `/verificationpanel` and `/ticketpanel` in your server
8. Use `/setwelcomechannel` and `/setautorole` if needed

## Command List

### Administration
| Command | Description |
|---------|-------------|
| `/setwelcomechannel` | Set welcome/goodbye channel |
| `/setautorole` | Set auto-assigned member role |
| `/setapplicationchannel` | Set mod application review channel |
| `/automod enable/disable` | Toggle automod |
| `/setxprate` | Set XP multiplier |
| `/verificationpanel` | Post verification button panel |
| `/ticketpanel` | Post ticket panel |
| `/announce` | Send an announcement embed |
| `/embedbuilder` | Build and send a custom embed |
| `/say` | Make the bot say a message |

### Moderation
| Command | Description |
|---------|-------------|
| `/warn` | Warn a user |
| `/warnings` | View user warnings |
| `/clearwarnings` | Clear user warnings |
| `/kick` | Kick a user |
| `/ban` | Ban a user |
| `/unban` | Unban by user ID |
| `/mute` | Timeout a user |
| `/unmute` | Remove timeout |
| `/purge` | Bulk delete messages |
| `/lock` | Lock a channel |
| `/unlock` | Unlock a channel |
| `/nickname` | Change a nickname |

### Tickets
| Command | Description |
|---------|-------------|
| `/close` | Close ticket with transcript |
| `/claim` | Claim a ticket |
| `/rename` | Rename ticket channel |
| `/adduser` | Add user to ticket |
| `/removeuser` | Remove user from ticket |
| `/transcript` | Generate HTML transcript |

### Utility
| Command | Description |
|---------|-------------|
| `/userinfo` | User information |
| `/serverinfo` | Server information |
| `/avatar` | View avatar |
| `/banner` | View banner |
| `/ping` | Bot latency |
| `/botinfo` | Bot information |
| `/roleinfo` | Role information |
| `/channelinfo` | Channel information |
| `/rank` | View XP rank |
| `/leaderboard` | XP leaderboard |
| `/suggest` | Submit a suggestion |
| `/giveaway start/end/reroll` | Manage giveaways |

## Project Structure

```
zenith-bot/
├── src/
│   ├── commands/
│   │   ├── administration/
│   │   ├── applications/
│   │   ├── moderation/
│   │   ├── tickets/
│   │   └── utility/
│   ├── events/
│   │   ├── guild/
│   │   ├── interaction/
│   │   └── logging/
│   ├── handlers/
│   ├── database/
│   ├── config/
│   ├── utils/
│   └── index.js
├── data/                  # SQLite DB & transcripts (auto-created)
├── .env.example
├── deploy-commands.js
├── package.json
└── README.md
```

## Hosting

### PM2 (Recommended)

```bash
npm install -g pm2
pm2 start src/index.js --name zenith-bot
pm2 save
pm2 startup
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "src/index.js"]
```

### Railway / Render / VPS

1. Set environment variables in the hosting dashboard
2. Set start command: `node src/index.js`
3. Ensure the `data/` directory persists between restarts

## Database

SQLite database is stored at `data/zenith.db`.

Tables: `users`, `warnings`, `tickets`, `applications`, `levels`, `giveaways`, `suggestions`, `settings`, `suggestion_votes`

## Security Notes

- Never share your bot token
- Keep role hierarchy correct (bot role above managed roles)
- Review automod bad word list for your community standards
- Back up `data/zenith.db` regularly

## License

MIT — Zenith Crest Community
