import {
	Next, ParameterizedContext
} from 'koa';
import Config from '~/utils/Config.ts';

export default async function checkPassword(ctx: ParameterizedContext, next: Next) {
	const password = Config.API_PASSWORD ? `Bearer ${ Config.API_PASSWORD }` : false;
	if (!password) {
		return next();
	}

	const authorization = ctx.headers.authorization;
	if (!authorization || authorization !== password) {
		ctx.status = 401;

		return;
	}

	return next();
}
