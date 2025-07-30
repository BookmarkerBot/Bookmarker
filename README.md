# Bookmarker

![Bookmarker Banner](https://cdn.buape.com/bookmarker/BookmarkerBanner.png)

[![Discord](https://img.shields.io/discord/1388233593113018440?color=7289DA&label=Discord)](https://discord.gg/MFq4P7r2Uc)
![GitHub Stars](https://img.shields.io/github/stars/BookmarkerBot/Bookmarker?style=social)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit/)
[![Carbon Version](https://img.shields.io/npm/v/@buape/carbon)](https://www.npmjs.com/package/@buape/carbon)

> Bookmarker is a Discord bot built with [Carbon](https://github.com/buape/carbon) by [Codeize](https://github.com/Codeize) that allows users to bookmark messages they find interesting or important, making it easy to revisit them later.

## Setup

1. Create a `.dev.vars` file with the following variables:

```env
BASE_URL="your-base-url"
DEPLOY_SECRET="your-deploy-secret"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_PUBLIC_KEY="discord-public-key"
DISCORD_BOT_TOKEN="your-bot-token"
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun run dev
```

## Commands

- `Right click on a message -> Apps -> Bookmark` - The meat and potatoes of the bot, allowing you to bookmark messages.
- `/help` - Basic information about Bookmarker and its functionality.

## License

MIT
