import { d as db } from "../../../../../chunks/index3.js";
async function load({ params }) {
  const [product] = await db.$client`
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
	`;
  if (!product) {
    return { product: null };
  }
  console.log({ product });
  return { product };
}
export {
  load
};
