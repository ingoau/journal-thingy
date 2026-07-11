// src/lib/mood.ts

// score 0 -> distressed, score 5 -> great
const STOPS: [number, number, number][] = [
	[239, 68, 68],  // 0 - red-500
	[249, 115, 22], // 1 - orange-500
	[234, 179, 8],  // 2 - yellow-500
	[163, 230, 53], // 3 - lime-400
	[74, 222, 128], // 4 - green-400
	[34, 197, 94]   // 5 - green-500
];

function mix(a: [number, number, number], b: [number, number, number], t: number) {
	return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as [number, number, number];
}

export function scoreToColor(score: number | undefined | null): string | undefined {
	if (score === undefined || score === null) return undefined;
	const clamped = Math.max(0, Math.min(5, score));
	const lower = Math.floor(clamped);
	const upper = Math.min(5, lower + 1);
	const t = clamped - lower;
	const [r, g, b] = mix(STOPS[lower], STOPS[upper], t);
	return `rgb(${r}, ${g}, ${b})`;
}