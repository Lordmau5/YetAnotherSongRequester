import {
	Server, Socket as SocketClient
} from 'socket.io';

import {
	Server as HttpServer
} from 'http';

import SongManager from '~/SongManager.ts';

export default class Socket {
	static io: Server;

	static connections: Set<SocketClient> = new Set();

	static async asyncEmit(eventName: string, only_once: boolean = true, data: any = {
	}): Promise<any> {
		return new Promise((resolve, reject) => {
			let got_data = false;

			this.connections.forEach(socket => {
				socket.once(eventName, result => {
					if (only_once && got_data)
						return;

					got_data = true;

					resolve(result);
				});
			});

			this.io.emit(eventName, data);

			setTimeout(reject, 3000);
		});
	}

	static setup(server: HttpServer) {
		this.io = new Server(server);

		this.io.on('connection', async socket => {
			this.connections.add(socket);

			socket.on('disconnect', () => {
				this.connections.delete(socket);
			});

			socket.emit('current_song', await SongManager.getFirst(true));

			socket.on('request_current_song', async() => {
				socket.emit('current_song', await SongManager.getFirst(true));
			});

			socket.on('song_ended', async() => {
				const nextSong = await SongManager.advanceSong(true);

				socket.emit('current_song', nextSong);
			});
		});
	}
}
