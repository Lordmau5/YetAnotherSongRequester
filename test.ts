import {
	SongRequest
} from '~/SongManager.ts';
import {
	RequestError,
	fetchSongRequest, searchSongRequest
} from '~/YTDL.ts';

async function start() {
	const data = await fetchSongRequest('https://www.youtube.com/watch?v=H9Gx5L_nboE', 'test');
	if ((data as RequestError).error) {
		const requestError = data as RequestError;
		console.error(requestError.error);

		return;
	}

	const request = data as SongRequest;
	console.log(request);
}
start();
