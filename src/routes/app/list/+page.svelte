<script lang="ts">
	let { data } = $props();

	const products = $derived(data?.products ?? []);
</script>

<div class="grid grid-cols-2 gap-4 p-4">
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
