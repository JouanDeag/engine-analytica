import { redirect } from '@sveltejs/kit';

export async function adminOnlyRoute(locals: App.Locals) {
	const { session, user } = await locals.auth.validateUser();

	if (!session) {
		throw redirect(301, '/login');
	}

	if (user.role !== 'admin') {
		throw redirect(301, '/');
	}

	return { session, user };
}

export async function guestOnlyRoute(locals: App.Locals) {
	const { session, user } = await locals.auth.validateUser();
	if (session) {
		throw redirect(301, '/');
	}

	return { session, user };
}

export async function userOnlyRoute(locals: App.Locals) {
	const { session, user } = await locals.auth.validateUser();

	if (!session) {
		throw redirect(301, '/login');
	}

	return { session, user };
}
