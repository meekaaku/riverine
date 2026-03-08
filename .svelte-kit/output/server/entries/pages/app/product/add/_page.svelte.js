import { g as getContext, f as attr_class, b as ensure_array_like, a as attr, e as escape_html, d as derived, i as store_get, c as stringify, u as unsubscribe_stores } from "../../../../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    const categories = derived(() => data?.categories ?? []);
    const error = derived(() => store_get($$store_subs ??= {}, "$page", page).form?.error);
    let photos = [];
    $$renderer2.push(`<div class="p-4 max-w-xl"><a href="/app/list" class="mb-4 inline-block text-sm text-stone-600 hover:text-stone-900">← Back to list</a> <h1 class="text-2xl font-semibold text-stone-900 mb-6">Add product</h1> <form method="POST" enctype="multipart/form-data" class="space-y-6"><div><label for="photos" class="block text-sm font-medium text-stone-700 mb-2">Photos</label> <div role="button" tabindex="0"${attr_class(`relative rounded-lg border-2 border-dashed transition-colors ${stringify("border-stone-200 hover:border-stone-300")}`)}>`);
    if (photos.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4"><!--[-->`);
      const each_array = ensure_array_like(photos);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let photo = each_array[$$index];
        $$renderer2.push(`<div class="relative aspect-square overflow-hidden rounded-lg bg-stone-100"><img${attr("src", photo.preview)} alt="Preview" class="h-full w-full object-contain"/> <button type="button" class="absolute top-1 right-1 rounded-full bg-stone-800/80 text-white p-1 hover:bg-stone-900" aria-label="Remove photo"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button></div>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> <span class="text-xs">Add more</span></button></div> <button type="button" class="mt-2 text-sm text-stone-500 hover:text-stone-700">Clear all</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div role="button" tabindex="0" class="aspect-square flex flex-col items-center justify-center gap-2 p-6 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg> <p class="text-sm text-stone-500 text-center">Drag &amp; drop, or click to upload</p> <div class="flex gap-2"><button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline">Upload files</button> <span class="text-stone-300">|</span> <button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline">Take photo</button></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <input id="photos" type="file" name="photos" accept="image/*" multiple="" class="hidden"/></div> <div><label for="category_id" class="block text-sm font-medium text-stone-700 mb-2">Category</label> <select id="category_id" name="category_id" required="" class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Select category`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array_1 = ensure_array_like(categories());
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let cat = each_array_1[$$index_1];
      $$renderer2.option({ value: cat.id }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(cat.name)}`);
      });
    }
    $$renderer2.push(`<!--]--></select></div> <div><label for="requirements" class="block text-sm font-medium text-stone-700 mb-2">Requirements</label> <textarea id="requirements" name="requirements" rows="3" class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" placeholder="Product requirements..."></textarea></div> <div><label for="link" class="block text-sm font-medium text-stone-700 mb-2">Link</label> <input type="url" id="link" name="link" class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" placeholder="https://..."/></div> <div><label for="description" class="block text-sm font-medium text-stone-700 mb-2">Description</label> <textarea id="description" name="description" rows="4" class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" placeholder="Product description..."></textarea></div> <div class="space-y-3" role="group" aria-labelledby="options-heading"><span id="options-heading" class="block text-sm font-medium text-stone-700 mb-2">Options</span> <div class="flex flex-wrap gap-x-6 gap-y-2"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="is_public" class="rounded border-stone-300"/> <span class="text-stone-700">Is public</span></label> <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="floor_rent" class="rounded border-stone-300"/> <span class="text-stone-700">Floor rent</span></label> <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="floor_7" class="rounded border-stone-300"/> <span class="text-stone-700">Floor 7</span></label> <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="floor_8" class="rounded border-stone-300"/> <span class="text-stone-700">Floor 8</span></label> <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="floor_9" class="rounded border-stone-300"/> <span class="text-stone-700">Floor 9</span></label> <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="floor_10" class="rounded border-stone-300"/> <span class="text-stone-700">Floor 10</span></label></div></div> `);
    if (error()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-sm text-red-600">${escape_html(error())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="w-full rounded-lg bg-stone-900 px-4 py-3 text-white font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Add product</button></form></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
