import { auditLog } from '$lib/server/auditlog';
import { auth } from '$lib/server/lucia';
import { userOnlyRoute } from '$lib/server/routing';

import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, getClientAddress }) => {
	const { session, user } = await userOnlyRoute(locals);

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	await auditLog(user.userId, user.username, 'logout', 'user', getClientAddress());

	throw redirect(301, '/login');
};
