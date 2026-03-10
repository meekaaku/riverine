<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const products = $derived<any>(data?.products ?? []);
	const showDeleted = $derived($page.url.searchParams.get('deleted') === '1');

	$effect(() => {
		if (showDeleted) {
			const t = setTimeout(() => goto('/app/list', { replaceState: true }), 3000);
			return () => clearTimeout(t);
		}
	});
</script>

<div class="p-4">
	{#if showDeleted}
		<p class="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">Product deleted successfully.</p>
	{/if}
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		{#each products as product}
			{@const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images ?? [])}
			{@const imageUrl = Array.isArray(images) && images[0] ? images[0].url : null}
			{@const floors = [
				product.floor_rent && 'Rent',
				product.floor_7 && '7',
				product.floor_8 && '8',
				product.floor_9 && '9',
				product.floor_10 && '10'
			].filter(Boolean)}
			<a href="/app/product/{product.id}" class="block min-w-0">
				<article class="flex h-64 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md md:h-56">
					{#if imageUrl}
						<div class="min-h-0 flex-1 overflow-hidden rounded-t-lg">
							<img
								src={imageUrl}
								alt={product.category_name ?? 'Product'}
								class="h-full w-full object-contain"
							/>
						</div>
					{:else}
						<div class="min-h-0 flex-1 rounded-t-lg bg-stone-100"></div>
					{/if}
					<div class="shrink-0 px-3 py-2">
						<p class="text-sm text-stone-600">{product.category_name}</p>
						{#if floors.length > 0}
							<p class="text-xs text-stone-400">{floors.join(', ')}</p>
						{/if}
					</div>
				</article>
			</a>
		{/each}
	</div>
</div>
