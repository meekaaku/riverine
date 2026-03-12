<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const filters = $derived(data?.filters ?? { category: '', publicOnly: false, selectedFloors: [] as string[] });
	const queryKey = $derived(
		`${filters.category}|${filters.publicOnly}|${(filters.selectedFloors ?? []).join(',')}`
	);

	let products = $state<any[]>([]);
	let hasMore = $state(true);
	let loading = $state(false);
	let sentinelEl: HTMLDivElement | null = null;

	const showDeleted = $derived($page.url.searchParams.get('deleted') === '1');

	$effect(() => {
		const base = data?.products ?? [];
		const key = queryKey;
		products = [...base];
		hasMore = data?.hasMore ?? false;
	});

	$effect(() => {
		if (!sentinelEl || !hasMore || loading) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0]?.isIntersecting || loading || !hasMore) return;
				loadMore();
			},
			{ rootMargin: '200px', threshold: 0 }
		);
		observer.observe(sentinelEl);
		return () => observer.disconnect();
	});

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('offset', String(products.length));
			params.set('limit', '10');
			if (filters.category) params.set('category', filters.category);
			if (filters.publicOnly) params.set('public', '1');
			if ((filters.selectedFloors ?? []).length > 0) params.set('floors', (filters.selectedFloors ?? []).join(','));
			const res = await fetch(`/app/list/products?${params.toString()}`);
			if (!res.ok) return;
			const { products: next, hasMore: more } = await res.json();
			products = [...products, ...(next ?? [])];
			hasMore = more ?? false;
		} finally {
			loading = false;
		}
	}

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
			{@const imageUrl = Array.isArray(images) && images[0] ? (images[0].thumb ?? images[0].url) : null}
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
	<div bind:this={sentinelEl} class="h-4 w-full" aria-hidden="true"></div>
	{#if loading}
		<div class="flex justify-center py-8">
			<svg class="h-8 w-8 animate-spin text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
	{/if}
</div>
