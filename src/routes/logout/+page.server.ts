import { auth } from '$lib/server/lucia';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { session } = await locals.auth.validateUser();
	if (!session) {
		throw redirect(301, '/login');
	}

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	throw redirect(301, '/login');
};
