import { IMAGE_SIZE, THUMB_SIZE } from '$lib/constants';

/** Load a File into an Image and resolve when loaded */
function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};
		img.src = url;
	});
}

/** Draw image to canvas at given dimensions and return as JPEG Blob with quality */
function canvasToBlob(
	img: HTMLImageElement,
	width: number,
	height: number,
	quality: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			reject(new Error('Canvas not supported'));
			return;
		}
		ctx.drawImage(img, 0, 0, width, height);
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
			'image/jpeg',
			quality
		);
	});
}

/** Compute dimensions that fit within maxDim while preserving aspect ratio */
function fitDimensions(
	imgWidth: number,
	imgHeight: number,
	maxDim: number
): { width: number; height: number } {
	if (imgWidth <= maxDim && imgHeight <= maxDim) {
		return { width: imgWidth, height: imgHeight };
	}
	const ratio = Math.min(maxDim / imgWidth, maxDim / imgHeight);
	return {
		width: Math.round(imgWidth * ratio),
		height: Math.round(imgHeight * ratio)
	};
}

/**
 * Resize and compress an image to fit within maxBytes.
 * Uses JPEG compression; reduces dimensions and quality as needed.
 */
export async function resizeImage(file: File, maxBytes: number = IMAGE_SIZE): Promise<Blob> {
	const img = await loadImage(file);
	const maxDim = 1920;
	let { width, height } = fitDimensions(img.naturalWidth, img.naturalHeight, maxDim);

	for (let quality = 0.9; quality >= 0.1; quality -= 0.1) {
		const blob = await canvasToBlob(img, width, height, quality);
		if (blob.size <= maxBytes) return blob;
	}

	// Still too big: reduce dimensions and try again
	while (width > 160 || height > 160) {
		width = Math.max(160, Math.round(width * 0.7));
		height = Math.max(160, Math.round(height * 0.7));
		for (let quality = 0.8; quality >= 0.2; quality -= 0.2) {
			const blob = await canvasToBlob(img, width, height, quality);
			if (blob.size <= maxBytes) return blob;
		}
	}

	// Last resort: minimum size
	return canvasToBlob(img, width, height, 0.5);
}

/**
 * Generate a small thumbnail (e.g. for listing).
 * Target ~50KB or THUMB_SIZE.
 */
export async function resizeToThumbnail(file: File, maxBytes: number = THUMB_SIZE): Promise<Blob> {
	const img = await loadImage(file);
	const maxDim = 320;
	let { width, height } = fitDimensions(img.naturalWidth, img.naturalHeight, maxDim);

	for (let quality = 0.8; quality >= 0.3; quality -= 0.1) {
		const blob = await canvasToBlob(img, width, height, quality);
		if (blob.size <= maxBytes) return blob;
	}

	// Reduce size further
	width = Math.max(80, Math.round(width * 0.6));
	height = Math.max(80, Math.round(height * 0.6));
	for (let quality = 0.6; quality >= 0.2; quality -= 0.1) {
		const blob = await canvasToBlob(img, width, height, quality);
		if (blob.size <= maxBytes) return blob;
	}

	return canvasToBlob(img, width, height, 0.3);
}

/**
 * Resize a photo for upload: returns { image, thumb } both as Blobs.
 * Main image targets IMAGE_SIZE (~500KB), thumbnail targets THUMB_SIZE (~50KB).
 */
export async function resizePhotoForUpload(file: File): Promise<{ image: Blob; thumb: Blob }> {
	const [image, thumb] = await Promise.all([
		resizeImage(file, IMAGE_SIZE),
		resizeToThumbnail(file, THUMB_SIZE)
	]);
	return { image, thumb };
}
