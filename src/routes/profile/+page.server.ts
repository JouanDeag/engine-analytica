import { auth } from '$lib/server/lucia';
import { db } from '$lib/server/db';
import { z } from 'zod';
import { parseFormData } from '$lib/server/form';
import { userOnlyRoute } from '$lib/server/routing';
import { auditLog } from '$lib/server/auditlog';

export const load = async ({ locals }) => {
	await userOnlyRoute(locals);
};

const changeUserSchema = z.object({
	id: z.string().max(32),
	username: z.string().max(32).optional(),
	email: z.string().max(256).optional(),
	role: z.enum(['user', 'admin']).optional(),
	engine: z.string().max(32).optional()
});

export const actions = {
	async default({ locals, request, getClientAddress }) {
		const data = await parseFormData(request);

		const { user } = await userOnlyRoute(locals);

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
					username: username
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

		await auditLog(user.userId, user.username, 'modify', 'user', getClientAddress());

		return {
			success: true,
			message: 'User updated successfully'
		};
	}
};
