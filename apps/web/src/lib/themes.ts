export type ThemeDef = {
	id: string;
	name: string;
	sub: string;
	desc: string;
	note: string[];
	swatches: { name: string; value: string }[];
};

export const THEMES: ThemeDef[] = [
	{
		id: 'felt',
		name: 'Retro Felt',
		sub: 'The pintable standard',
		desc: 'Deep stadium felt with warm cork accents. Chunky arcade controls and a proper match-day energy.',
		note: ['Current default for the whole app', 'Bungee / Baloo / Pixelify', 'Chunky arcade buttons'],
		swatches: [
			{ name: 'Felt', value: '#0d3326' },
			{ name: 'Surface', value: '#12402f' },
			{ name: 'Cork', value: '#f2a93b' },
			{ name: 'Home', value: '#6ec6ff' },
			{ name: 'Away', value: '#ff7a5c' },
			{ name: 'Cream', value: '#f6ecd4' }
		]
	},
	{
		id: 'clubroom',
		name: 'Vintage Clubroom',
		sub: 'Wood panelling and brass',
		desc: 'The old-fashioned football clubhouse: walnut walls, baize table, and a brass scoreboard under dusty light.',
		note: ['Wood grain + brass hairlines', 'Serif display type', 'Leather & waxed accents'],
		swatches: [
			{ name: 'Walnut', value: '#231a10' },
			{ name: 'Table', value: '#3a2c1d' },
			{ name: 'Brass', value: '#c9a227' },
			{ name: 'Home', value: '#6f9fd0' },
			{ name: 'Away', value: '#c85a3a' },
			{ name: 'Vellum', value: '#f2e8d4' }
		]
	},
	{
		id: 'program',
		name: 'Printed Match Program',
		sub: 'Newsprint & ink',
		desc: 'Typeset like the paper programme they hand out at the turnstile: cream stock, ink rules, and a touch of match red.',
		note: ['Cream newsprint stock', 'Ink rules and hard shadows', 'Serif body, red accents'],
		swatches: [
			{ name: 'Stock', value: '#f0ead7' },
			{ name: 'Paper', value: '#fffdf6' },
			{ name: 'Green', value: '#175c38' },
			{ name: 'Home', value: '#12506e' },
			{ name: 'Away', value: '#a8321b' },
			{ name: 'Ink', value: '#17130c' }
		]
	}
];

export function getTheme(id: string): ThemeDef | undefined {
	return THEMES.find((t) => t.id === id);
}