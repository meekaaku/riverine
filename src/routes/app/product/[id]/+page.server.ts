import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { uploadToSpaces } from '$lib/server/storage';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export async function load({ params }) {
	const [productResult, categoriesResult] = await Promise.all([
		db.execute(sql`
			SELECT 
				p.*, 
				c.id category_id, 
				c.name category_name,
				u.username added_by_username,
				COALESCE(
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', rip.id,
							'url', rip.url
						)
					) FILTER (WHERE rip.id IS NOT NULL), 
					'[]'::json
				) AS images
			FROM rvr_product p
			INNER JOIN rvr_category c ON p.category_id = c.id
			LEFT JOIN rvr_user u ON p.user_id = u.id
			LEFT JOIN rvr_product_image rip ON p.id = rip.product_id AND rip.deleted_at IS NULL
			WHERE p.id = ${params.id} AND p.deleted_at IS NULL
			GROUP BY p.id, c.id, u.username
		`),
		db.execute(sql`SELECT id, name FROM rvr_category ORDER BY name`)
	]);

	/* do we really need this ? */
	const productRows = Array.isArray(productResult) ? productResult : (productResult as { rows?: unknown[] }).rows ?? [];
	const product = productRows[0];

	const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult as { rows?: unknown[] }).rows ?? [];

	if (!product) {
		return { product: null, categories: [] };
	}

	return { product, categories };
}

export const actions = {
	/* need to properly type this */
	default: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const intent = formData.get('intent')?.toString();

		if (intent === 'remove_image') {
			const imageId = formData.get('image_id')?.toString();
			if (!imageId) return fail(400, { error: 'Image ID required' });
			try {
				await db.execute(sql`UPDATE rvr_product_image SET deleted_at = NOW() WHERE id = ${imageId} AND product_id = ${params.id} AND deleted_at IS NULL`);
				return { success: true };
			} catch (e) {
				console.error('Remove image failed:', e);
				const err = e instanceof Error ? e : new Error(String(e));
				return fail(500, { error: 'Failed to remove photo', details: err.stack, context: `remove_image: ${err.message}` });
			}
		}

		if (intent === 'delete') {
			try {
				await db.execute(sql`UPDATE rvr_product_image SET deleted_at = NOW() WHERE product_id = ${params.id}`);
				await db.execute(sql`UPDATE rvr_product SET deleted_at = NOW() WHERE id = ${params.id} AND deleted_at IS NULL`);
				redirect(303, '/app/list?deleted=1');
			} catch (e) {
				if (isRedirect(e)) throw e;
				console.error('Delete failed:', e);
				const err = e instanceof Error ? e : new Error(String(e));
				return fail(500, { error: 'Failed to delete product', details: err.stack, context: `delete: ${err.message}` });
			}
		}

		if (intent === 'duplicate') {
			const userId = locals.user?.id;
			if (!userId) {
				return fail(401, { error: 'You must be logged in to duplicate a product' });
			}
			try {
				const [productResult] = await Promise.all([
					db.execute(sql`
						SELECT category_id, requirements, link, description, is_public, floor_rent, floor_7, floor_8, floor_9, floor_10
						FROM rvr_product WHERE id = ${params.id} AND deleted_at IS NULL
					`)
				]);
				const rows = Array.isArray(productResult) ? productResult : (productResult as { rows?: unknown[] }).rows ?? [];
				const src = rows[0] as Record<string, unknown> | undefined;
				if (!src) return fail(404, { error: 'Product not found' });

				const insertResult = await db.execute(sql`
					INSERT INTO rvr_product (category_id, user_id, requirements, link, description, is_public, floor_rent, floor_7, floor_8, floor_9, floor_10)
					VALUES (${src.category_id}, ${userId}::uuid, ${src.requirements ?? null}, ${src.link ?? null}, ${src.description ?? null}, ${src.is_public ?? false}, ${src.floor_rent ?? false}, ${src.floor_7 ?? false}, ${src.floor_8 ?? false}, ${src.floor_9 ?? false}, ${src.floor_10 ?? false})
					RETURNING id
				`);
				const insertRows = Array.isArray(insertResult) ? insertResult : (insertResult as { rows?: unknown[] }).rows ?? [];
				const newProduct = insertRows[0] as { id: number } | undefined;
				if (!newProduct?.id) return fail(500, { error: 'Failed to create duplicate' });

				const imageRows = await db.execute(sql`
					SELECT url, thumb FROM rvr_product_image WHERE product_id = ${params.id} AND deleted_at IS NULL
				`);
				const images = Array.isArray(imageRows) ? imageRows : (imageRows as { rows?: { url: string; thumb?: string }[] }).rows ?? [];
				for (const img of images) {
					const url = (img as { url?: string }).url;
					const thumb = (img as { thumb?: string }).thumb ?? url;
					if (url) {
						await db.execute(sql`
							INSERT INTO rvr_product_image (product_id, url, thumb) VALUES (${newProduct.id}, ${url}, ${thumb})
						`);
					}
				}

				redirect(303, `/app/product/${newProduct.id}?duplicated=1`);
			} catch (e) {
				if (isRedirect(e)) throw e;
				console.error('Duplicate failed:', e);
				const err = e instanceof Error ? e : new Error(String(e));
				return fail(500, { error: 'Failed to duplicate product', details: err.stack, context: `duplicate: ${err.message}` });
			}
		}

		const categoryId = formData.get('category_id')?.toString();
		const requirements = formData.get('requirements')?.toString() ?? '';
		const link = formData.get('link')?.toString() ?? '';
		const description = formData.get('description')?.toString() ?? '';
		const isPublic = formData.get('is_public') === 'on';
		const floorRent = formData.get('floor_rent') === 'on';
		const floor7 = formData.get('floor_7') === 'on';
		const floor8 = formData.get('floor_8') === 'on';
		const floor9 = formData.get('floor_9') === 'on';
		const floor10 = formData.get('floor_10') === 'on';

		if (!categoryId) {
			return fail(400, { error: 'Please select a category' });
		}

		try {
			await db.execute(sql`
				UPDATE rvr_product SET
					category_id = ${categoryId},
					requirements = ${requirements},
					link = ${link || null},
					description = ${description || null},
					is_public = ${isPublic},
					floor_rent = ${floorRent},
					floor_7 = ${floor7},
					floor_8 = ${floor8},
					floor_9 = ${floor9},
					floor_10 = ${floor10}
				WHERE id = ${params.id} AND deleted_at IS NULL
			`);

			const photoFiles = formData.getAll('photos') as File[];
			const thumbFiles = formData.getAll('photos_thumb') as File[];
			const validPhotos = photoFiles.filter((f) => f instanceof File && f.size > 0);
			for (let i = 0; i < validPhotos.length; i++) {
				const photo = validPhotos[i];
				const thumb = thumbFiles[i] instanceof File && thumbFiles[i].size > 0 ? thumbFiles[i] : null;
				try {
					const ext = (photo.name?.split('.').pop() || 'jpg').replace(/[^a-z0-9]/i, '') || 'jpg';
					const baseId = randomUUID();
					const mainKey = `${baseId}.${ext}`;
					const thumbKey = `${baseId}_thumb.${ext}`;
					const contentType = photo.type?.startsWith('image/') ? photo.type : 'image/jpeg';
					const [url, thumbUrl] = await Promise.all([
						uploadToSpaces(photo, mainKey, contentType),
						thumb ? uploadToSpaces(thumb, thumbKey, contentType) : Promise.resolve(null)
					]);
					await db.execute(sql`
						INSERT INTO rvr_product_image (product_id, url, thumb) VALUES (${params.id}, ${url}, ${thumbUrl ?? url})
					`);
				} catch (e) {
					console.error('Upload failed:', e);
					const err = e instanceof Error ? e : new Error(String(e));
					return fail(500, { error: 'Failed to upload photo', details: err.stack, context: `upload: ${err.message}` });
				}
			}

			return { success: true };
		} catch (e) {
			console.error('Update failed:', e);
			const err = e instanceof Error ? e : new Error(String(e));
			return fail(500, { error: 'Failed to update product', details: err.stack, context: `update: ${err.message}` });
		}
	}
};
