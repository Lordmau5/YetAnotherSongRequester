import tmi from 'tmi.js';
import SongManager, {
	UserRequestType
} from '~/SongManager.ts';

import AbstractHandler, {
	RequestResultData, RequestResultError
} from '~/handlers/AbstractHandler.ts';
import {
	RequestErrorType
} from '~/handlers/RequestErrorTypes.ts';
import Config from '~/utils/Config.ts';

class TwitchHandler extends AbstractHandler {
	private client: tmi.Client;

	async init() {
		this.client = new tmi.Client({
			connection: {
				secure: true,
				reconnect: true
			},
			identity: {
				username: Config.BOT_NAME,
				password: `oauth:${ Config.OAUTH }`
			},
			channels: [ Config.CHANNEL ]
		});

		this.client.on('message', this.onMessage.bind(this));

		await this.client.connect();
		console.log('Twitch connected.');
	}

	getUserTypeFromBadges(badges: tmi.Badges): UserRequestType {
		if (badges.broadcaster === '1')
			return 'broadcaster';
		if (badges.vip === '1')
			return 'vip';
		if (badges.subscriber === '1')
			return 'subscriber';
		if (badges.moderator === '1')
			return 'moderator';

		return 'viewer';
	}

	// TODO: Add commands from StreamElements Media Request (!song, !wrongsong, !next, !when, etc.)

	async respondWithCurrentSong(channel: string, username: string) {
		const currentSong = await SongManager.getFirst();
		if (!currentSong) {
			await this.sendMessage(`@${ username } There is no song currently playing.`);

			return;
		}

		await this.sendMessage(`@${ username } Current song: "${ currentSong.title }" (requested by ${ currentSong.requestedBy }) - ${ currentSong.url }`);
	}

	async onMessage(channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) {
		if (self || channel !== `#${ Config.CHANNEL }`)
			return;

		if (message === '!song') {
			await this.respondWithCurrentSong(channel, tags.username);

			return;
		}

		if (!message.startsWith('!sr'))
			return;

		const split = message.split('!sr', 2);
		const urlOrQuery = split[1]?.trim();

		const request_type = this.getUserTypeFromBadges(tags.badges);
		const request_limit = SongManager.getMaxRequestsFor(request_type);

		const result = await this.handleRequest(urlOrQuery, tags['display-name'] || 'unknown', request_type);
		if (!result.success) {
			const error = result.data as RequestResultError;
			switch (error.type) {
				case RequestErrorType.NO_URL:
					break;
				case RequestErrorType.REQUESTS_DISABLED:
					this.client.say(channel, `@${ tags.username } Sorry, but requests are currently disabled.`);
					break;
				case RequestErrorType.SONG_BLOCKED:
					this.client.say(channel, `@${ tags.username } Sorry, but this song is blocked in my country.`);
					break;
				case RequestErrorType.SONG_TOO_LONG:
					this.client.say(channel, `@${ tags.username } Sorry, but this song is too long. (Max 10 minutes)`);
					break;
				case RequestErrorType.REQUEST_LIMIT_REACHED:
					this.client.say(channel, `@${ tags.username } Sorry, but you have reached the maximum number of requests (${ request_limit }).`);
					break;
				case RequestErrorType.QUEUE_FULL:
					this.client.say(channel, `@${ tags.username } Sorry, but the queue is currently full.`);
					break;
				default:
					console.error('Generic error', error.message);
					break;
			}

			return;
		}

		const data = result.data as RequestResultData;

		await this.sendMessage(`@${ tags.username } Added "${ data.addedSong.title }" at position #${ data.songPosition }`);

		if (data.songPosition === 1) {
			await this.sendMessage(`Now playing: ${ data.addedSong.title } (requested by ${ data.addedSong.requestedBy })`);
		}
	}

	async sendMessage(message: string) {
		if (!this.client)
			return;

		this.client.say(`#${ Config.CHANNEL }`, message);
	}
}

export default new TwitchHandler();
