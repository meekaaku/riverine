import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { uploadToSpaces } from '$lib/server/storage';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export async function load() {
	const result = await db.execute(sql`SELECT id, name FROM rvr_category ORDER BY name`);
	const categories = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
	return { categories };
}

export const actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id;
		if (!userId) {
			return fail(401, { error: 'You must be logged in to add a product' });
		}
		const formData = await request.formData();
		const categoryId = formData.get('category_id');
		const requirements = formData.get('requirements')?.toString() ?? '';
		const link = formData.get('link')?.toString() ?? '';
		const description = formData.get('description')?.toString() ?? '';
		const isPublic = formData.get('is_public') === 'on';
		const floorRent = formData.get('floor_rent') === 'on';
		const floor7 = formData.get('floor_7') === 'on';
		const floor8 = formData.get('floor_8') === 'on';
		const floor9 = formData.get('floor_9') === 'on';
		const floor10 = formData.get('floor_10') === 'on';

		if (!categoryId || typeof categoryId !== 'string') {
			return fail(400, { error: 'Please select a category' });
		}

		const photoFiles = formData.getAll('photos') as File[];
		const validPhotos = photoFiles.filter((f) => f instanceof File && f.size > 0);

		if (validPhotos.length === 0) {
			return fail(400, { error: 'At least one photo is required' });
		}

		const imageUrls: string[] = [];

		for (const photo of validPhotos) {
			try {
				const ext = (photo.name?.split('.').pop() || 'jpg').replace(/[^a-z0-9]/i, '') || 'jpg';
				const key = `${randomUUID()}.${ext}`;
				const contentType = photo.type?.startsWith('image/') ? photo.type : 'image/jpeg';
				const url = await uploadToSpaces(photo, key, contentType);
				imageUrls.push(url);
			} catch (e) {
				console.error('Upload failed:', e);
				const err = e instanceof Error ? e : new Error(String(e));
				return fail(500, {
					error: 'Failed to upload photo',
					details: err.stack,
					context: `upload: ${err.message}`
				});
			}
		}

		try {
			const productResult = await db.execute(sql`
				INSERT INTO rvr_product (category_id, user_id, requirements, link, description, is_public, floor_rent, floor_7, floor_8, floor_9, floor_10)
				VALUES (${categoryId}, ${userId}::uuid, ${requirements}, ${link || null}, ${description || null}, ${isPublic}, ${floorRent}, ${floor7}, ${floor8}, ${floor9}, ${floor10})
				RETURNING id
			`);
			const productRows = Array.isArray(productResult) ? productResult : (productResult as { rows?: unknown[] }).rows ?? [];
			const product: any = productRows[0];

			if (imageUrls.length > 0 && product?.id) {
				for (const url of imageUrls) {
					await db.execute(sql`
						INSERT INTO rvr_product_image (product_id, url)
						VALUES (${product.id}, ${url})
					`);
				}
			}

			redirect(303, `/app/product/${product.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			console.error('Insert failed:', e);
			const err = e instanceof Error ? e : new Error(String(e));
			return fail(500, {
				error: 'Failed to create product',
				details: err.stack,
				context: `add product: ${err.message}`
			});
		}
	}
};
