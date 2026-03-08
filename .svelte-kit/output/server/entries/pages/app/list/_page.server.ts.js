import { d as db } from "../../../../chunks/index3.js";
async function load() {
  const products = await db.$client`
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
    `;
  console.log({ products });
  return { products };
}
export {
  load
};
