<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	const MAX_PHOTOS_BYTES = 10 * 1024 * 1024; // 10MB
	const categories = $derived<any>(data?.categories ?? []);
	const error = $derived($page.form?.error);

	type PhotoItem = { id: string; preview: string; file: File };

	let photos = $state<PhotoItem[]>([]);
	const totalPhotosBytes = $derived(photos.reduce((sum, p) => sum + p.file.size, 0));
	const photosSizeError = $derived(totalPhotosBytes > MAX_PHOTOS_BYTES);
	const totalPhotosMB = $derived((totalPhotosBytes / (1024 * 1024)).toFixed(2));
	let isSubmitting = $state(false);
	let uploadProgress = $state<number | null>(null);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null = null;

	function addFiles(files: FileList | File[] | null) {
		if (!files) return;
		const fileArray = Array.from(files).filter(
			(f) => f.type.startsWith('image/') || (f.type === '' && f.size > 0)
		);
		let runningTotal = totalPhotosBytes;
		for (const file of fileArray) {
			if (runningTotal + file.size > MAX_PHOTOS_BYTES) continue;
			runningTotal += file.size;
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
		fileInput?.removeAttribute('capture');
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

	function addClipboardItems(items: DataTransferItemList) {
		const files: File[] = [];
		for (const item of items) {
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) files.push(file);
			}
		}
		if (files.length > 0) addFiles(files);
	}

	function onPaste(e: ClipboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
		const items = e.clipboardData?.items;
		if (!items?.length) return;
		const hasImage = Array.from(items).some((i) => i.kind === 'file' && i.type.startsWith('image/'));
		if (hasImage) {
			e.preventDefault();
			addClipboardItems(items);
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		if (photosSizeError || photos.length === 0) return;

		const formData = new FormData(form);
		formData.delete('photos');
		for (const photo of photos) {
			const f = photo.file;
			const name = f.name?.includes('.') ? f.name : `${f.name || 'image'}.jpg`;
			const type = f.type || 'image/jpeg';
			formData.append('photos', new File([f], name, { type }));
		}

		isSubmitting = true;
		uploadProgress = 0;

		const actionUrl = form.action || window.location.pathname;
		try {
			const result = await new Promise<{ type: string; data?: unknown } | { redirect: string }>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', actionUrl);

				xhr.upload.onprogress = (ev) => {
					if (ev.lengthComputable) {
						uploadProgress = Math.round((ev.loaded / ev.total) * 100);
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						try {
							const parsed = deserialize(xhr.responseText);
							resolve(parsed as { type: string; data?: unknown });
						} catch {
							// XHR followed redirect, response is HTML; navigate to final URL
							if (xhr.responseURL && xhr.responseURL !== actionUrl) {
								resolve({ redirect: xhr.responseURL });
							} else {
								reject(new Error('Invalid response'));
							}
						}
					} else {
						reject(new Error(`Upload failed: ${xhr.status}`));
					}
				};
				xhr.onerror = () => reject(new Error('Network error'));
				xhr.send(formData);
			});

			if ('redirect' in result) {
				goto(new URL(result.redirect).pathname);
			} else {
				await applyAction(result as Parameters<typeof applyAction>[0]);
			}
		} finally {
			isSubmitting = false;
			uploadProgress = null;
		}
	}
</script>

<svelte:window onpaste={onPaste} />

<div class="mx-auto max-w-xl p-4 md:px-8">
	<a href="/app/list" class="mb-4 inline-block text-sm text-stone-600 hover:text-stone-900">
		← Back to list
	</a>

	<h1 class="text-2xl font-semibold text-stone-900 mb-6">Add product</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-6"
		onsubmit={handleSubmit}
	>
		<!-- Photo upload -->
		<div>
			<label for="photos" class="block text-sm font-medium text-stone-700 mb-2">
				Photos <span class="text-red-500">*</span>
				<span class="font-normal text-stone-500">(max 10MB total)</span>
			</label>
			<div
				role="button"
				tabindex="0"
				class="relative flex h-64 flex-col overflow-hidden rounded-lg border-2 border-dashed transition-colors {isDragging
					? 'border-stone-400 bg-stone-50'
					: 'border-stone-200 hover:border-stone-300'}"
				ondrop={onDrop}
				ondragover={onDragOver}
				ondragleave={onDragLeave}
				onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
			>
				{#if photos.length > 0}
					<div class="min-h-0 flex-1 overflow-y-auto p-4">
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
					</div>
					<button
						type="button"
						class="shrink-0 py-2 text-sm text-stone-500 hover:text-stone-700"
						onclick={clearAllPhotos}
					>
						Clear all
					</button>
				{:else}
					<div
						role="button"
						tabindex="0"
						class="flex h-full flex-col items-center justify-center gap-2 p-6 cursor-pointer"
						onclick={openFilePicker}
						onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
						</svg>
						<p class="text-sm text-stone-500 text-center">Drag & drop, paste, or click to upload</p>
						<div class="flex flex-wrap justify-center gap-2">
							<button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline" onclick={(e) => { e.stopPropagation(); openFilePicker(); }}>
								Upload files
							</button>
							<span class="text-stone-300">|</span>
							<button type="button" class="text-sm text-stone-600 hover:text-stone-900 underline" onclick={(e) => { e.stopPropagation(); openCamera(); }}>
								Take photo
							</button>
							<span class="text-stone-300">|</span>
							<span class="text-sm text-stone-500">Ctrl+V to paste</span>
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
			{#if photos.length > 0}
				<p class="mt-1.5 text-xs {photosSizeError ? 'text-red-600' : 'text-stone-500'}">
					{totalPhotosMB} MB / 10 MB
					{#if photosSizeError}
						— over limit, remove some photos
					{/if}
				</p>
			{/if}
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
				placeholder="Product requirements, colors, style, finish etc..."
			></textarea>
		</div>

		<!-- Link -->
		<div>
			<label for="link" class="block text-sm font-medium text-stone-700 mb-2">Link</label>
			<input
				type="text"
				id="link"
				name="link"
				class="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
				placeholder="https://... or catalog & page"
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
				placeholder="Product code, size etc if not visible in photos"
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
					<span class="text-stone-700">Rent</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_7" class="rounded border-stone-300" />
					<span class="text-stone-700">7th</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_8" class="rounded border-stone-300" />
					<span class="text-stone-700">8th</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_9" class="rounded border-stone-300" />
					<span class="text-stone-700">9th</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="floor_10" class="rounded border-stone-300" />
					<span class="text-stone-700">10th</span>
				</label>
			</div>
		</div>

		{#if uploadProgress !== null}
			<div class="space-y-1">
				<div class="h-2 overflow-hidden rounded-full bg-stone-200">
					<div
						class="h-full bg-stone-700 transition-all duration-300"
						style="width: {uploadProgress}%"
					></div>
				</div>
				<p class="text-xs text-stone-500">Uploading… {uploadProgress}%</p>
			</div>
		{/if}

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button
			type="submit"
			disabled={photos.length === 0 || isSubmitting || photosSizeError}
			class="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 text-white font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if isSubmitting}
				<svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span>Adding…</span>
			{:else}
				Add product
			{/if}
		</button>
	</form>
</div>
