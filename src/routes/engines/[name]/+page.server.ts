import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

// Schema for validating data
const paramsSchema = z.object({
	name: z.string().min(1).max(64)
});

export const load = async ({ locals, params }) => {
	const { session, user } = await locals.auth.validateUser();

	// Redirect to login page if user is not logged in
	if (!session) {
		throw redirect(301, '/login');
	}

	// Get engine name from URL
	let name = params.name.toLowerCase();

	// Parse URL parameters
	try {
		name = paramsSchema.parse(params).name.toLowerCase();
	} catch (err) {
		// Throw 400 error if parameters are invalid
		throw error(400, 'Invalid parameters');
	}

	// Fetch engine with given name
	const engine = (await db.engine.findMany()).filter((engine) => {
		return engine.name.toLowerCase() === name;
	})[0];

	// Throw 404 error if engine does not exist
	if (!engine) {
		throw error(404, 'Not found');
	}

	// Fetch tests for engine
	const tests = await db.test.findMany({
		where: {
			engineName: engine.name
		}
	});

	// Return data to the page
	return {
		session,
		user,
		engine,
		tests
	};
};
