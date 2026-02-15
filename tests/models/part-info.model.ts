import { OHPCategory, PackingMode, PartComplexity, PartType } from '../enums';
import { BillOfMaterialDto } from './bom.model';
import { DocumentCollectionDto } from './document-collection.model';
import { EeConversionCost } from './ee-conversion-cost.model';

type DigitalFactoryDtoNew = any;
type BuLocationDto = any;

export class PartInfoDto {
  constructor() {
    this.billOfMaterialPartInfos = [];
    this.conversionCosts = [];
  }

  partInfoId: number;
  projectInfoId: number;
  partInfoName?: string;
  intPartNumber?: string;
  intPartDescription?: string;
  partRevision?: string;
  makeBuy: number;
  partTypeId: PartType;
  costingMethodId?: number;
  costType: number;
  mfrCountryId: number;
  deliveryCountryId: number;
  supplierInfoId?: number;
  supplierRegionId?: number;
  buId?: number;
  buRegionId: number;
  supplierPartNumber?: string;
  termId: number;
  eav: number;
  lotSize: number;
  commodityId?: number;
  processTypeId: number;
  noOfShifts: number;
  currentBuyCost: number;
  partComplexity: PartComplexity;
  paymentTermId: number;
  hscode?: string;
  ohpcategory: OHPCategory;
  remarksAssumptions?: string;
  packingModeId: PackingMode;
  documentCollectionDto?: DocumentCollectionDto;
  documentCollectionId?: number;
  billOfMaterialPartInfos?: BillOfMaterialDto[];
  conversionCosts?: EeConversionCost[];
  dataCompletionPercentage: number;
  azureFileSharedId: string;
  deliveryFrequency: number;
  incoTerm?: string;
  buLocation?: BuLocationDto;
  vendorLocation?: DigitalFactoryDtoNew;
  originCity?: string;
  destinationCity: string;
  prodLifeRemaining?: number;
  lifeTimeQtyRemaining?: number;
  bomQty?: number;
  bomId?: number;
  drawingNumber?: string;
  scenarioId: number;
  scenarioName?: string;
  baseScenarioId: number;
  selected: boolean;
  dataExtractionStatus: number;
  dataExtractionPercentage: number;
  extractionCategoryId: number;
  materialDescription: string;
  materialEsg?: number;
  manufacturingEsg?: number;
  ismaterialEsgDirty?: boolean = false;
  ismanufacturingEsgDirty?: boolean = false;
}

export enum FileFormat {
  _3DXML = '3dxml',
  _3DS = '3ds',
  _3MF = '3mf',
  SAT = 'sat',
  SAB = 'sab',
  BREP = 'brep',
  CATPart = 'CATPart',
  CATProduct = 'CATProduct',
  DAE = 'dae',
  PRT = 'prt',
  ASM = 'asm',
  DXF = 'dxf',
  DWG = 'dwg',
  FBX = 'fbx',
  GLB = 'glb',
  GLTF = 'gltf',
  IFC = 'ifc',
  IGS = 'igs',
  IGES = 'iges',
  IPT = 'ipt',
  IAM = 'iam',
  JT = 'jt',
  OBJ = 'obj',
  X_T = 'x_t',
  X_B = 'x_b',
  XMT_TXT = 'xmt_txt',
  XMT_BIN = 'xmt_bin',
  XMP_TXT = 'xmp_txt',
  XMP_BIN = 'xmp_bin',
  PLY = 'ply',
  PRC = 'prc',
  RVT = 'rvt',
  _3DM = '3dm',
  PAR = 'par',
  PSM = 'psm',
  SLDPRT = 'sldprt',
  SLDSM = 'sldasm',
  STP = 'stp',
  STEP = 'step',
  STL = 'stl',
  U3D = 'u3d',
  USD = 'usd',
  USDA = 'usda',
  USDC = 'usdc',
  USDZ = 'usdz',
  WRL = 'wrl',
  X3D = 'x3d',
  TXT = 'txt',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  PDF = 'pdf',
  HTML = 'html',
  HTM = 'htm',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  ZIP = 'zip',
  RAR = 'rar',
  TAR = 'tar',
  GZ = 'gz',
  ISO = 'iso',
  SSV = 'ssv',
  JSON = 'json',
  TGZ = 'tgz',
}
