import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser();

	const engines = await db.engine.findMany();

	return {
		session,
		user,
		engines
	};
};
