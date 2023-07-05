import { auth } from '$lib/server/lucia';
import { guestOnlyRoute } from '$lib/server/routing';
import { db } from '$lib/server/db';
import { isZodError } from '$lib/zod';

import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { auditLog } from '$lib/server/auditlog';

export const load = async ({ locals }) => {
	await guestOnlyRoute(locals);
};

const registerSchema = z
	.object({
		username: z.string().min(3).max(32),
		email: z.string().email(),
		password: z.string().min(8).max(128),
		confirmPassword: z.string().min(8).max(128),
		terms: z.string().min(1).max(1)
	})
	.strict();

export const actions = {
	async default({ request, locals, getClientAddress }) {
		const formData = await request.formData();

		const data = registerSchema.safeParse(Object.fromEntries(formData.entries()));

		if (!data.success) {
			const zodResult = data.error.flatten().fieldErrors;

			return fail(400, {
				success: false,
				message: '',
				errors: {
					username: isZodError(zodResult.username),
					email: isZodError(zodResult.email),
					password: isZodError(zodResult.password),
					confirmPassword: isZodError(zodResult.confirmPassword),
					terms: isZodError(zodResult.terms)
				}
			});
		}

		const { username, email, password, confirmPassword } = data.data;

		if (password !== confirmPassword) {
			return fail(400, {
				success: false,
				message: 'Passwords do not match',
				errors: {
					username: false,
					email: false,
					password: false,
					confirmPassword: true,
					terms: false
				}
			});
		}

		const amountOfUsers = await db.authUser.count();

		try {
			const assignedRole = amountOfUsers === 0 ? 'admin' : 'user';
			const shouldDisable = amountOfUsers === 0 ? false : true;

			const user = await auth.createUser({
				primaryKey: {
					providerId: 'username',
					providerUserId: username.toLowerCase(),
					password
				},
				attributes: {
					username: username.toLowerCase(),
					email: email.toLowerCase(),
					role: assignedRole,
					disabled: shouldDisable
				}
			});

			if (shouldDisable) {
				return {
					success: true,
					message: 'User created successfully, please wait for an admin to approve your account',
					errors: {
						username: false,
						email: false,
						password: false,
						confirmPassword: false,
						terms: false
					}
				};
			}

			const session = await auth.createSession(user.userId);
			locals.auth.setSession(session);

			await auditLog(user.userId, user.username, 'register', 'user', getClientAddress());
		} catch {
			await auditLog('', '', 'register', 'user', getClientAddress(), 'failure');
			return fail(400, {
				success: false,
				message: 'Email or username already exists',
				errors: {
					username: false,
					email: false,
					password: false,
					confirmPassword: false,
					terms: false
				}
			});
		}

		return {
			success: true,
			message: 'User created successfully',
			errors: {
				username: false,
				email: false,
				password: false,
				confirmPassword: false,
				terms: false
			}
		};
	}
};
