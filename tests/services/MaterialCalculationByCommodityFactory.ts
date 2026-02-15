
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';
import { MaterialMatalFormingCalculationService } from './material-hot-forging-closed-die-hot-calculator';
import { PlasticRubberCalculatorService } from './plastic-rubber-material';
import { SheetMetalCalculatorService } from './sheet-metal-calculator';
import { CommodityType } from '../utils/constants';
import { MaterialCastingCalculatorService } from './material-casting-calculator';
import { MaterialStockMachiningCalculatorService } from './material-stock-machining-calculator';
import { PartInfoDto } from 'src/app/shared/models';
import { ExtrusionCommodityService } from './ExtrusionCommodity';
import { MaterialCustomCableCalculatorService } from './material-custom-cable-calculator';
import { MaterialDefaultCalculatorService } from './material-default-calculator';

export class MaterialCalculationByCommodityFactory {
  constructor(
    private _materialInsulationJacketCalcService: MaterialInsulationJacketCalculatorService,
    private _materialMatalFormingService: MaterialMatalFormingCalculationService,
    private _plasticRubberService: PlasticRubberCalculatorService,
    private _sheetMetalService: SheetMetalCalculatorService,
    private _materialCastingCalcService: MaterialCastingCalculatorService,
    private _materialMachiningCalcService: MaterialStockMachiningCalculatorService,
    private _extrusionCommodityService: ExtrusionCommodityService,
    private _materialCustomCableService: MaterialCustomCableCalculatorService,
    private _materialDefaultCalculatorService: MaterialDefaultCalculatorService
  ) { }

  getCalculatorServiveByCommodity(partInfo: PartInfoDto): IMaterialCalculationByCommodity {
    switch (partInfo.commodityId) {
      case CommodityType.PlasticAndRubber:
        this._plasticRubberService.setCurrentPart(partInfo);
        return this._plasticRubberService;
      case CommodityType.SheetMetal:
        this._sheetMetalService.setCurrentPart(partInfo);
        return this._sheetMetalService;
      case CommodityType.Casting:
        this._materialCastingCalcService.setCurrentPart(partInfo);
        return this._materialCastingCalcService;
      case CommodityType.StockMachining:
        this._materialMachiningCalcService.setCurrentPart(partInfo);
        return this._materialMachiningCalcService;
      case CommodityType.MetalForming:
        this._materialMatalFormingService.setCurrentPart(partInfo);
        return this._materialMatalFormingService;
      case CommodityType.Extrusion:
        return this._extrusionCommodityService;
      case CommodityType.Electricals:
        return this._materialCustomCableService;
      case CommodityType.Assembly:
        this._materialInsulationJacketCalcService.setCurrentPart(partInfo);
        return this._materialInsulationJacketCalcService;

      default:
        this._materialDefaultCalculatorService.setCurrentPart(partInfo);
        return this._materialDefaultCalculatorService;
    }
  }
}
