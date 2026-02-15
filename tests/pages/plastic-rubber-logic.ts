import { PlasticRubberPage } from './plastic-rubber.page'
import { PlasticRubberProcessCalculatorService } from '../services/plastic-rubber-process-calculator'
import { SharedService } from '../services/shared'
import { DeburringConfigService } from '../config/cost-deburring-config'
import { BlowMoldingConfigService } from '../config/cost-blow-molding-config'
import { PlasticRubberConfigService } from '../config/plastic-rubber-config'
import { ManufacturingSustainabilityCalculatorService } from '../services/manufacturing-sustainability-calculator'
import { MaterialSustainabilityCalculationService } from '../services/material-sustainability-calculator'
import {
	MaterialDimensionsAndDensity,
	MaterialProcessProperties,
	ProcessInfoDto,
	IMouldingInputs,
	PlasticRubberVerificationOptions
} from '../utils/interfaces'
import { ProcessType } from '../utils/constants'
import { VerificationHelper } from '../lib/BasePage'
import { Locator, expect } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import { MaterialInformation } from '../../test-data/Plastic-rubber-testdata'
import { materialMasterReader } from '../../test-data'
import { machineMasterReader } from '../../test-data/machine-master-reader'
import { packagingMasterReader } from '../../test-data/packaging-master-reader'
import { calculateNetWeight } from '../utils/welding-calculator'
import { CostingPackagingInformationCalculatorService } from '../services/costing-packaging-information-calculator'
import { PackagingInfoDto } from '../models/packaging-info.model'

const logger = Logger
export type PartComplexityKey = 'low' | 'medium' | 'high'

export class PlasticRubberLogic {
	private readonly sharedService = new SharedService()
	private readonly deburringConfig = new DeburringConfigService()
	private readonly blowMoldingConfig = new BlowMoldingConfigService()

	// PlasticRubberConfigService constructor expects (SharedService, MessagingService)
	// MessagingService is an Angular-specific service not available in Playwright tests
	// Passing null and using 'as any' to bypass Angular type checking
	private readonly plasticRubberConfig = new PlasticRubberConfigService(this.sharedService as any, null as any)

	// PlasticRubberProcessCalculatorService expects Angular service types
	// Using 'as any' for compatibility between Playwright test services and Angular source services
	private readonly calculator = new PlasticRubberProcessCalculatorService(
		this.sharedService,
		this.deburringConfig,
		this.blowMoldingConfig,
		{
			_manufacturingSustainabilityCalService: new ManufacturingSustainabilityCalculatorService(this.sharedService)
		} as any, // Mock ManufacturingCalculatorService with only the required property
		this.plasticRubberConfig as any,
		new MaterialSustainabilityCalculationService(this.sharedService)
	)
	private readonly manufacturingService = new ManufacturingSustainabilityCalculatorService(this.sharedService)
	private readonly materialService = new MaterialSustainabilityCalculationService(this.sharedService)
	private readonly packagingService = new CostingPackagingInformationCalculatorService(this.sharedService)

	constructor(public page: PlasticRubberPage) { }

	async setProcessGroup(value: string): Promise<void> {
		await this.page.selectOption(this.page.ProcessGroup, value)
	}
	public async getMaterialDimensionsAndDensity(): Promise<MaterialDimensionsAndDensity> {
		let density = 0
		let length = 0
		let width = 0
		let height = 0

		try {
			if (this.page.isPageClosed?.()) {
				logger.warn('⚠️ Page already closed — returning empty material values')
				return { length, width, height, density }
			}

			/* ---------- Material Details ---------- */
			await this.page.waitAndClick(this.page.MaterialDetailsTab)

			const materialDetailLocators = [
				this.page.Density,
				this.page.MeltTemp,
				this.page.MouldTemp,
				this.page.EjecTemp,
				this.page.ClampingPressure,
				this.page.esgImpactCO2Kg,
				this.page.esgImpactCO2KgScrap,
				this.page.esgImpactCO2KgPart
			]

			const isMaterialDetailsVisible = (
				await Promise.all(
					materialDetailLocators.map(locator =>
						locator.first().isVisible({ timeout: 3000 }).catch(() => false)
					)
				)
			).every(Boolean)

			if (isMaterialDetailsVisible) {
				const uiDensity = Number(
					await this.page.Density.first().inputValue()
				)
				if (uiDensity > 0) {
					density = uiDensity
				}
			} else {
				logger.warn('⚠️ One or more Material Details fields are not visible — using default density')
			}

			/* ---------- Material Dimensions ---------- */
			await this.page.waitAndClick(this.page.MaterialInfo)

			const isDimensionVisible = await this.page.PartEnvelopeLength.first()
				.isVisible({ timeout: 3000 })
				.catch(() => false)

			if (isDimensionVisible) {
				;[length, width, height] = (
					await Promise.all([
						this.page.PartEnvelopeLength.first().inputValue(),
						this.page.PartEnvelopeWidth.first().inputValue(),
						this.page.PartEnvelopeHeight.first().inputValue()
					])
				).map(value => Number(value) || 0)
			} else {
				logger.warn('⚠️ Part envelope dimensions not visible — using defaults')
			}

		} catch (error) {
			logger.warn(`⚠️ Failed to read material dimensions and density safely: ${error}`)
		}

		logger.info(`📐 L:${length}, W:${width}, H:${height} | Density:${density}`)
		return { length, width, height, density }
	}

	public async getMachineInjectionRate(): Promise<number> {
		logger.info('🔹 Fetching Injection Rate from Machine Master...')
		try {
			await this.page.waitAndClick(this.page.MfgDetailsTab)
			await this.page.waitForTimeout(300)

			const machineName = await this.page.MachineName.locator('option:checked').innerText().catch(() => '')
			const trimmedName = machineName.trim()

			if (!trimmedName || trimmedName.toLowerCase().includes('select')) {
				logger.warn('⚠️ No machine selected in UI or default select option found')
				return 0
			}

			logger.info(`🔍 Searching Machine Master for: "${trimmedName}"`)
			const machineData = machineMasterReader.getMachineByName(trimmedName)

			if (machineData && machineData.InjectionRate) {
				logger.info(`✅ Found Injection Rate: ${machineData.InjectionRate} for machine: ${trimmedName}`)
				return machineData.InjectionRate
			} else {
				logger.warn(`❌ No Injection Rate found in MasterDB for machine: ${trimmedName}`)
				return 0
			}
		} catch (error) {
			logger.error(`⚠️ Error fetching machine injection rate: ${error}`)
			return 0
		}
	}

	public async getMaterialProperties(inputs?: Partial<IMouldingInputs>): Promise<MaterialProcessProperties> {
		let props: MaterialProcessProperties = {
			length: 0,
			width: 0,
			height: 0,
			density: 0,
			thermalDiffusivity: 0,
			thermalConductivity: 0,
			specificHeatCapacity: 0,
			meltTemp: 0,
			mouldTemp: 0,
			ejectionTemp: 0,
			clampingPressure: 0,
			injectionRate: 0,
			materialTypeId: 0,

		}

		try {
			if (this.page.isPageClosed?.()) {
				logger.warn('⚠️ Page already closed — returning empty material values')
				return props
			}

			// 🔹 1. Get Identifiers
			const identifiers = await this.readMaterialIdentifiers()
			props.materialTypeId = identifiers.materialTypeId

			logger.info(`🔍 Looking up Material Master data:
			   - MaterialType: ${identifiers.materialType} (ID: ${props.materialTypeId})
			   - MaterialGroup: ${identifiers.materialGroup}
			   - StockForm: ${identifiers.stockForm}
			   - MaterialDescription: ${identifiers.materialDescription}`)

			// 🔹 2. Excel/ODS Lookup
			const masterData = this.lookupMaterialInMasterDB(identifiers)
			if (masterData) {
				props.density = Number(masterData.Density) || props.density
				props.thermalDiffusivity = Number(masterData.ThermalDiffusivity) || 0
				props.thermalConductivity = Number(masterData.ThermalConductivity) || 0
				props.specificHeatCapacity = Number(masterData.MaterialSpecificHeat) || 0
				props.meltTemp = Number(masterData.MeltingTemp) || 0
				props.mouldTemp = Number(masterData.MoldTemp) || 0
				props.clampingPressure = Number(masterData.ClampingPressure) || 0
				props.tensileStrength = Number(masterData.TensileStrength) || 0
				props.injectionRate = Number(masterData.InjectionRate) || 0
			}

			// 🔹 2.1 Fallback ESG values from UI if Excel lookup didn't provide them
			if (inputs) {
				if (!props.esgImpactCO2Kg && inputs.esgImpactCO2Kg) props.esgImpactCO2Kg = inputs.esgImpactCO2Kg
				if (!props.esgImpactCO2KgScrap && inputs.esgImpactCO2KgScrap) props.esgImpactCO2KgScrap = inputs.esgImpactCO2KgScrap
			}

			// 🔹 3. Read dimensions + density from UI (or use provided inputs)
			if (inputs) {
				props.length = inputs.partEnvelopeLength || props.length
				props.width = inputs.partEnvelopeWidth || props.width
				props.height = inputs.partEnvelopeHeight || props.height
				if (inputs.density && inputs.density > 0) props.density = inputs.density
			} else {
				const mat = await this.getMaterialDimensionsAndDensity()
				props.length = mat.length
				props.width = mat.width
				props.height = mat.height
				if (mat.density > 0) props.density = mat.density
			}

			// 🔹 4. Read Process Params from UI (or use provided inputs)
			if (inputs) {
				if (inputs.meltTemp && inputs.meltTemp > 0) props.meltTemp = inputs.meltTemp
				if (inputs.mouldTemp && inputs.mouldTemp > 0) props.mouldTemp = inputs.mouldTemp
				if (inputs.ejectionTemp && inputs.ejectionTemp > 0) props.ejectionTemp = inputs.ejectionTemp
				if (inputs.clampPr && inputs.clampPr > 0) props.clampingPressure = inputs.clampPr
			} else {
				const uiParams = await this.readMaterialProcessParamsFromUI()
				if (uiParams.meltTemp > 0) props.meltTemp = uiParams.meltTemp
				if (uiParams.mouldTemp > 0) props.mouldTemp = uiParams.mouldTemp
				if (uiParams.ejectionTemp > 0) props.ejectionTemp = uiParams.ejectionTemp
				if (uiParams.clampingPressure > 0) props.clampingPressure = uiParams.clampingPressure
			}

			// 🔹 5. Thermo Data Fallback
			await this.applyThermoConfigFallback(props, identifiers.materialDescription)

		} catch (err) {
			logger.warn(`⚠️ Failed to read material data safely: ${err}`)
		}

		logger.info(
			`📐 L:${props.length}, W:${props.width}, H:${props.height} | Density:${props.density} | TD:${props.thermalDiffusivity} | TC:${props.thermalConductivity} | SH:${props.specificHeatCapacity} | IR:${props.injectionRate}`
		)

		if (!inputs) {
			await this.page.waitAndClick(this.page.MaterialInfo)
		}

		return props
	}

	private async readMaterialIdentifiers() {
		await this.page.waitAndClick(this.page.MaterialInfo)
		await this.page.waitForTimeout(300)

		const getText = async (loc: Locator) => (await loc.locator('option:checked').innerText().catch(() => '')).trim();

		return {
			materialType: await getText(this.page.materialCategory),
			materialGroup: await getText(this.page.MatFamily),
			stockForm: await getText(this.page.StockForm),
			materialDescription: await getText(this.page.DescriptionGrade),
			materialTypeId: await this.page.safeGetNumber(this.page.materialCategory)
		}
	}

	private lookupMaterialInMasterDB(identifiers: { materialType: string, materialGroup: string, stockForm: string, materialDescription: string }) {
		const masterData = materialMasterReader.getMaterialByMultipleFields({
			materialType: identifiers.materialType,
			materialGroup: identifiers.materialGroup,
			stockForm: identifiers.stockForm,
			materialDescription: identifiers.materialDescription
		})

		if (masterData) {
			logger.info(`✅ Found Material Master data:
			   - Material: ${masterData.MaterialType}
			   - Group: ${masterData.MaterialGroup}
			   - ThermalDiffusivity: ${masterData.ThermalDiffusivity}
			   - InjectionRate: ${masterData.InjectionRate}`)
			return masterData
		} else {
			logger.warn(`❌ No Material Master data found for: ${identifiers.materialType} / ${identifiers.materialGroup}`)
			return null
		}
	}

	private async readMaterialProcessParamsFromUI() {
		await this.page.waitAndClick(this.page.MaterialDetailsTab)
		await this.page.waitForTimeout(300)
		return {
			meltTemp: await this.page.safeGetNumber(this.page.MeltTemp),
			mouldTemp: await this.page.safeGetNumber(this.page.MouldTemp),
			ejectionTemp: await this.page.safeGetNumber(this.page.EjecTemp),
			clampingPressure: await this.page.safeGetNumber(this.page.ClampingPressure)
		}
	}

	private async applyThermoConfigFallback(props: MaterialProcessProperties, materialDisplayName: string) {
		const materialInfo = this.plasticRubberConfig.materials.find(m => {
			const normalizedName = m.name.toLowerCase().replace(/\s*\(.*\)/, '').trim();
			return materialDisplayName.toLowerCase().includes(m.materialType.toLowerCase()) ||
				materialDisplayName.toLowerCase().includes(normalizedName) ||
				normalizedName.includes(materialDisplayName.toLowerCase());
		});
		const materialCode = materialInfo?.materialType || materialDisplayName.split(/[\s-]+/)[0];

		const thermoData = this.plasticRubberConfig.thermoForminglookUpData.find(d =>
			d.rawMaterial.toLowerCase() === materialCode.toLowerCase() ||
			materialDisplayName.toLowerCase().includes(d.rawMaterial.toLowerCase())
		);

		if (thermoData) {
			logger.info(`✅ Found ThermoData for ${thermoData.rawMaterial}: SpecificHeatLb=${thermoData.specificHeatLb}, ThermalConductivity=${thermoData.thermalConductivity}`)
			if (props.thermalConductivity === 0) props.thermalConductivity = thermoData.thermalConductivity || 0
			if (props.specificHeatCapacity === 0) props.specificHeatCapacity = thermoData.specificHeatLb || 0
		} else {
			logger.warn(`❌ No ThermoData found for ${materialCode} / ${materialDisplayName}`)
		}

		// Ensure we are back on MaterialInfo as expected by some flows?
		// The main method handles final navigation back to MaterialInfo
	}

	//======================== Part Complexity ======================
	private readonly PART_COMPLEXITY_MAP: Record<PartComplexityKey, number> = {
		low: 1,
		medium: 2,
		high: 3
	}
	async getPartComplexity(testData?: {
		partComplexity?: PartComplexityKey
	}): Promise<number> {
		logger.info('🔹 Processing Part Complexity...')
		await this.page.AdditionalDetails.scrollIntoViewIfNeeded()
		await this.page.waitAndClick(this.page.AdditionalDetails)
		await this.page.waitForTimeout(300)
		// ✅ Set value if provided
		if (testData?.partComplexity) {
			const value = this.PART_COMPLEXITY_MAP[testData.partComplexity]
			logger.info(`🔧 Selecting Part Complexity: ${testData.partComplexity} (${value})`)
			await this.page.PartComplexity.selectOption(String(value))
			await this.page.waitForTimeout(500)
		}
		// ✅ Read value from UI
		const selectedValue = Number(await this.page.PartComplexity.inputValue())
		if (!selectedValue) {
			logger.warn('⚠️ Part Complexity not selected, defaulting to LOW')
			await this.page.waitAndClick(this.page.PartDetails)
			return this.PART_COMPLEXITY_MAP.low
		}
		logger.info(`✅ Part Complexity resolved as: ${selectedValue}`)
		// Click back to Part Details to leave page in a clean state
		await this.page.waitAndClick(this.page.PartDetails)
		await this.page.waitForTimeout(300)
		return selectedValue
	}

	async getMouldCavity(testData?: {
		NoOfCavities?: number,
		NumberOfCavityLength?: number,
		NumberOfCavityWidth?: number,
		RunnerType?: string,
		RunnerDia?: number,
		RunnerLength?: number,
		NoOfInternalSideCores?: number,
		UnscrewingUndercuts?: number
	}): Promise<number> {
		logger.info('🔹 Processing Mould Cavity...')

		// Open the Mould Cavity tab
		await this.page.MouldCavityTab.scrollIntoViewIfNeeded()
		await this.page.waitAndClick(this.page.MouldCavityTab)
		await this.page.waitForTimeout(300)

		// ✅ Set values if provided
		if (testData?.NoOfCavities) {
			logger.info(`🔧 Setting No Of Cavities: ${testData.NoOfCavities}`)
			await this.page.waitAndFill(this.page.NoOfCavities, testData.NoOfCavities)
			if (testData.NumberOfCavityLength) await this.page.waitAndFill(this.page.NumberOfCavityLengthNos, testData.NumberOfCavityLength)
			if (testData.NumberOfCavityWidth) await this.page.waitAndFill(this.page.NumberOfCavityWidth, testData.NumberOfCavityWidth)
			if (testData.RunnerType) await this.page.selectByTrimmedLabel(this.page.RunnerType, testData.RunnerType)
			if (testData.RunnerDia) await this.page.waitAndFill(this.page.RunnerDia, testData.RunnerDia)
			if (testData.RunnerLength) await this.page.waitAndFill(this.page.RunnerLength, testData.RunnerLength)
			if (testData.NoOfInternalSideCores) await this.page.waitAndFill(this.page.NoOfInternalSideCores, testData.NoOfInternalSideCores)
			if (testData.UnscrewingUndercuts) await this.page.waitAndFill(this.page.UnscrewingUndercuts, testData.UnscrewingUndercuts)
		}

		// ✅ Read value from UI
		let selectedValue = Number(await this.page.NoOfCavities.inputValue())
		if (!selectedValue || isNaN(selectedValue)) {
			logger.warn('⚠️ No Of Cavities not selected, defaulting to 1')
			selectedValue = 1
			await this.page.waitAndFill(this.page.NoOfCavities, selectedValue)
		}

		logger.info(`✅ No Of Cavities resolved as: ${selectedValue}`)

		// Return to Part Details tab to leave page clean
		await this.page.waitAndClick(this.page.PartDetails)
		await this.page.waitForTimeout(300)

		return selectedValue
	}

	// ========================== Navigation ==========================

	async navigateToProject(projectId: string): Promise<void> {
		logger.info(`🔹 Navigating to project: ${projectId}`)
		await this.page.waitAndClick(this.page.projectIcon)
		logger.info('Existing part found. Clicking Clear All...')
		const isClearVisible = await this.page.ClearAll.isVisible().catch(
			() => false
		)

		if (isClearVisible) {
			await this.page.waitAndClick(this.page.ClearAll)
		} else {
			await this.page.keyPress('Escape')
		}
		await this.page.openMatSelect(this.page.SelectAnOption, 'Project Selector')

		const projectOption = this.page.page
			.locator('mat-option, mat-mdc-option')
			.filter({ hasText: 'Project #' })
			.first()

		await projectOption.waitFor({ state: 'visible', timeout: 10000 })
		await projectOption.scrollIntoViewIfNeeded()
		await projectOption.click()

		logger.info('✅ Project option selected')

		await this.page.waitAndFill(this.page.ProjectValue, projectId)
		await this.page.pressTab()
		await this.page.pressEnter()
		await this.page.waitForNetworkIdle()
		await this.page.ProjectID.click()
		logger.info(`✔ Navigated to project ID: ${projectId}`)
	}

	public async getNetWeight(): Promise<number> {
		return this.page.safeGetNumber(this.page.PartNetWeight)
	}

	public async getMaterialType(): Promise<string> {
		await this.page.waitAndClick(this.page.MaterialInfo)
		return (await this.page.DescriptionGrade.inputValue()) || 'Other material'
	}

	private async readManufacturingInputs(): Promise<IMouldingInputs> {
		const common = await this.readCommonManufacturingInputs()
		const mould = await this.readMouldCavityInputs()
		const material = await this.readMaterialDetailsInputs()
		const manufacturing = await this.readManufacturingDetailsInputs()

		// Go back to part details to leave in clean state
		await this.page.waitAndClick(this.page.PartDetails)

		return {
			...common,
			...mould,
			...material,
			...manufacturing
		} as IMouldingInputs
	}

	private async readCommonManufacturingInputs(): Promise<Partial<IMouldingInputs>> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)
		// Helper to safely get option text
		const getSelectedText = async (locator: Locator) =>
			(await locator.locator('option:checked').innerText().catch(() => '')).trim();

		return {
			bomQty: await n(this.page.BOMQtyNos),
			annualVolumeQty: await n(this.page.AnnualVolumeQtyNos),
			lotSize: await n(this.page.LotSize),
			productLifeRemainingYrs: await n(this.page.ProductLifeRemainingYrs),
			lifeTimeQtyRemainingNos: await n(this.page.LifeTimeQtyRemainingNos),
			scrapPrice: await n(this.page.ScrapPrice),
			materialPrice: await n(this.page.MaterialPrice),
			volumePurchasingQtyNos: await n(this.page.VolumePurchased),
			volDiscountPer: await n(this.page.VolumeDiscount),
			discountedMaterialPrice: await n(this.page.DiscountedMaterialPrice),
			partEnvelopeLength: await n(this.page.PartEnvelopeLength),
			partEnvelopeWidth: await n(this.page.PartEnvelopeWidth),
			partEnvelopeHeight: await n(this.page.PartEnvelopeHeight),
			maxWallThk: await n(this.page.MaxWallThick),
			WallAvgThk: await n(this.page.WallAverageThickness),
			standardDeviation: await n(this.page.StandardDeviation),
			partProjectedArea: await n(this.page.PartProjectedArea),
			partSurfaceArea: await n(this.page.PartSurfaceArea),
			partVolume: await n(this.page.PartVolume),
			PartNetWeight: await n(this.page.PartNetWeight),
			noOfInserts: await n(this.page.NumberOfInserts),
			matUtilizationPer: await n(this.page.MaterialUtilisationPer),
			ScrapRecPer: await n(this.page.ScrapRecoveryPer),
			grossWeight: await n(this.page.PartGrossWeight),
			scrapWeight: await n(this.page.PartScrapWeight),
			ScrapRecoPer: await n(this.page.ScrapRecoveryPer),
			GrossMaterialCost: await n(this.page.PartGrossMaterialCost),
			scraprec: await n(this.page.PartScrapRecovery),
			regrindPer: await n(this.page.RegrindPer),
			netMatCost: await n(this.page.NetMaterialCost),
			sheetThickness: await n(this.page.PartThickness),
			cycleTime: await n(this.page.CycleTime),
			machineEfficiency: await n(this.page.MachineEfficiency),
			setUpTime: await n(this.page.SetUpTime),
			esgImpactCO2Kg: await n(this.page.esgImpactCO2Kg),
			esgImpactCO2KgScrap: await n(this.page.esgImpactCO2KgScrap),
			esgImpactCO2KgPart: await n(this.page.esgImpactCO2KgPart),
			powerESG: await n(this.page.PowerESG),
			co2Part: await n(this.page.Co2Part),
			machineName: await getSelectedText(this.page.MachineName),
			machineDescription: await this.page.getInputValue(this.page.MachineDescription),
			machineId: await this.page.safeGetNumber(this.page.MachineName),
			deliveryFrequency: await n(this.page.DeliveryFrequency),
		}
	}

	private async readMouldCavityInputs(): Promise<Partial<IMouldingInputs>> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)
		await this.page.waitAndClick(this.page.MouldCavityTab)
		await this.page.waitForTimeout(300)
		return {
			NoOfCavities: await n(this.page.NoOfCavities),
			NumberOfCavityLengthNos: await n(this.page.NumberOfCavityLengthNos),
			NumberOfCavityWidth: await n(this.page.NumberOfCavityWidth),
			RunnerDia: await n(this.page.RunnerDia),
			RunnerLength: await n(this.page.RunnerLength),
			NoOfExternalSideCores: await n(this.page.NoOfExternalSideCores),
			NoOfInternalSideCores: await n(this.page.NoOfInternalSideCores),
			UnscrewingUndercuts: await n(this.page.UnscrewingUndercuts)
		}
	}

	private async readMaterialDetailsInputs(): Promise<Partial<IMouldingInputs>> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)
		await this.page.waitAndClick(this.page.MaterialDetailsTab)
		await this.page.waitForTimeout(300)

		// Expand Sustainability section if it exists to ensure values are read from UI
		await this.page.expandSectionIfVisible(this.page.MaterialSustainability, 'Material Sustainability')

		return {
			density: await n(this.page.Density),
			clampPr: await n(this.page.ClampingPressure),
			mouldTemp: await n(this.page.MouldTemp),
			meltTemp: await n(this.page.MeltTemp),
			ejectionTemp: await n(this.page.EjecTemp),
			esgImpactCO2Kg: await n(this.page.esgImpactCO2Kg),
			esgImpactCO2KgScrap: await n(this.page.esgImpactCO2KgScrap),
			esgImpactCO2KgPart: await n(this.page.esgImpactCO2KgPart)
		}
	}

	private async readManufacturingDetailsInputs(): Promise<Partial<IMouldingInputs>> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)
		await this.page.waitAndClick(this.page.MfgDetailsTab)
		await this.page.waitForTimeout(300)

		// Helper to safely get option text
		const getSelectedText = async (locator: Locator) =>
			(await locator.locator('option:checked').innerText().catch(() => '')).trim();

		return {
			recomTonnage: await n(this.page.RecommendTonnage),
			selectedTonnage: await n(this.page.SelectedTonnage),
			shotWeightRequired: await n(this.page.ShotWeightRequired),
			newToolingCostAllocation: await n(this.page.NewToolingCostAllocation),
			machineEfficiency: await n(this.page.MachineEfficiency),
			shotSize: await n(this.page.ShotWeightOfMachine),
			platenSizeOfMachine: await this.page.PlatenSizeOfMachine.inputValue(),
			machineName: await getSelectedText(this.page.MachineName),
			machineDescription: await this.page.getInputValue(this.page.MachineDescription),
			machineId: await this.page.safeGetNumber(this.page.MachineName),
			insertsPlacement: await n(this.page.InsertsPlacement),
			dryCycleTime: await n(this.page.DryCycleTime),
			injectionTime: await n(this.page.InjectionTime),
			sideCoreMechanisms: await n(this.page.SideCoreMechanisms),
			coolingTime: await n(this.page.CoolingTime),
			partEjection: await n(this.page.PartEjection),
			others: await n(this.page.Others),
			packAndHoldTime: await n(this.page.PackAndHoldTime),
			totalTime: await n(this.page.TotalTime),
			samplingRate: await n(this.page.SamplingRate),
			lowSkilledLaborRate: await n(this.page.LowSkilledLaborRate),
			SkilledLaborHours: await n(this.page.SkilledLaborHours),
			noOfLowSkilledLabours: await n(this.page.NoOfLowSkilledLabours),
			noOfSkilledLabours: await n(this.page.NoOfSkilledLabours),
			qaInspectorRate: await n(this.page.QAInspectorRate),
			machineHourRate: await n(this.page.MachineHourRate),
			directMachineCost: await n(this.page.DirectMachineCost),
			yieldPercentage: await n(this.page.YieldPercentage),
			setUpTime: await n(this.page.SetUpTime),
			inspectionTime: await n(this.page.InspectionTime),
			cycleTime: await n(this.page.CycleTime),
			yieldCost: await n(this.page.YieldCost),
			directLaborCost: await n(this.page.DirectLaborCost),
			inspectionCost: await n(this.page.InspectionCost),
			directSetUpCost: await n(this.page.DirectSetUpCost),
			directProcessCost: await n(this.page.DirectProcessCost),
			powerESG: await n(this.page.PowerESG),
			esgImpactAnnualKgCO2Part: await n(this.page.Co2Part),
			powerConsumptionKW: await n(this.page.RequiredPlatenSize)
		}
	}

	private async gatherManufacturingInfo(
		processType: ProcessType
	): Promise<{ processInfo: ProcessInfoDto, inputs: IMouldingInputs, materialProps: MaterialProcessProperties }> {
		logger.info('📥 Gathering Manufacturing Info from UI...')

		const inputs = await this.readManufacturingInputs()
		const materialProps = await this.getMaterialProperties(inputs)
		const partComplexity = await this.getPartComplexity()
		const materialTypeName = await this.getMaterialType()

		// Log critical inputs for debugging
		logger.info(`📊 Inputs Summary:
			- Cavities: ${inputs.NoOfCavities}
			- Wall Avg Thk: ${inputs.WallAvgThk}
			- Density: ${materialProps.density}
			- Thermal Diff: ${materialProps.thermalDiffusivity}
			- Melt Temp: ${materialProps.meltTemp}
			- Mould Temp: ${materialProps.mouldTemp}
			- Ejec Temp: ${materialProps.ejectionTemp}
			- Machine Hour Rate: ${inputs.machineHourRate}
			- Efficiency: ${inputs.machineEfficiency}%
			- Injection Rate: ${materialProps.injectionRate}
			- Shot Weight Req: ${inputs.shotWeightRequired}
			- Dry Cycle Time (UI): ${inputs.dryCycleTime}
			- Others (UI): ${inputs.others}
		`)

		// 🔹 Primary lookup by Machine Name (as requested)
		let machineData = machineMasterReader.getMachineByName(inputs.machineName || '');

		// 🔹 Secondary lookup by Machine Description if Name lookup fails
		if (!machineData && inputs.machineDescription) {
			logger.info(`🔍 Name lookup failed, trying Machine Description: "${inputs.machineDescription}"`)
			machineData = machineMasterReader.getMachineByDescription(inputs.machineDescription);
		}

		// 🔹 Fallback to Tonnage if name/description lookup fails
		if (!machineData) {
			logger.info(`🔍 Name/Description lookup failed, falling back to tonnage: ${inputs.selectedTonnage || inputs.recomTonnage || 0}`)
			machineData = machineMasterReader.getMachineByTonnage(inputs.selectedTonnage || inputs.recomTonnage || 0);
		}

		const processInfo: ProcessInfoDto = {
			processTypeID: processType,
			partComplexity: partComplexity,
			noOfExternalSideCores: inputs.NoOfExternalSideCores || 0,
			noOfInternalSideCores: inputs.NoOfInternalSideCores || 0,
			unscrewingUndercuts: inputs.UnscrewingUndercuts || 0,
			newToolingCostAllocation: inputs.newToolingCostAllocation || 0,

			// Flattened for calculator access
			density: materialProps.density || inputs.density || 0,
			thermalDiffusivity: materialProps.thermalDiffusivity || inputs.thermalDiffusivity || 0,
			thermalConductivity: materialProps.thermalConductivity || 0,
			specificHeatCapacity: materialProps.specificHeatCapacity || 0,
			meltTemp: materialProps.meltTemp || inputs.meltTemp || 0,
			mouldTemp: materialProps.mouldTemp || inputs.mouldTemp || 0,
			ejecTemp: materialProps.ejectionTemp || inputs.ejectionTemp || 0,
			wallAverageThickness: inputs.WallAvgThk || 0,
			machineHourRate: inputs.machineHourRate || 0,
			// Logic to handle decimal (e.g. 0.85) vs percentage (e.g. 85) inputs
			// Efficiency: Calculator expects decimal (0-1). If input > 1, assume percent and divide by 100.
			efficiency: (inputs.machineEfficiency && inputs.machineEfficiency > 1) ? inputs.machineEfficiency / 100 : (inputs.machineEfficiency || 1), // Default 1 (100%)

			noOfLowSkilledLabours: inputs.noOfLowSkilledLabours || 0,
			lowSkilledLaborRatePerHour: inputs.lowSkilledLaborRate || 0,
			noOfSkilledLabours: inputs.noOfSkilledLabours || 0,
			skilledLaborRatePerHour: inputs.SkilledLaborHours || 0,
			lotSize: inputs.lotSize || 1,

			// Sampling Rate: Calculator expects Percent (0-100). If input <= 1 (e.g. 0.1), convert to 10.
			samplingRate: (inputs.samplingRate && inputs.samplingRate <= 1) ? inputs.samplingRate * 100 : (inputs.samplingRate || 0),

			inspectionTime: inputs.inspectionTime || 0,
			qaOfInspectorRate: inputs.qaInspectorRate || 0,

			// Yield: Calculator expects Percent (0-100). If input <= 1 (e.g. 0.99), convert to 99.
			yieldPer: (inputs.yieldPercentage && inputs.yieldPercentage <= 1) ? inputs.yieldPercentage * 100 : (inputs.yieldPercentage || 100),

			setUpTime: inputs.setUpTime || 0,

			// Breakdown fields for Injection Moulding (Normal and Rubber)
			dryCycleTime: inputs.dryCycleTime || 0,
			others: inputs.others || 0,
			coolingTime: inputs.coolingTime || 0,
			insertsPlacement: inputs.insertsPlacement || 0,
			partEjection: inputs.partEjection || 0,
			sideCoreMechanisms: inputs.sideCoreMechanisms || 0,
			injectionTime: inputs.injectionTime || 0,
			packAndHoldTime: inputs.packAndHoldTime || 0,
			totalTime: inputs.totalTime || 0,
			cycleTime: inputs.cycleTime || 0,

			// Dirty flags tracking (assumed false for now)
			// Dirty flags tracking (set to true if value provided to prevent recalculation)
			isCoolingTimeDirty: (inputs.coolingTime || 0) > 0,
			isInsertsPlacementDirty: (inputs.insertsPlacement || 0) > 0,
			isPartEjectionDirty: (inputs.partEjection || 0) > 0,
			isSideCoreMechanismsDirty: (inputs.sideCoreMechanisms || 0) > 0,
			isOthersDirty: (inputs.others || 0) > 0,
			isinjectionTimeDirty: (inputs.injectionTime || 0) > 0,
			isDryCycleTimeDirty: (inputs.dryCycleTime || 0) > 0,
			isTotalTimeDirty: (inputs.totalTime || 0) > 0,
			iscycleTimeDirty: (inputs.cycleTime || 0) > 0,

			// Support for yield calculation
			yieldCost: inputs.yieldCost || 0,
			directLaborCost: inputs.directLaborCost || 0,
			directMachineCost: inputs.directMachineCost || 0,
			inspectionCost: inputs.inspectionCost || 0,
			directSetUpCost: inputs.directSetUpCost || 0,

			machineMaster: {
				totalPowerKW: machineData?.TotalPowerKW || inputs.powerConsumptionKW || 45,
				powerUtilization: machineData?.PowerUtilization || 0.8,
				injectionRate: inputs.injectionRate || machineData?.InjectionRate || materialProps.injectionRate || 0,
				shotSize: inputs.shotSize || machineData?.ShotSize || 0,
				machineTonnageTons: inputs.selectedTonnage || machineData?.MachineTonnageTons || 0,
				platenSizeStr: inputs.platenSizeOfMachine || '',
				platenLengthmm: machineData?.PlatenLengthmm,
				platenWidthmm: machineData?.PlatenWidthmm,
				machineHourRate: inputs.machineHourRate || 0
			},
			eav: inputs.annualVolumeQty || 0,
			materialInfoList: [
				{
					density: materialProps.density || inputs.density || 7.85,
					grossWeight: inputs.grossWeight || 0,
					scrapWeight: inputs.scrapWeight || 0,
					netWeight: inputs.PartNetWeight || 0,
					netMatCost: inputs.netMatCost || 0,
					wallAverageThickness: inputs.WallAvgThk || 0,
					wallThickessMm: inputs.maxWallThk || inputs.WallAvgThk || 0,
					sheetThickness: inputs.sheetThickness || inputs.WallAvgThk || 0,
					dimX: inputs.partEnvelopeLength || 0,
					dimY: inputs.partEnvelopeWidth || 0,
					dimZ: inputs.partEnvelopeHeight || 0,
					partVolume: inputs.partVolume || 0,
					partSurfaceArea: inputs.partSurfaceArea || 0,
					noOfCavities: inputs.NoOfCavities || 1,
					runnerProjectedArea: inputs.partProjectedArea || 0,
					partProjectedArea: inputs.partProjectedArea || 0,
					noOfInserts: inputs.noOfInserts || 0,
					scrapPrice: inputs.scrapPrice || 0,
					meltTemp: materialProps.meltTemp || inputs.meltTemp,
					mouldTemp: materialProps.mouldTemp || inputs.mouldTemp,
					ejectionTemp: materialProps.ejectionTemp || inputs.ejectionTemp,
					thermalDiffusivity: materialProps.thermalDiffusivity || inputs.thermalDiffusivity,
					materialName: materialTypeName,
					runnerVolume: 0,
					partFinish: 1,
					materialMarketData: {
						clampingPressure: materialProps.clampingPressure || inputs.clampPr || 0,
						esgImpactCO2Kg: materialProps.esgImpactCO2Kg || 0,
						esgImpactCO2KgScrap: materialProps.esgImpactCO2KgScrap || 0
					},
					esgImpactCO2Kg: inputs.esgImpactCO2Kg,
					esgImpactCO2KgScrap: inputs.esgImpactCO2KgScrap,
					esgImpactCO2KgPart: inputs.esgImpactCO2KgPart
				}

			],
			materialmasterDatas: {
				materialType: { materialTypeName: this.plasticRubberConfig.materials.find(m => materialTypeName.includes(m.materialType) || materialTypeName.includes(m.name))?.materialType || materialTypeName },
				materialTypeId: materialProps.materialTypeId || 0
			},
			// Lists for Thermoforming/VacuumForming
			thermoFormingList: this.plasticRubberConfig.thermoForminglookUpData || [],
			formingTimeList: this.plasticRubberConfig.formingTimeList || [],

			// Sustainability add-on
			laborRate: [{ powerESG: inputs.powerESG || 0 }]
		}

		return { processInfo, inputs, materialProps }
	}

	async openManufacturingForPlasticRubber(): Promise<void> {
		logger.info('🔧 Opening Manufacturing → Plastic & Rubber')

		const {
			ManufacturingInformation,
			MfgDetailsTab,
			InjectionMouldingSingleShot
		} = this.page

		await this.page.scrollToMiddle(ManufacturingInformation)
		await ManufacturingInformation.waitFor({
			state: 'visible',
			timeout: 10_000
		})

		const isExpanded = await MfgDetailsTab.isVisible().catch(() => false)

		if (!isExpanded) {
			logger.info('🔽 Expanding Manufacturing section')
			await ManufacturingInformation.click()
			await this.page.waitForNetworkIdle()
		}

		// Click Edit if details not visible or if we want to ensure we're in edit mode
		if (await InjectionMouldingSingleShot.isVisible()) {
			await InjectionMouldingSingleShot.click()
			await this.page.waitForNetworkIdle()
		}

		logger.info('✅ Manufacturing → Plastic & Rubber ready')
	}


	async verifyMaterialInformationDetails(): Promise<void> {
		logger.info('🔹 Verifying Material Information...')
		const { processGroup, category, family, grade, stockForm } =
			MaterialInformation
		logger.info(
			`Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm} `
		)
		await this.page.MaterialInformationSection.scrollIntoViewIfNeeded()
		if (!(await this.page.SearchMaterials.isVisible())) {
			await this.page.MaterialInformationSection.click()
		}
		await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup)
		await this.page.selectOption(this.page.materialCategory, category)
		await this.page.selectOption(this.page.MatFamily, family)
		await this.page.selectOption(this.page.DescriptionGrade, grade)
		await this.page.selectOption(this.page.StockForm, stockForm)
		await this.page.waitForTimeout(300)

		const scrapPrice = await this.page.readNumberSafe(
			this.page.ScrapPrice,
			'Scrap Price'
		)
		const materialPrice = await this.page.readNumberSafe(
			this.page.MaterialPrice,
			'Material Price'
		)
		const netMaterialCost = await this.page.readNumberSafe(
			this.page.NetMaterialCost,
			'Net Material Cost'
		)

		logger.info(
			`💰 Scrap: ${scrapPrice}, Mat: ${materialPrice}, Net: ${netMaterialCost} `
		)
		await this.page.scrollIntoView(this.page.PartDetails)
		const props = await this.getMaterialProperties()
		const partVolume = await this.getPartVolume()

		logger.info(`🧪 Density → ${props.density} `)
		logger.info(`📦 Part Volume → ${partVolume} `)

		if (props.density <= 0 || partVolume <= 0) {
			logger.warn(
				`⚠️ Invalid calculation inputs → Density: ${props.density}, Volume: ${partVolume} `
			)
			return
		}

		const expectedNetWeight = calculateNetWeight(partVolume, props.density)

		// Optional higher precision validation
		await this.verifyNetWeight(expectedNetWeight, 4)
	}

	async getPartVolume(): Promise<number> {
		logger.info('🔹 Waiting for Part Volume...')
		await expect.soft(this.page.PartVolume).toBeVisible({ timeout: 10000 })
		const volume = await this.page.waitForStableNumber(
			this.page.PartVolume,
			'Part Volume'
		)

		return volume
	}
	async verifyNetWeight(
		expectedValue?: number,
		precision: number = 2
	): Promise<number> {
		logger.info('🔹 Verifying Net Weight...')
		let expected = expectedValue
		if (expected === undefined) {
			const props = await this.getMaterialProperties()
			logger.info(`🧪 Density → ${props.density} `)
			const partVolumeMm3 = await this.getPartVolume()
			expected = calculateNetWeight(partVolumeMm3, props.density)
		}
		const actualNetWeight = await this.getNetWeight()
		await VerificationHelper.verifyNumeric(
			actualNetWeight,
			expected,
			'Net Weight',
			precision
		)

		logger.info(
			`✔ Net Weight verified: ${actualNetWeight.toFixed(precision)} g`
		)
		return actualNetWeight
	}
	async verifyInjectionMoulding(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Injection Moulding Calculations...')
		await this.verifyProcess(ProcessType.InjectionMoulding, options)
	}

	async verifyRubberInjectionMoulding(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Rubber Injection Moulding Calculations...')
		await this.verifyProcess(ProcessType.RubberInjectionMolding, options, 'RubberInjectionMoulding')
	}

	async verifyCompressionMolding(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Compression Molding Calculations...')
		await this.verifyProcess(ProcessType.CompressionMolding, options, 'CompressionMolding')
	}

	async verifyRubberExtrusion(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Rubber Extrusion Calculations...')
		await this.verifyProcess(ProcessType.RubberExtrusion, options, 'RubberExtrusion')
	}

	async verifyBlowMolding(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Blow Molding Calculations...')
		await this.verifyProcess(ProcessType.BlowMolding, options, 'BlowMolding')
	}

	async verifyTransferMolding(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Transfer Molding Calculations...')
		await this.verifyProcess(ProcessType.TransferMolding, options, 'TransferMolding')
	}

	async verifyThermoForming(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Thermo Forming Calculations...')
		await this.verifyProcess(ProcessType.ThermoForming, options, 'ThermoForming')
	}

	async verifyVacuumForming(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Vacuum Forming Calculations...')
		await this.verifyProcess(ProcessType.PlasticVacuumForming, options, 'VacuumForming')
	}
	// ======================================= sustainability calculation =======================================

	public calculateManufacturingSustainability(processInfo: any, laborRate: any[]): any {
		return this.manufacturingService.doCostCalculationsForSustainability(processInfo, [], null as any, laborRate);
	}
	public calculateMaterialSustainability(materialInfo: any, selectedMaterialInfo: any): any {
		return this.materialService.calculationsForMaterialSustainability(materialInfo, [], selectedMaterialInfo);
	}

	public async MaterialSustainabilityCalculation(): Promise<void> {
		logger.info('🧪 Running verification of sustainability logic using UI data...');

		const inputs = await this.readCommonManufacturingInputs() as IMouldingInputs;

		logger.info('   • Verifying Material Sustainability Logic path...');
		await this.verifyingMaterialSustainability(null, inputs);

		await this.verifyingManufacturingSustainability(null, inputs);
	}

	// ======================================= material sustainability verification =======================================
	async verifyingMaterialSustainability(
		result?: any,
		inputs?: IMouldingInputs,
	): Promise<void> {
		logger.info('═══════════════════════════════════════════════════════════');
		logger.info('🔹 Running Material Sustainability Check...');
		logger.info('═══════════════════════════════════════════════════════════');
		// Read inputs if not provided
		if (!inputs) {
			inputs = await this.readManufacturingInputs();
		}
		const {
			grossWeight = inputs.grossWeight,
			scrapWeight = inputs.scrapWeight,
			esgImpactCO2Kg = inputs.esgImpactCO2Kg,
			esgImpactCO2KgScrap = inputs.esgImpactCO2KgScrap,
			esgImpactCO2KgPart = inputs.esgImpactCO2KgPart
		} = inputs;
		logger.info(`📥 Inputs → MaterialCO2=${esgImpactCO2Kg}, ScrapCO2=${esgImpactCO2KgScrap}, GrossWeight=${grossWeight}, ScrapWeight=${scrapWeight}, PartCO2=${esgImpactCO2KgPart}`);
		// Prepare data for the material sustainability service
		const materialInfo: any = {
			grossWeight: Number(grossWeight || 0),
			scrapWeight: Number(scrapWeight || 0),
			netWeight: Number(inputs.PartNetWeight || 0),
			eav: Number(inputs.annualVolumeQty || 0),
			materialMarketData: {
				esgImpactCO2Kg: Number(esgImpactCO2Kg || 0),
				esgImpactCO2KgScrap: Number(esgImpactCO2KgScrap || 0)
			}
		};
		const selectedMaterialInfo: any = {
			esgImpactCO2Kg: Number(esgImpactCO2Kg || 0),
			esgImpactCO2KgScrap: Number(esgImpactCO2KgScrap || 0)
		};
		// Use the calculate function via the logic wrapper
		const calcResult = this.calculateMaterialSustainability(materialInfo, selectedMaterialInfo);
		logger.info('--- Material Sustainability Logic Result ---');
		logger.info(`Actual Part CO2 (UI)   : ${Number(inputs.esgImpactCO2KgPart || 0).toFixed(6)}`);
		logger.info(`Expected Part CO2      : ${calcResult.esgImpactCO2KgPart?.toFixed(6)}`);
		// Verify UI against Calculated Expected Value
		await VerificationHelper.verifyNumeric(Number(inputs.esgImpactCO2KgPart || 0), calcResult.esgImpactCO2KgPart, 'Material ESG Part CO2');
		// If a full result object is provided, verify other fields
		if (result?.materialInfoList?.[0]) {
			const matInfo = result.materialInfoList[0];
			logger.info('\n📈 Verifying Additional Material Metrics:');
			const matChecks = [
				{ actual: matInfo.esgAnnualVolumeKg, expected: calcResult.esgAnnualVolumeKg, label: 'Annual Volume (kg)' },
				{ actual: matInfo.esgAnnualKgCO2, expected: calcResult.esgAnnualKgCO2, label: 'Annual CO2 (kg)' },
				{ actual: matInfo.esgAnnualKgCO2Part, expected: calcResult.esgAnnualKgCO2Part, label: 'Annual CO2/Part (kg)' }
			];
			for (const check of matChecks) {
				await VerificationHelper.verifyNumeric(check.actual, check.expected, check.label);
			}
		}
		logger.info('\n✅ Material Sustainability Check Complete');
		logger.info('═══════════════════════════════════════════════════════════\n');
	}

	// ======================================= manufacturing sustainability verification =======================================
	async verifyingManufacturingSustainability(
		result?: any,
		inputs?: IMouldingInputs,
		machineName?: string
	): Promise<void> {
		logger.info('═══════════════════════════════════════════════════════════');
		logger.info('🔹 Running Manufacturing Sustainability Check...');
		logger.info('═══════════════════════════════════════════════════════════');

		// If no inputs, fallback to reading from UI
		if (!inputs) {
			inputs = await this.readManufacturingInputs();
		}

		// Lookup machine data with multiple fallback strategies
		logger.info('🔍 Machine Lookup Process:');
		logger.info(`   - Parameter machineName: "${machineName || 'not provided'}"`);
		logger.info(`   - inputs.machineName: "${inputs.machineName || 'not provided'}"`);
		logger.info(`   - inputs.machineDescription: "${inputs.machineDescription || 'not provided'}"`);

		let machineData = null;

		// Strategy 1: Try parameter machineName if provided
		if (machineName) {
			logger.info(`   → Trying getMachineByName("${machineName}")`);
			machineData = machineMasterReader.getMachineByName(machineName);
			if (machineData) logger.info(`   ✅ Found via parameter machineName`);
		}

		// Strategy 2: Try inputs.machineName if not found yet
		if (!machineData && inputs.machineName) {
			logger.info(`   → Trying getMachineByName("${inputs.machineName}")`);
			machineData = machineMasterReader.getMachineByName(inputs.machineName);
			if (machineData) logger.info(`   ✅ Found via inputs.machineName`);
		}

		// Strategy 3: Try inputs.machineDescription if not found yet
		if (!machineData && inputs.machineDescription) {
			logger.info(`   → Trying getMachineByDescription("${inputs.machineDescription}")`);
			machineData = machineMasterReader.getMachineByDescription(inputs.machineDescription);
			if (machineData) logger.info(`   ✅ Found via inputs.machineDescription`);
		}

		if (!machineData) {
			logger.warn('⚠️ Machine not found in master DB. Using fallback values from inputs/result.');
		}

		logger.info(`\n📊 Machine Info: ${machineData?.MachineName || 'N/A'}`);
		if (machineData) {
			logger.info(`   - Total Power (kW): ${machineData.TotalPowerKW}`);
			logger.info(`   - Power Utilization: ${machineData.PowerUtilization}`);
		}

		const powerESG = inputs.powerESG || 0;
		logger.info(`   - Power ESG: ${powerESG}`);
		const expectedElectricityIntensity = machineData
			? (machineData.TotalPowerKW || 0) * (machineData.PowerUtilization || 0) * powerESG
			: 0;

		// Prepare labor rate data (PowerESG from UI)
		const laborRate: any[] = [{ powerESG }];

		// Prepare process info data for the sustainability service
		const processInfo: any = {
			machineMaster: {
				totalPowerKW: machineData?.TotalPowerKW || inputs.powerConsumptionKW || 0,
				powerUtilization: machineData?.PowerUtilization || 0.8
			},
			cycleTime: inputs.cycleTime || 0,
			efficiency: (inputs.machineEfficiency && inputs.machineEfficiency > 1) ? inputs.machineEfficiency / 100 : (inputs.machineEfficiency || 1),
			setUpTime: inputs.setUpTime || 0,
			lotSize: inputs.lotSize || 1,
			eav: inputs.annualVolumeQty || 0
		};

		// Use the calculator service via the logic wrapper to get expected results
		const calcResult = this.calculateManufacturingSustainability(processInfo, laborRate);

		logger.info(`\n--- Manufacturing Sustainability Logic Result ---`);
		logger.info(`Expected Electricity Intensity (kg/hr) : ${expectedElectricityIntensity.toFixed(5)}`);
		logger.info(`Calculated Electricity Intensity (kg/hr) : ${calcResult.esgImpactElectricityConsumption.toFixed(5)}`);

		// Verify calculated intensity against master data expectation
		if (expectedElectricityIntensity > 0) {
			await VerificationHelper.verifyNumeric(calcResult.esgImpactElectricityConsumption, expectedElectricityIntensity, 'ESG Electricity Consumption (kg/hr)');
		}

		// Verify UI values against calculated expected results
		if (result) {
			logger.info(`\n🔍 Comparing UI Results vs Calculated Metrics:`);

			const mfgChecks = [
				{
					actual: inputs.esgImpactAnnualKgCO2Part,
					expected: calcResult.esgImpactFactoryImpact,
					label: 'Factory Impact (kg/part)',
					formula: `(CycleTime: ${inputs.cycleTime} / (3600 * Efficiency: ${inputs.machineEfficiency}) + SetupTime: ${inputs.setUpTime} / (LotSize: ${inputs.lotSize} * 60)) * ElectricityIntensity_hr`
				},
				{
					actual: result.esgImpactAnnualUsageHrs,
					expected: calcResult.esgImpactAnnualUsageHrs,
					label: 'Annual Usage (hrs)',
					formula: `(SetupTime: ${inputs.setUpTime} * (EAV: ${inputs.annualVolumeQty}/LotSize: ${inputs.lotSize}) / 60) + (CycleTime: ${inputs.cycleTime} * EAV: ${inputs.annualVolumeQty}) / 3600`
				},
				{
					actual: result.esgImpactAnnualKgCO2,
					expected: calcResult.esgImpactAnnualKgCO2,
					label: 'Annual Manufacturing CO2 (kg)',
					formula: `ElectricityIntensity_hr: ${expectedElectricityIntensity} * AnnualUsageHrs: ${calcResult.esgImpactAnnualUsageHrs}`
				},
				{
					actual: inputs.esgImpactAnnualKgCO2Part,
					expected: calcResult.esgImpactAnnualKgCO2Part,
					label: 'Annual Manufacturing CO2/Part (kg)',
					formula: `AnnualManufacturingCO2: ${calcResult.esgImpactAnnualKgCO2} / EAV: ${inputs.annualVolumeQty}`
				}
			];

			for (const check of mfgChecks) {
				if (check.expected !== undefined && check.expected !== null) {
					logger.info(`\n${check.label}:`);
					logger.info(`Expected : ${Number(check.expected).toFixed(4)}`);
					logger.info(`Actual   : ${Number(check.actual || 0).toFixed(4)}`);
					if (check.formula) logger.info(`Formula  : ${check.formula}`);

					await VerificationHelper.verifyNumeric(Number(check.actual || 0), check.expected, check.label);
				}
			}
		}

		logger.info('\n✅ Manufacturing Sustainability Check Complete');
		logger.info('═══════════════════════════════════════════════════════════\n');
	}


	async verifyPassivation(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Passivation Calculations...')
		await this.verifyProcess(ProcessType.Passivation, options, 'Passivation')
	}

	async verifyDeflashing(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Deflashing Calculations...')
		await this.verifyProcess(ProcessType.Deflash, options, 'Deflashing')
	}

	async verifyManualDeflashing(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Manual Deflashing Calculations...')
		await this.verifyProcess(ProcessType.ManualDeflashing, options, 'ManualDeflashing')
	}

	async verifyPostCuring(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Post Curing Calculations...')
		await this.verifyProcess(ProcessType.PostCuring, options, 'PostCuring')
	}

	async verifyDeburring(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Deburring Calculations...')
		await this.verifyProcess(ProcessType.Deburring, options, 'Deburring')
	}

	async verifyCutting(
		options: PlasticRubberVerificationOptions = {}
	): Promise<void> {
		logger.info('🔹 Verifying Cutting Calculations...')
		await this.verifyProcess(ProcessType.Cutting, options, 'Cutting')
	}

	private async verifyProcess(
		processType: ProcessType,
		options: PlasticRubberVerificationOptions = {},
		specificMethod:
			| 'InjectionMoulding'
			| 'RubberInjectionMoulding'
			| 'CompressionMolding'
			| 'RubberExtrusion'
			| 'BlowMolding'
			| 'TransferMolding'
			| 'ThermoForming'
			| 'VacuumForming'
			| 'Passivation'
			| 'Deflashing'
			| 'ManualDeflashing'
			| 'PostCuring'
			| 'Deburring'
			| 'Cutting' = 'InjectionMoulding'
	): Promise<void> {
		// 1. Prepare Tabs
		await this.page.waitAndClick(this.page.MaterialDetailsTab)
		await this.page.waitAndClick(this.page.MaterialInfo)
		await this.page.waitAndClick(this.page.MfgDetailsTab)

		// 2. Gather Info
		const { processInfo, inputs, materialProps } = await this.gatherManufacturingInfo(processType)

		// 3. Calculate
		let result: ProcessInfoDto | null = null as any
		// Commented out process calculations to isolate packaging/sustainability testing

		switch (specificMethod) {
			case 'RubberInjectionMoulding':
				result = this.calculator.calculationsForRubberInjectionMoulding(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'CompressionMolding':
				result = this.calculator.calculationsForCompressionMolding(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'RubberExtrusion':
				result = this.calculator.calculationsForRubberExtrusion(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'BlowMolding':
				result = this.calculator.calculationsForBlowMolding(processInfo as any, [], null as any, { eav: inputs.annualVolumeQty } as any, (processInfo as any).laborRate) as any
				break
			case 'TransferMolding':
				result = this.calculator.calculationsForTransferMolding(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'ThermoForming':
				result = this.calculator.doCostCalculationForThermoForming(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'VacuumForming':
				result = this.calculator.doCostCalculationForVacuumForming(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'Passivation':
				result = this.calculator.calculationsForPassivation(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'Deflashing':
				logger.warn('⚠️ calculationsForDeflashing not implemented in calculator service. Skipping calculation.')
				break
			case 'ManualDeflashing':
				result = this.calculator.calculationsForManualDeflashing(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'PostCuring':
				result = this.calculator.calculationsForPostCuring(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
				break
			case 'Deburring':
				logger.warn('⚠️ calculationsForDeburring not implemented in calculator service. Skipping calculation.')
				break
			case 'Cutting':
				logger.warn('⚠️ calculationsForCutting not implemented in calculator service. Skipping calculation.')
				break
			default:
				result = this.calculator.calculationsForInjectionMoulding(processInfo as any, [], null as any, (processInfo as any).laborRate) as any
		}

		if (result) {
			logger.info(`🧪 Calculation Results for ${specificMethod}:
				- Direct Machine Cost: ${result.directMachineCost}
				- Direct Labor Cost: ${result.directLaborCost}
				- Inspection Cost: ${result.inspectionCost}
				- Direct Setup Cost: ${result.directSetUpCost}
				- Yield Cost: ${result.yieldCost}
				- Efficiency Used: ${processInfo.efficiency}
				- Lot Size Used: ${processInfo.lotSize}
			`)
		} else {
			logger.warn(`⚠️ No result calculated for ${specificMethod}. Skipping cost verification.`)
		}

		// 4. Verify Inputs (if provided)
		if (options.expectedInputs) {
			logger.info('🔍 Verifying Cycle Time Breakdown Inputs...')
			const { expectedInputs } = options
			const checks = [
				{ actual: inputs.insertsPlacement, expected: expectedInputs.insertsPlacement, label: 'Inserts Placement' },
				{ actual: inputs.dryCycleTime, expected: expectedInputs.dryCycleTime, label: 'Dry Cycle (Mold Open/Close)' },
				{ actual: inputs.injectionTime, expected: expectedInputs.injectionTime, label: 'Injection Time' },
				{ actual: inputs.coolingTime, expected: expectedInputs.coolingTime, label: 'Cooling Time' },
				{ actual: inputs.sideCoreMechanisms, expected: expectedInputs.sideCoreMechanisms, label: 'Side Core/Lifter' },
				{ actual: inputs.partEjection, expected: expectedInputs.partEjection, label: 'Part Ejection' },
				{ actual: inputs.others, expected: expectedInputs.others, label: 'Others/Misc' },
				{ actual: inputs.totalTime, expected: expectedInputs.totalTime, label: 'Cycle Time Per Shot' }
			]

			for (const check of checks) {
				if (check.expected !== undefined) {
					await VerificationHelper.verifyNumeric(check.actual || 0, check.expected, check.label)
				}
			}
		}

		// 5. Verify Costs
		if (result) {
			const costs = options.expectedCosts || {}

			const costChecks = [
				{ ui: this.page.CycleTime, label: 'Cycle Time', expected: costs.cycleTime ?? result.cycleTime },
				{ ui: this.page.DirectMachineCost, label: 'Direct Machine Cost', expected: costs.directMachineCost ?? result.directMachineCost },
				{ ui: this.page.DirectLaborCost, label: 'Direct Labor Cost', expected: costs.directLaborCost ?? result.directLaborCost },
				{ ui: this.page.InspectionCost, label: 'Inspection Cost', expected: costs.inspectionCost ?? result.inspectionCost },
				{ ui: this.page.DirectSetUpCost, label: 'Direct Setup Cost', expected: costs.directSetUpCost ?? result.directSetUpCost },
				{ ui: this.page.YieldCost, label: 'Yield Cost', expected: costs.yieldCost ?? result.yieldCost },
				{ ui: this.page.DirectProcessCost, label: 'Direct Process Cost', expected: costs.directProcessCost ?? result.directProcessCost }
			]

			for (const check of costChecks) {
				if (this.page.isPageClosed?.()) {
					logger.error(`❌ Browser closed during verification of ${check.label}. Bailing out.`)
					return
				}

				let uiValue = await this.page.readNumberSafe(check.ui, check.label)
				let expected = Number(check.expected)

				if (check.label === 'Yield Cost') {
					uiValue = Number(uiValue.toFixed(3))
					expected = Number(expected.toFixed(3))
				}

				logger.info(`Verifying ${check.label}: Expected=${expected.toFixed(4)}, Actual(UI)=${uiValue.toFixed(4)}`)
				await VerificationHelper.verifyNumeric(uiValue, expected, check.label)
			}
		}

		// 6. Sustainability Verification
		if (result) {
			await this.verifyingMaterialSustainability(result, inputs)
			await this.verifyingManufacturingSustainability(result, inputs)
		} else {
			logger.warn('⚠️ No result available for sustainability verification.')
		}

		logger.info(`✔ ${specificMethod} verification complete.`)
	}

	/**
	 * Standalone verification of packaging calculation logic using UI data.
	 */
	public async PackagingInformationCalculation(): Promise<void> {
		logger.info('Running verification of packaging logic using UI data...');
		const inputs = await this.readCommonManufacturingInputs() as IMouldingInputs;
		const packagingInputs = await this.readPackagingInputs();

		const corrugatedBoxList = packagingMasterReader.getCorrugatedBoxes();
		const palletList = packagingMasterReader.getPallets();
		const protectList = packagingMasterReader.getProtectivePackaging();

		const cleanBoxList = corrugatedBoxList.map(item => ({ ...item, price: item.price || 0 }));
		const cleanPalletList = palletList.map(item => ({ ...item, price: item.price || 0 }));
		const cleanProtectList = protectList.map(item => ({ ...item, price: item.price || 0 }));

		const selectedBoxId = cleanBoxList[0]?.materialMasterId || 0;
		const selectedPalletId = cleanPalletList[0]?.materialMasterId || 0;
		const deliveryFrequency = Number(inputs.deliveryFrequency || 30);

		const packagingInfo: PackagingInfoDto = {
			eav: Number(inputs.annualVolumeQty || 0),
			deliveryFrequency,
			corrugatedBox: selectedBoxId,
			pallet: selectedPalletId,
			shrinkWrap: packagingInputs.shrinkWrapCostPerUnit > 0 || packagingInputs.totalShrinkWrapCost > 0,
			shrinkWrapCostPerUnit: Number(packagingInputs.shrinkWrapCostPerUnit || 0),
			adnlProtectPkgs: [],
			esgImpactCO2Kg: 0,
			esgImpactperBox: 0,
			esgImpactperPallet: 0,
			totalESGImpactperPart: 0,
			totalBoxVol: 0,
			countNumberOfMatSub: 0,
			dataFromMaterialInfo: 0,
			corrugatedBoxList: cleanBoxList,
			palletList: cleanPalletList,
			protectList: cleanProtectList,
			materialInfo: {
				netWeight: inputs.PartNetWeight || 0,
				dimX: inputs.partEnvelopeLength || 0,
				dimY: inputs.partEnvelopeWidth || 0,
				dimZ: inputs.partEnvelopeHeight || 0
			}
		};

		logger.info('Verifying packaging logic path...');
		const result = this.packagingService.calculationsForPackaging(
			packagingInfo,
			[],
			packagingInfo
		);

		logger.info('--- Packaging Logic Result ---');
		logger.info(`Total Packaging Cost/Shipment : ${result.totalPackagCostPerShipment?.toFixed(4)}`);
		logger.info(`Total Packaging Cost/Part     : ${result.totalPackagCostPerUnit?.toFixed(4)}`);

		if (
			result.totalPackagCostPerShipment === undefined ||
			Number.isNaN(result.totalPackagCostPerShipment) ||
			result.totalPackagCostPerUnit === undefined ||
			Number.isNaN(result.totalPackagCostPerUnit)
		) {
			throw new Error('Packaging calculation failed: calculated packaging totals are invalid');
		}

		logger.info('Packaging logic verification completed');
	}

	/**
	 * Read packaging inputs from the UI
	 */
	private async readPackagingInputs(): Promise<any> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)
		logger.info('📦 Reading Packaging Inputs from UI...');

		// Navigate to packaging tab if it exists
		try {
			if (await this.page.PackagingExpPanel.isVisible({ timeout: 2000 })) {
				await this.page.PackagingExpPanel.click({ force: true });
				await this.page.waitForTimeout(500);
			}
		} catch (e) {
			logger.warn('⚠️ Packaging tab not found, assuming packaging fields are on current view');
		}

		const packagingInputs = {
			// Shipment details
			deliveryFrequency: await n(this.page.PartsPerShipment),
			weightPerShipment: await n(this.page.WeightPerShipment),
			volumePerShipment: await n(this.page.VolumePerShipment),

			// Box details
			boxPerShipment: await n(this.page.QuantityNeededPerShipment),
			corrugatedBoxCostPerUnit: await n(this.page.CostPerContainer),
			totalBoxCostPerShipment: await n(this.page.CostPerUnit),

			// Pallet details
			palletPerShipment: await n(this.page.QuantityNeededPerShipment),
			palletCostPerUnit: await n(this.page.CostPerContainer),
			totalPalletCostPerShipment: await n(this.page.CostPerUnit),

			// Shrink wrap details
			shrinkWrapCostPerUnit: await n(this.page.CostPerContainer),
			totalShrinkWrapCost: await n(this.page.CostPerUnit),

			// Total costs
			totalPackagCostPerShipment: await n(this.page.CostPerUnit),
			totalPackagCostPerUnit: await n(this.page.CostPerUnit),

			// Additional packaging details
			packagingWeight: await n(this.page.PackagingWeight),
			packageMaxCapacity: await n(this.page.PackageMaxCapacity),
			packageMaxVolume: await n(this.page.PackageMaxVolume),

			// Labor and cost details
			directLaborRate: await n(this.page.DirectLaborRate),
			laborCostPerPart: await n(this.page.LaborCostPerPart),

			// Container details
			partsPerContainer: await n(this.page.PartsPerContainer),
			qtyNeededPerShipment: await n(this.page.QuantityNeededPerShipment),
			costPerContainer: await n(this.page.CostPerContainer),
			costPerUnit: await n(this.page.CostPerUnit),

			// Sustainability
			co2PerUnit: await n(this.page.CO2PerUnit),
			cO2PerUnit: await n(this.page.CO2PerUnit)
		};

		logger.info(`📦 Packaging Inputs Read:`);
		logger.info(`   - Parts/Shipment: ${packagingInputs.deliveryFrequency} `);
		logger.info(`   - Weight / Shipment: ${packagingInputs.weightPerShipment} kg`);
		logger.info(`   - Volume / Shipment: ${packagingInputs.volumePerShipment} m³`);
		logger.info(`   - Box / Shipment: ${packagingInputs.boxPerShipment} `);
		logger.info(`   - Pallet / Shipment: ${packagingInputs.palletPerShipment} `);
		logger.info(`   - Total Cost / Shipment: $${packagingInputs.totalPackagCostPerShipment} `);
		logger.info(`   - Total Cost / Unit: $${packagingInputs.totalPackagCostPerUnit} `);
		logger.info(`   - Packaging Weight: ${packagingInputs.packagingWeight} kg`);
		logger.info(`   - Package Max Capacity: ${packagingInputs.packageMaxCapacity} kg`);
		logger.info(`   - Package Max Volume: ${packagingInputs.packageMaxVolume} m³`);
		logger.info(`   - Direct Labor Rate: $${packagingInputs.directLaborRate} `);
		logger.info(`   - Labor Cost / Part: $${packagingInputs.laborCostPerPart} `);
		logger.info(`   - Parts / Container: ${packagingInputs.partsPerContainer} `);
		logger.info(`   - Qty Needed / Shipment: ${packagingInputs.qtyNeededPerShipment} `);
		logger.info(`   - Cost / Container: $${packagingInputs.costPerContainer} `);
		logger.info(`   - Cost / Unit: $${packagingInputs.costPerUnit} `);
		logger.info(`   - CO2 / Unit: ${packagingInputs.co2PerUnit} `);
		return packagingInputs;
	}
	//========================== Packaging Verification ==========================	

	public async verifyPackagingCalculations(): Promise<void> {
		logger.info('═══════════════════════════════════════════════════════════');
		logger.info('🔹 Running Packaging Calculation Verification...');
		logger.info('═══════════════════════════════════════════════════════════');

		const testData = require('../../test-data/packaging-verification-data.json');

		// Retrieve lists from master DB
		const corrugatedBoxList = packagingMasterReader.getCorrugatedBoxes();
		const palletList = packagingMasterReader.getPallets();
		const protectList = packagingMasterReader.getProtectivePackaging();

		const cleanBoxList = corrugatedBoxList.map(item => ({ ...item, price: item.price || 0 }));
		const cleanPalletList = palletList.map(item => ({ ...item, price: item.price || 0 }));
		const cleanProtectList = protectList.map(item => ({ ...item, price: item.price || 0 }));
		const inputs = await this.readCommonManufacturingInputs() as IMouldingInputs;

		for (const testCase of testData) {
			logger.info(`\n🔸 Running Test Case: ${testCase.TestCaseId}`);

			await this.page.selectOption(this.page.MaterialFinish, testCase.MaterialFinish);
			await this.page.selectOption(this.page.FragileOrSpeciality, testCase.FragileStatus);
			await this.page.selectOption(this.page.Freight, testCase.Freight);
			for (const item of testCase.PackagingItems) {
				if (await this.page.PackagingType.isVisible()) {
					await this.page.selectOption(this.page.PackagingType, item.PackagingType);
					await this.page.waitForTimeout(500);
					await this.page.selectOption(this.page.PackagingMaterial, item.PackagingMaterial);
					await this.page.waitForTimeout(500);
					await this.page.PackageDescription.fill(item.PackageDescription);
					await this.page.PackageDescription.press('Tab');
					await this.page.waitForTimeout(1000);
					if (await this.page.UpdateSaveBtn.isVisible()) {
						await this.page.UpdateSaveBtn.click();
						await this.page.waitForTimeout(2000);
					}
				}
			}

			if (await this.page.RecalculateCostBtn.isVisible()) {
				await this.page.RecalculateCostBtn.click();
				await this.page.waitForTimeout(2000);
			}

			const packagingInputs = await this.readPackagingInputs();

			let selectedBoxId = cleanBoxList.length > 0 ? cleanBoxList[0].materialMasterId : 0;
			const matchedBox = cleanBoxList.find(b => b.materialDescription.includes(testCase.PackagingItems[0].PackageDescription));
			if (matchedBox) selectedBoxId = matchedBox.materialMasterId;

			const packagingInfo: PackagingInfoDto = {
				eav: Number(inputs.annualVolumeQty || 0),
				deliveryFrequency: Number(inputs.deliveryFrequency),
				partsPerShipment: packagingInputs.partsPerShipment,
				weightPerShipment: packagingInputs.weightPerShipment,
				volumePerShipment: packagingInputs.volumePerShipment,

				corrugatedBox: selectedBoxId,
				boxPerShipment: packagingInputs.boxPerShipment,
				corrugatedBoxCostPerUnit: packagingInputs.corrugatedBoxCostPerUnit,
				totalBoxCostPerShipment: packagingInputs.totalBoxCostPerShipment,

				pallet: cleanPalletList.length > 0 ? cleanPalletList[0].materialMasterId : 0, // Default pallet
				palletPerShipment: packagingInputs.palletPerShipment,
				palletCostPerUnit: packagingInputs.palletCostPerUnit,
				totalPalletCostPerShipment: packagingInputs.totalPalletCostPerShipment,

				shrinkWrap: packagingInputs.shrinkWrapCostPerUnit > 0,
				shrinkWrapCostPerUnit: packagingInputs.shrinkWrapCostPerUnit,
				totalShrinkWrapCost: packagingInputs.totalShrinkWrapCost,

				totalPackagCostPerShipment: packagingInputs.totalPackagCostPerShipment,
				totalPackagCostPerUnit: packagingInputs.totalPackagCostPerUnit,

				adnlProtectPkgs: [],
				esgImpactCO2Kg: 0,
				esgImpactperBox: 0,
				esgImpactperPallet: 0,
				totalESGImpactperPart: 0,
				totalBoxVol: 0,
				countNumberOfMatSub: 0,
				dataFromMaterialInfo: 0,
				corrugatedBoxList: cleanBoxList,
				palletList: cleanPalletList,
				protectList: cleanProtectList,
				materialInfo: {
					netWeight: inputs.PartNetWeight || 0,
					dimX: inputs.partEnvelopeLength || 0,
					dimY: inputs.partEnvelopeWidth || 0,
					dimZ: inputs.partEnvelopeHeight || 0
				}
			} as any;

			// Calculate
			const calcResult = this.packagingService.calculationsForPackaging(
				packagingInfo,
				[],
				packagingInfo
			);

			// Log Results
			logger.info(`--- Results for ${testCase.TestCaseId} ---`);
			logger.info(`Parts/Shipment: Expected=${calcResult.partsPerShipment}, Actual=${packagingInputs.partsPerShipment}`);
			logger.info(`Total Packaging Cost/Unit: Expected=${calcResult.totalPackagCostPerUnit}, Actual=${packagingInputs.totalPackagCostPerUnit}`);

			// Verify
			await VerificationHelper.verifyNumeric(packagingInputs.partsPerShipment || 0, calcResult.partsPerShipment || 0, 'Parts Per Shipment');
			await VerificationHelper.verifyNumeric(packagingInputs.totalPackagCostPerUnit || 0, calcResult.totalPackagCostPerUnit || 0, 'Total Packaging Cost Per Unit');
		}

		logger.info('\n✅ Packaging Calculation Verification Complete');
		logger.info('═══════════════════════════════════════════════════════════\n');
	}
}


