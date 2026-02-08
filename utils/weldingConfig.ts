// tests/utils/weldingConfig.ts
export class WeldingConfigService {
	// returns welding efficiency factor for given formLength, isSemiAuto boolean
	getWeldingEfficiency(formLength: number = 0, isSemiAuto = false) {
		if (!formLength) return 1
		return isSemiAuto ? 0.8 : 1
	}

	// returns an object mimicking getWeldingData(materialType, shoulderWidth, processId, mode)
	getWeldingData(
		materialType: string,
		shoulderWidth: number,
		processId: number,
		mode = 'Manual'
	) {
		// simplified dataset
		return {
			TravelSpeed_mm_per_sec: shoulderWidth
				? Math.max(1, 20 - shoulderWidth / 2)
				: 10,
			Current_Amps: 150,
			Voltage_Volts: 22
		}
	}

	getUnloadingTime(netWeight: number) {
		if (!netWeight) return 6
		if (netWeight < 1) return 4
		if (netWeight < 5) return 8
		return 12
	}

	getDiscBrushDia() {
		// stub delegated to costing config usually; not used here
		return []
	}
}
