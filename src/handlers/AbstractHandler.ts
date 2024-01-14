import Socket from '~/Socket.ts';
import SongManager, {
	SongRequest,
	UserRequestType
} from '~/SongManager.ts';
import {
	RequestError, fetchSongRequest, searchSongRequest
} from '~/YTDL.ts';
import {
	RequestErrorType
} from '~/handlers/RequestErrorTypes.ts';
import Config from '~/utils/Config.ts';

export interface RequestResultError {
	type: RequestErrorType;
	message?: string;
	extra?: any;
}

export interface RequestResultData {
	addedSong: SongRequest;
	songPosition: number;
}

export interface RequestResult {
	success: boolean;
	data: RequestResultData | RequestResultError;
}

export default class AbstractHandler {
	async init() {}

	isUrl(uri: string): boolean {
		let url: URL;

		try {
			url = new URL(uri);
		}
		catch (_) {
			return false;
		}

		return url.protocol === 'http:' || url.protocol === 'https:';
	}

	async handleRequest(urlOrQuery: string, displayName: string, request_type: UserRequestType = 'viewer'): Promise<RequestResult> {
		if (!SongManager.requestsEnabled) {
			return {
				success: false,
				data: {
					type: RequestErrorType.REQUESTS_DISABLED
				}
			};
		}

		const max_requests = SongManager.getMaxRequestsFor(request_type);
		if (max_requests > 0 && SongManager.getRequestsBy(displayName, false).length >= max_requests) {
			return {
				success: false,
				data: {
					type: RequestErrorType.REQUEST_LIMIT_REACHED
				}
			};
		}

		if (SongManager.getAll().length >= Config.MAX_SONGS_IN_QUEUE) {
			return {
				success: false,
				data: {
					type: RequestErrorType.QUEUE_FULL
				}
			};
		}

		if (!urlOrQuery.length)
			return {
				success: false,
				data: {
					type: RequestErrorType.NO_URL
				}
			};

		const isURL = this.isUrl(urlOrQuery);

		const request = isURL
			? await fetchSongRequest(urlOrQuery, displayName)
			: await searchSongRequest(urlOrQuery, displayName);
		if ((request as RequestError).error) {
			const error = request as RequestError;
			console.error(`Invalid song request: ${ urlOrQuery }`);

			if (error.error.includes('blocked it in your country')) {
				return {
					success: false,
					data: {
						type: RequestErrorType.SONG_BLOCKED
					}
				};
			}

			return {
				success: false,
				data: {
					type: RequestErrorType.GENERIC,
					message: error.error
				}
			};
		}

		const songRequest = request as SongRequest;

		if (songRequest.duration > Config.MAX_SONG_DURATION) {
			return {
				success: false,
				data: {
					type: RequestErrorType.SONG_TOO_LONG,
					extra: songRequest.duration
				}
			};
		}

		await SongManager.add(songRequest);

		if (SongManager.getAll().length === 1) {
			Socket.io.emit('current_song', await SongManager.getFirst(true));
		}

		return {
			success: true,
			data: {
				addedSong: songRequest,
				songPosition: SongManager.getAll().length
			}
		};
	}
}
