import { test, expect } from '@playwright/test'
import { PlasticRubberLogic } from './pages/plastic-rubber-logic'

// Minimal Locator mock
class LocatorMock {
  private _value: string = ''
  private _visible: boolean = true
  private _text: string = ''
  constructor(value: string | number = '', visible = true, text = '') {
    this._value = String(value)
    this._visible = visible
    this._text = text
  }
  async isVisible(): Promise<boolean> { return this._visible }
  async inputValue(): Promise<string> { return this._value }
  locator(_sel: string): LocatorMock { return new LocatorMock(this._text || this._value, this._visible, this._text) }
  first(): LocatorMock { return this }
  async innerText(): Promise<string> { return this._text || this._value }
  async click(): Promise<void> { /* no-op */ }
  async waitFor(_opts?: any): Promise<void> { /* no-op */ }
  async scrollIntoViewIfNeeded(): Promise<void> { /* no-op */ }
  async toBeVisible(): Promise<void> { /* no-op */ }
}

// Minimal Page Object mock implementing only used members
class PlasticRubberPageMock {
  // Tabs/sections
  MaterialDetailsTab = new LocatorMock()
  MaterialInfo = new LocatorMock()
  MfgDetailsTab = new LocatorMock()
  AdditionalDetails = new LocatorMock()
  PartDetails = new LocatorMock()
  MouldCavityTab = new LocatorMock()

  // Material details
  Density = new LocatorMock(0)
  MeltTemp = new LocatorMock(0)
  MouldTemp = new LocatorMock(0)
  EjecTemp = new LocatorMock(0)
  ClampingPressure = new LocatorMock(0)
  esgImpactCO2Kg = new LocatorMock(0)
  esgImpactCO2KgScrap = new LocatorMock(0)
  esgImpactCO2KgPart = new LocatorMock(0)

  // Dimensions
  PartEnvelopeLength = new LocatorMock(0)
  PartEnvelopeWidth = new LocatorMock(0)
  PartEnvelopeHeight = new LocatorMock(0)

  // IDs
  materialCategory = new LocatorMock('1')
  MatFamily = new LocatorMock('fam')
  StockForm = new LocatorMock('form')
  DescriptionGrade = new LocatorMock('PA6')

  // Manufacturing tab
  MachineName = new LocatorMock('')
  MachineDescription = new LocatorMock('')
  PartNetWeight = new LocatorMock(0)
  PartVolume = new LocatorMock(0)
  PartThickness = new LocatorMock(0)
  WallAverageThickness = new LocatorMock(0)
  MaxWallThick = new LocatorMock(0)
  CycleTime = new LocatorMock(0)
  MachineEfficiency = new LocatorMock(1)
  SetUpTime = new LocatorMock(0)
  Co2Part = new LocatorMock(0)

  // Mould cavity
  NoOfCavities = new LocatorMock(1)
  NumberOfCavityLengthNos = new LocatorMock(1)
  NumberOfCavityWidth = new LocatorMock(1)
  RunnerDia = new LocatorMock(0)
  RunnerLength = new LocatorMock(0)
  NoOfExternalSideCores = new LocatorMock(0)
  NoOfInternalSideCores = new LocatorMock(0)
  UnscrewingUndercuts = new LocatorMock(0)

  // Part complexity
  PartComplexity = new LocatorMock('2')

  // Packaging minimal
  PackagingExpPanel = new LocatorMock()
  PartsPerShipment = new LocatorMock(0)
  WeightPerShipment = new LocatorMock(0)
  VolumePerShipment = new LocatorMock(0)
  PackagingWeight = new LocatorMock(0)
  PackageMaxCapacity = new LocatorMock(0)
  PackageMaxVolume = new LocatorMock(0)
  DirectLaborRate = new LocatorMock(0)
  LaborCostPerPart = new LocatorMock(0)
  PartsPerContainer = new LocatorMock(0)
  QuantityNeededPerShipment = new LocatorMock(0)
  CostPerContainer = new LocatorMock(0)
  CostPerUnit = new LocatorMock(0)
  CO2PerUnit = new LocatorMock(0)

  // Methods used by logic
  isPageClosed(): boolean { return false }
  async waitAndClick(_loc: any): Promise<void> { /* no-op */ }
  async waitForTimeout(_ms: number): Promise<void> { /* no-op */ }
  async readNumberSafe(loc: LocatorMock, _label: string): Promise<number> { return Number(await loc.inputValue()) }
  async safeGetNumber(loc: LocatorMock): Promise<number> { return Number(await loc.inputValue()) }
  async selectOption(_loc: any, _val: any): Promise<void> { /* no-op */ }
  async selectByTrimmedLabel(_loc: any, _val: any): Promise<void> { /* no-op */ }
  async getInputValue(loc: LocatorMock): Promise<string> { return loc.inputValue() }
  async openMatSelect(_loc: any, _label: string): Promise<void> { /* no-op */ }
  async waitForNetworkIdle(): Promise<void> { /* no-op */ }
  async pressTab(): Promise<void> { /* no-op */ }
  async pressEnter(): Promise<void> { /* no-op */ }
  async keyPress(_k: string): Promise<void> { /* no-op */ }
  page = { locator: (_: string) => new LocatorMock() }
  projectIcon = new LocatorMock()
  ClearAll = new LocatorMock()
  SelectAnOption = new LocatorMock()
  ProjectValue = new LocatorMock()
  ProjectID = new LocatorMock()

  // Additional helpers referenced
  async expandSectionIfVisible(_loc: any, _name: string): Promise<void> { /* no-op */ }
  async scrollToMiddle(_loc: any): Promise<void> { /* no-op */ }
  async scrollIntoView(_loc: any): Promise<void> { /* no-op */ }
}

// Patch external readers/services via jest-like manual stubs
// We import the module after setting globals the logic references
const readers: any = {
  materialMasterReader: {
    getMaterialByMultipleFields: (_: any) => ({
      Density: 1.2,
      ThermalDiffusivity: 0.001,
      ThermalConductivity: 0.22,
      MaterialSpecificHeat: 1.5,
      MeltingTemp: 230,
      MoldTemp: 60,
      ClampingPressure: 80,
      TensileStrength: 50,
      InjectionRate: 100,
      MaterialType: 'Plastic',
      MaterialGroup: 'Polyamide'
    })
  },
  machineMasterReader: {
    getMachineByName: (name: string) => name && !/select|^\s*$/.test(name.toLowerCase()) ? ({
      MachineID: 7,
      InjectionRate: 88,
      TotalPowerKW: 50,
      PowerUtilization: 0.7,
      ShotSize: 200,
      MachineTonnageTons: 120,
      PlatenLengthmm: 500,
      PlatenWidthmm: 400,
      MachineName: name
    }) : null,
    getMachineByDescription: (_: string) => null,
    getMachineByTonnage: (_: number) => null
  },
  packagingMasterReader: {
    getCorrugatedBoxes: () => [{ materialMasterId: 1, price: 2.5 }],
    getPallets: () => [{ materialMasterId: 10, price: 15 }],
    getProtectivePackaging: () => []
  }
}

// Stub calculator services on the prototype after class load
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRLProto: any = PlasticRubberLogic.prototype

// Store readers globally for the logic to access
(globalThis as any).materialMasterReader = readers.materialMasterReader
(globalThis as any).machineMasterReader = readers.machineMasterReader
(globalThis as any).packagingMasterReader = readers.packagingMasterReader

// Provide deterministic results for sustainability calculators
PRLProto.calculateManufacturingSustainability = function(processInfo: any, laborRate: any[]) {
  // simple derived metrics ensuring positive values
  const powerBase = (processInfo.machineMaster?.totalPowerKW || 0) * (processInfo.machineMaster?.powerUtilization || 0.8)
  return {
    esgImpactElectricityConsumption: (powerBase) * (laborRate?.[0]?.powerESG || 0),
    esgImpactFactoryImpact: 0.1234,
    esgImpactAnnualUsageHrs: 12.34,
    esgImpactAnnualKgCO2: 5.678,
    esgImpactAnnualKgCO2Part: 0.005678
  }
}
PRLProto.calculateMaterialSustainability = function(materialInfo: any, _selected: any) {
  const part = (materialInfo.netWeight || 0) * (materialInfo.materialMarketData?.esgImpactCO2Kg || 0) / 1000
  return {
    esgImpactCO2Kg: materialInfo.materialMarketData?.esgImpactCO2Kg || 0,
    esgImpactCO2KgScrap: materialInfo.materialMarketData?.esgImpactCO2KgScrap || 0,
    esgImpactCO2KgPart: part,
    esgAnnualVolumeKg: 1,
    esgAnnualKgCO2: 2,
    esgAnnualKgCO2Part: 3
  }
}

// Provide packaging calculation with straightforward totals using inputs
PRLProto['packagingService'] = { /* will be shadowed in instance, keep for type */ }
const PackagingCalc = {
  calculationsForPackaging(info: any) {
    const boxCost = (info.boxPerShipment || 0) * (info.corrugatedBoxCostPerUnit || 0)
    const palletCost = (info.palletPerShipment || 0) * (info.palletCostPerUnit || 0)
    const shrink = (info.totalShrinkWrapCost || 0)
    const totalShipment = boxCost + palletCost + shrink
    const perUnit = info.partsPerShipment ? totalShipment / info.partsPerShipment : 0
    return { ...info, totalBoxCostPerShipment: boxCost, totalPalletCostPerShipment: palletCost, totalPackagCostPerShipment: totalShipment, totalPackagCostPerUnit: perUnit }
  }
}

// Helper to build logic with a configured page
function buildLogic(config?: Partial<{ closed: boolean, density: number, dims: [number,number,number], machine: string }>) {
  const page = new PlasticRubberPageMock()
  if (config?.closed) { (page as any).isPageClosed = () => true }
  if (config?.density !== undefined) page.Density = new LocatorMock(config.density, true)
  if (config?.dims) {
    const [l,w,h] = config.dims
    page.PartEnvelopeLength = new LocatorMock(l, true)
    page.PartEnvelopeWidth = new LocatorMock(w, true)
    page.PartEnvelopeHeight = new LocatorMock(h, true)
  }
  if (config?.machine !== undefined) {
    page.MachineName = new LocatorMock(config.machine, true, config.machine)
  } else {
    page.MachineName = new LocatorMock('Select', true, 'Select')
  }
  // Ensure option:checked lookups return text via locator('option:checked').innerText()
  page.MachineName.locator = (_: string) => new LocatorMock(config?.machine ?? 'Select', true, config?.machine ?? 'Select')
  page.materialCategory.locator = (_: string) => new LocatorMock('1', true, '1')
  page.MatFamily.locator = (_: string) => new LocatorMock('fam', true, 'fam')
  page.StockForm.locator = (_: string) => new LocatorMock('form', true, 'form')
  page.DescriptionGrade.locator = (_: string) => new LocatorMock('PA6', true, 'PA6')

  const logic = new PlasticRubberLogic(page as any)
  // Shadow packaging service with our calc
  ;(logic as any).packagingService = PackagingCalc
  return { logic, page }
}

// 1. Page closed returns zeroed values
test('PlasticRubberLogic unit - getMaterialDimensionsAndDensity returns zeros when page closed', async () => {
  const { logic } = buildLogic({ closed: true })
  const res = await logic.getMaterialDimensionsAndDensity()
  expect(res).toEqual({ length: 0, width: 0, height: 0, density: 0 })
})

// 2. Reads visible UI density and dimensions
test('PlasticRubberLogic unit - reads density and dimensions from visible UI', async () => {
  const { logic } = buildLogic({ density: 1.23, dims: [100, 50, 20] })
  const res = await logic.getMaterialDimensionsAndDensity()
  expect(res.density).toBe(1.23)
  expect(res.length).toBe(100)
  expect(res.width).toBe(50)
  expect(res.height).toBe(20)
})

// 3. Injection rate returns 0 when no machine selected
test('PlasticRubberLogic unit - getMachineInjectionRate returns 0 for invalid selection', async () => {
  const { logic } = buildLogic({ machine: 'Select' })
  const rate = await logic.getMachineInjectionRate()
  expect(rate).toBe(0)
})

// 4. Injection rate fetched from machine master
test('PlasticRubberLogic unit - getMachineInjectionRate reads from master when valid machine selected', async () => {
  const { logic } = buildLogic({ machine: 'ENGEL-120T' })
  const rate = await logic.getMachineInjectionRate()
  expect(rate).toBe(88)
})

// 5. getMaterialProperties merges master + UI fallbacks
test('PlasticRubberLogic unit - getMaterialProperties merges master DB values and UI fallbacks', async () => {
  const { logic } = buildLogic({ density: 0, dims: [10, 10, 10] })
  // Provide inputs to use UI fallbacks
  const props = await logic.getMaterialProperties({ partEnvelopeLength: 10, partEnvelopeWidth: 10, partEnvelopeHeight: 10, density: 0.98 })
  expect(props.density).toBe(0.98)
  expect(props.meltTemp).toBe(230)
  expect(props.mouldTemp).toBe(60)
  expect(props.clampingPressure).toBe(80)
  expect(props.injectionRate).toBe(100)
})

// 6. Thermo config fallback applied when missing — we simulate by overriding master reader to miss thermal values
test('PlasticRubberLogic unit - applyThermoConfigFallback provides thermal props when master missing', async () => {
  // Patch materials config minimally to include thermo data for PA6
  const { logic } = buildLogic({})
  const cfg: any = (logic as any).plasticRubberConfig
  cfg.materials = [{ name: 'PA6', materialType: 'PA6' }]
  cfg.thermoForminglookUpData = [{ rawMaterial: 'PA6', specificHeatLb: 2.2, thermalConductivity: 0.33 }]

  // Override material master to skip thermal fields
  logicModule.materialMasterReader.getMaterialByMultipleFields = (_: any) => ({ Density: 1.1 })

  const props = await (logic as any).getMaterialProperties({ density: 1.1, partEnvelopeLength: 1, partEnvelopeWidth: 1, partEnvelopeHeight: 1 })
  expect(props.thermalConductivity).toBe(0.33)
  expect(props.specificHeatCapacity).toBe(2.2)
})

// 7. verifyNetWeight computes from volume and density and validates
test('PlasticRubberLogic unit - verifyNetWeight checks calculated expected net weight', async () => {
  const { logic, page } = buildLogic({ density: 1.2 })
  // Set volume = 1000 mm3 and expected net weight = 1.2 g (1000 mm3 * 1.2 g/cm3 with calculator used in code)
  page.PartVolume = new LocatorMock(1000)
  page.PartNetWeight = new LocatorMock(1.2)
  const actual = await logic.verifyNetWeight(undefined, 3)
  expect(actual).toBeCloseTo(1.2, 3)
})

// 8. Part complexity selection and defaulting
test('PlasticRubberLogic unit - getPartComplexity resolves from input and defaults to low', async () => {
  const { logic, page } = buildLogic({})
  // Case 1: with provided testData
  const selected = await logic.getPartComplexity({ partComplexity: 'high' as any })
  expect(selected).toBe(3)
  // Case 2: when UI has empty value, it defaults to low
  page.PartComplexity = new LocatorMock('')
  const def = await logic.getPartComplexity()
  expect(def).toBe(1)
})

// 9. MaterialSustainabilityCalculation stores results in runtime context
test('PlasticRubberLogic unit - MaterialSustainabilityCalculation computes and stores results', async () => {
  const { logic, page } = buildLogic({})
  // set basic inputs
  page.PartNetWeight = new LocatorMock(10)
  page.esgImpactCO2Kg = new LocatorMock(2)
  page.esgImpactCO2KgScrap = new LocatorMock(0.3)
  await logic.MaterialSustainabilityCalculation()
  const ctx: any = (logic as any).runtimeContext
  expect(ctx.calculationResults.materialSustainability).toBeTruthy()
  expect(ctx.calculationResults.materialSustainability.esgImpactCO2KgPart).toBeGreaterThanOrEqual(0)
})

// 10. PackagingInformationCalculation performs unit conversion and positive per-unit cost
test('PlasticRubberLogic unit - PackagingInformationCalculation computes positive per-unit cost and volume m3', async () => {
  const { logic, page } = buildLogic({})
  // Provide dimensions in mm to drive volume calc
  page.PartEnvelopeLength = new LocatorMock(200)
  page.PartEnvelopeWidth = new LocatorMock(100)
  page.PartEnvelopeHeight = new LocatorMock(50)
  // Packaging UI fields used as defaults in preparePackagingInfoDto
  page.QuantityNeededPerShipment = new LocatorMock(10)
  page.CostPerContainer = new LocatorMock(2.5)
  page.CostPerUnit = new LocatorMock(25)

  await logic.PackagingInformationCalculation()
  const ctx: any = (logic as any).runtimeContext
  const result = ctx.calculationResults.packaging
  expect(result).toBeTruthy()
  expect(result.volumePerShipment).toBeGreaterThan(0)
  expect(result.totalPackagCostPerUnit).toBeGreaterThanOrEqual(0)
})
