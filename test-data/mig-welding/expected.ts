export const ExpectedValues = {
	weldElementSizeLookup: [
		{ maxWeldSize: 3, elementSize: 3 },
		{ maxWeldSize: 4.5, elementSize: 3 },
		{ maxWeldSize: 5.5, elementSize: 4 },
		{ maxWeldSize: 6, elementSize: 5 },
		{ maxWeldSize: 12, elementSize: 6 },
		{ maxWeldSize: Infinity, elementSize: 8 }
	] as const,

	totalWeldLength: 300,
	totalCycleTime: 179.1471,
	totalNetProcessCost: 2.6385,
	totalShouldCost: 2.9695,

	tolerance: 0.01
} as const
