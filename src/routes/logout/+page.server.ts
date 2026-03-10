import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

const SESSION_COOKIE = 'riverine_session';

export async function load({ cookies }) {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await db.execute(sql`DELETE FROM rvr_session WHERE id = ${sessionId}`);
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
	throw redirect(302, '/login');
}
