export async function parseFormData(request: Request) {
	const formData = await request.formData();
	const data = Object.fromEntries(formData.entries());

	return data;
}
