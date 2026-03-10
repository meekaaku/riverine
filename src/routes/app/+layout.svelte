<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface Props {
		data: { user?: { id: number; username: string; name: string } };
		children: import('svelte').Snippet;
	}
	let { data, children }: Props = $props();
	let dropdownOpen = $state(false);
	let filterOpen = $state(false);

	const isListPage = $derived($page.url.pathname === '/app/list');
	const categories = $derived<any[]>($page.data?.categories ?? []);
	const filters = $derived($page.data?.filters ?? { category: '', publicOnly: false, selectedFloors: [] as string[] });
	const isFilterActive = $derived(
		!!(filters.category || filters.publicOnly || (filters.selectedFloors?.length ?? 0) > 0)
	);
	let pendingCategory = $state('');
	let pendingPublic = $state(false);
	let pendingFloors = $state<string[]>([]);

	const FLOOR_OPTIONS = [
		{ value: 'rent', label: 'Rent' },
		{ value: '7', label: '7' },
		{ value: '8', label: '8' },
		{ value: '9', label: '9' },
		{ value: '10', label: '10' }
	];

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
		if (!dropdownOpen) return;
		const handler = (e: MouseEvent) => {
			const target = e.target as Node;
			if (!document.querySelector('.user-dropdown')?.contains(target) && !document.querySelector('.user-trigger')?.contains(target)) {
				dropdownOpen = false;
			}
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
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

<div class="container mx-auto">
	<header class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
		<div class="flex items-center gap-2">
			<a
				href="/app/product/add"
				class="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 5v14M5 12h14" />
				</svg>
				Add
			</a>
			{#if isListPage}
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
			{/if}
		</div>
		<div class="relative">
			<button
				type="button"
				class="user-trigger inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
				onclick={() => (dropdownOpen = !dropdownOpen)}
				aria-expanded={dropdownOpen}
				aria-haspopup="true"
			>
				<span>{data.user?.name ?? data.user?.username ?? 'User'}</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform {dropdownOpen ? 'rotate-180' : ''}">
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
			{#if dropdownOpen}
				<div
					class="user-dropdown absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
					role="menu"
				>
					<a
						href="/logout"
						class="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
						role="menuitem"
					>
						Logout
					</a>
				</div>
			{/if}
		</div>
	</header>
	{@render children()}
</div>