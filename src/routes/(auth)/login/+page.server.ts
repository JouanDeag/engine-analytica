import { isZodError } from '$lib/zod';
import { auth } from '$lib/server/lucia';
import { db } from '$lib/server/db';
import { guestOnlyRoute } from '$lib/server/routing';
import { auditLog } from '$lib/server/auditlog';

import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
	await guestOnlyRoute(locals);
};

const loginSchema = z
	.object({
		username: z.string().min(3).max(32),
		password: z.string().min(8).max(128)
	})
	.strict();

export const actions = {
	async default({ request, locals, getClientAddress }) {
		const formData = await request.formData();

		const data = loginSchema.safeParse(Object.fromEntries(formData.entries()));

		if (!data.success) {
			const zodResult = data.error.flatten().fieldErrors;

			await auditLog('', '', 'login', 'user', getClientAddress(), 'failure');

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

			const user = await db.authUser.findUnique({
				where: {
					username: username
				}
			});

			if (user && user.disabled) {
				return {
					success: false,
					message: 'Your account is disabled, contact an administrator',
					errors: {
						username: false,
						password: false
					}
				};
			}

			const session = await auth.createSession(key.userId);
			locals.auth.setSession(session);

			await auditLog(key.userId, username, 'login', 'user', getClientAddress());
		} catch (error) {
			await auditLog('', username, 'login', 'user', getClientAddress(), 'failure');

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
