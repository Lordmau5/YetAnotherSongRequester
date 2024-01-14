import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import SongManager from '~/SongManager.ts';

class GetQueue extends AbstractEndpoint {
	setup() {
		this.add(this.getQueue);
	}

	async getQueue(ctx: ParameterizedContext, next: Next) {
		try {
			return super.success(ctx, next, SongManager.getAll());
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetQueue().middlewares();
