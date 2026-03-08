import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const baseUrl =
	process.env.DB_URL ??
	(process.env.DB_HOST &&
		`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

if (!baseUrl) throw new Error('DB_URL or DB_* connection vars must be set in .env');

const dbUrl =
	process.env.DB_SSL === 'true' ? `${baseUrl}?sslmode=require` : baseUrl;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: dbUrl },
	verbose: true,
	strict: true
});
