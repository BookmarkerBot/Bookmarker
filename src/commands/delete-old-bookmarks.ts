import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	Command,
	type CommandInteraction,
} from "@buape/carbon";

export default class DeleteOldBookmarksCommand extends Command {
	name = "Delete Old Bookmarks";
	description = "Deletes old bookmarks from V1 of Bookmarker";
	type: ApplicationCommandType = ApplicationCommandType.Message;
	integrationTypes: ApplicationIntegrationType[] = [
		ApplicationIntegrationType.GuildInstall,
		ApplicationIntegrationType.UserInstall,
	];

	defer = true;
	ephemeral = true;

	async run(interaction: CommandInteraction) {
		if (interaction.rawData.data.type !== ApplicationCommandType.Message)
			return;

		if (!interaction.user) return;
		if (!interaction.channel) return;
		if (interaction.guild?.id)
			return interaction.reply({
				content: "This command can only be used in DMs.",
			});

		const resolvedTargetMessage =
			interaction.rawData.data.resolved.messages[
				interaction.rawData.data.target_id
			];

		const message = await interaction.client
			.fetchMessage(resolvedTargetMessage.channel_id, resolvedTargetMessage.id)
			.catch(() => {
				return null;
			});

		if (!message)
			return interaction.reply({
				content:
					"Failed to fetch message. This command can only be used in your personal DMs with me.",
			});

		console.log(message.author?.id, process.env.DISCORD_CLIENT_ID);

		if (message.author?.id !== process.env.DISCORD_CLIENT_ID) {
			return interaction.reply({
				content: "I can only delete bookmarks that I created.",
			});
		}

		try {
			await message.delete().then(async () => {
				return interaction.reply({
					content: "Bookmark deleted successfully!",
				});
			});
		} catch (error) {
			return interaction.reply({
				content: `Failed to delete bookmark. Try again?\n\n${error}`,
			});
		}
	}
}
