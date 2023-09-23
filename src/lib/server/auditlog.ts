import { db } from '$lib/server/db';

type AuditAction =
	| 'create'
	| 'delete'
	| 'modify'
	| 'enabled'
	| 'disabled'
	| 'login'
	| 'logout'
	| 'register'
	| 'changePassword';

type AuditTargetType = 'user' | 'engine' | 'test';

type AuditActionResult = 'success' | 'failure';

export const auditLog = async (
	userId: string,
	target: string,
	action: AuditAction,
	targetType: AuditTargetType,
	ip = '0.0.0.0',
	result: AuditActionResult = 'success'
) => {
	try {
		await db.auditLog.create({
			data: {
				performer: userId,
				action: action,
				actionResult: result,
				target: target,
				targetType: targetType,
				clientAddress: ip
			}
		});
	} catch (error) {
		console.log(error);
	}
};
