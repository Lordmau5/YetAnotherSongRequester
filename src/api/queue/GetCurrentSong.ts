import {
	Next, ParameterizedContext
} from 'koa';

import Joi from 'Joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import SongManager from '~/SongManager.ts';
import Socket from '~/Socket.ts';

class GetCurrentSong extends AbstractEndpoint {
	setup() {
		this.add(this.getCurrentSong);
	}

	getSchema() {
		return Joi.object({
			body: Joi.object({
				with_stream_url: Joi.boolean().default(false)
			})
		});
	}

	async getCurrentSong(ctx: ParameterizedContext, next: Next) {
		const {
			with_stream_url
		} = ctx.request.body;

		try {
			return super.success(ctx, next, {
				...await SongManager.getFirst(with_stream_url),
				...await Socket.asyncEmit('get_status', false)
			});
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetCurrentSong().middlewares();
