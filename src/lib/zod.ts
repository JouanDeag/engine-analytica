import type { z } from 'zod';

export const isZodError = (error: any): error is z.ZodError => {
	return error ? error[0] : null;
};
