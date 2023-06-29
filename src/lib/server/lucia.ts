import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';
import prisma from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';

export const auth = lucia({
	adapter: prisma(db),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (user) => {
		return {
			userId: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			engine: user.engineName
		};
	}
});

export type Auth = typeof auth;
