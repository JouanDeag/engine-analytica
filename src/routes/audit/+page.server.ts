import { adminOnlyRoute } from '$lib/server/routing';
import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
	await adminOnlyRoute(locals);

	const audit = await db.auditLog.findMany({
		include: {
			User: {
				select: {
					username: true
				}
			}
		}
	});

	return {
		audit
	};
};
