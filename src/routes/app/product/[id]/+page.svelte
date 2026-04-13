<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { showError } from '$lib/stores/errorDialog';
	import { resizePhotoForUpload } from '$lib/resizeImage';

	let { data } = $props();

	/* some constants */
	const MAX_PHOTOS_BYTES = 10 * 1024 * 1024; // 10MB
	const product = $derived<any>(data?.product);
	const categories = $derived<any[]>(data?.categories ?? []);
	const isChecked = (v: unknown) => v === true || v === 't' || v === 1;
	const success = $derived($page.form?.success);
	const showDuplicated = $derived($page.url.searchParams.get('duplicated') === '1');

	type PhotoItem = { id: string; preview: string; file: File };

	let newPhotos = $state<PhotoItem[]>([]);
	const totalNewPhotosBytes = $derived(newPhotos.reduce((sum, p) => sum + p.file.size, 0));
	const newPhotosSizeError = $derived(totalNewPhotosBytes > MAX_PHOTOS_BYTES);
	const totalNewPhotosMB = $derived((totalNewPhotosBytes / (1024 * 1024)).toFixed(2));

	const images = $derived(
		product?.images
			? typeof product.images === 'string'
				? JSON.parse(product.images || '[]')
				: product.images ?? []
			: []
	);
	const imageUrl = $derived(Array.isArray(images) && images[0] ? images[0].url : null);
	const lightboxImages = $derived([
		...(Array.isArray(images) ? images.map((img: { url: string }) => img.url) : []),
		...newPhotos.map((p) => p.preview)
	]);
	let isSubmitting = $state(false);
	let uploadProgress = $state<number | null>(null);
	let isDuplicating = $state(false);
	let isDeleting = $state(false);
	let showSuccess = $state(false);
	let isDragging = $state(false);
	/* ts-ignore */
	let fileInput: HTMLInputElement | null = null;
	let lightboxIndex = $state<number | null>(null);
	let removingImageId = $state<string | number | null>(null);

	const isAnyLoading = $derived(isSubmitting || isDuplicating || isDeleting);
	const lightboxUrl = $derived(
		lightboxIndex !== null && lightboxImages[lightboxIndex] ? lightboxImages[lightboxIndex] : null
	);
	const hasMultipleImages = $derived(lightboxImages.length > 1);

	/* handle basic gallery managemnt */
	function openLightbox(index: number) {

		if (index >= 0 && index < lightboxImages.length) lightboxIndex = index;
	}

	function closeLightbox() {

		lightboxIndex = null;
	}

	function goPrev() {
		if (lightboxImages.length <= 1) return;
		lightboxIndex = lightboxIndex === null ? 0 : (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
	}

	function goNext() {
		if (lightboxImages.length <= 1) return;
		lightboxIndex = lightboxIndex === null ? 0 : (lightboxIndex + 1) % lightboxImages.length;
	}

	function handleLightboxKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeLightbox();
		else if (e.key === 'ArrowLeft') goPrev();
		else if (e.key === 'ArrowRight') goNext();
	}

	function addFiles(files: FileList | File[] | null) {
		if (!files) return;
		const fileArray = Array.from(files).filter(
			(f) => f.type.startsWith('image/') || (f.type === '' && f.size > 0)
		);
		let runningTotal = totalNewPhotosBytes;
		for (const file of fileArray) {
			if (runningTotal + file.size > MAX_PHOTOS_BYTES) continue;
			runningTotal += file.size;
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

	function onPaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;
		const files: File[] = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) files.push(file);
			}
		}
		if (files.length > 0) {
			e.preventDefault();
			addFiles(files);
		}
	}

	function openFilePicker() {
		fileInput?.click();
	}

	function removePhoto(id: string) {
		newPhotos = newPhotos.filter((p) => p.id !== id);
	}

	async function handleProductSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		if (newPhotosSizeError) return;

		const formData = new FormData(form);
		formData.delete('photos');
		formData.delete('photos_thumb');
		for (const photo of newPhotos) {
			const { image, thumb } = await resizePhotoForUpload(photo.file);
			const name = photo.file.name?.includes('.') ? photo.file.name : `${photo.file.name || 'image'}.jpg`;
			formData.append('photos', new File([image], name, { type: 'image/jpeg' }));
			formData.append('photos_thumb', new File([thumb], `thumb_${name}`, { type: 'image/jpeg' }));
		}

		isSubmitting = true;
		uploadProgress = 0;

		try {
			const actionUrl = form.action || window.location.pathname;
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
							if (xhr.responseURL && xhr.responseURL !== actionUrl) {
								resolve({ redirect: xhr.responseURL });
							} else {
								reject(new Error('Invalid response'));
							}
						}
					} else {
						// Parse failure response so applyAction can show error dialog
						try {
							const parsed = deserialize(xhr.responseText);
							resolve(parsed as { type: string; data?: unknown });
						} catch {
							resolve({ type: 'failure', data: { error: `Request failed: ${xhr.status}` } });
						}
					}
				};
				xhr.onerror = () => reject(new Error('Network error'));
				xhr.send(formData);
			});

			if ('redirect' in result) {
				goto(new URL(result.redirect).pathname);
			} else {
				await applyAction(result as Parameters<typeof applyAction>[0]);
				const data = (result as { type: string; data?: { success?: boolean } }).data;
				if (result.type === 'success' && data?.success) {
					newPhotos = [];
					if (fileInput) fileInput.value = '';
					await invalidateAll();
				}
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e));
			showError({ message: err.message, context: 'Save product' });
		} finally {
			isSubmitting = false;
			uploadProgress = null;
		}
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

	$effect(() => {
		if (lightboxIndex !== null) {
			const handler = (e: KeyboardEvent) => handleLightboxKeydown(e);
			window.addEventListener('keydown', handler);
			document.body.style.overflow = 'hidden';
			return () => {
				window.removeEventListener('keydown', handler);
				document.body.style.overflow = '';
			};
		}
	});

	$effect(() => {
		if (!product) return;
		document.addEventListener('paste', onPaste);
		return () => document.removeEventListener('paste', onPaste);
	});
</script>

<!-- Lightbox modal -->
{#if lightboxIndex !== null && lightboxUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Image preview"
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
		onclick={closeLightbox}
		onkeydown={handleLightboxKeydown}
	>
		<button
			type="button"
			class="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
			onclick={closeLightbox}
			aria-label="Close"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M18 6L6 18M6 6l12 12" />
			</svg>
		</button>
		{#if hasMultipleImages}
			<button
				type="button"
				class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
				onclick={(e) => { e.stopPropagation(); goPrev(); }}
				aria-label="Previous image"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>
			<button
				type="button"
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
				onclick={(e) => { e.stopPropagation(); goNext(); }}
				aria-label="Next image"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		{/if}
		<div class="flex max-h-[90vh] max-w-[90vw] cursor-default items-center justify-center" onclick={(e) => e.stopPropagation()}>
			<img src={lightboxUrl} alt="Product" class="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain" />
		</div>
		{#if hasMultipleImages}
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white/90">
				{lightboxIndex + 1} / {lightboxImages.length}
			</div>
		{/if}
	</div>
{/if}

{#if !product}
	<p class="p-4 text-stone-600">Product not found.</p>
{:else}
	<div class="mx-auto max-w-xl p-4">
		<div class="mb-4 flex items-start justify-between gap-4">
			<div class="flex flex-col gap-0.5">
				<button type="button" onclick={() => history.back()} class="bg-transparent border-none cursor-pointer p-0 text-left text-sm text-stone-600 hover:text-stone-900">← Back</button>
				{#if product?.added_by_username}
					<span class="text-xs text-stone-500">added by {product.added_by_username}</span>
				{/if}
			</div>
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
						disabled={isAnyLoading || newPhotosSizeError}
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

		<!-- Existing photos (outside form - each has its own remove form) -->
		{#if Array.isArray(images) && images.length > 0}
			<div class="mb-4">
				<label class="block text-xs font-medium text-stone-500 mb-2">Current photos (click to enlarge)</label>
				<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{#each images as img, i (img?.id ?? img?.url ?? i)}
						<div class="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
							<button
								type="button"
								class="absolute inset-0 flex items-center justify-center cursor-zoom-in disabled:pointer-events-none"
								disabled={removingImageId == img.id}
								onclick={() => openLightbox(i)}
							>
								<img src={img.url} alt="Product" class="h-full w-full object-contain" />
							</button>
							{#if removingImageId == img.id}
								<div class="absolute inset-0 flex items-center justify-center bg-stone-900/50 z-20">
									<svg class="h-8 w-8 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								</div>
							{/if}
							<form
								method="POST"
								class="absolute top-0.5 right-0.5 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
								use:enhance={({ formData }) => {
									removingImageId = formData.get('image_id')?.toString() ?? null;
									return async ({ result, update }) => {
										try {
											await update();
											if (result.type === 'success' && result.data?.success) {
												await invalidateAll();
											}
										} finally {
											removingImageId = null;
										}
									};
								}}
							>
								<input type="hidden" name="intent" value="remove_image" />
								<input type="hidden" name="image_id" value={img.id} />
								<button
									type="submit"
									disabled={removingImageId == img.id}
									class="rounded-full bg-stone-800/80 p-1 text-white hover:bg-stone-900 disabled:opacity-70"
									aria-label="Remove photo"
								>
									{#if removingImageId == img.id}
										<svg class="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M18 6L6 18M6 6l12 12" />
										</svg>
									{/if}
								</button>
							</form>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="mb-4 aspect-square max-h-48 w-full max-w-xs rounded-lg bg-stone-100"></div>
		{/if}

		<form
			id="product-form"
			method="POST"
			enctype="multipart/form-data"
			class="space-y-4"
			onsubmit={handleProductSubmit}
		>
			<!-- Add more photos -->
			<div>
				<label class="block text-xs font-medium text-stone-500 mb-2">Add more photos <span class="font-normal text-stone-400">(max 10MB total)</span></label>
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
								{#each newPhotos as photo, i (photo.id)}
									<div class="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
										<button
											type="button"
											class="absolute inset-0 flex items-center justify-center"
											onclick={() => openLightbox(images.length + i)}
										>
											<img src={photo.preview} alt="Preview" class="h-full w-full object-contain" />
										</button>
										<button
											type="button"
											class="absolute top-0.5 right-0.5 z-10 rounded-full bg-stone-800/80 text-white p-1 hover:bg-stone-900"
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
							<p class="text-xs text-stone-500">Drag & drop, paste, or click to add photos</p>
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
				{#if newPhotos.length > 0}
					<p class="mt-1.5 text-xs {newPhotosSizeError ? 'text-red-600' : 'text-stone-500'}">
						{totalNewPhotosMB} MB / 10 MB
						{#if newPhotosSizeError}
							— over limit, remove some photos
						{/if}
					</p>
				{/if}
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
					{/if}
				</div>
				<button
					form="product-form"
					type="submit"
					disabled={isAnyLoading || newPhotosSizeError}
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
