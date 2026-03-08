<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	const product = $derived<any>(data?.product);
	const categories = $derived<any[]>(data?.categories ?? []);
	const isChecked = (v: unknown) => v === true || v === 't' || v === 1;
	const error = $derived($page.form?.error);
	const success = $derived($page.form?.success);
	const showDuplicated = $derived($page.url.searchParams.get('duplicated') === '1');

	const images = $derived(
		product?.images
			? typeof product.images === 'string'
				? JSON.parse(product.images || '[]')
				: product.images ?? []
			: []
	);
	const imageUrl = $derived(Array.isArray(images) && images[0] ? images[0].url : null);

	type PhotoItem = { id: string; preview: string; file: File };

	let newPhotos = $state<PhotoItem[]>([]);
	let isSubmitting = $state(false);
	let isDuplicating = $state(false);
	let isDeleting = $state(false);
	let showSuccess = $state(false);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null = null;

	const isAnyLoading = $derived(isSubmitting || isDuplicating || isDeleting);

	function addFiles(files: FileList | File[] | null) {
		if (!files) return;
		const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
		for (const file of fileArray) {
			const reader = new FileReader();
			reader.onload = () => {
				newPhotos = [...newPhotos, { id: crypto.randomUUID(), preview: reader.result as string, file }];
			};
			reader.readAsDataURL(file);
		}
	}

	function onInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		addFiles(target.files);
		target.value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		addFiles(e.dataTransfer?.files ?? null);
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	function openFilePicker() {
		fileInput?.click();
	}

	function removePhoto(id: string) {
		newPhotos = newPhotos.filter((p) => p.id !== id);
	}

	function syncPhotosToInput() {
		if (!fileInput) return;
		const dt = new DataTransfer();
		for (const photo of newPhotos) {
			dt.items.add(photo.file);
		}
		fileInput.files = dt.files;
	}

	$effect(() => {
		if (success) {
			showSuccess = true;
			const t = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(t);
		}
	});

	$effect(() => {
		if (showDuplicated) {
			const t = setTimeout(() => goto($page.url.pathname, { replaceState: true }), 3000);
			return () => clearTimeout(t);
		}
	});
</script>

{#if !product}
	<p class="p-4 text-stone-600">Product not found.</p>
{:else}
	<div class="mx-auto max-w-xl p-4">
		<div class="mb-4 flex items-start justify-between gap-4">
			<a href="/app/list" class="text-sm text-stone-600 hover:text-stone-900">← Back</a>
			<div class="flex flex-col items-end gap-1">
				<div class="flex items-center gap-2">
					<form
						method="POST"
						class="inline"
						use:enhance={() => {
							isDuplicating = true;
							return async ({ result, update }) => {
								await update();
								isDuplicating = false;
							};
						}}
					>
						<input type="hidden" name="intent" value="duplicate" />
						<button
							type="submit"
							disabled={isAnyLoading}
							class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 inline-flex items-center gap-1.5"
						>
							{#if isDuplicating}
								<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Duplicating…
							{:else}
								Duplicate
							{/if}
						</button>
					</form>
					<form
						method="POST"
						class="inline"
						use:enhance={() => {
							isDeleting = true;
							return async ({ result, update }) => {
								await update();
								isDeleting = false;
							};
						}}
					>
						<input type="hidden" name="intent" value="delete" />
						<button
							type="submit"
							disabled={isAnyLoading}
							class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-1.5"
						>
							{#if isDeleting}
								<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Deleting…
							{:else}
								Delete
							{/if}
						</button>
					</form>
					<button
						form="product-form"
						type="submit"
						disabled={isAnyLoading}
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
				</div>
				<div class="min-h-6 w-full text-right text-sm">
					{#if showDuplicated}
						<span class="text-green-600">Product duplicated successfully</span>
					{:else if showSuccess}
						<span class="text-green-600">Saved successfully</span>
					{:else if error}
						<span class="text-red-600">{error}</span>
					{/if}
				</div>
				<div class="min-h-5 w-full text-right text-xs text-stone-500">
					{#if isDuplicating}
						<span>Duplicating product…</span>
					{:else if isDeleting}
						<span>Deleting product…</span>
					{/if}
				</div>
			</div>
		</div>

		<form
			id="product-form"
			method="POST"
			enctype="multipart/form-data"
			class="space-y-4"
			onsubmit={() => syncPhotosToInput()}
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					await update({ reset: false });
					isSubmitting = false;
					if (result.type === 'success' && result.data?.success) {
						newPhotos = [];
						if (fileInput) fileInput.value = '';
					}
				};
			}}
		>
			<!-- Existing photos -->
			{#if Array.isArray(images) && images.length > 0}
				<div>
					<label class="block text-xs font-medium text-stone-500 mb-2">Current photos</label>
					<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
						{#each images as img, i (img?.id ?? img?.url ?? i)}
							<div class="aspect-square overflow-hidden rounded-lg bg-stone-100">
								<img src={img.url} alt="Product" class="h-full w-full object-contain" />
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="aspect-square max-h-48 w-full max-w-xs rounded-lg bg-stone-100"></div>
			{/if}

			<!-- Add more photos -->
			<div>
				<label class="block text-xs font-medium text-stone-500 mb-2">Add more photos</label>
				<div
					role="button"
					tabindex="0"
					class="relative flex min-h-[120px] flex-col overflow-hidden rounded-lg border-2 border-dashed transition-colors {isDragging
						? 'border-stone-400 bg-stone-50'
						: 'border-stone-200 hover:border-stone-300'}"
					ondrop={onDrop}
					ondragover={onDragOver}
					ondragleave={onDragLeave}
					onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
				>
					{#if newPhotos.length > 0}
						<div class="min-h-0 flex-1 overflow-y-auto p-3">
							<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
								{#each newPhotos as photo (photo.id)}
									<div class="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
										<img src={photo.preview} alt="Preview" class="h-full w-full object-contain" />
										<button
											type="button"
											class="absolute top-0.5 right-0.5 rounded-full bg-stone-800/80 text-white p-1 hover:bg-stone-900"
											onclick={() => removePhoto(photo.id)}
											aria-label="Remove photo"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M18 6L6 18M6 6l12 12" />
											</svg>
										</button>
									</div>
								{/each}
								<button
									type="button"
									class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-600"
									onclick={openFilePicker}
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
									</svg>
									<span class="text-xs">Add</span>
								</button>
							</div>
						</div>
					{:else}
						<div
							class="flex h-full min-h-[100px] flex-col items-center justify-center gap-1 p-4 cursor-pointer"
							onclick={openFilePicker}
							onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
							</svg>
							<p class="text-xs text-stone-500">Drag & drop or click to add photos</p>
						</div>
					{/if}
				</div>
				<input
					bind:this={fileInput}
					type="file"
					name="photos"
					accept="image/*"
					multiple
					class="hidden"
					onchange={onInputChange}
				/>
			</div>

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
					type="text"
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
						<input type="checkbox" name="is_public" class="rounded border-stone-300" checked={isChecked(product?.is_public)} />
						Is public
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_rent" class="rounded border-stone-300" checked={isChecked(product?.floor_rent)} />
						Floor rent
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_7" class="rounded border-stone-300" checked={isChecked(product?.floor_7)} />
						Floor 7
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_8" class="rounded border-stone-300" checked={isChecked(product?.floor_8)} />
						Floor 8
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_9" class="rounded border-stone-300" checked={isChecked(product?.floor_9)} />
						Floor 9
					</label>
					<label class="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
						<input type="checkbox" name="floor_10" class="rounded border-stone-300" checked={isChecked(product?.floor_10)} />
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
					disabled={isAnyLoading}
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
