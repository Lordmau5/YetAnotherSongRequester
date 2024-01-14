import Joi from 'joi';
import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import Socket from '~/Socket.ts';

class PlayPauseSong extends AbstractEndpoint {
	setup() {
		this.add(this.playPauseSong);
	}

	getSchema() {
		return Joi.object({
			body: Joi.object({
				play: Joi.boolean()
			})
		});
	}

	async playPauseSong(ctx: ParameterizedContext, next: Next) {
		let state = undefined;
		if (ctx.request.body) {
			state = ctx.request.body.play;
		}

		if (state === undefined) {
			const {
				playing
			} = await Socket.asyncEmit('get_status', false);

			state = !playing;
		}

		if (state) {
			Socket.io.emit('play');
		}
		else {
			Socket.io.emit('pause');
		}

		this.success(ctx, next);
	}
}

export default new PlayPauseSong().middlewares();
