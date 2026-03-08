<script lang="ts">
	let { data } = $props();

	const products = $derived(data?.products ?? []);
</script>

<div class="p-4">
	<a
		href="/app/product/add"
		class="mb-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 5v14M5 12h14" />
		</svg>
		Add product
	</a>
	<div class="grid grid-cols-2 gap-4">
	{#each products as product}
		{@const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images ?? [])}
		{@const imageUrl = Array.isArray(images) && images[0] ? images[0].url : null}
		<a href="/app/product/{product.id}" class="block min-w-0">
			<article class="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				{#if imageUrl}
					<div class="mb-3 aspect-square w-full min-h-0 overflow-hidden rounded-md">
						<img
							src={imageUrl}
							alt={product.name ?? 'Product'}
							class="block h-full w-full min-h-0 min-w-0 object-contain"
						/>
					</div>
				{:else}
					<div class="mb-3 aspect-square w-full rounded-md bg-stone-100"></div>
				{/if}
                <p class="text-sm text-stone-600">{product.category_name}</p>
		
			</article>
		</a>
	{/each}
	</div>
</div>
