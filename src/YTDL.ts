import {
	SongRequest
} from '~/SongManager.ts';

import {
	promisify
} from 'util';
import {
	exec
} from 'child_process';
import Config from '~/utils/Config.ts';

const execAsync = promisify(exec);

export interface RequestError {
	error: string;
}

export async function searchSongRequest(query: string, username: string): Promise<SongRequest | RequestError> {
	let command = `yt-dlp -j --no-playlist ytsearch1:"${ query }"`;
	if (Config.FORCE_IP_V4) {
		command = `${ command } --force-ipv4`;
	}

	try {
		const {
			stdout, stderr
		} = await execAsync(command);
		if (stderr) {
			return {
				error: stderr
			};
		}

		const info: any = JSON.parse(stdout.trim());

		return {
			title: info.fulltitle,
			url: info.webpage_url,
			duration: info.duration,
			requestedBy: username
		};
	}
	catch (err) {
		return {
			error: err.stderr
		};
	}
}

export async function fetchSongRequest(url: string, username: string): Promise<SongRequest | RequestError | null> {
	let command = `yt-dlp -j --no-playlist "${ url }"`;
	if (Config.FORCE_IP_V4) {
		command = `${ command } --force-ipv4`;
	}

	try {
		const {
			stdout, stderr
		} = await execAsync(command);
		if (stderr) {
			return {
				error: stderr
			};
		}

		const info: any = JSON.parse(stdout.trim());

		return {
			title: info.fulltitle,
			url: info.webpage_url,
			duration: info.duration,
			requestedBy: username
		};
	}
	catch (err) {
		return {
			error: err.stderr
		};
	}
}

export async function getBestAudioFormat(url: string): Promise<string | null> {
	let command = `yt-dlp -g -f bestaudio --no-playlist "${ url }"`;
	if (Config.FORCE_IP_V4) {
		command = `${ command } --force-ipv4`;
	}

	try {
		const {
			stdout, stderr
		} = await execAsync(command);
		if (stderr) {
			console.log(stderr);

			return null;
		}

		return stdout.trim();
	}
	catch (err) {
		console.log(err);

		return null;
	}
}
