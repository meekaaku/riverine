<script lang="ts">
	type Photo = { id: number; url: string; thumb?: string | null } | null;

	type ProductRow = {
		id: number;
		category_name?: string | null;
		requirements?: string | null;
		floor_rent?: boolean | null;
		floor_7?: boolean | null;
		floor_8?: boolean | null;
		floor_9?: boolean | null;
		floor_10?: boolean | null;
		images?: Photo[] | null;
	};

	let { data }: { data: { products?: ProductRow[] } } = $props();
	const products = $derived(data?.products ?? []);

	const FLOOR_OPTIONS: { key: keyof ProductRow; label: string }[] = [
		{ key: 'floor_rent', label: 'Rent' },
		{ key: 'floor_7', label: '7' },
		{ key: 'floor_8', label: '8' },
		{ key: 'floor_9', label: '9' },
		{ key: 'floor_10', label: '10' }
	];

	function getFloors(p: ProductRow): string {
		return FLOOR_OPTIONS.filter((opt) => p[opt.key] === true).map((opt) => opt.label).join(', ');
	}
</script>

<div class="p-4">
	<div class="mb-4">
		<h1 class="text-lg font-semibold text-stone-900">Products Table</h1>
	</div>

	<div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
		<table class="min-w-full divide-y divide-stone-200">
			<thead class="bg-stone-50">
				<tr>
					<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Category</th>
					<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Floor</th>
					<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Requirements</th>
					<th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Photos</th>
				</tr>
			</thead>

			<tbody class="divide-y divide-stone-100 bg-white">
				{#each products as p (p.id)}
					{@const totalPhotos = Array.isArray(p.images) ? p.images.filter(Boolean).length : 0}
					{@const thumbUrls =
						Array.isArray(p.images)
							? p.images
									.filter(Boolean)
									.map((img) => (img ? (img.thumb ?? img.url) : null))
									.filter((u): u is string => !!u)
									.slice(0, 3)
							: []}

					<tr class="hover:bg-stone-50">
						<td class="whitespace-nowrap px-3 py-2 text-sm text-stone-900">{p.category_name ?? '-'}</td>
						<td class="whitespace-nowrap px-3 py-2 text-sm text-stone-700">{getFloors(p) || '-'}</td>
						<td class="px-3 py-2 text-sm text-stone-700">
							<div class="max-h-24 max-w-md overflow-hidden whitespace-pre-wrap">{p.requirements ?? '-'}</div>
						</td>
						<td class="px-3 py-2">
							{#if totalPhotos === 0}
								<span class="text-sm text-stone-500">-</span>
							{:else}
								<div class="flex items-center gap-2">
									{#each thumbUrls as url, idx (idx)}
										<a href="/app/product/{p.id}" class="inline-flex rounded border border-stone-200 bg-white p-0.5 hover:border-stone-300" aria-label="View product photos">
											<img src={url} alt={`${p.category_name ?? 'Product'} thumbnail ${idx + 1}`} class="h-10 w-10 rounded object-cover" />
										</a>
									{/each}
									{#if totalPhotos > 3}
										<span class="text-sm text-stone-500">+{totalPhotos - 3}</span>
									{/if}
								</div>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>