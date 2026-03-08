import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export async function load() {
	const products = await db.execute(sql`
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
		GROUP BY p.id, c.id
	`);

	return { products: Array.isArray(products) ? products : (products as { rows?: unknown[] }).rows ?? [] };
}