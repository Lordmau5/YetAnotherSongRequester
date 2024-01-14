import Koa from 'koa';
import responseTime from 'koa-response-time';
import {
	koaBody
} from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import json from 'koa-json';
// import cors from '@koa/cors';
import serve from 'koa-static';

import session from 'koa-session';
import mount from 'koa-mount';

// --- Setup Koa

import path from 'node:path';
import {
	readFile
} from 'node:fs/promises';

async function setupKoa() {
	const app = new Koa();

	// Error handling
	app.use(async(ctx, next) => {
		try {
			await next();
		}
		catch (err) {
			ctx.app.emit('error', err, ctx);
		}
	});

	app.on('error', err => {
		pino.error('Koa Error Handler');
		pino.error(err);
	});

	app.use(responseTime({
		hrtime: true
	}));
	app.use(koaBody({
		multipart: true,
		jsonLimit: '3mb'
	}));
	app.use(conditional());
	app.use(etag());
	// app.use(cors({
	// 	origin: '*',
	// 	maxAge: 1728000
	// }));
	app.use(json());

	app.use(mount(serve('./public')));
	app.use(async(ctx, next) => {
		const requestUrl = ctx.request.url;

		// Check if the request URL does not contain a period or does not end with a file extension
		if (
			requestUrl.includes('.')
			|| path.extname(requestUrl)
			|| requestUrl.startsWith('/api')
			|| requestUrl.startsWith('/auth')
		) {
			return next();
		}

		ctx.set('Content-Type', 'text/html');
		ctx.body = await readFile('./public/index.html', 'utf-8');
	});

	app.keys = [ 'yet_another_song_requester' ];
	app.use(session(app));

	app.proxy = true;

	return app;
}

// ---

import setupRouters from '~/api/index.ts';
import pino from '~/utils/Pino';
import Socket from '~/Socket';

export default async function start() {
	const app = await setupKoa();

	await setupRouters(app);

	const port = 3000;

	const server = app.listen(port, () => {
		pino.info(`Koa server listening on localhost:${ port }`);
	});

	Socket.setup(server);
}
