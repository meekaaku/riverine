import { sql } from "drizzle-orm";
import { d as db } from "../../../../../chunks/index3.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { b as private_env } from "../../../../../chunks/shared-server.js";
import { fail, redirect } from "@sveltejs/kit";
import { randomUUID } from "crypto";
const pathPrefix = private_env.DO_PATH_PREFIX ?? "riverine/";
function getS3Client() {
  if (!private_env.DO_SPACES_KEY || !private_env.DO_SPACES_SECRET) {
    throw new Error("DO_SPACES_KEY and DO_SPACES_SECRET must be set");
  }
  return new S3Client({
    endpoint: private_env.DO_SPACES_ENDPOINT ?? "https://sgp1.digitaloceanspaces.com",
    region: private_env.DO_SPACES_REGION ?? "sgp1",
    credentials: {
      accessKeyId: private_env.DO_SPACES_KEY,
      secretAccessKey: private_env.DO_SPACES_SECRET
    }
  });
}
async function uploadToSpaces(file, key, contentType) {
  const client = getS3Client();
  const bucket = private_env.DO_SPACES_BUCKET ?? "haley";
  const fullKey = pathPrefix + key;
  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: body,
      ContentType: contentType ?? (file instanceof File ? file.type : "application/octet-stream"),
      ACL: "public-read"
    })
  );
  const region = private_env.DO_SPACES_REGION ?? "sgp1";
  return `https://${bucket}.${region}.digitaloceanspaces.com/${fullKey}`;
}
async function load() {
  const result = await db.execute(sql`SELECT id, name FROM rvr_category ORDER BY name`);
  const categories = Array.isArray(result) ? result : result.rows ?? [];
  return { categories };
}
const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get("category_id");
    const requirements = formData.get("requirements")?.toString() ?? "";
    const link = formData.get("link")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const isPublic = formData.get("is_public") === "on";
    const floorRent = formData.get("floor_rent") === "on";
    const floor7 = formData.get("floor_7") === "on";
    const floor8 = formData.get("floor_8") === "on";
    const floor9 = formData.get("floor_9") === "on";
    const floor10 = formData.get("floor_10") === "on";
    if (!categoryId || typeof categoryId !== "string") {
      return fail(400, { error: "Please select a category" });
    }
    const photoFiles = formData.getAll("photos");
    const validPhotos = photoFiles.filter((f) => f instanceof File && f.size > 0);
    if (validPhotos.length === 0) {
      return fail(400, { error: "At least one photo is required" });
    }
    const imageUrls = [];
    for (const photo of validPhotos) {
      try {
        const ext = photo.name.split(".").pop() ?? "jpg";
        const pathPrefix2 = process.env.DO_PATH_PREFIX ?? "";
        const key = `${pathPrefix2}${randomUUID()}.${ext}`;
        const url = await uploadToSpaces(photo, key, photo.type);
        imageUrls.push(url);
      } catch (e) {
        console.error("Upload failed:", e);
        return fail(500, { error: "Failed to upload photo" });
      }
    }
    try {
      const productResult = await db.execute(sql`
				INSERT INTO rvr_product (category_id, requirements, link, description, is_public, floor_rent, floor_7, floor_8, floor_9, floor_10)
				VALUES (${categoryId}, ${requirements}, ${link || null}, ${description || null}, ${isPublic}, ${floorRent}, ${floor7}, ${floor8}, ${floor9}, ${floor10})
				RETURNING id
			`);
      const productRows = Array.isArray(productResult) ? productResult : productResult.rows ?? [];
      const product = productRows[0];
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
      console.error("Insert failed:", e);
      return fail(500, { error: "Failed to create product" });
    }
  }
};
export {
  actions,
  load
};
