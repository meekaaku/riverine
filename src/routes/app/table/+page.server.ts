import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export async function load() {
	const limit = 100;

	const productsResult = await db.execute(sql`
		SELECT
			p.id,
			c.name AS category_name,
			p.requirements,
			p.floor_rent,
			p.floor_7,
			p.floor_8,
			p.floor_9,
			p.floor_10,
			COALESCE(
				(
					SELECT JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', rip.id,
							'url', rip.url,
							'thumb', rip.thumb
						)
					)
					FROM rvr_product_image rip
					WHERE rip.product_id = p.id AND rip.deleted_at IS NULL
				),
				'[]'::json
			) AS images
		FROM rvr_product p
		INNER JOIN rvr_category c ON p.category_id = c.id
		WHERE p.deleted_at IS NULL
		ORDER BY c.name ASC NULLS LAST, p.created_at DESC NULLS LAST
		LIMIT ${limit}
	`);

	const products = Array.isArray(productsResult) ? productsResult : (productsResult as { rows?: unknown[] }).rows ?? [];

	return { products };
}

