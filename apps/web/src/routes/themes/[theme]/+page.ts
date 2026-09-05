import { redirect } from '@sveltejs/kit';
import { getTheme } from '$lib/themes';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const theme = getTheme(params.theme);
	if (!theme) {
		throw redirect(307, '/themes');
	}
	return { theme };
};