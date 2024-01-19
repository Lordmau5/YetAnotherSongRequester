import 'dotenv/config';

// TODO: Save/Load config?

interface IConfig {
	CHANNEL: string;
	BOT_NAME: string;
	OAUTH: string;
	API_PASSWORD: string;
	FORCE_IP_V4: boolean;

	MAX_SONG_DURATION: number;
	MAX_SONGS_IN_QUEUE: number;

	MAX_REQUESTS_PER_USER: number;
	MAX_REQUESTS_PER_SUBSCRIBER: number;
	MAX_REQUESTS_PER_VIP: number;
}

const Config: IConfig = {
	CHANNEL: process.env.CHANNEL || '',
	BOT_NAME: process.env.BOT_NAME || process.env.CHANNEL || '',
	OAUTH: process.env.OAUTH || '',
	API_PASSWORD: process.env.API_PASSWORD || '',
	FORCE_IP_V4: process.env.FORCE_IP_V4 === 'true',

	MAX_SONG_DURATION: Number(process.env.MAX_SONG_DURATION) || 5 * 60, // 5 minutes
	MAX_SONGS_IN_QUEUE: Number(process.env.MAX_SONGS_IN_QUEUE) || 10, // 10 songs

	MAX_REQUESTS_PER_USER: Number(process.env.MAX_REQUESTS_PER_USER) || 1,
	MAX_REQUESTS_PER_SUBSCRIBER: Number(process.env.MAX_REQUESTS_PER_SUBSCRIBER) || 2,
	MAX_REQUESTS_PER_VIP: Number(process.env.MAX_REQUESTS_PER_VIP) || 3
};

function validateConfig() {
	if (!Config.CHANNEL)
		throw new Error('No channel set');
	if (!Config.BOT_NAME)
		throw new Error('No bot name set');
	if (!Config.OAUTH)
		throw new Error('No OAuth token set');
}

validateConfig();

export default Config;
