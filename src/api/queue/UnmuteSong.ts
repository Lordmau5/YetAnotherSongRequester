import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import Socket from '~/Socket.ts';

class UnmuteSong extends AbstractEndpoint {
	setup() {
		this.add(this.unmuteSong);
	}

	async unmuteSong(ctx: ParameterizedContext, next: Next) {
		Socket.io.emit('unmute');

		this.success(ctx, next);
	}
}

export default new UnmuteSong().middlewares();
