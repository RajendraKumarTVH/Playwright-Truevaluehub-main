/*
 * Create a minimal OverheadProfitMaster.xlsx with required sheets and headers.
 * This helps tests run while a full conversion is done manually.
 * Usage: node scripts/create-empty-overhead-xlsx.js
 */

const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const outPath = path.resolve(
	__dirname,
	'../tests/Database/OverheadProfitMaster.xlsx'
)

const sheets = {
	// Provide headers and a single data row for ICC/FGICC so calculations use non-zero values
	MedbFgiccMaster: [
		[
			'fgiccId',
			'countryId',
			'volumeCategory',
			'supplyDescription',
			'domestic',
			'export'
		],
		[1, 1, 'DEFAULT', 'Fallback FGICC', 0.0436, 0.0436]
	],
	MedbIccMaster: [
		['iccId', 'countryId', 'volumeCategory', 'iccPercentage'],
		[1, 1, 'DEFAULT', 0.0436]
	],
	MedbPaymentMaster: [
		['paymentTermId', 'term'],
		[30, 'NET 30']
	],
	MedbMohMaster: [['id', 'value']],
	MedbFohMaster: [['id', 'value']],
	MedbSgaMaster: [['id', 'value']],
	MedbProfitMaster: [['id', 'value']],
	MedbPackingMaterialMaster: [['materialId', 'name']],
	MedbContainerSize: [['sizeId', 'description']],
	MedbLogisticsRateCard: [['routeId', 'rate']]
}

const wb = XLSX.utils.book_new()
for (const [name, data] of Object.entries(sheets)) {
	const ws = XLSX.utils.aoa_to_sheet(data)
	XLSX.utils.book_append_sheet(wb, ws, name)
}

try {
	XLSX.writeFile(wb, outPath, { bookType: 'xlsx', compression: true })
	const stats = fs.statSync(outPath)
	console.log(`✅ Created placeholder XLSX at: ${outPath}`)
	console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`)
} catch (err) {
	console.error(
		'❌ Failed to write placeholder XLSX:',
		err && err.message ? err.message : err
	)
	process.exit(1)
}
