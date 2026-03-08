<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();

	const categories = $derived(data?.categories ?? []);
	const error = $derived($page.form?.error);

	type PhotoItem = { id: string; preview: string; file: File };

	let photos = $state<PhotoItem[]>([]);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null = null;

	function addFiles(files: FileList | File[] | null) {
		if (!files) return;
		const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
		for (const file of fileArray) {
			const reader = new FileReader();
			reader.onload = () => {
				photos = [...photos, { id: crypto.randomUUID(), preview: reader.result as string, file }];
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

	function openCamera() {
		if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
			fileInput?.setAttribute('capture', 'environment');
			fileInput?.click();
		} else {
			openFilePicker();
		}
	}

	function removePhoto(id: string) {
		photos = photos.filter((p) => p.id !== id);
	}

	function clearAllPhotos() {
		photos = [];
		if (fileInput) fileInput.value = '';
	}

	function syncPhotosToInput() {
		if (!fileInput) return;
		const dt = new DataTransfer();
		for (const photo of photos) {
			dt.items.add(photo.file);
		}
		fileInput.files = dt.files;
	}
</script>

<div class="p-4 max-w-xl">
	<a href="/app/list" class="mb-4 inline-block text-sm text-stone-600 hover:text-stone-900">
		← Back to list
	</a>

	<h1 class="text-2xl font-semibold text-stone-900 mb-6">Add product</h1>

	<form method="POST" enctype="multipart/form-data" class="space-y-6" onsubmit={() => syncPhotosToInput()}>
		<!-- Photo upload -->
		<div>
			<label for="photos" class="block text-sm font-medium text-stone-700 mb-2">Photos <span class="text-red-500">*</span></label>
			<div
				role="button"
				tabindex="0"
				class="relative rounded-lg border-2 border-dashed transition-colors {isDragging
					? 'border-stone-400 bg-stone-50'
					: 'border-stone-200 hover:border-stone-300'}"
				ondrop={onDrop}
				ondragover={onDragOver}
				ondragleave={onDragLeave}
				onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
			>
				{#if photos.length > 0}
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
						{#each photos as photo (photo.id)}
							<div class="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
								<img src={photo.preview} alt="Preview" class="h-full w-full object-contain" />
								<button
									type="button"
									class="absolute top-1 right-1 rounded-full bg-stone-800/80 text-white p-1 hover:bg-stone-900"
									onclick={() => removePhoto(photo.id)}
									aria-label="Remove photo"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							<span class="text-xs">Add more</span>
						</button>
					</div>
					<button
						type="button"
						class="mt-2 text-sm text-stone-500 hover:text-stone-700"
						onclick={clearAllPhotos}
					>
						Clear all
					</button>
				{:else}
					<div
						role="button"
						tabindex="0"
						class="aspect-square flex flex-col items-center justify-center gap-2 p-6 cursor-pointer"
						onclick={openFilePicker}
						onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
						</svg>
						<p class="text-sm text-stone-500 text-center">Drag & drop, or click to upload</p>
						<div class="flex gap-2">
							<button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline" onclick={(e) => { e.stopPropagation(); openFilePicker(); }}>
								Upload files
							</button>
							<span class="text-stone-300">|</span>
							<button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline" onclick={(e) => { e.stopPropagation(); openCamera(); }}>
								Take photo
							</button>
						</div>
					</div>
				{/if}
			</div>
			<input
				bind:this={fileInput}
				id="photos"
				type="file"
				name="photos"
				accept="image/*"
				multiple
				class="hidden"
				onchange={onInputChange}
			/>
		</div>

		<!-- Category -->
		<div>
			<label for="category_id" class="block text-sm font-medium text-stone-700 mb-2">Category</label>
			<select
				id="category_id"
				name="category_id"
				required
				class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
			>
				<option value="">Select category</option>
				{#each categories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>

		<!-- Requirements -->
		<div>
			<label for="requirements" class="block text-sm font-medium text-stone-700 mb-2">Requirements</label>
			<textarea
				id="requirements"
				name="requirements"
				rows="3"
				class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
				placeholder="Product requirements..."
			></textarea>
		</div>

		<!-- Link -->
		<div>
			<label for="link" class="block text-sm font-medium text-stone-700 mb-2">Link</label>
			<input
				type="url"
				id="link"
				name="link"
				class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
				placeholder="https://..."
			/>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium text-stone-700 mb-2">Description</label>
			<textarea
				id="description"
				name="description"
				rows="4"
				class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
				placeholder="Product description..."
			></textarea>
		</div>

		<!-- Checkboxes -->
		<div class="space-y-3" role="group" aria-labelledby="options-heading">
			<span id="options-heading" class="block text-sm font-medium text-stone-700 mb-2">Options</span>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="is_public" class="rounded border-stone-300" />
					<span class="text-stone-700">Is public</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_rent" class="rounded border-stone-300" />
					<span class="text-stone-700">Floor rent</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_7" class="rounded border-stone-300" />
					<span class="text-stone-700">Floor 7</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_8" class="rounded border-stone-300" />
					<span class="text-stone-700">Floor 8</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_9" class="rounded border-stone-300" />
					<span class="text-stone-700">Floor 9</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_10" class="rounded border-stone-300" />
					<span class="text-stone-700">Floor 10</span>
				</label>
			</div>
		</div>

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button
			type="submit"
			disabled={photos.length === 0}
			class="w-full rounded-lg bg-stone-900 px-4 py-3 text-white font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Add product
		</button>
	</form>
</div>
