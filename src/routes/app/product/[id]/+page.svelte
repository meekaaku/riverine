<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	const product = $derived<any>(data?.product);
	const categories = $derived<any[]>(data?.categories ?? []);
	const error = $derived($page.form?.error);
	const success = $derived($page.form?.success);

	const images = $derived(
		product?.images
			? typeof product.images === 'string'
				? JSON.parse(product.images || '[]')
				: product.images ?? []
			: []
	);
	const imageUrl = $derived(Array.isArray(images) && images[0] ? images[0].url : null);

	let isSubmitting = $state(false);
	let showSuccess = $state(false);

	$effect(() => {
		if (success) {
			showSuccess = true;
			const t = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(t);
		}
	});
</script>

{#if !product}
	<p class="p-4 text-stone-600">Product not found.</p>
{:else}
	<div class="p-4 max-w-xl">
		<div class="mb-4 flex items-start justify-between gap-4">
			<a href="/app/list" class="text-sm text-stone-600 hover:text-stone-900">← Back</a>
			<div class="flex flex-col items-end gap-1">
				<button
					form="product-form"
					type="submit"
					disabled={isSubmitting}
					class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
				>
					{#if isSubmitting}
						<span class="inline-flex items-center gap-1.5">
							<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Saving…
						</span>
					{:else}
						Save
					{/if}
				</button>
				<div class="min-h-6 w-full text-right text-sm">
					{#if showSuccess}
						<span class="text-green-600">Saved successfully</span>
					{:else if error}
						<span class="text-red-600">{error}</span>
					{/if}
				</div>
			</div>
		</div>

		<form
			id="product-form"
			method="POST"
			class="space-y-4"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					await update();
					isSubmitting = false;
					if (result.type === 'success' && result.data?.success) {
						await invalidateAll();
					}
				};
			}}
		>
			{#if imageUrl}
				<div class="aspect-square max-h-48 w-full max-w-xs overflow-hidden rounded-lg">
					<img src={imageUrl} alt="Product" class="h-full w-full object-contain" />
				</div>
			{:else}
				<div class="aspect-square max-h-48 w-full max-w-xs rounded-lg bg-stone-100"></div>
			{/if}

			<div>
				<label for="category_id" class="block text-xs font-medium text-stone-500">Category</label>
				<select
					id="category_id"
					name="category_id"
					required
					class="mt-0.5 w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900"
				>
					{#each categories as cat}
						<option value={cat.id} selected={product?.category_id == cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="requirements" class="block text-xs font-medium text-stone-500">Requirements</label>
				<textarea
					id="requirements"
					name="requirements"
					rows="3"
					class="mt-0.5 w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900"
				>{product?.requirements ?? ''}</textarea>
			</div>

			<div>
				<label for="link" class="block text-xs font-medium text-stone-500">Link</label>
				<input
					type="url"
					id="link"
					name="link"
					value={product?.link ?? ''}
					class="mt-0.5 w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900"
				/>
			</div>

			<div>
				<label for="description" class="block text-xs font-medium text-stone-500">Description</label>
				<textarea
					id="description"
					name="description"
					rows="4"
					class="mt-0.5 w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900"
				>{product?.description ?? ''}</textarea>
			</div>

			<div>
				<span class="block text-xs font-medium text-stone-500 mb-2">Options</span>
				<div class="flex flex-wrap gap-x-6 gap-y-2">
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="is_public" class="rounded border-stone-300" checked={!!product?.is_public} />
						Is public
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_rent" class="rounded border-stone-300" checked={!!product?.floor_rent} />
						Floor rent
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_7" class="rounded border-stone-300" checked={!!product?.floor_7} />
						Floor 7
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_8" class="rounded border-stone-300" checked={!!product?.floor_8} />
						Floor 8
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_9" class="rounded border-stone-300" checked={!!product?.floor_9} />
						Floor 9
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_10" class="rounded border-stone-300" checked={!!product?.floor_10} />
						Floor 10
					</label>
				</div>
			</div>

			<div class="flex flex-col gap-1 pt-2">
				<div class="min-h-6 text-sm">
					{#if showSuccess}
						<span class="text-green-600">Saved successfully</span>
					{:else if error}
						<span class="text-red-600">{error}</span>
					{/if}
				</div>
				<button
					form="product-form"
					type="submit"
					disabled={isSubmitting}
					class="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
				>
					{#if isSubmitting}
						<span class="inline-flex items-center justify-center gap-1.5">
							<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Saving…
						</span>
					{:else}
						Save
					{/if}
				</button>
			</div>
		</form>
	</div>
{/if}
