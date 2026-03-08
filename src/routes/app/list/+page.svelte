<script lang="ts">
	let { data } = $props();

	const products = $derived(data?.products ?? []);
</script>

<div class="grid grid-cols-2 gap-4 p-4">
	{#each products as product}
		{@const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images ?? [])}
		{@const imageUrl = Array.isArray(images) && images[0] ? images[0].url : null}
		<a href="/app/product/{product.id}" class="block">
			<article class="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				{#if imageUrl}
					<div class="mb-3 aspect-square w-full overflow-hidden rounded-md">
						<img
							src={imageUrl}
							alt={product.name ?? 'Product'}
							class="h-full w-full object-cover"
						/>
					</div>
				{:else}
					<div class="mb-3 aspect-square w-full rounded-md bg-stone-100"></div>
				{/if}
				<h3 class="font-semibold text-stone-900">{product.name ?? 'Untitled'}</h3>
				{#if product.price != null}
					<p class="mt-1 text-sm text-stone-600">${product.price}</p>
				{/if}
			</article>
		</a>
	{/each}
</div>
