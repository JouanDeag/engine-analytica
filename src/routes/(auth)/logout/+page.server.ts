import { auth } from '$lib/server/lucia';
import { userOnlyRoute } from '$lib/server/routing';

import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { session } = await userOnlyRoute(locals);

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	throw redirect(301, '/login');
};
