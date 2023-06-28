import { isZodError } from '$lib/zod.js';
import { auth } from '$lib/server/lucia';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
	const { session } = await locals.auth.validateUser();
	if (session) {
		throw redirect(301, '/');
	}
};

const loginSchema = z
	.object({
		username: z.string().min(3).max(32),
		password: z.string().min(8).max(128)
	})
	.strict();

export const actions = {
	async default({ request, locals }) {
		const formData = await request.formData();

		const data = loginSchema.safeParse(Object.fromEntries(formData.entries()));

		if (!data.success) {
			const zodResult = data.error.flatten().fieldErrors;

			return fail(400, {
				success: false,
				message: '',
				errors: {
					username: isZodError(zodResult.username),
					password: isZodError(zodResult.password)
				}
			});
		}

		const { username, password } = data.data;

		try {
			const key = await auth.useKey('username', username, password);
			const session = await auth.createSession(key.userId);
			locals.auth.setSession(session);
		} catch {
			return fail(400, {
				success: false,
				message: 'Invalid username or password',
				errors: {
					username: false,
					password: false
				}
			});
		}

		return {
			success: true,
			message: 'Welcome back!',
			errors: {
				username: false,
				password: false
			}
		};
	}
};
