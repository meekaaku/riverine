import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export async function load() {
	const products = await db.execute(sql`
		SELECT 
			p.id, p.category_id, p.requirements, p.link, p.description,
			p.is_public, p.floor_rent, p.floor_7, p.floor_8, p.floor_9, p.floor_10,
			c.name AS category_name,
			COALESCE(
				(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', rip.id, 'url', rip.url))
				 FROM rvr_product_image rip
				 WHERE rip.product_id = p.id),
				'[]'::json
			) AS images
		FROM rvr_product p
		INNER JOIN rvr_category c ON p.category_id = c.id
	`);

	return { products: Array.isArray(products) ? products : (products as { rows?: unknown[] }).rows ?? [] };
}