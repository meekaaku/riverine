import * as server from '../entries/pages/app/product/_id_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/app/product/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/app/product/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.YSF8_hpS.js","_app/immutable/chunks/PYfKw6-A.js","_app/immutable/chunks/pArACxew.js","_app/immutable/chunks/4LBr7HhJ.js","_app/immutable/chunks/CENBE0I_.js","_app/immutable/chunks/ziiS7P6X.js","_app/immutable/chunks/DtFr6bQu.js"];
export const stylesheets = [];
export const fonts = [];
