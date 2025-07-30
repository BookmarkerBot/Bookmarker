import {
	Command,
	type CommandInteraction,
	Container,
	LinkButton,
	MediaGallery,
	Row,
	Section,
	TextDisplay,
	Thumbnail,
} from "@buape/carbon";
import stripIndent from "strip-indent";

export default class HelpCommand extends Command {
	name = "help";
	description = "Information about Bookmarker";

	async run(interaction: CommandInteraction) {
		return interaction.reply({
			components: [new HelpContainer(), new ExternalButtonRow()],
		});
	}
}

class HelpContainer extends Container {
	components = [
		new TextDisplay("# Bookmarker Help"),
		new TextDisplay(
			"Bookmarker is a simple bot that allows users to bookmark messages by using interactions i.e. App commands. The bot supports user apps as well, so you can use the bot in any server since the interaction is tied to your account and not a server",
		),
		new TextDisplay(`## How to use Bookmarker`),
		new TextDisplay(
			stripIndent(`
            **On Desktop:**
            \`Right click on the message you wish to bookmark --> Apps --> Bookmark\`

            **On Mobile:**
            \`Tap & hold on the message you wish to bookmark --> Apps --> Bookmark\`
            `),
		),
		new BookmarkerDemo(),
		new BookmarkerDemoText(),
		new TextDisplay(
			stripIndent(`
            **Credits:**
            - [Daksh](discord://-/users/97268410836062208) for being the original creator of Bookmarker.
            - [Codeize](discord://-/users/668423998777982997) for developing the new version of Bookmarker.`),
		),
		new DocsButtonRow(),
	];

	accentColor = 15158332;
}

class BookmarkerDemo extends MediaGallery {
	items = [
		{
			url: "https://cdn.buape.com/bookmarker/BookmarkCommandDemo.png",
		},
	];
}

class BookmarkerDemoText extends Section {
	components = [
		new TextDisplay(
			`Bookmarker DMs you with the message. You can manage the bookmark directly in your DMs by changing the colour, adding a note within the bookmark, pinning the message or deleting bookmarks.`,
		),
	];
	accessory = new BookmarkerDemoThumbnail();
}

class BookmarkerDemoThumbnail extends Thumbnail {
	url = "https://cdn.buape.com/bookmarker/BookmarkerNotification.png";
}

class DocsButtonRow extends Row {
	components = [new BookmarkerDocsButton()];
}

class BookmarkerDocsButton extends LinkButton {
	label = "Visit Bookmarker Docs";
	url = "https://bookmarker.mintlify.app/";
	style = 5;
}

class ExternalButtonRow extends Row {
	components = [
		new AddBookmarkerButton(),
		new SupportServerButton(),
		new GitHubRepoButton(),
	];
}

class AddBookmarkerButton extends LinkButton {
	label = "Add Bookmarker";
	url = "https://discord.com/oauth2/authorize?client_id=935447281929449532";
	style = 5;
}

class SupportServerButton extends LinkButton {
	label = "Support Server";
	url = "https://discord.gg/MFq4P7r2Uc";
	style = 5;
}

class GitHubRepoButton extends LinkButton {
	label = "GitHub Repository";
	url = "https://github.com/BookmarkerBot/Bookmarker";
	style = 5;
}
