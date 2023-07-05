import { db } from '$lib/server/db';

type AuditAction = 'create' | 'delete' | 'modify';
type AuditTargetType = 'user' | 'engine' | 'test';

export const auditLog = async (
	userId: string,
	target: string,
	action: AuditAction,
	targetType: AuditTargetType
) => {
	console.log();

	try {
		await db.auditLog.create({
			data: {
				User: {
					connect: {
						id: userId
					}
				},
				action: action,
				target: target,
				targetType: targetType
			}
		});
	} catch (error) {
		console.log(error);
	}
};
