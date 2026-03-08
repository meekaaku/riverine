import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export async function load({ params }) {
	const [productResult, categoriesResult] = await Promise.all([
		db.execute(sql`
			SELECT 
				p.*, 
				c.id category_id, 
				c.name category_name,
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
			LEFT JOIN rvr_product_image rip ON p.id = rip.product_id
			WHERE p.id = ${params.id}
			GROUP BY p.id, c.id
		`),
		db.execute(sql`SELECT id, name FROM rvr_category ORDER BY name`)
	]);

	const productRows = Array.isArray(productResult) ? productResult : (productResult as { rows?: unknown[] }).rows ?? [];
	const product = productRows[0];

	const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult as { rows?: unknown[] }).rows ?? [];

	if (!product) {
		return { product: null, categories: [] };
	}

	return { product, categories };
}

export const actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
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
				WHERE id = ${params.id}
			`);
			return { success: true };
		} catch (e) {
			console.error('Update failed:', e);
			return fail(500, { error: 'Failed to update product' });
		}
	}
};
