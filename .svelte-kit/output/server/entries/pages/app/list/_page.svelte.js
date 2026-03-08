import { b as ensure_array_like, a as attr, c as stringify, e as escape_html, d as derived } from "../../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const products = derived(() => data?.products ?? []);
    $$renderer2.push(`<div class="p-4"><a href="/app/product/add" class="mb-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg> Add product</a> <div class="grid grid-cols-2 gap-4"><!--[-->`);
    const each_array = ensure_array_like(products());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let product = each_array[$$index];
      const images = typeof product.images === "string" ? JSON.parse(product.images || "[]") : product.images ?? [];
      const imageUrl = Array.isArray(images) && images[0] ? images[0].url : null;
      $$renderer2.push(`<a${attr("href", `/app/product/${stringify(product.id)}`)} class="block min-w-0"><article class="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">`);
      if (imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-3 aspect-square w-full min-h-0 overflow-hidden rounded-md"><img${attr("src", imageUrl)}${attr("alt", product.name ?? "Product")} class="block h-full w-full min-h-0 min-w-0 object-contain"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="mb-3 aspect-square w-full rounded-md bg-stone-100"></div>`);
      }
      $$renderer2.push(`<!--]--> <p class="text-sm text-stone-600">${escape_html(product.category_name)}</p></article></a>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
