import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const pathPrefix = env.DO_PATH_PREFIX ?? 'riverine/';

function getS3Client() {
	if (!env.DO_SPACES_KEY || !env.DO_SPACES_SECRET) {
		throw new Error('DO_SPACES_KEY and DO_SPACES_SECRET must be set');
	}
	return new S3Client({
		endpoint: env.DO_SPACES_ENDPOINT ?? 'https://sgp1.digitaloceanspaces.com',
		region: env.DO_SPACES_REGION ?? 'sgp1',
		credentials: {
			accessKeyId: env.DO_SPACES_KEY,
			secretAccessKey: env.DO_SPACES_SECRET
		}
	});
}

export async function uploadToSpaces(
	file: File | Blob,
	key: string,
	contentType?: string
): Promise<string> {
	const client = getS3Client();
	const bucket = env.DO_SPACES_BUCKET ?? 'haley';
	const fullKey = pathPrefix + key;

	// Convert to Buffer - AWS SDK can't hash the raw File/Blob stream
	const arrayBuffer = await file.arrayBuffer();
	const body = Buffer.from(arrayBuffer);

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: fullKey,
			Body: body,
			ContentType: contentType ?? (file instanceof File ? file.type : 'application/octet-stream'),
			ACL: 'public-read'
		})
	);

	const region = env.DO_SPACES_REGION ?? 'sgp1';
	return `https://${bucket}.${region}.digitaloceanspaces.com/${fullKey}`;
}
