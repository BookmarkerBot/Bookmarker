import { Client } from "@buape/carbon";
import { createHandler } from "@buape/carbon/adapters/fetch";
import BookmarkCommand from "./commands/bookmark.js";
import HelpCommand from "./commands/help.js";
import ApplicationAuthorized from "./events/authorized.js";

const isBeta = process.env.ENVIRONMENT === "beta";

const client = new Client(
	{
		baseUrl: isBeta ? process.env.BETA_BASE_URL : process.env.BASE_URL,
		deploySecret: isBeta
			? process.env.BETA_DEPLOY_SECRET
			: process.env.DEPLOY_SECRET,
		clientId: isBeta
			? process.env.BETA_DISCORD_CLIENT_ID
			: process.env.DISCORD_CLIENT_ID,
		publicKey: isBeta
			? process.env.BETA_DISCORD_PUBLIC_KEY
			: process.env.DISCORD_PUBLIC_KEY,
		token: isBeta
			? process.env.BETA_DISCORD_BOT_TOKEN
			: process.env.DISCORD_BOT_TOKEN,
		devGuilds: process.env.DISCORD_DEV_GUILDS?.split(","),
	},
	{
		commands: [new BookmarkCommand(), new HelpCommand()],
		listeners: [new ApplicationAuthorized()],
	},
);

const handler = createHandler(client);
export default { fetch: handler };

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BASE_URL: string;
			DEPLOY_SECRET: string;
			DISCORD_CLIENT_ID: string;
			DISCORD_PUBLIC_KEY: string;
			DISCORD_BOT_TOKEN: string;
			BETA_BASE_URL: string;
			BETA_DEPLOY_SECRET: string;
			BETA_DISCORD_CLIENT_ID: string;
			BETA_DISCORD_CLIENT_SECRET: string;
			BETA_DISCORD_PUBLIC_KEY: string;
			BETA_DISCORD_BOT_TOKEN: string;
		}
	}
}
