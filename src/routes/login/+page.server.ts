import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const SESSION_COOKIE = 'riverine_session';
const SESSION_DAYS = 3;

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString()?.trim();
		const password = formData.get('password')?.toString() ?? '';

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required' });
		}

		const result = await db.execute(
			sql`SELECT id, username, name, password FROM rvr_user WHERE username = ${username}`
		);
		const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
		const user = rows[0] as { id: number; username: string; name: string; password: string } | undefined;

		if (!user || user.password !== password) {
			return fail(401, { error: 'Invalid username or password' });
		}

		const sessionId = randomUUID();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

		await db.execute(
			sql`INSERT INTO rvr_session (id, user_id, expires_at) VALUES (${sessionId}::uuid, ${user.id}::uuid, ${expiresAt.toISOString()}::timestamptz)`
		);

		cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: SESSION_DAYS * 24 * 60 * 60
		});

		throw redirect(302, '/app/list');
	}
};
