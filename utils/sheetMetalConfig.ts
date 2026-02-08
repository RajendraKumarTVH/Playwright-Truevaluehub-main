// tests/utils/sheetMetalConfig.ts
export class SheetMetalConfigService {
	mapMaterial(name: string) {
		if (!name) return 'Steel'
		const n = name.toLowerCase()
		if (n.includes('alu') || n.includes('aluminium')) return 'Aluminium'
		if (n.includes('stainless')) return 'Stainless'
		return 'Steel'
	}
}
