import {
	type APIEmbed,
	ApplicationCommandType,
	ApplicationIntegrationType,
	Button,
	type ButtonInteraction,
	Command,
	type CommandInteraction,
	Embed,
	LinkButton,
	MessageFlags,
	Modal,
	type ModalInteraction,
	Row,
	TextInput,
	TextInputStyle,
} from "@buape/carbon";

const COLOR_EMOJIS = {
	BK_BLURPLE: "<:bk_blurple:1348745661402841189>",
	BK_FUCHSIA: "<:bk_fuchsia:1348745675424399441>",
	BK_GREEN: "<:bk_green:1348745688477077617>",
	BK_RED: "<:bk_red:1348745697796558848>",
	BK_YELLOW: "<:bk_yellow:1348745706873159751>",
};

const COLORS = {
	BLUE: 3447003,
	RED: 15158332,
	GREEN: 3066993,
	YELLOW: 16776960,
	MAGENTA: 15277667,
};

export default class BookmarkCommand extends Command {
	name = "Bookmark";
	description = "Bookmark this message";
	type: ApplicationCommandType = ApplicationCommandType.Message;
	integrationTypes: ApplicationIntegrationType[] = [
		ApplicationIntegrationType.GuildInstall,
		ApplicationIntegrationType.UserInstall,
	];

	defer = true;
	ephemeral = true;

	components = [
		new BookmarkSuccessButton(),
		new ControlColorPickerButton(),
		new ControlDeleteBookmarkButton(),
		new ControlBackButton(),
		new ControlRepostBookmarkButton(),
		new ControlAddNoteButton(),
		new ControlMobileViewButton(),
		new BlueColorButton(),
		new RedColorButton(),
		new GreenColorButton(),
		new YellowColorButton(),
		new FuchsiaColorButton(),
	];

	async run(interaction: CommandInteraction) {
		if (interaction.rawData.data.type !== ApplicationCommandType.Message)
			return;

		if (!interaction.user) return;
		const resolvedTargetMessage =
			interaction.rawData.data.resolved.messages[
				interaction.rawData.data.target_id
			];

		if (!resolvedTargetMessage)
			return interaction.reply({
				content:
					"Failed to get the message you want to bookmark. Try again later.",
			});

		try {
			if (resolvedTargetMessage) {
				const avatarUrl = resolvedTargetMessage.author.avatar
					? `https://cdn.discordapp.com/avatars/${resolvedTargetMessage.author.id}/${resolvedTargetMessage.author.avatar}.png`
					: `https://cdn.discordapp.com/embed/avatars/0.png`;

				const jumpToUrl = interaction.guild
					? `https://discord.com/channels/${interaction.guild.id}/${resolvedTargetMessage.channel_id}/${resolvedTargetMessage.id}`
					: `https://discord.com/channels/@me/${resolvedTargetMessage.channel_id}/${resolvedTargetMessage.id}`;

				const originalMessageEmbeds =
					(resolvedTargetMessage.embeds as APIEmbed[]) ?? [];
				const originalMessageAttachments =
					resolvedTargetMessage.attachments ?? [];

				const dmMsg = await interaction.user
					.send({
						embeds: [
							new Embed({
								description: [
									resolvedTargetMessage.content?.trim(),
									...originalMessageAttachments.map(
										() => `> *See attachment reposted below.*`,
									),
								]
									.filter(Boolean)
									.join("\n\n"),
								color: 3092790,
								author: {
									name: `${resolvedTargetMessage.author.username} (${resolvedTargetMessage.author.id})`,
									icon_url: avatarUrl,
								},
								timestamp: resolvedTargetMessage.timestamp,
								url: jumpToUrl,
							}),
							...originalMessageEmbeds.map((embed) => new Embed(embed)),
						],
						components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
					})
					.catch(async (e) => {
						console.error(e);
						await interaction.reply({
							content:
								"Failed to send a DM to you. Are you sure you have DMs enabled?",
						});
						return null;
					});
				if (!dmMsg) return;
				if (originalMessageAttachments.length >= 1) {
					for (const attachment of originalMessageAttachments) {
						await dmMsg
							.reply({
								content: attachment.url,
							})
							.catch(console.error);
					}
				}
				return interaction.reply({
					components: [
						new Row([
							new BookmarkSuccessButton(),
							new BookmarkSuccessJumpToButton(
								`https://discord.com/channels/@me/${dmMsg.channelId}/${dmMsg.id}`,
							),
						]),
					],
				});
			}
		} catch (e) {
			console.error(e);
			return interaction.reply({
				content:
					"Failed to send a DM to you. Please enable DMs from server members, then try again.",
			});
		}
	}
}

class BookmarkSuccessButton extends Button {
	label = "Bookmarked!";
	style = 3;
	disabled = true;
	customId = "bookmark-success";

	async run(interaction: ButtonInteraction) {
		// This button will never be run.
		void interaction;
	}
}

class BookmarkSuccessJumpToButton extends LinkButton {
	constructor(url: string) {
		super();
		this.url = url;
	}
	label = "";
	emoji = {
		name: "link",
		id: "1407060346576965762",
	};
	url;
}

class ControlLinkToMessageButton extends LinkButton {
	constructor(url: string) {
		super();
		this.url = url;
	}
	label = "";
	emoji = {
		name: "link",
		id: "1407060346576965762",
	};
	url;
}

class ControlColorPickerButton extends Button {
	label = "";
	emoji = {
		name: "magicwand",
		id: "1407060162795278449",
	};
	style = 2;
	customId = "bookmark-color-picker";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		await interaction.message.edit({
			components: [
				new Row([
					new BlueColorButton(),
					new RedColorButton(),
					new GreenColorButton(),
					new YellowColorButton(),
					new FuchsiaColorButton(),
				]),
				new Row([
					new ControlBackButton(),
					new ControlRepostBookmarkButton(),
					new ControlAddNoteButton(),
					new ControlMobileViewButton(),
				]),
			],
		});
		return interaction.acknowledge();
	}
}

class ControlDeleteBookmarkButton extends Button {
	label = "";
	emoji = {
		name: "x_",
		id: "1407060523161223189",
	};
	style = 2;
	customId = "bookmark-delete";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		await interaction.message.delete();
		return interaction.acknowledge();
	}
}

class ControlBackButton extends Button {
	label = "";
	emoji = {
		name: "chevronleft1",
		id: "1388233593113018440",
	};
	style = 2;
	customId = "bookmark-color-back";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const jumpToUrl = interaction.message.embeds[0].url;
		if (!jumpToUrl) return;
		await interaction.message.edit({
			components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
		});
		return interaction.acknowledge();
	}
}

const MAIN_MENU_BUTTONS = (jumpToUrl: string) => [
	new ControlColorPickerButton(),
	new ControlDeleteBookmarkButton(),
	new ControlLinkToMessageButton(jumpToUrl),
];

class ControlRepostBookmarkButton extends Button {
	label = "Repost";
	emoji = {
		name: "repeat2",
		id: "1388234263580643538",
	};
	style = 1;
	customId = "bookmark-repost";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;

		const jumpToUrl = interaction.message.embeds[0].url;
		if (!jumpToUrl) return;

		await interaction.user
			?.send({
				embeds: interaction.message.embeds,
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);
		return interaction.acknowledge();
	}
}

class ControlAddNoteButton extends Button {
	label = "";
	emoji = {
		name: "memo",
		id: "1407061480334954497",
	};
	style = 2;
	customId = "bookmark-add-note";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;

		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const noteField = originalMessageEmbed.fields?.find((f) =>
			f.name.toLowerCase().includes("note"),
		);
		const existingNote = noteField?.value ?? "";

		return interaction.showModal(new ControlAddNoteModal(existingNote));
	}
}

class ControlAddNoteModal extends Modal {
	constructor(defaultValue = "") {
		super();

		this.customId = "bookmark-add-note-modal";
		this.title = "Edit your bookmark note";
		this.components = [new Row([new ControlAddNoteModalInput(defaultValue)])];
	}

	title = "Edit your bookmark note";
	customId = "bookmark-add-note-modal";

	async run(interaction: ModalInteraction) {
		const note = interaction.fields.getText("bookmark-add-note-input");
		if (!note) {
			return interaction.reply({
				content: "You must provide a note.",
			});
		}

		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const filteredFields =
			originalMessageEmbed.fields?.filter(
				(f) => !f.name.toLowerCase().includes("note"),
			) ?? [];

		const updatedEmbed = new Embed({
			...originalMessageEmbed.serialize(),
			fields: [
				...filteredFields,
				{
					name: `Note`,
					value: note,
					inline: false,
				},
			],
		});

		await interaction.message
			.edit({
				embeds: [updatedEmbed, ...interaction.message.embeds.slice(1)],
			})
			.catch(console.error);

		return interaction.acknowledge();
	}
}

class ControlAddNoteModalInput extends TextInput {
	customId = "bookmark-add-note-input";
	label = "Your note";
	required = true;
	style = TextInputStyle.Paragraph;
	value: string;

	constructor(defaultValue = "") {
		super();
		this.value = defaultValue;
	}
}

class ControlMobileViewButton extends Button {
	label = "";
	emoji = {
		name: "mobilephone",
		id: "1407062023879262281",
	};
	style = 2;
	customId = "bookmark-mobile-view";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;

		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		return interaction
			.reply({
				content: originalMessageEmbed.description,
				flags: MessageFlags.Ephemeral,
			})
			.catch(console.error);
	}
}

class BlueColorButton extends Button {
	label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_BLURPLE.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_BLURPLE.split(":")[1],
	};
	style = 2;
	customId = "bookmark-color-blue";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const jumpToUrl = originalMessageEmbed.url;
		if (!jumpToUrl) return;

		await interaction.message
			.edit({
				embeds: [
					new Embed({
						...originalMessageEmbed.serialize(),
						color: COLORS.BLUE,
						footer: {
							text: "tag_blue",
						},
					}),
					...interaction.message.embeds.slice(1),
				],
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);
		return interaction.acknowledge();
	}
}

class RedColorButton extends Button {
	label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_RED.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_RED.split(":")[1],
	};
	style = 2;
	customId = "bookmark-color-red";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const jumpToUrl = originalMessageEmbed.url;
		if (!jumpToUrl) return;

		await interaction.message
			.edit({
				embeds: [
					new Embed({
						...originalMessageEmbed.serialize(),
						color: COLORS.RED,
						footer: {
							text: "tag_red",
						},
					}),
					...interaction.message.embeds.slice(1),
				],
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);

		return interaction.acknowledge();
	}
}

class GreenColorButton extends Button {
	label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_GREEN.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_GREEN.split(":")[1],
	};
	style = 2;
	customId = "bookmark-color-green";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const jumpToUrl = originalMessageEmbed.url;
		if (!jumpToUrl) return;

		await interaction.message
			.edit({
				embeds: [
					new Embed({
						...originalMessageEmbed.serialize(),
						color: COLORS.GREEN,
						footer: {
							text: "tag_green",
						},
					}),
					...interaction.message.embeds.slice(1),
				],
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);

		return interaction.acknowledge();
	}
}

class YellowColorButton extends Button {
	label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_YELLOW.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_YELLOW.split(":")[1],
	};
	style = 2;
	customId = "bookmark-color-yellow";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const jumpToUrl = originalMessageEmbed.url;
		if (!jumpToUrl) return;

		await interaction.message
			.edit({
				embeds: [
					new Embed({
						...originalMessageEmbed.serialize(),
						color: COLORS.YELLOW,
						footer: {
							text: "tag_yellow",
						},
					}),
					...interaction.message.embeds.slice(1),
				],
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);

		return interaction.acknowledge();
	}
}

class FuchsiaColorButton extends Button {
	label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_FUCHSIA.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_FUCHSIA.split(":")[1],
	};
	style = 2;
	customId = "bookmark-color-fuchsia";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		const jumpToUrl = originalMessageEmbed.url;
		if (!jumpToUrl) return;

		await interaction.message
			.edit({
				embeds: [
					new Embed({
						...originalMessageEmbed.serialize(),
						color: COLORS.MAGENTA,
						footer: {
							text: "tag_fuchsia",
						},
					}),
					...interaction.message.embeds.slice(1),
				],
				components: [new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])],
			})
			.catch(console.error);

		return interaction.acknowledge();
	}
}
