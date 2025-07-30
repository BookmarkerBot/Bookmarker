import {
	ApplicationAuthorizedListener,
	ApplicationIntegrationType,
	type Client,
	type ListenerEvent,
	type ListenerEventData,
} from "@buape/carbon";

// const SERVER_WEBHOOK_URL = process.env.SERVER_WEBHOOK_URL;
// const USER_WEBHOOK_URL = process.env.USER_WEBHOOK_URL;

export default class ApplicationAuthorized extends ApplicationAuthorizedListener {
	async handle(
		data: ListenerEventData[typeof ListenerEvent.ApplicationAuthorized],
		_client: Client,
	) {
		// const webhookUrl =
		// 	data.integration_type === ApplicationIntegrationType.GuildInstall
		// 		? SERVER_WEBHOOK_URL
		// 		: USER_WEBHOOK_URL;
		let content: string;

		if (data.integration_type === ApplicationIntegrationType.GuildInstall) {
			content = `🤖 Bot added to server: **${data.guild?.name}** (\`${data.guild?.id}\`) by user: **${data.user.username}** (\`${data.user.id}\`)`;
			console.log(content);
		} else {
			content = `👤 Bot added to user: **${data.user.username}** (\`${data.user.id}\`)`;
			console.log(content);
		}

		// return await fetch(webhookUrl as string, {
		// 	method: "POST",
		// 	headers: { "Content-Type": "application/json" },
		// 	body: JSON.stringify({
		// 		content,
		// 	}),
		// }).catch((error) => {
		// 	console.error("Failed to send webhook:", error);
		// 	return null;
		// });
	}
}
