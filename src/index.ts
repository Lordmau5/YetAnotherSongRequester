import songManager from '~/SongManager.ts';
import TwitchHandler from '~/handlers/TwitchHandler.ts';
import setupKoa from '~/Koa.ts';

// Run the server!
const start = async() => {
	await songManager.init();

	await TwitchHandler.init();
	await setupKoa();
};
start();
