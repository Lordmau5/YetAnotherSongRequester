import pino from 'pino';
import pretty from 'pino-pretty';
import {
	DateTime
} from 'luxon';

const logToFile = false;

// TODO: Log rotation (rotate every day into files)
const streams = [
	{
		// Console output
		level: 'info',
		stream: pretty({
			customPrettifiers: {
				time: timestamp => `[${ DateTime.now().toISODate() } ${ timestamp }]`
			}
		})
	},
	{
		// Console output
		level: 'error',
		stream: pretty({
			customPrettifiers: {
				time: timestamp => `[${ DateTime.now().toISODate() } ${ timestamp }]`
			}
		})
	}
];

if (logToFile) {
	streams.push({
		// File output
		level: 'info',
		stream: pretty({
			colorize: false,
			destination: './info.log',
			customPrettifiers: {
				time: timestamp => `[${ DateTime.now().toISODate() } ${ timestamp }]`
			}
		})
	});

	streams.push({
		// File output
		level: 'error',
		stream: pretty({
			colorize: false,
			destination: './error.log',
			customPrettifiers: {
				time: timestamp => `[${ DateTime.now().toISODate() } ${ timestamp }]`
			}
		})
	});
}

export default pino(
	{
		level: 'info'
	},
	pino.multistream(streams, {
		dedupe: true
	})
);
