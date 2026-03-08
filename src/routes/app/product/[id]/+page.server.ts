import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export async function load({ params }) {
	const result = await db.execute(sql`
		SELECT 
			p.*, 
			c.*, 
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
	`);

	const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
	const product = rows[0];

	if (!product) {
		return { product: null };
	}

	return { product };
}
