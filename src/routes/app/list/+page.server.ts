import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

const FLOOR_COLUMNS: Record<string, ReturnType<typeof sql>> = {
	rent: sql`p.floor_rent`,
	'7': sql`p.floor_7`,
	'8': sql`p.floor_8`,
	'9': sql`p.floor_9`,
	'10': sql`p.floor_10`
};

export async function load({ url }) {
	const category = url.searchParams.get('category') ?? '';
	const publicOnly = url.searchParams.get('public') === '1';
	const floorsParam = url.searchParams.get('floors') ?? '';
	const selectedFloors = floorsParam ? floorsParam.split(',').filter((f) => f && FLOOR_COLUMNS[f]) : [];

	const conditions = [
		sql`p.deleted_at IS NULL`,
		...(category ? [sql`p.category_id = ${category}`] : []),
		...(publicOnly ? [sql`p.is_public = true`] : []),
		...(selectedFloors.length > 0
			? [sql.join(selectedFloors.map((f) => FLOOR_COLUMNS[f]), sql` OR `)]
			: [])
	];
	const whereClause = sql.join(conditions, sql` AND `);

	const [productsResult, categoriesResult] = await Promise.all([
		db.execute(sql`
			SELECT 
				p.id, p.category_id, p.requirements, p.link, p.description,
				p.is_public, p.floor_rent, p.floor_7, p.floor_8, p.floor_9, p.floor_10,
				c.name AS category_name,
				COALESCE(
					(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', rip.id, 'url', rip.url))
					 FROM rvr_product_image rip
					 WHERE rip.product_id = p.id AND rip.deleted_at IS NULL),
					'[]'::json
				) AS images
			FROM rvr_product p
			INNER JOIN rvr_category c ON p.category_id = c.id
			WHERE ${whereClause}
			ORDER BY p.created_at DESC NULLS LAST
		`),
		db.execute(sql`SELECT id, name FROM rvr_category ORDER BY name`)
	]);

	const products = Array.isArray(productsResult) ? productsResult : (productsResult as { rows?: unknown[] }).rows ?? [];
	const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult as { rows?: unknown[] }).rows ?? [];

	return {
		products,
		categories,
		filters: { category, publicOnly, selectedFloors }
	};
}