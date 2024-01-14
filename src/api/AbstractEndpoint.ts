import {
	getValidateAllMw
} from 'koa-mw-joi';

import {
	Next, ParameterizedContext
} from 'koa';

import Joi from 'joi';
import Router from '@koa/router';

export default class AbstractEndpoint {
	_middlewares: Router.Middleware[] = [];

	constructor() {
		this._middlewares = [];

		this.setup();
	}

	add(fn: Router.Middleware) {
		this._middlewares.push(fn.bind(this));
	}

	setup() {}

	getSchema(): Joi.AnySchema | undefined {
		return undefined;
	}

	middlewares(): Router.Middleware[] {
		const mws: Router.Middleware[] = [ ...this._middlewares ];

		const schema = this.getSchema();
		if (schema) {
			mws.unshift(getValidateAllMw(schema));
		}

		return mws;
	}

	async success(ctx: ParameterizedContext, next: Next, data: any = undefined) {
		ctx.status = 200;

		ctx.body = {
			status: 'success',
			data
		};

		return next && next();
	}

	async fail(ctx: ParameterizedContext, next: Next, data: any = undefined) {
		ctx.status = 200;

		ctx.body = {
			status: 'success',
			data
		};

		return next && next();
	}

	async error(ctx: ParameterizedContext, messageOrError: any, statusCode = 400) {
		ctx.status = statusCode;

		ctx.body = {
			status: 'error',
			message: messageOrError?.message || messageOrError
		};
	}
}
