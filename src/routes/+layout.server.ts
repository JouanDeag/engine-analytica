export const load = async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser();

	return {
		session,
		user
	};
};
