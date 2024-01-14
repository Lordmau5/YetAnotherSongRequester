import {
	Low
} from 'lowdb';
import {
	JSONFile
} from 'lowdb/node';

import {
	getBestAudioFormat
} from '~/YTDL.ts';

import chokidar from 'chokidar';
import TwitchHandler from '~/handlers/TwitchHandler.ts';
import Config from '~/utils/Config.ts';

export interface SongRequest {
	url: string;
	streamURL?: string | null;
	title: string;
	requestedBy: string;
	duration: number;
	view_count?: number;
}

export type UserRequestType = 'broadcaster' | 'vip' | 'subscriber' | 'moderator' | 'viewer';

class SongRequestManager {
	private db: Low<SongRequest[]>;

	private manualSave: boolean = false;

	public requestsEnabled: boolean = true;

	constructor() {
		const db = new JSONFile<SongRequest[]>('requests.json');
		this.db = new Low(db, []);

		chokidar.watch('requests.json').on('change', async() => {
			if (this.manualSave) {
				this.manualSave = false;

				return;
			}

			await this.db.read();
			console.log(this.songRequests.length, 'song requests loaded.');
		});
	}

	async init() {
		await this.db.read();
	}

	get songRequests() {
		return this.db.data;
	}

	async save() {
		this.manualSave = true;

		await this.db.write();
	}

	async add(songRequest: SongRequest) {
		if (!songRequest.url.length || !songRequest.title.length) {
			console.error('Invalid song request:', songRequest);

			return;
		}

		this.songRequests.push(songRequest);

		await this.save();
	}

	getAll(): SongRequest[] {
		return this.songRequests;
	}

	async getFirst(with_stream_url: boolean = false): Promise<SongRequest | null> {
		const songRequests = this.getAll();
		if (!songRequests.length) {
			return null;
		}

		const song = songRequests[0];

		return {
			...song,
			streamURL: with_stream_url ? await getBestAudioFormat(song.url) : undefined
		};
	}

	async advanceSong(with_stream_url: boolean = false): Promise<SongRequest | null> {
		const songRequests = this.getAll();

		if (!songRequests.length) {
			return null;
		}

		// Shift the first song
		songRequests.shift();

		await this.save();

		const nextSong = await this.getFirst(with_stream_url);
		if (nextSong) {
			await TwitchHandler.sendMessage(`Now playing: ${ nextSong.title } (requested by ${ nextSong.requestedBy })`);
		}

		return nextSong;
	}

	getRequestsBy(user: string, include_current: boolean = true): SongRequest[] {
		const requests = include_current ? this.songRequests : this.songRequests.slice(1);

		return requests.filter(songRequest => songRequest.requestedBy === user);
	}

	getMaxRequestsFor(user_type: UserRequestType): number {
		switch (user_type) {
			case 'broadcaster':
			case 'moderator':
				return -1;
			case 'vip':
				return Config.MAX_REQUESTS_PER_VIP;
			case 'subscriber':
				return Config.MAX_REQUESTS_PER_SUBSCRIBER;
			case 'viewer':
				return Config.MAX_REQUESTS_PER_USER;
		}
	}
}

export default new SongRequestManager();
