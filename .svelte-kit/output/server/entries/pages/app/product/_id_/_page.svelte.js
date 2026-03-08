import { a as attr, e as escape_html, d as derived } from "../../../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const product = derived(() => data?.product);
    const images = derived(() => product()?.images ? typeof product().images === "string" ? JSON.parse(product().images || "[]") : product().images ?? [] : []);
    const imageUrl = derived(() => Array.isArray(images()) && images()[0] ? images()[0].url : null);
    if (!product()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="p-4 text-stone-600">Product not found.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<article class="p-4"><a href="/app/list" class="mb-4 inline-block text-sm text-stone-600 hover:text-stone-900">← Back to list</a> <div class="max-w-lg">`);
      if (imageUrl()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="aspect-square w-full overflow-hidden rounded-lg"><img${attr("src", imageUrl())}${attr("alt", product().name ?? "Product")} class="h-full w-full object-cover"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="aspect-square w-full rounded-lg bg-stone-100"></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="mt-4"><h1 class="text-2xl font-semibold text-stone-900">${escape_html(product().name ?? "Untitled")}</h1> `);
      if (product().price != null) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-2 text-lg text-stone-600">$${escape_html(product().price)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (product().description) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-4 text-stone-600">${escape_html(product().description)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></article>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
