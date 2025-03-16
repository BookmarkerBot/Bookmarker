import {
	APIEmbed,
	ApplicationCommandType,
	ApplicationIntegrationType,
	Button,
	ButtonInteraction,
	Command,
	Embed,
	LinkButton,
	Row,
	type CommandInteraction
} from "@buape/carbon"

const COLOR_EMOJIS = {
	BK_BLURPLE: "<:bk_blurple:1348745661402841189>",
	BK_FUCHSIA: "<:bk_fuchsia:1348745675424399441>",
	BK_GREEN: "<:bk_green:1348745688477077617>",
	BK_RED: "<:bk_red:1348745697796558848>",
	BK_YELLOW: "<:bk_yellow:1348745706873159751>"
}

const COLORS = {
	BLUE: 3447003,
	RED: 15158332,
	GREEN: 3066993,
	YELLOW: 16776960,
	MAGENTA: 15277667
}

export default class BookmarkCommand extends Command {
	name = "Bookmark"
	description = "Bookmark this message"
	type: ApplicationCommandType = ApplicationCommandType.Message
	integrationTypes: ApplicationIntegrationType[] = [
		ApplicationIntegrationType.GuildInstall,
		ApplicationIntegrationType.UserInstall
	]

	defer = true
	ephemeral = true

	components = [BookmarkSuccessButton, ControlColorPickerButton, ControlDeleteBookmarkButton, ControlBackButton, ControlRepostBookmarkButton, BlueColorButton, RedColorButton, GreenColorButton, YellowColorButton, FuchsiaColorButton]

	async run(interaction: CommandInteraction) {
		if (interaction.rawData.data.type !== ApplicationCommandType.Message) return

		if (!interaction.user) return
		const resolvedTargetMessage =
			interaction.rawData.data.resolved.messages[
				interaction.rawData.data.target_id
			]

		if (!resolvedTargetMessage)
			return interaction.reply({
				content:
					"Failed to get the message you want to bookmark. Try again later."
			})

		try {
			if (resolvedTargetMessage) {
				const fetchedGuild = await interaction.client.fetchGuild(
					interaction.guild?.id ?? ""
				).catch((e) => {
					console.error(e)
					return null
				})

				const avatarUrl = resolvedTargetMessage.author.avatar
				? `https://cdn.discordapp.com/avatars/${resolvedTargetMessage.author.id}/${resolvedTargetMessage.author.avatar}.png`
				: `https://cdn.discordapp.com/embed/avatars/0.png`;

				const guildIconUrl = (interaction.guild && fetchedGuild && fetchedGuild.icon)
				? `https://cdn.discordapp.com/icons/${interaction.guild.id}/${fetchedGuild.icon}.png`
				: undefined
				
				const jumpToUrl = (interaction.guild)
				? `https://discord.com/channels/${interaction.guild.id}/${resolvedTargetMessage.channel_id}/${resolvedTargetMessage.id}`
				: `https://discord.com/channels/@me/${resolvedTargetMessage.channel_id}/${resolvedTargetMessage.id}`

				const originalMessageEmbeds = resolvedTargetMessage.embeds as APIEmbed[] ?? []
				const originalMessageAttachments = resolvedTargetMessage.attachments ?? []
				const dmMsg = await interaction.user.send({
					embeds: [
						new Embed({
							description: originalMessageAttachments.length
								? originalMessageAttachments.map((attachment) => `> ${attachment.url}`).join('\n> ')
								: resolvedTargetMessage.content,
							color: 3092790,
							author: {
								name: `${resolvedTargetMessage.author.username} (${resolvedTargetMessage.author.id})`,
								icon_url: avatarUrl
							},
							footer: {
								text: `${fetchedGuild ? `${fetchedGuild.name} (${fetchedGuild.id})` : `Your DMs with ${resolvedTargetMessage.author.username} (${resolvedTargetMessage.author.id})`}`,
								icon_url: guildIconUrl
							},
							url: jumpToUrl
						}),
						...originalMessageEmbeds.map(embed => new Embed(embed))
					],
					components: [
						new Row([
							...MAIN_MENU_BUTTONS(jumpToUrl)
						])
					]
				}).catch(async (e) => {
					console.error(e)
					await interaction.reply({
						content:
							"Failed to send a DM to you. Are you sure you have DMs enabled?"
					})
					return null
				})
				if (!dmMsg) return
				return interaction.reply({
					components: [new Row([new BookmarkSuccessButton(), new BookmarkSuccessJumpToButton(`https://discord.com/channels/@me/${dmMsg.channelId}/${dmMsg.id}`)])]
				})
			}
		} catch (e) {
			console.error(e)
			return interaction.reply({
				content:
					"Failed to send a DM to you. Please enable DMs from server members, then try again."
			})
		}
	}
}

class BookmarkSuccessButton extends Button {
	label = "Bookmarked!"
	style = 3
	disabled = true
	customId = "bookmark-success"

	async run(interaction: ButtonInteraction) {
		// This button will never be run.
		void interaction
	}
}

class BookmarkSuccessJumpToButton extends LinkButton {
	constructor(url: string) {
		super()
		this.url = url
	}
	label = "🔗"
	url
}

class ControlLinkToMessageButton extends LinkButton {
	constructor(url: string) {
		super()
		this.url = url
	}
	label = "🔗"
	url
}

class ControlColorPickerButton extends Button {
    label = "🪄";
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
                    new FuchsiaColorButton()
                ]),
				new Row([new ControlBackButton(), new ControlRepostBookmarkButton()]),
            ],
        });
		return interaction.acknowledge();
    }
}

class ControlDeleteBookmarkButton extends Button {
	label = "❌";
	style = 2;
	customId = "bookmark-delete";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		await interaction.message.delete();
		return interaction.acknowledge();
	}
}

class ControlBackButton extends Button {
	label = "🔙";
	style = 2;
	customId = "bookmark-color-back";

	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
		const jumpToUrl = interaction.message.embeds[0].url;
		if (!jumpToUrl) return;
		await interaction.message.edit({
			components: [
				new Row([...MAIN_MENU_BUTTONS(jumpToUrl)])
			]
		});
		return interaction.acknowledge();
	}
}

const MAIN_MENU_BUTTONS = (jumpToUrl: string) => [
	new ControlColorPickerButton(),
	new ControlDeleteBookmarkButton(),
	new ControlLinkToMessageButton(jumpToUrl),
]

class ControlRepostBookmarkButton extends Button {
	label = "🔁";
	style = 2;
	customId = "bookmark-repost";
	
	async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;

		const jumpToUrl = interaction.message.embeds[0].url;
		if (!jumpToUrl) return;

		await interaction.user?.send({
			embeds: interaction.message.embeds,
			components: [
				new Row([
					...MAIN_MENU_BUTTONS(jumpToUrl)
				])
			]
		}).catch(console.error);
		await interaction.message.delete().catch(console.error);
		return interaction.acknowledge();
	}
}


class BlueColorButton extends Button {
	label = "";
    emoji = {
		id: COLOR_EMOJIS.BK_BLURPLE.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_BLURPLE.split(":")[1]
	};
    style = 2;
    customId = "bookmark-color-blue";

    async run(interaction: ButtonInteraction) {
		if (!interaction.message) return;
        const originalMessageEmbed = interaction.message.embeds[0];
		if (!originalMessageEmbed) return;

		await interaction.message.edit({
			embeds: [
				new Embed({
					...originalMessageEmbed.serialize(),
					color: COLORS.BLUE
				}),
				...interaction.message.embeds.slice(1)
			]
		}).catch(console.error);
		return interaction.acknowledge();
    }
}

class RedColorButton extends Button {
    label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_RED.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_RED.split(":")[1]
	};
    style = 2;
    customId = "bookmark-color-red";

    async run(interaction: ButtonInteraction) {
        if (!interaction.message) return;
        const originalMessageEmbed = interaction.message.embeds[0];
        if (!originalMessageEmbed) return;

        await interaction.message.edit({
            embeds: [
                new Embed({
                    ...originalMessageEmbed.serialize(),
                    color: COLORS.RED
                }),
                ...interaction.message.embeds.slice(1)
            ]
        }).catch(console.error);
        
        return interaction.acknowledge();
    }
}

class GreenColorButton extends Button {
    label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_GREEN.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_GREEN.split(":")[1]
	};
    style = 2;
    customId = "bookmark-color-green";

    async run(interaction: ButtonInteraction) {
        if (!interaction.message) return;
        const originalMessageEmbed = interaction.message.embeds[0];
        if (!originalMessageEmbed) return;

        await interaction.message.edit({
            embeds: [
                new Embed({
                    ...originalMessageEmbed.serialize(),
                    color: COLORS.GREEN
                }),
                ...interaction.message.embeds.slice(1)
            ]
        }).catch(console.error);

        return interaction.acknowledge();
    }
}

class YellowColorButton extends Button {
    label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_YELLOW.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_YELLOW.split(":")[1]
	};
    style = 2;
    customId = "bookmark-color-yellow";

    async run(interaction: ButtonInteraction) {
        if (!interaction.message) return;
        const originalMessageEmbed = interaction.message.embeds[0];
        if (!originalMessageEmbed) return;

        await interaction.message.edit({
            embeds: [
                new Embed({
                    ...originalMessageEmbed.serialize(),
                    color: COLORS.YELLOW
                }),
                ...interaction.message.embeds.slice(1)
            ]
        }).catch(console.error);

        return interaction.acknowledge();
    }
}

class FuchsiaColorButton extends Button {
    label = "";
	emoji = {
		id: COLOR_EMOJIS.BK_FUCHSIA.split(":")[2].split(">")[0],
		name: COLOR_EMOJIS.BK_FUCHSIA.split(":")[1]
	};
    style = 2;
    customId = "bookmark-color-magenta";

    async run(interaction: ButtonInteraction) {
        if (!interaction.message) return;
        const originalMessageEmbed = interaction.message.embeds[0];
        if (!originalMessageEmbed) return;

        await interaction.message.edit({
            embeds: [
                new Embed({
                    ...originalMessageEmbed.serialize(),
                    color: COLORS.MAGENTA
                }),
                ...interaction.message.embeds.slice(1)
            ]
        }).catch(console.error);

        return interaction.acknowledge();
    }
}

