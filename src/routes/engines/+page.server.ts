import { db } from '$lib/server/db.js';
import { adminOnlyRoute } from '$lib/server/routing';
import { z } from 'zod';

export const load = async ({ locals }) => {
	await adminOnlyRoute(locals);

	// Fetch engines and their tests with won, tied and lost games
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

	// Fetch users
	const users = await db.authUser.findMany();

	// Return data to the page
	return {
		engines,
		users
	};
};

// Schema for validating data
const addEngineSchema = z.object({
	name: z.string().min(3).max(32),
	developer: z.string().min(1).max(64),
	user: z.string().min(3).max(32)
});

export const actions = {
	async default({ locals, request }) {
		await adminOnlyRoute(locals);

		// Parse form data
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		// Validate data
		let validatedData;

		// Try to parse data
		try {
			validatedData = addEngineSchema.parse(data);
		} catch {
			// Return error if data is invalid
			return {
				success: false,
				message: 'Invalid data supplied'
			};
		}

		// Check if engine already exists
		const existingEngine = await db.engine.findUnique({
			where: {
				name: validatedData.name
			}
		});

		// Return error if engine already exists
		if (existingEngine) {
			return {
				success: false,
				message: 'Engine already exists'
			};
		}

		// Create engine
		try {
			const engine = await db.engine.create({
				data: {
					name: validatedData.name,
					developer: validatedData.developer
				}
			});

			// Connect engine to user if user is not 'none'
			if (validatedData.user !== 'none') {
				// Find user
				const user = await db.authUser.findUnique({
					where: {
						username: validatedData.user
					}
				});

				// Return error if user does not exist
				if (!user) {
					return {
						success: false,
						message: 'Could not find user'
					};
				}

				// Connect engine to user
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
			// Return error if engine could not be created
			console.log(error);

			return {
				success: false,
				message: 'An error occured while creating engine'
			};
		}

		// Return success message
		return {
			success: true,
			message: 'Engine successfully added!'
		};
	}
};
