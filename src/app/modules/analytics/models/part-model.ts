export class PartModel {
  projectInfoId: number;
  partInfoId: number;
  bomId: number;
  intPartNumber: string;
  intPartDescription: string;
  partQty: number;
  uom: string;
  level: number;
  name: string;
  eav?: number;
  partComplexity?: number;
  lotSize?: number;
  commodityId?: number;
  mfrCountryId?: number;
  paymentTermId: number;
  deliveryFrequency: number;
  packingModeId: number;
  lifeTimeQtyRemaining: number;
}
