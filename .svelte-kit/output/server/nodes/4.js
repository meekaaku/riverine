import * as server from '../entries/pages/app/list/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/app/list/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/app/list/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.BzgLX8iM.js","_app/immutable/chunks/PYfKw6-A.js","_app/immutable/chunks/pArACxew.js","_app/immutable/chunks/4LBr7HhJ.js","_app/immutable/chunks/CENBE0I_.js","_app/immutable/chunks/ziiS7P6X.js","_app/immutable/chunks/BQZWxNps.js","_app/immutable/chunks/DtFr6bQu.js"];
export const stylesheets = [];
export const fonts = [];
