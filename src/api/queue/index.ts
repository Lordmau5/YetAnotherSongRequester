import AbstractRouter from '~/api/AbstractRouter.ts';
import checkPassword from '~/api/PasswordMiddleware.ts';

import GetQueue from '~/api/queue/GetQueue.ts';
import GetCurrentSong from '~/api/queue/GetCurrentSong.ts';

import PlayPauseSong from '~/api/queue/PlayPauseSong.ts';
import PlaySong from '~/api/queue/PlaySong.ts';
import PauseSong from '~/api/queue/PauseSong.ts';

import SkipSong from '~/api/queue/SkipSong.ts';

import MuteSong from '~/api/queue/MuteSong.ts';
import UnmuteSong from '~/api/queue/UnmuteSong.ts';

import ToggleRequests from '~/api/queue/ToggleRequests.ts';

class QueueRouter extends AbstractRouter {
	constructor() {
		super({
			prefix: '/api/queue'
		});
	}

	setupRouter() {
		super.setupRouter();

		this.router.get('/', ...GetQueue);
		this.router.get('/current', ...GetCurrentSong);

		this.router.post('/skip', checkPassword, ...SkipSong);

		this.router.post('/play-pause', checkPassword, ...PlayPauseSong);
		this.router.post('/play', checkPassword, ...PlaySong);
		this.router.post('/pause', checkPassword, ...PauseSong);

		this.router.post('/mute', checkPassword, ...MuteSong);
		this.router.post('/unmute', checkPassword, ...UnmuteSong);

		this.router.post('/toggle', checkPassword, ...ToggleRequests);
	}
}

export default new QueueRouter().getRouter();
