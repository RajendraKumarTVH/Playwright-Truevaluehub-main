/**
 * @file costing-test-data.ts
 * @description Test data and configuration for costing automation tests
 * Manages scenarios for different manufacturing processes (MIG, Sheet Metal, Machining, etc.)
 */

export enum ManufacturingProcess {
	MIG_WELDING = 'MIG Welding',
	TIG_WELDING = 'TIG Welding',
	STICK_WELDING = 'Stick Welding',
	SHEET_METAL = 'Sheet Metal',
	PLASTIC = 'Plastic',
	MACHINING = 'Machining',
	CASTING = 'Casting',
	FORGING = 'Forging',
	PCB = 'PCB'
}

export interface CostingTestScenario {
	processName: ManufacturingProcess
	projectId: string
	partInformation: {
		internalPartNumber: string
		bomQuantity: number
		annualVolume: number
		productLife: number
	}
	materialInformation: {
		processGroup: string
		category: string
		family: string
		grade: string
		stockForm: string
		materialPrice: number
		scrapPrice: number
		density: number
	}
	manufacturingInformation: {
		machineType: string
		machineName: string
		machineEfficiency: number
		setupTime: number
		cycleTime?: number
	}
	expectedCosts?: {
		netMaterialCostMin: number
		netMaterialCostMax: number
		totalCostMin: number
		totalCostMax: number
	}
	tags: string[]
}

export class CostingTestData {
	// ============ MIG WELDING SCENARIOS ============
	static readonly MIG_WELDING_BASIC: CostingTestScenario = {
		processName: ManufacturingProcess.MIG_WELDING,
		projectId: '14783',
		partInformation: {
			internalPartNumber: 'MIG-TEST-001',
			bomQuantity: 100,
			annualVolume: 1200,
			productLife: 5
		},
		materialInformation: {
			processGroup: 'Welding',
			category: 'Carbon Steel',
			family: 'Carbon Steel',
			grade: 'Grade A',
			stockForm: 'Rod',
			materialPrice: 15.5,
			scrapPrice: 2.5,
			density: 7.85
		},
		manufacturingInformation: {
			machineType: 'Manual',
			machineName: 'MIG-Machine-01',
			machineEfficiency: 85,
			setupTime: 30
		},
		expectedCosts: {
			netMaterialCostMin: 50,
			netMaterialCostMax: 500,
			totalCostMin: 100,
			totalCostMax: 2000
		},
		tags: ['@welding', '@smoke', '@e2e']
	}

	static readonly MIG_WELDING_ADVANCED: CostingTestScenario = {
		processName: ManufacturingProcess.MIG_WELDING,
		projectId: '14783',
		partInformation: {
			internalPartNumber: 'MIG-TEST-ADV-001',
			bomQuantity: 500,
			annualVolume: 6000,
			productLife: 10
		},
		materialInformation: {
			processGroup: 'Welding',
			category: 'Stainless Steel',
			family: 'Stainless Steel',
			grade: '304',
			stockForm: 'Wire',
			materialPrice: 25.75,
			scrapPrice: 3.5,
			density: 8.0
		},
		manufacturingInformation: {
			machineType: 'Semi-Automatic',
			machineName: 'MIG-Machine-02',
			machineEfficiency: 90,
			setupTime: 45
		},
		expectedCosts: {
			netMaterialCostMin: 200,
			netMaterialCostMax: 2000,
			totalCostMin: 500,
			totalCostMax: 6000
		},
		tags: ['@welding', '@advanced', '@regression']
	}

	// ============ SHEET METAL SCENARIOS ============
	static readonly SHEET_METAL_BASIC: CostingTestScenario = {
		processName: ManufacturingProcess.SHEET_METAL,
		projectId: '14784',
		partInformation: {
			internalPartNumber: 'SM-TEST-001',
			bomQuantity: 200,
			annualVolume: 2400,
			productLife: 5
		},
		materialInformation: {
			processGroup: 'Sheet Metal',
			category: 'Aluminum',
			family: 'Aluminum 6061',
			grade: 'T6',
			stockForm: 'Sheet',
			materialPrice: 18.5,
			scrapPrice: 3.0,
			density: 2.7
		},
		manufacturingInformation: {
			machineType: 'Semi-Automatic',
			machineName: 'Press-01',
			machineEfficiency: 88,
			setupTime: 60
		},
		expectedCosts: {
			netMaterialCostMin: 80,
			netMaterialCostMax: 800,
			totalCostMin: 150,
			totalCostMax: 3000
		},
		tags: ['@sheetmetal', '@smoke', '@e2e']
	}

	static readonly SHEET_METAL_COMPLEX: CostingTestScenario = {
		processName: ManufacturingProcess.SHEET_METAL,
		projectId: '14784',
		partInformation: {
			internalPartNumber: 'SM-TEST-COMPLEX-001',
			bomQuantity: 1000,
			annualVolume: 12000,
			productLife: 7
		},
		materialInformation: {
			processGroup: 'Sheet Metal',
			category: 'Steel',
			family: 'Cold Rolled Steel',
			grade: 'ASTM A1008',
			stockForm: 'Coil',
			materialPrice: 12.75,
			scrapPrice: 2.25,
			density: 7.85
		},
		manufacturingInformation: {
			machineType: 'Automatic',
			machineName: 'Press-02',
			machineEfficiency: 92,
			setupTime: 90
		},
		expectedCosts: {
			netMaterialCostMin: 300,
			netMaterialCostMax: 3000,
			totalCostMin: 600,
			totalCostMax: 12000
		},
		tags: ['@sheetmetal', '@complex', '@regression']
	}

	// ============ MACHINING SCENARIOS ============
	static readonly MACHINING_BASIC: CostingTestScenario = {
		processName: ManufacturingProcess.MACHINING,
		projectId: '14785',
		partInformation: {
			internalPartNumber: 'MACH-TEST-001',
			bomQuantity: 150,
			annualVolume: 1800,
			productLife: 4
		},
		materialInformation: {
			processGroup: 'Machining',
			category: 'Aluminum',
			family: 'Aluminum 5083',
			grade: 'H321',
			stockForm: 'Billet',
			materialPrice: 22.5,
			scrapPrice: 4.0,
			density: 2.66
		},
		manufacturingInformation: {
			machineType: 'CNC',
			machineName: 'CNC-Mill-01',
			machineEfficiency: 85,
			setupTime: 120
		},
		expectedCosts: {
			netMaterialCostMin: 100,
			netMaterialCostMax: 1000,
			totalCostMin: 300,
			totalCostMax: 5000
		},
		tags: ['@machining', '@smoke', '@e2e']
	}

	// ============ CASTING SCENARIOS ============
	static readonly CASTING_BASIC: CostingTestScenario = {
		processName: ManufacturingProcess.CASTING,
		projectId: '14786',
		partInformation: {
			internalPartNumber: 'CAST-TEST-001',
			bomQuantity: 50,
			annualVolume: 600,
			productLife: 3
		},
		materialInformation: {
			processGroup: 'Casting',
			category: 'Aluminum',
			family: 'Aluminum A356',
			grade: 'T6',
			stockForm: 'Ingot',
			materialPrice: 28.5,
			scrapPrice: 5.0,
			density: 2.68
		},
		manufacturingInformation: {
			machineType: 'Foundry',
			machineName: 'Furnace-01',
			machineEfficiency: 80,
			setupTime: 240
		},
		expectedCosts: {
			netMaterialCostMin: 200,
			netMaterialCostMax: 2000,
			totalCostMin: 500,
			totalCostMax: 10000
		},
		tags: ['@casting', '@smoke']
	}

	// ============ HELPER METHODS ============

	static getScenariosByProcess(
		process: ManufacturingProcess
	): CostingTestScenario[] {
		return [
			this.MIG_WELDING_BASIC,
			this.MIG_WELDING_ADVANCED,
			this.SHEET_METAL_BASIC,
			this.SHEET_METAL_COMPLEX,
			this.MACHINING_BASIC,
			this.CASTING_BASIC
		].filter(s => s.processName === process)
	}

	static getAllScenarios(): CostingTestScenario[] {
		return [
			this.MIG_WELDING_BASIC,
			this.MIG_WELDING_ADVANCED,
			this.SHEET_METAL_BASIC,
			this.SHEET_METAL_COMPLEX,
			this.MACHINING_BASIC,
			this.CASTING_BASIC
		]
	}

	static getSmokeTestScenarios(): CostingTestScenario[] {
		return this.getAllScenarios().filter(s => s.tags.includes('@smoke'))
	}

	static getRegressionScenarios(): CostingTestScenario[] {
		return this.getAllScenarios().filter(s => s.tags.includes('@regression'))
	}

	static getE2EScenarios(): CostingTestScenario[] {
		return this.getAllScenarios().filter(s => s.tags.includes('@e2e'))
	}
}

// ============ TEST CONFIGURATION ============
export const COSTING_TEST_CONFIG = {
	baseUrl: process.env.BASE_URL || 'https://qa.truevaluehub.com',
	timeout: 60000,
	retryAttempts: 2,
	screenshotOnFailure: true,
	headless: process.env.HEADLESS === 'true',
	browser: 'msedge',
	slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
	userProfilePath: './user-profile-costing',
	authStatePath: 'auth_costing.json'
} as const

export default CostingTestData
