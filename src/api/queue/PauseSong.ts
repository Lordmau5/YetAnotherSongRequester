import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import Socket from '~/Socket.ts';

class PauseSong extends AbstractEndpoint {
	setup() {
		this.add(this.playSong);
	}

	async playSong(ctx: ParameterizedContext, next: Next) {
		Socket.io.emit('pause');

		this.success(ctx, next);
	}
}

export default new PauseSong().middlewares();
