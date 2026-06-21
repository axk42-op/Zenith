import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const transcriptDir = join(__dirname, '../../data/transcripts');

if (!existsSync(transcriptDir)) {
  mkdirSync(transcriptDir, { recursive: true });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTimestamp(date) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export async function generateTranscript(channel, ticketInfo = {}) {
  const messages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const fetched = await channel.messages.fetch(options);
    if (fetched.size === 0) break;

    messages.push(...fetched.values());
    lastId = fetched.last().id;

    if (fetched.size < 100) break;
  }

  messages.reverse();

  const messageRows = messages.map(msg => {
    const attachments = msg.attachments.map(a =>
      `<div class="attachment"><a href="${escapeHtml(a.url)}" target="_blank">${escapeHtml(a.name || 'Attachment')}</a></div>`
    ).join('');

    const embeds = msg.embeds.length
      ? `<div class="embed">${msg.embeds.map(e => escapeHtml(e.description || e.title || 'Embed')).join('<br>')}</div>`
      : '';

    return `
      <div class="message">
        <div class="avatar" style="background-image: url('${escapeHtml(msg.author.displayAvatarURL({ size: 64 }))}')"></div>
        <div class="content">
          <div class="header">
            <span class="author">${escapeHtml(msg.author.tag)}</span>
            <span class="timestamp">${formatTimestamp(msg.createdAt)}</span>
          </div>
          <div class="text">${escapeHtml(msg.content) || '<em>No content</em>'}</div>
          ${attachments}
          ${embeds}
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript - ${escapeHtml(channel.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #36393f; color: #dcddde; padding: 20px; }
    .header-info { background: #2f3136; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header-info h1 { color: #fff; margin-bottom: 10px; }
    .header-info p { color: #b9bbbe; margin: 4px 0; }
    .message { display: flex; padding: 8px 16px; margin: 2px 0; border-radius: 4px; }
    .message:hover { background: #32353b; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background-size: cover; flex-shrink: 0; margin-right: 12px; }
    .content { flex: 1; min-width: 0; }
    .header { margin-bottom: 4px; }
    .author { font-weight: 600; color: #fff; margin-right: 8px; }
    .timestamp { font-size: 12px; color: #72767d; }
    .text { word-wrap: break-word; white-space: pre-wrap; }
    .attachment { margin-top: 4px; }
    .attachment a { color: #00aff4; }
    .embed { background: #2f3136; border-left: 4px solid #5865f2; padding: 8px; margin-top: 4px; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header-info">
    <h1>Ticket Transcript</h1>
    <p><strong>Channel:</strong> #${escapeHtml(channel.name)}</p>
    <p><strong>Guild:</strong> ${escapeHtml(channel.guild.name)}</p>
    <p><strong>Ticket Type:</strong> ${escapeHtml(ticketInfo.type || 'Unknown')}</p>
    <p><strong>Created By:</strong> ${escapeHtml(ticketInfo.userId || 'Unknown')}</p>
    <p><strong>Generated:</strong> ${formatTimestamp(new Date())}</p>
    <p><strong>Messages:</strong> ${messages.length}</p>
  </div>
  <div class="messages">
    ${messageRows || '<p>No messages found.</p>'}
  </div>
</body>
</html>`;

  const filename = `transcript-${channel.id}-${Date.now()}.html`;
  const filepath = join(transcriptDir, filename);
  writeFileSync(filepath, html, 'utf-8');

  return { filepath, filename, html, messageCount: messages.length };
}
