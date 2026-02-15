import { IncStatus } from '../enums/inc-trans';

export class CostSummaryDto {
  costSummaryId: number;
  partInfoId: number;
  materialCost: number; //material cost
  conversionCost: number; //manufacuring cost
  iccPer!: number;
  iccCost: number | 0;
  mohPer: number;
  mohCost: number | 0;
  fohPer: number;
  fohCost: number | 0;
  sgaPer: number;
  sgaCost: number | 0;
  profitPer: number;
  profitCost: number | 0;
  paymentTermsPer: number;
  paymentTermsCost: number | 0;
  packingCost: number;
  freightCost: number;
  dtper: number;
  dtcost: number; // dtcCost
  vmiCost: number;
  fgiccPer: number;
  fgiccCost: number;
  grossMargin: number;
  currMaterialCost: number;
  currConversionCost: number;
  currOhpCost: number;
  currPackingCost: number;
  currDTCost: number;
  currFreightCost: number;
  incStatus: IncStatus;
  ohpCost: number; //overhead cost
  shouldCost: number;
  opportunityCost: number;
  comments: string;
  costingNotes: string;
}

export class RefreshCostSummaryDto {
  partId: string;
  iccPercentage: string;
  materialOHPercentage: string;
  factoryOHPercentage: string;
  sgAndPercentage: string;
  profitPercentage: string;
  paymentTermsPercentage: string;
}

export class ViewCostSummaryDto {
  costSummaryId: number;
  partInfoId: number;
  sumNetMatCost: number;
  sumBillOfMaterial: number;
  sumNetProcessCost: number;
  sumOverHeadCost: number;
  sumManufacturingCost: number;
  unitAmount: number;
  packingCost: number;
  comments: string;
  freightCost: number;
  currMaterialCost: number;
  toolingCost: number;
  dutiesTariffCost: number;
  platingCost: number;
  purchasePartCost: number;
  costingNotes: string;
  nestingNotes: string;
  suggestedCategoryNotes: string;
  materialSustainabilityPart: number;
  manufactureSustainabilityPart: number;
  packageSustainabilityPart: number;
  logisticsSustainabilityPart: number;
  sustainabilityAnnualNos: number;
}

export class Data {
  accuracy?: number;
  keyword?: string;
  mlLayer1?: string;
  colour?: string;
  ml_match?: string;
  similar_match_from_db?: string;
}

export interface ManufacturingCategory {
  manufacturing_category: string;
  manufacturing_category_confidence: number;
  sketch_specification: string;
  summary: string;
  thickness_of_part: string;
}

export class NestingNotesDto {
  processType?: string;
  sheetLength?: string;
  sheetWidth?: string;
  count?: string;
  smallestParts?: string;
  utilisation?: string;
  xUtilDim?: string;
  yUtilDim?: string;
}

export class AICategoryDto {
  averageScore: number;
  category: string;
  highestScore: number;
  totalScore: number;
  totalSimilarMatchCount: number;
}
export class WiringHarnessDrawingInfo {
  drawing_number?: string;
  part_number?: string;
  revision_number?: string;
}

export class CableHarnessInfo {
  unit_of_measurement?: string;
  confidence?: number;
  manufacturing_description?: string;
  manufacturing_part_number?: string;
  name?: string;
  quantity_of_manufacturing_part_number?: number;
}
export interface WiringHarness {
  'Drawing number/revision number/part number'?: WiringHarnessDrawingInfo;
  cableHarnessInfo?: CableHarnessInfo[];
  technical_req?: string[];
}

export interface DrillingDetails {
  drill_size?: string;
  drill_type?: string;
  hole_count?: string;
}

export interface PcbMaterialInfo {
  core?: any;
  prepeg?: any;
}
export interface PcbInfo {
  depaneling_method?: string;
  drilling_details?: DrillingDetails[];
  impedance_control?: any;
  ipc_class?: any;
  laminate?: any;
  material?: PcbMaterialInfo;
  number_of_copper_layers?: string;
  overall_thickness?: string;
  pcb_dimension?: string;
  silkscreen?: any;
  soldermask?: any;
  stackup_technology?: string;
  surface_finish?: string;
  via_plug?: any;
}

export interface PdfExtractionDto {
  ProcessSteps?: ProcessSteps;
  generic_info?: GenericInfo[];
  manufacturingCategory?: ManufacturingCategory;
  manufacturing_category_from_pdf_aux?: string;
  WiringHarness?: WiringHarness;
  PCB?: PcbInfo;
}

export interface ProcessSteps {
  color?: string;
  color_confidence?: number;
  material?: string;
  material_confidence?: number;
  primary_process?: string;
  primary_process_confidence?: number;
  process_group?: ProcessGroup;
  secondary_process_steps?: string;
}

export interface ProcessGroup {
  confidence?: number;
  name?: string;
  reason?: string;
}

export interface GenericInfo {
  category?: string;
  data?: GenericInfoData;
}

export interface GenericInfoData {
  accuracy?: number;
  colour?: string | null;
  'keyword ': string;
  mlLayer1?: string;
  ml_match?: any;
  similar_match_from_db?: string;
}

export interface ManufacturingCategory {
  manufacturing_category: string;
  manufacturing_category_confidence: number;
  sketch_specification: string;
  summary: string;
  thickness_of_part: string;
}
