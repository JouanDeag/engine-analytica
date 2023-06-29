import { isZodError } from '$lib/zod.js';
import { auth } from '$lib/server/lucia';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db.js';

export const load = async ({ locals }) => {
	const { session } = await locals.auth.validateUser();
	if (session) {
		throw redirect(301, '/');
	}
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
	async default({ request, locals }) {
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
			const session = await auth.createSession(user.userId);
			locals.auth.setSession(session);
		} catch {
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
