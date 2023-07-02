import { db } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser();

	if (!session) {
		throw redirect(301, '/login');
	}

	if (user.role !== 'admin') {
		throw redirect(301, '/');
	}

	const engines = await db.engine.findMany({
		include: {
			Tests: {
				select: {
					wonGames: true,
					tiedGames: true,
					lostGames: true
				}
			}
		}
	});
	const users = await db.authUser.findMany();

	return {
		session,
		user,
		engines,
		users
	};
};

const addEngineSchema = z.object({
	name: z.string().min(3).max(32),
	developer: z.string().min(1).max(64),
	user: z.string().min(3).max(32)
});

export const actions = {
	async default({ locals, request }) {
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

		try {
			validatedData = addEngineSchema.parse(data);
		} catch {
			return {
				success: false,
				message: 'Invalid data supplied'
			};
		}

		const existingEngine = await db.engine.findUnique({
			where: {
				name: validatedData.name
			}
		});

		if (existingEngine) {
			return {
				success: false,
				message: 'Engine already exists'
			};
		}

		try {
			const engine = await db.engine.create({
				data: {
					name: validatedData.name,
					developer: validatedData.developer
				}
			});

			if (validatedData.user !== 'none') {
				const user = await db.authUser.findUnique({
					where: {
						username: validatedData.user
					}
				});

				if (!user) {
					return {
						success: false,
						message: 'Could not find user'
					};
				}

				await db.engine.update({
					where: {
						name: engine.name
					},
					data: {
						AuthUser: {
							connect: {
								username: validatedData.user
							}
						}
					}
				});
			}
		} catch (error) {
			console.log(error);

			return {
				success: false,
				message: 'An error occured while creating engine'
			};
		}

		return {
			success: true,
			message: 'Engine successfully added!'
		};
	}
};
