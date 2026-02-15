import { MaterialPriceDto } from '../packaging-info.model';

export class PackagingSimulationModel {
  totalBoxCostperShipment: number;
  totalPalletCostperShipment: number;
  totalShrinkWrapCost: number;
  totalPackagingCostperShipment: number;
  totalPackagingCostperPart: number;
}

export class GetMaterialPriceByCountryModel {
  corrugatedBoxList: MaterialPriceDto[];
  palletList: MaterialPriceDto[];
  protectList: MaterialPriceDto[];
  boxType: number;
  totalPackagingCostperPart: number;
}
