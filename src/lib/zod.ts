type Error = string[] | undefined;

export const isZodError = (error: Error) => {
	return error && error[0] ? true : false;
};
