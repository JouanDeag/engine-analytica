import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

const paramsSchema = z.object({
	name: z.string().min(1).max(64)
});

export const load = async ({ locals, params }) => {
	const { session, user } = await locals.auth.validateUser();

	let name = params.name.toLowerCase();

	try {
		name = paramsSchema.parse(params).name.toLowerCase();
	} catch (err) {
		console.log(err);
		throw error(400, 'Invalid parameters');
	}

	const engine = (await db.engine.findMany()).filter((engine) => {
		return engine.name.toLowerCase() === name;
	})[0];

	if (!engine) {
		throw error(404, 'Not found');
	}

	const tests = await db.test.findMany({
		where: {
			engineName: engine.name
		}
	});

	return {
		session,
		user,
		engine,
		tests
	};
};
