import Joi from 'joi';
import {
	Next, ParameterizedContext
} from 'koa';

import AbstractEndpoint from '~/api/AbstractEndpoint.ts';
import SongManager from '~/SongManager.ts';

class ToggleRequests extends AbstractEndpoint {
	setup() {
		this.add(this.toggleRequests);
	}

	getSchema() {
		return Joi.object({
			body: Joi.object({
				enabled: Joi.boolean().required().default(true)
			})
		});
	}

	async toggleRequests(ctx: ParameterizedContext, next: Next) {
		const {
			enabled
		} = ctx.request.body;

		SongManager.requestsEnabled = enabled;

		this.success(ctx, next);
	}
}

export default new ToggleRequests().middlewares();
