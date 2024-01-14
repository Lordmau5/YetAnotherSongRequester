import Router from '@koa/router';

export interface RouterResult {
	routes: Router.Middleware;
	allowedMethods: Router.Middleware;
}

export default class AbstractRouter {
	router: Router;

	constructor(options: Router.RouterOptions | undefined = undefined) {
		this.router = new Router(options);
	}

	getRouter(): RouterResult {
		this.setupRouter();

		return {
			routes: this.router.routes(),
			allowedMethods: this.router.allowedMethods()
		};
	}

	setupRouter() {}
}
