import * as server from '../entries/pages/app/product/add/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/app/product/add/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/app/product/add/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.Cxpf8cdy.js","_app/immutable/chunks/PYfKw6-A.js","_app/immutable/chunks/pArACxew.js","_app/immutable/chunks/4LBr7HhJ.js","_app/immutable/chunks/CENBE0I_.js","_app/immutable/chunks/ziiS7P6X.js","_app/immutable/chunks/BQZWxNps.js","_app/immutable/chunks/DtFr6bQu.js","_app/immutable/chunks/tORJeZC1.js","_app/immutable/chunks/B_yxPNCF.js","_app/immutable/chunks/E_m5vl97.js"];
export const stylesheets = [];
export const fonts = [];
