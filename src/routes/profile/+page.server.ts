import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import { db } from '$lib/server/db';
import { z } from 'zod';

export const load = async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser();

	if (!session) {
		throw redirect(301, '/login');
	}

	return {
		user,
		session
	};
};

const changeUserSchema = z.object({
	username: z.string().max(32).optional(),
	email: z.string().max(256).optional(),
	role: z.enum(['user', 'admin']).optional(),
	engine: z.string().max(32).optional()
});

export const actions = {
	async default({ locals, request }) {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		const { user } = await locals.auth.validateUser();

		try {
			const validatedData = changeUserSchema.parse(data);

			if (validatedData.username) {
				const userExists = await db.authUser.findUnique({
					where: {
						username: validatedData.username
					}
				});

				if (userExists) {
					return {
						success: false,
						message: 'Username already exists'
					};
				}

				const username = z.string().min(3).max(32).parse(validatedData.username).toLowerCase();

				auth.updateUserAttributes(user.userId, {
					username: validatedData.username
				});
			}

			if (validatedData.email) {
				const userExists = await db.authUser.findUnique({
					where: {
						email: validatedData.email
					}
				});

				if (userExists) {
					return {
						success: false,
						message: 'Email already exists'
					};
				}

				const email = z.string().email().parse(validatedData.email).toLowerCase();

				auth.updateUserAttributes(user.userId, {
					email: email
				});
			}

			if (validatedData.role && validatedData.role !== user.role) {
				if (user.role !== 'admin') {
					return {
						success: false,
						message: 'Permission denied'
					};
				}

				auth.updateUserAttributes(user.userId, {
					role: validatedData.role
				});

				await auth.invalidateAllUserSessions(user.userId);
				await auth.createSession(user.userId);
			}
		} catch (error) {
			return {
				success: false,
				message: 'Invalid data'
			};
		}

		return {
			success: true,
			message: 'User updated successfully'
		};
	}
};
