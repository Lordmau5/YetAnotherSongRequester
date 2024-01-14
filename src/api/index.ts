import Koa from 'koa';
import {
	readdir, stat
} from 'node:fs/promises';
import path from 'node:path';

import pino from '~/utils/Pino.ts';
import {
	RouterResult
} from '~/api/AbstractRouter.ts';

export default async function setupRouters(app: Koa) {
	const files = await readdir('src/api');

	for (const file of files) {
		const pth = path.join('src/api', file);

		if (!(await stat(pth)).isDirectory())
			continue;

		const {
			default: router
		}: {
			default: RouterResult
		} = await import(`~/api/${ file }/index.ts`);

		app.use(router.routes);
		app.use(router.allowedMethods);

		pino.info(`Loaded ${ file } router`);
	}
}

// import songManager from '../song-manager';
// import {
// 	fetchSongRequest, getBestAudioFormat
// } from '../ytdl';

// const apiRoutes: FastifyPluginAsync = async(fastify, options) => {
// 	fastify.get('/get-current-song', async() => {
// 		const songRequest = await songManager.getFirst();
// 		if (!songRequest) {
// 			return {
// 				audioURL: null
// 			};
// 		}

// 		return {
// 			audioURL: await getBestAudioFormat(songRequest.url)
// 		};
// 	});

// 	fastify.get('/get-all', async() => {
// 		return {
// 			songs: await songManager.getAll()
// 		};
// 	});
// };

// export default apiRoutes;
