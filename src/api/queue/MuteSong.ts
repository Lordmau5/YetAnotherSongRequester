import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import Socket from '~/Socket.ts';

class MuteSong extends AbstractEndpoint {
	setup() {
		this.add(this.muteSong);
	}

	async muteSong(ctx: ParameterizedContext, next: Next) {
		Socket.io.emit('mute');

		this.success(ctx, next);
	}
}

export default new MuteSong().middlewares();
