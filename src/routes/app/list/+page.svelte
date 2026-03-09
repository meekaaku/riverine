<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const products = $derived<any>(data?.products ?? []);
	const categories = $derived<any[]>(data?.categories ?? []);
	const FLOOR_OPTIONS = [
		{ value: 'rent', label: 'Rent' },
		{ value: '7', label: '7' },
		{ value: '8', label: '8' },
		{ value: '9', label: '9' },
		{ value: '10', label: '10' }
	];
	const filters = $derived(data?.filters ?? { category: '', publicOnly: false, selectedFloors: [] as string[] });
	const showDeleted = $derived($page.url.searchParams.get('deleted') === '1');
	const isFilterActive = $derived(
		!!(filters.category || filters.publicOnly || (filters.selectedFloors?.length ?? 0) > 0)
	);
	let filterOpen = $state(false);
	let pendingCategory = $state('');
	let pendingPublic = $state(false);
	let pendingFloors = $state<string[]>([]);

	$effect(() => {
		if (filterOpen) {
			pendingCategory = filters.category ?? '';
			pendingPublic = filters.publicOnly ?? false;
			pendingFloors = [...(filters.selectedFloors ?? [])];
		}
	});

	function buildFilterUrl(updates: { category?: string; public?: boolean; floors?: string[] }) {
		const params = new URLSearchParams();
		const cat = updates.category ?? pendingCategory;
		const pub = updates.public ?? pendingPublic;
		const fl = updates.floors ?? pendingFloors;
		if (cat) params.set('category', cat);
		if (pub) params.set('public', '1');
		if (fl.length > 0) params.set('floors', fl.join(','));
		const qs = params.toString();
		return `/app/list${qs ? `?${qs}` : ''}`;
	}

	function togglePendingFloor(floorValue: string) {
		pendingFloors = pendingFloors.includes(floorValue)
			? pendingFloors.filter((f) => f !== floorValue)
			: [...pendingFloors, floorValue];
	}

	function applyFilters() {
		filterOpen = false;
		goto(buildFilterUrl({}));
	}

	function clearAll() {
		filterOpen = false;
		pendingCategory = '';
		pendingPublic = false;
		pendingFloors = [];
		goto('/app/list');
	}

	$effect(() => {
		if (showDeleted) {
			const t = setTimeout(() => goto('/app/list', { replaceState: true }), 3000);
			return () => clearTimeout(t);
		}
	});

	$effect(() => {
		if (!filterOpen) return;
		const handler = (e: MouseEvent) => {
			const target = e.target as Node;
			if (!document.querySelector('.filter-dropdown')?.contains(target) && !document.querySelector('.filter-trigger')?.contains(target)) {
				filterOpen = false;
			}
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	});
</script>

<div class="p-4">
	{#if showDeleted}
		<p class="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">Product deleted successfully.</p>
	{/if}
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<a
			href="/app/product/add"
			class="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 5v14M5 12h14" />
			</svg>
			Add
		</a>
		<div class="relative">
			<button
				type="button"
				class="filter-trigger inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium {isFilterActive ? 'border-stone-900 bg-stone-100 text-stone-900' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'}"
				onclick={(e) => { e.stopPropagation(); filterOpen = !filterOpen; }}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
				</svg>
				Filter
				{#if isFilterActive}
					<span class="ml-0.5 size-1.5 rounded-full bg-stone-600" title="Filtering active"></span>
				{/if}
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform {filterOpen ? 'rotate-180' : ''}">
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
			{#if filterOpen}
				<div
					class="filter-dropdown absolute left-0 top-full z-10 mt-1 min-w-[200px] rounded-lg border border-stone-200 bg-white py-2 shadow-lg"
					role="menu"
				>
					<div class="border-b border-stone-100 px-3 py-2">
						<label for="filter-category" class="block text-xs font-medium text-stone-500 mb-1">Category</label>
						<select
							id="filter-category"
							bind:value={pendingCategory}
							class="w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
						>
							<option value="">All</option>
							{#each categories as cat}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2 px-3 py-2">
						<label class="flex cursor-pointer items-center gap-2">
							<input type="checkbox" bind:checked={pendingPublic} />
							<span class="text-sm">Public</span>
						</label>
						<div>
							<span class="block text-xs font-medium text-stone-500 mb-1">Floors</span>
							<div class="space-y-1">
								{#each FLOOR_OPTIONS as opt}
									<label class="flex cursor-pointer items-center gap-2">
										<input
											type="checkbox"
											checked={pendingFloors.includes(opt.value)}
											onchange={() => togglePendingFloor(opt.value)}
										/>
										<span class="text-sm">{opt.label}</span>
									</label>
								{/each}
							</div>
						</div>
					</div>
					<div class="flex gap-2 border-t border-stone-100 px-3 pt-2">
						<button
							type="button"
							onclick={applyFilters}
							class="flex-1 rounded bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
						>
							Apply
						</button>
						<button
							type="button"
							onclick={clearAll}
							class="rounded border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
						>
							Clear All
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
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
