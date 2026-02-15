export class PartInfoModel {
  partId!: number;
  intPartNumber!: string;
}

export class CommodityModel {
  id!: number;
  commodity!: string;
  commodityId!: string;
}

export class ProcessCommodityModel {
  id!: number;
  processId!: string;
  commodityId!: string;
  processName!: string;
}

export class MachineModel {
  id!: number;
  processTypeId!: string;
  machineName!: string;
}

export class PartInfoProcessModel {
  partNumber!: string;
  intPartDesc!: string;
  bomQty!: string;
  partComplexcity!: string;
  annualVolume!: string;
  supplierName!: string;
  lotSize!: string;
  supplyChainModel!: string;
  commdityValue!: string;
  processName!: string;
  packingType!: string;
  hsCode!: string;
  manufacturingCountry!: string;
  deliveryCountry!: string;
  incoTerms!: string;
  paymentTerms!: string;
}

export class MaterialInfoModel {
  materialGroup!: number;
  materialType!: string;
  materialDescription!: string;
  density!: number;
  matPrice!: number;
  scrapPrice!: number;
}
export class MaterialModel {
  Id!: number;
  part_Id!: string;
  materialNumber!: string;
}

export class PartInfoMachineModel {
  Id!: number;
  part_Id!: string;
  processNumber!: string;
}

export class MachineInfoModel {
  processTypeId!: number;
  machineId!: number;
  mhr!: number;
  setuphr!: number;
}
export class CatalogInfoModel {
  Id!: number;
  part_Id!: string;
  part_Name!: string;
  part_key!: string;
  part_cost!: string;
  qty!: number;
  ext_cost!: string;
  price_ref!: string;
}
