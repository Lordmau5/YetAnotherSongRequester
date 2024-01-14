import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import Socket from '~/Socket.ts';

class PlaySong extends AbstractEndpoint {
	setup() {
		this.add(this.playSong);
	}

	async playSong(ctx: ParameterizedContext, next: Next) {
		Socket.io.emit('play');

		this.success(ctx, next);
	}
}

export default new PlaySong().middlewares();
