import { calculateNetWeight } from './tests/utils/welding-calculator'

function assertAlmostEqual(actual: number, expected: number, tol = 1e-6) {
	if (Math.abs(actual - expected) > tol) {
		console.error(`FAIL: actual=${actual} expected=${expected}`)
		return false
	}
	console.log(`PASS: actual=${actual} expected=${expected}`)
	return true
}

const cases: Array<{
	length: number
	width: number
	height: number
	density: number
}> = [
	{ length: 100, width: 100, height: 10, density: 7.85 }, // 100x100x10 mm
	{ length: 200, width: 50, height: 5, density: 2.7 }, // aluminum
	{ length: 10, width: 10, height: 10, density: 1 }, // 1 cm cube
	{ length: 0, width: 100, height: 10, density: 7.85 } // zero dimension
]

let allPass = true
for (const c of cases) {
	const actual = calculateNetWeight(c.length, c.width, c.height, c.density)
	const expected =
		(c.length / 10) * (c.width / 10) * (c.height / 10) * c.density
	const ok = assertAlmostEqual(actual, expected, 1e-8)
	allPass = allPass && ok
}

if (!allPass) process.exit(1)
else process.exit(0)
