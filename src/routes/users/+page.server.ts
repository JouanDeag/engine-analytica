import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/lucia';
import { z } from 'zod';

export const load = async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser();
	if (!session) {
		throw redirect(301, '/login');
	}

	if (user.role !== 'admin') {
		throw redirect(301, '/');
	}

	const users = await db.authUser.findMany();
	const engines = await db.engine.findMany();

	return {
		user,
		session,
		users,
		engines
	};
};

const changeUserSchema = z.object({
	id: z.string().max(32),
	username: z.string().max(32).optional(),
	email: z.string().max(256).optional(),
	role: z.enum(['user', 'admin']).optional(),
	engine: z.string().max(32).optional()
});

export const actions = {
	async edit({ locals, request }) {
		const { session, user } = await locals.auth.validateUser();

		if (!session) {
			throw redirect(301, '/login');
		}

		if (user.role !== 'admin') {
			throw redirect(301, '/');
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		let validatedData;
		let username;
		let email;

		try {
			validatedData = changeUserSchema.parse(data);

			if (validatedData.username) {
				username = z.string().min(3).max(32).parse(validatedData.username).toLowerCase();
			}

			if (validatedData.email) {
				email = z.string().email().parse(validatedData.email).toLowerCase();
			}
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'Invalid data'
			};
		}

		const modifiedUser = await db.authUser.findUnique({
			where: {
				id: validatedData.id
			}
		});

		if (!modifiedUser) {
			return {
				success: false,
				message: 'User not found'
			};
		}

		if (validatedData.username) {
			try {
				const userExists = await db.authUser.findUnique({
					where: {
						username: username
					}
				});

				if (userExists) {
					return {
						success: false,
						message: 'Username already exists'
					};
				}

				await auth.updateUserAttributes(validatedData.id, {
					username: username
				});
			} catch (error) {
				console.log(error);

				return {
					success: false,
					message: 'An error occured while updating the username'
				};
			}
		}

		if (validatedData.email) {
			try {
				const userExists = await db.authUser.findUnique({
					where: {
						email: email
					}
				});

				if (userExists) {
					return {
						success: false,
						message: 'Email already exists'
					};
				}

				await auth.updateUserAttributes(validatedData.id, {
					email: email
				});
			} catch (error) {
				console.log(error);

				return {
					success: false,
					message: 'An error occured while updating the email'
				};
			}
		}

		if (validatedData.engine) {
			if (validatedData.engine === 'none') {
				await db.authUser.update({
					where: {
						id: validatedData.id
					},
					data: {
						engine: {
							disconnect: true
						}
					}
				});
			} else {
				try {
					const engineExists = await db.engine.findUnique({
						where: {
							name: validatedData.engine
						}
					});

					if (!engineExists) {
						return {
							success: false,
							message: 'Engine not found'
						};
					}

					await db.authUser.update({
						where: {
							id: validatedData.id
						},
						data: {
							engine: {
								connect: {
									name: validatedData.engine
								}
							}
						}
					});
				} catch (error) {
					console.log(error);

					return {
						success: false,
						message: 'An error occured while updating the engine'
					};
				}
			}
		}

		if (validatedData.role !== modifiedUser.role) {
			try {
				await auth.updateUserAttributes(validatedData.id, {
					role: validatedData.role
				});

				await auth.invalidateAllUserSessions(validatedData.id);
			} catch (error) {
				return {
					success: false,
					message: 'An error occured while updating the role'
				};
			}
		}

		return {
			success: true,
			message: 'User updated successfully'
		};
	},
	async delete({ locals, request }) {
		const { session, user } = await locals.auth.validateUser();

		if (!session) {
			throw redirect(301, '/login');
		}

		if (user.role !== 'admin') {
			throw redirect(301, '/');
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		let id;

		try {
			id = z.string().min(3).max(32).parse(data.id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'Invalid user id'
			};
		}

		// Ensure last admin user is not deleted
		const adminUserCount = await db.authUser.count({
			where: {
				role: 'admin'
			}
		});

		const deleteUser = await db.authUser.findUnique({
			where: {
				id: id
			}
		});

		if (!deleteUser) {
			return {
				success: false,
				message: 'User not found'
			};
		}

		if (deleteUser.role === 'admin' && adminUserCount === 1) {
			return {
				success: false,
				message: 'Cannot delete last administrator'
			};
		}

		// Delete user
		try {
			await auth.deleteUser(id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'An error occured when deleting user'
			};
		}

		return {
			success: true,
			message: 'User deleted successfully'
		};
	},

	async disable({ locals, request }) {
		const { session, user } = await locals.auth.validateUser();

		if (!session) {
			throw redirect(301, '/login');
		}

		if (user.role !== 'admin') {
			throw redirect(301, '/');
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		let id;

		try {
			id = z.string().min(3).max(32).parse(data.id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'Invalid user id'
			};
		}

		if (id === user.userId) {
			return {
				success: false,
				message: 'You cannot disable your own account'
			};
		}

		try {
			await auth.updateUserAttributes(id, {
				disabled: true
			});

			await auth.invalidateAllUserSessions(id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'An error occured when disabling user'
			};
		}

		return {
			success: true,
			message: 'User disabled successfully'
		};
	},

	async enable({ locals, request }) {
		const { session, user } = await locals.auth.validateUser();

		if (!session) {
			throw redirect(301, '/login');
		}

		if (user.role !== 'admin') {
			throw redirect(301, '/');
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		let id;

		try {
			id = z.string().min(3).max(32).parse(data.id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'Invalid user id'
			};
		}

		try {
			await auth.updateUserAttributes(id, {
				disabled: false
			});

			await auth.invalidateAllUserSessions(id);
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'An error occured when enabling user'
			};
		}

		return {
			success: true,
			message: 'User enabled successfully'
		};
	}
};
