import { TestConfig, ProjectData } from './config'
import { PartInformation, PartDetails } from './part'
import {
	SupplyTerms,
	MaterialInformation,
	MaterialCostDetails
} from './supply_material'
import { WeldingDetails, testWeldData, SubProcessDetails } from './welding'
import {
	ManufacturingInformation,
	MachineDetails,
	CycleTimeDetails,
	ManufacturingDetails
} from './manufacturing'
import { SustainabilityMaterial, SustainabilityManufacturing } from './sustainability'
import { CostSummary, Opportunity, ESG } from './costs'
import { ExpectedValues } from './expected'
import { DropdownOptions } from './dropdownOptions'
import { SpecificManufacturingScenario } from './scenarios'

export const MigWeldingTestData = {
	config: TestConfig,
	project: ProjectData,
	partInformation: PartInformation,
	supplyTerms: SupplyTerms,
	materialInformation: MaterialInformation,
	partDetails: PartDetails,
	weldingDetails: WeldingDetails,
	testWeldData: testWeldData,
	materialCostDetails: MaterialCostDetails,
	sustainabilityMaterial: SustainabilityMaterial,
	manufacturingInformation: ManufacturingInformation,
	machineDetails: MachineDetails,
	cycleTimeDetails: CycleTimeDetails,
	subProcessDetails: SubProcessDetails,
	manufacturingDetails: ManufacturingDetails,
	sustainabilityManufacturing: SustainabilityManufacturing,
	costSummary: CostSummary,
	opportunity: Opportunity,
	esg: ESG,
	expectedValues: ExpectedValues,
	dropdownOptions: DropdownOptions,
	specificManufacturingScenario: SpecificManufacturingScenario
}

export default MigWeldingTestData
