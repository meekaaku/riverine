import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

const SESSION_COOKIE = 'riverine_session';
const SESSION_DAYS = 3;

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE);
	const path = event.url.pathname;

	// Public routes - no auth required
	if (path === '/login') {
		if (sessionId) {
			const result = await db.execute(
				sql`
				SELECT u.id, u.username, u.name
				FROM rvr_session s
				INNER JOIN rvr_user u ON s.user_id = u.id
				WHERE s.id = ${sessionId} AND s.expires_at > NOW()
			`
			);
			const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
			if (rows.length > 0) {
				throw redirect(302, '/app/list');
			}
		}
		return resolve(event);
	}

	// Protect /app/* routes
	if (path.startsWith('/app')) {
		if (!sessionId) {
			throw redirect(302, '/login');
		}
		const result = await db.execute(
			sql`
			SELECT u.id, u.username, u.name
			FROM rvr_session s
			INNER JOIN rvr_user u ON s.user_id = u.id
			WHERE s.id = ${sessionId} AND s.expires_at > NOW()
		`
		);
		const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
		if (rows.length === 0) {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
			throw redirect(302, '/login');
		}
		event.locals.user = rows[0] as { id: number; username: string; name: string };
	}

	return resolve(event);
};
