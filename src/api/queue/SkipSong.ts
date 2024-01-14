import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import SongManager from '~/SongManager.ts';
import Socket from '~/Socket.ts';

class SkipSong extends AbstractEndpoint {
	setup() {
		this.add(this.skipSong);
	}

	async skipSong(ctx: ParameterizedContext, next: Next) {
		const nextSong = await SongManager.advanceSong(true);

		Socket.io.emit('current_song', nextSong);

		this.success(ctx, next, nextSong);
	}
}

export default new SkipSong().middlewares();
