export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BXLFZAAx.js",app:"_app/immutable/entry/app.7uNcJTkz.js",imports:["_app/immutable/entry/start.BXLFZAAx.js","_app/immutable/chunks/CegctE8k.js","_app/immutable/chunks/pArACxew.js","_app/immutable/chunks/B_yxPNCF.js","_app/immutable/entry/app.7uNcJTkz.js","_app/immutable/chunks/pArACxew.js","_app/immutable/chunks/4LBr7HhJ.js","_app/immutable/chunks/PYfKw6-A.js","_app/immutable/chunks/B_yxPNCF.js","_app/immutable/chunks/CENBE0I_.js","_app/immutable/chunks/ziiS7P6X.js","_app/immutable/chunks/tORJeZC1.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/app/list",
				pattern: /^\/app\/list\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/app/product/add",
				pattern: /^\/app\/product\/add\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/app/product/[id]",
				pattern: /^\/app\/product\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
