import { Injectable, effect } from '@angular/core';
import { MaterialInfoDto, MaterialMasterDto, PartInfoDto, VendorDto } from 'src/app/shared/models';
import { CostingConfig, PrimaryProcessType } from '../costing.config';
import { Observable, Subject } from 'rxjs';
import { SharedService } from './shared.service';
// import { PartInfoState } from '../../_state/part-info.state';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { VendorService } from '../../data/Service/vendor.service';
import { AnnualRevenueTypeEnum, AnnualRevenueTypeNameMap, PartComplexity, StampingMaterialLookUpCatEnum } from 'src/app/shared/enums';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { StampingMetrialLookUpState } from '../../_state/stamping-material-lookup.state';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { MaterialTubeBendingCalculationService } from './material-tube-bending-calculator.service';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';
import { MaterialBrazingCalculatorService } from './material-brazing-calculator.service';
import { MaterialPlasticTubeExtrusionCalculatorService } from './material-plastic-tube-extrusion-calculator.service';
import { MaterialPlasticVacuumFormingCalculatorService } from './material-plastic-vacuum-forming-calculator.service';
import { MaterialMatalFormingCalculationService } from './material-hot-forging-closed-die-hot-calculator.service';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';
import { MaterialSustainabilityCalculationService } from './material-sustainability-calculator.service';
import { MaterialRigidFlexCalculationService } from './material-rigid-flex-calculator';
import { PlasticRubberCalculatorService } from './plastic-rubber-material.service';
import { SheetMetalCalculatorService } from './sheet-metal-calculator.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialCalculatorService {
  _stampingMetrialLookUpData: StampingMetrialLookUp[] = [];
  currentPart: PartInfoDto;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  vendorDto: VendorDto[] = [];
  // _partInfo$: Observable<PartInfoDto>;
  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;
  private partInfoEffect = effect(() => {
    const partInfo = this.partInfoSignalsService.partInfo();
    if (partInfo) {
      this.currentPart = { ...partInfo };
    }
  });
  constructor(
    private shareService: SharedService,
    private vendorService: VendorService,
    private costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    public _materialTubeBendingCalcService: MaterialTubeBendingCalculationService,
    public _materialInsulationJacketCalcService: MaterialInsulationJacketCalculatorService,
    public _materialBrazingCalcService: MaterialBrazingCalculatorService,
    public _materialPlasticTubeExtrusion: MaterialPlasticTubeExtrusionCalculatorService,
    public _materialPlasticVacuumForming: MaterialPlasticVacuumFormingCalculatorService,
    public _materialHotForgingClosedDieHotCalcService: MaterialMatalFormingCalculationService,
    public _sheetMetalConfig: SheetMetalConfigService,
    public _materialSustainabilityCalcService: MaterialSustainabilityCalculationService,
    public _materialRigidFlexCalcService: MaterialRigidFlexCalculationService,
    public _plasticService: PlasticRubberCalculatorService,
    public _sheetMetalService: SheetMetalCalculatorService,
    private store: Store,
    private partInfoSignalsService: PartInfoSignalsService
  ) {
    // this._partInfo$ = this.store.select(PartInfoState.getPartInfo);
    this._stampingMetrialLookUp$ = this.store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
    this._stampingMetrialLookUp$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response) => {
      if (response && response.length > 0) {
        this._stampingMetrialLookUpData = response;
      }
    });
  }

  public calculationsForColdForgingColdHeading(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): Observable<MaterialInfoDto> {
    if (materialInfo.isCoilDiameterDirty && materialInfo.coilDiameter != null) {
      materialInfo.coilDiameter = Number(materialInfo.coilDiameter);
    } else {
      materialInfo.coilDiameter = 5;
    }

    if (materialInfo.isCoilLengthDirty && materialInfo.coilLength != null) {
      materialInfo.coilLength = Number(materialInfo.coilLength);
    } else {
      materialInfo.coilLength = 300000;
    }

    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.stockForm == 'Round Bar') {
        netWeight = this.isValidNumber(
          Number(3.14) * Number(materialInfo.partOuterDiameter / 2) * Number(materialInfo.partOuterDiameter / 2) * Number(materialInfo.dimX) * Number(materialInfo.density) * Math.pow(10, -3)
        );
      }
      if (materialInfo.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    const partStockLength = this.isValidNumber((materialInfo.netWeight / (materialInfo.density * (3.14 / 4) * Math.pow(materialInfo.coilDiameter, 2))) * Math.pow(10, 3));
    materialInfo.partStockLength = partStockLength;

    const totalPartStockLength = Number(partStockLength) + Number(materialInfo.cuttingAllowance);
    materialInfo.totalPartStockLength = totalPartStockLength;

    const partsPerCoil = this.isValidNumber(Math.round((Number(materialInfo.coilLength) - Number(materialInfo.enterStartEndScrapLength)) / Number(totalPartStockLength)));
    materialInfo.partsPerCoil = partsPerCoil;
    let coilWeight = 0;
    coilWeight = this.isValidNumber((3.14 / 4) * Math.pow(Number(materialInfo.coilDiameter), 2) * Number(materialInfo.coilLength) * Number(materialInfo.density) * Math.pow(10, -3));
    materialInfo.coilWeight = coilWeight;

    if (materialInfo.isPartProjectedAreaDirty && materialInfo.partProjectedArea != null) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      if (materialInfo.stockForm == 'Round Bar') {
        materialInfo.partProjectedArea = Number(materialInfo.dimX) * Number(materialInfo.partOuterDiameter);
      }
      materialInfo.partProjectedArea = this.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterial?.partProjectedArea : materialInfo.partProjectedArea;
    }

    let partVolume = 0;
    if (materialInfo.isPartVolumeDirty && materialInfo.partVolume != null) {
      partVolume = Number(materialInfo.partVolume);
    } else {
      if (materialInfo.stockForm == 'Round Bar') {
        partVolume = this.isValidNumber(3.14 * Number(materialInfo.partOuterDiameter / 2) * Number(materialInfo.partOuterDiameter / 2) * Number(materialInfo.dimX));
      }
      if (materialInfo?.partVolume != null) {
        partVolume = this.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterial?.partVolume : partVolume;
      }
    }
    materialInfo.partVolume = partVolume;

    let stockDiameter = 0;
    if (materialInfo.isStockDiameterDirty && materialInfo.stockDiameter != null) {
      stockDiameter = Number(materialInfo.stockDiameter);
    } else {
      // stockDiameter = this.isValidNumber(Number(materialInfo.partOuterDiameter) + (Number(materialInfo.partOuterDiameter) * Number(materialInfo.lengthAllowance / 100)));
      stockDiameter = Number(materialInfo.partOuterDiameter);
      if (materialInfo?.stockDiameter != null) {
        stockDiameter = this.checkDirtyProperty('stockDiameter', fieldColorsList) ? selectedMaterial?.stockDiameter : stockDiameter;
      }
    }
    materialInfo.stockDiameter = stockDiameter;

    let stockLength = 0;
    if (materialInfo.isStockLengthDirty && materialInfo.blockLength != null) {
      stockLength = Number(materialInfo.blockLength);
    } else {
      stockLength = this.isValidNumber(Number(materialInfo.dimX) + Number(materialInfo.dimX) * Number(materialInfo.widthAllowance / 100));

      if (materialInfo?.blockLength != null) {
        stockLength = this.checkDirtyProperty('blockLength', fieldColorsList) ? selectedMaterial?.blockLength : stockLength;
      }
    }
    materialInfo.stockLength = stockLength;
    materialInfo.grossWeight = this.isValidNumber(Number(coilWeight) / Number(partsPerCoil));

    if (materialInfo.stockForm == 'Round Bar') {
      materialInfo.grossWeight = this.isValidNumber(
        3.14 * (Number(materialInfo.stockDiameter / 2) * Number(materialInfo.stockDiameter / 2) * Number(materialInfo.stockLength) * Number(materialInfo.density)) * Math.pow(10, -3)
      );
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.isValidNumber((Number(materialInfo.netWeight) / materialInfo.grossWeight) * 100);
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }
    const grossMaterialCost = this.isValidNumber((materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
    materialInfo.materialCostPart = grossMaterialCost;
    const scrapRecCost = this.isValidNumber((materialInfo.scrapWeight / 1000) * (Number(materialInfo.scrapRecovery) / 100) * Number(materialInfo.scrapPricePerKg));
    materialInfo.scrapRecCost = scrapRecCost;
    materialInfo.netMatCost = Number(grossMaterialCost) - Number(scrapRecCost);
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo); // commenting now to test new logic, will removed later

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public calculationsForWelding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo?.netWeight) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    const angleInDegrees: number = 45;
    if (materialInfo.processId === PrimaryProcessType.StickWelding) {
      materialInfo.weldLegLength = Number(materialInfo.dimX) > Number(materialInfo.dimY) ? materialInfo.dimX : materialInfo.dimY;
    } else {
      materialInfo.weldLegLength = Math.sqrt(2) * (materialInfo.dimY / Math.cos(angleInDegrees));
    }

    if (materialInfo.iswireDiameterDirty && !!materialInfo.wireDiameter) {
      materialInfo.wireDiameter = Number(materialInfo.wireDiameter);
    } else {
      let wireDiameter = 0;
      if (materialInfo.processId === PrimaryProcessType.StickWelding) {
        wireDiameter = this.costingConfig.weldingValuesForStickWelding().find((x) => x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter;
      } else if (materialInfo.processId === PrimaryProcessType.TigWelding) {
        wireDiameter = this.costingConfig.tigWeldingValuesForMachineType().find((x) => x.id == 3 && x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter; // 3 is manual
      } else {
        wireDiameter = this.costingConfig.weldingValuesForMachineType().find((x) => x.id == 3 && x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter;
      }
      // let wireDiameter = this.shareService.isValidNumber(weldingValues?.WireDiameter);
      if (materialInfo.wireDiameter) {
        wireDiameter = this.checkDirtyProperty('wireDiameter', fieldColorsList) ? selectedMaterialInfo?.wireDiameter : wireDiameter;
      }
      materialInfo.wireDiameter = wireDiameter;
    }

    if (materialInfo.isPartProjectedAreaDirty && materialInfo.partProjectedArea != null) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      let projectedArea = 0;
      if (materialInfo.typeOfWeld == 1 || materialInfo.typeOfWeld == 2) {
        projectedArea = (Number(materialInfo.dimY) * Number(materialInfo.dimZ)) / 2;
      } else if (materialInfo.typeOfWeld == 3) {
        projectedArea = Number(materialInfo.dimY) * Number(materialInfo.dimZ) + Number(materialInfo.partTickness * 1);
      } else if (materialInfo.typeOfWeld == 4) {
        projectedArea = (Number(materialInfo.dimY) * Number(materialInfo.dimZ) + Number(materialInfo.partTickness * 1)) / 2;
      }

      if (materialInfo.partProjectedArea != null) {
        projectedArea = this.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : projectedArea;
      }
      materialInfo.partProjectedArea = projectedArea;
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {
      let partVolume = materialInfo.dimX * materialInfo.partProjectedArea;
      if (materialInfo.partVolume) {
        partVolume = this.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
      }
      materialInfo.partVolume = partVolume;
    }

    let effeciency = 75;
    if (materialInfo.isEffeciencyDirty && !!materialInfo.effeciency) {
      effeciency = materialInfo.effeciency;
    } else {
      effeciency = this.checkDirtyProperty('effeciency', fieldColorsList) ? selectedMaterialInfo?.effeciency : effeciency;
    }
    materialInfo.effeciency = effeciency;

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      // Weld Material Weight
      grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
    }
    materialInfo.grossWeight = grossWeight;

    let weldWeightWastage = 0;
    if (materialInfo.isWeldWeightWastageDirty && !!materialInfo.weldWeightWastage) {
      weldWeightWastage = Number(materialInfo.weldWeightWastage);
    } else {
      weldWeightWastage = this.isValidNumber((materialInfo.grossWeight * 100) / effeciency);
      if (materialInfo?.weldWeightWastage) {
        weldWeightWastage = this.checkDirtyProperty('weldWeightWastage', fieldColorsList) ? selectedMaterialInfo?.weldWeightWastage : weldWeightWastage;
      }
    }
    materialInfo.weldWeightWastage = weldWeightWastage;
    materialInfo.netMatCost = this.isValidNumber(weldWeightWastage / 1000) * Number(materialInfo.materialPricePerKg);
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);
    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  calculationForForging(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.isValidNumber(Number(materialInfo.partVolume) * Number(materialInfo?.density) * Math.pow(10, -3));
      if (materialInfo?.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    let stockDiameter = 0;
    if (materialInfo.isStockDiameterDirty && materialInfo.stockDiameter != null) {
      stockDiameter = Number(materialInfo.stockDiameter);
    } else {
      stockDiameter = Number(materialInfo.inputBilletDiameter);
      if (materialInfo?.stockDiameter != null) {
        stockDiameter = this.checkDirtyProperty('stockDiameter', fieldColorsList) ? selectedMaterialInfo?.stockDiameter : stockDiameter;
      }
    }
    materialInfo.stockDiameter = stockDiameter;

    let stockLength = 0;
    if (materialInfo.isStockLengthDirty && materialInfo.blockLength != null) {
      stockLength = Number(materialInfo.blockLength);
    } else {
      stockLength = this.isValidNumber(Number(materialInfo.inputBilletLength) + Number(materialInfo.cuttingAllowance));
      if (materialInfo?.blockLength != null) {
        stockLength = this.checkDirtyProperty('blockLength', fieldColorsList) ? selectedMaterialInfo?.blockLength : stockLength;
      }
    }
    materialInfo.stockLength = stockLength;
    materialInfo.blockLength = stockLength;

    let stockHeight = 0;
    if (materialInfo.isStockHeightDirty && materialInfo.blockHeight != null) {
      stockHeight = Number(materialInfo.blockHeight);
    } else {
      stockHeight = this.isValidNumber(Number(materialInfo.inputBilletHeight));
      if (materialInfo?.blockHeight != null) {
        stockHeight = this.checkDirtyProperty('blockHeight', fieldColorsList) ? selectedMaterialInfo?.blockHeight : stockHeight;
      }
    }
    materialInfo.stockHeight = stockHeight;
    materialInfo.blockHeight = stockHeight;

    let stockWidth = 0;
    if (materialInfo.isStockWidthDirty && materialInfo.blockWidth != null) {
      stockWidth = materialInfo.blockWidth;
    } else {
      stockWidth = this.isValidNumber(Number(materialInfo.inputBilletWidth));
      if (materialInfo?.blockWidth != null) {
        stockWidth = this.checkDirtyProperty('blockWidth', fieldColorsList) ? selectedMaterialInfo?.blockWidth : stockWidth;
      }
    }
    materialInfo.stockWidth = stockWidth;
    materialInfo.blockWidth = stockWidth;
    let grossWeight = this.isValidNumber(Number(materialInfo.density) * (Number(stockLength) * Number(stockWidth) * Number(stockHeight)) * Math.pow(10, -3));

    if (materialInfo.stockForm == 'Round Bar') {
      grossWeight = this.isValidNumber(
        3.14 * (Number(materialInfo.stockDiameter / 2) * Number(materialInfo.stockDiameter / 2) * Number(materialInfo.stockLength) * Number(materialInfo.density)) * Math.pow(10, -3)
      );
    }
    materialInfo.grossWeight = grossWeight;

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      scrapWeight = materialInfo.scrapWeight;
    } else {
      scrapWeight = Number(grossWeight) - Number(materialInfo.netWeight);
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
    }
    materialInfo.scrapWeight = scrapWeight;

    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.isValidNumber((Number(materialInfo.netWeight) / Number(grossWeight)) * 100);
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }
    const grossMaterialCost = this.isValidNumber((grossWeight * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.materialCostPart = grossMaterialCost;

    const scrapRecCost = (Number(scrapWeight) * Number(materialInfo.scrapPricePerKg) * (Number(materialInfo.scrapRecovery) / 100)) / 1000;
    materialInfo.scrapRecCost = scrapRecCost;
    materialInfo.netMatCost = Number(grossMaterialCost) - Number(scrapRecCost);
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  calculationForHotForgingClosedDie(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto, currentPart: PartInfoDto): Observable<MaterialInfoDto> {
    //Net (Forging)Part Weight (g / part):
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      if (materialInfo?.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    //Material Utilization Ratio:
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0.95;
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    //Diameter

    let stockOuterDiameter = 0;
    if (materialInfo.isInputBilletDiameterDirty && materialInfo.inputBilletDiameter != null) {
      materialInfo.inputBilletDiameter = Number(materialInfo.inputBilletDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.inputBilletDiameter);
      if (materialInfo?.inputBilletDiameter != null) {
        stockOuterDiameter = this.checkDirtyProperty('inputBilletDiameter', fieldColorsList) ? selectedMaterialInfo?.inputBilletDiameter : stockOuterDiameter;
      }
      materialInfo.inputBilletDiameter = stockOuterDiameter;
    }

    if (materialInfo.isStockOuterDiameterDirty && materialInfo.stockOuterDiameter != null) {
      materialInfo.stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
      if (materialInfo?.stockOuterDiameter != null) {
        stockOuterDiameter = this.checkDirtyProperty('stockOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.stockOuterDiameter : stockOuterDiameter;
      }
      materialInfo.stockOuterDiameter = stockOuterDiameter;
    }

    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      stockOuterDiameter = materialInfo.stockOuterDiameter;
    } else if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      stockOuterDiameter = materialInfo.inputBilletDiameter;
    }

    //Cutting Loss mm^3
    if (materialInfo.stockForm === 'Round Bar') {
      const divided = this.shareService.isValidNumber(Number(stockOuterDiameter / 2));
      materialInfo.cuttingLoss = this.shareService.isValidNumber(3.142 * Number(Math.pow(divided, 2)) * 1);
    } else {
      materialInfo.cuttingLoss = this.shareService.isValidNumber(Number(materialInfo.stockWidth * materialInfo.stockHeight * 1));
    }

    //flash volume
    let flashVolume = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      const complexity = currentPart?.partComplexity;

      let widthGutter = 0;
      if (complexity === PartComplexity.High) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1?.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].cmplexb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].complexb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.isValidNumber(Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter));
        }
      }

      if (complexity === PartComplexity.Medium) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.isValidNumber(Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter));
        }
      }
    } else {
      flashVolume = 0;
    }

    if (materialInfo.isFlashVolumeDirty && materialInfo.flashVolume != null) {
      materialInfo.flashVolume = Number(materialInfo.flashVolume);
    } else {
      if (materialInfo?.flashVolume != null) {
        flashVolume = this.checkDirtyProperty('flashVolume', fieldColorsList) ? selectedMaterialInfo?.flashVolume : flashVolume;
      }
      materialInfo.flashVolume = flashVolume;
    }

    //Scale loss
    let scaleloss = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      scaleloss = this.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.partVolume)) * 0.03);
    } else {
      scaleloss = this.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)) * 0.03);
    }
    if (materialInfo.isScaleLossDirty && materialInfo.scaleLoss != null) {
      materialInfo.scaleLoss = Number(materialInfo.scaleLoss);
    } else {
      if (materialInfo?.scaleLoss != null) {
        scaleloss = this.checkDirtyProperty('scaleLoss', fieldColorsList) ? selectedMaterialInfo?.scaleLoss : scaleloss;
      }
      materialInfo.scaleLoss = scaleloss;
    }

    //Gross Volume

    materialInfo.grossVolumne = this.shareService.isValidNumber(
      Number(materialInfo?.scaleLoss) + Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)
    );

    //Stock Length / Billet Bar length
    let blockLength = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      if (materialInfo.isBlockLengthDirty && materialInfo.blockLength != null) {
        materialInfo.blockLength = Number(materialInfo.blockLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.blockLength != null) {
          blockLength = this.checkDirtyProperty('blockLength', fieldColorsList) ? selectedMaterialInfo?.blockLength : blockLength;
        }
        materialInfo.blockLength = blockLength;
      }
    }
    if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      // Billet Bar length
      if (materialInfo.isInputBilletLengthDirty && materialInfo.inputBilletLength != null) {
        materialInfo.blockLength = Number(materialInfo.inputBilletLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.inputBilletLength != null) {
          blockLength = this.checkDirtyProperty('inputBilletLength', fieldColorsList) ? selectedMaterialInfo?.inputBilletLength : blockLength;
        }
        materialInfo.inputBilletLength = blockLength;
      }
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.isValidNumber(Number(materialInfo.grossVolumne) * (Number(materialInfo.density) / 1000));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      scrapWeight = this.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    let totalCostOfRawMaterials = 0;
    if (materialInfo.isTotalCostOfRawMaterialsDirty && materialInfo.totalCostOfRawMaterials != null) {
      materialInfo.totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    } else {
      totalCostOfRawMaterials = this.isValidNumber(Number((materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg)));
      if (materialInfo?.totalCostOfRawMaterials != null) {
        totalCostOfRawMaterials = this.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
      }
      materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    }

    let yeildUtilization = 0;
    if (materialInfo.isYeildUtilizationDirty && materialInfo.yeildUtilization != null) {
      materialInfo.yeildUtilization = Number(materialInfo.yeildUtilization);
    } else {
      yeildUtilization = this.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo?.yeildUtilization != null) {
        yeildUtilization = this.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : yeildUtilization;
      }
      materialInfo.yeildUtilization = yeildUtilization;
    }

    let scrapRecCost = 0;
    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
        scrapRecCost = this.shareService.isValidNumber(((((materialInfo.cuttingLoss + materialInfo.flashVolume) / 1000) * materialInfo.density) / 1000) * materialInfo.scrapPricePerKg);
      } else {
        scrapRecCost = this.shareService.isValidNumber(
          // this.isValidNumber(
          //   ((
          //     (Number(materialInfo.grossWeight) - Number(materialInfo.scaleLoss)) -
          //     materialInfo.netWeight)
          //     / 1000
          //   )) * materialInfo.scrapPricePerKg
          (materialInfo.scrapWeight / 1000) * materialInfo.scrapPricePerKg
        );
      }
      if (materialInfo?.scrapRecCost != null) {
        scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapRecCost : scrapRecCost;
      }
      materialInfo.scrapRecCost = scrapRecCost;
    }

    materialInfo.netMatCost = this.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public calculationForColdForging(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    //Net (Forging)Part Weight (g / part):
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      //if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
      netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      //}
      // else {
      //   netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)));
      // }
      if (materialInfo?.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    //Material Utilization Ratio:
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0.95;
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    //Raw Material Diameter (mm)
    let stockOuterDiameter = 0;
    if (materialInfo.isStockDiameterDirty && materialInfo.stockDiameter != null) {
      stockOuterDiameter = Number(materialInfo.stockDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.stockDiameter);
      if (materialInfo?.stockDiameter != null) {
        stockOuterDiameter = this.shareService.checkDirtyProperty('stockDiameter', fieldColorsList) ? selectedMaterialInfo?.stockDiameter : stockOuterDiameter;
      }
      materialInfo.stockDiameter = stockOuterDiameter;
    }

    //cutting Loss
    // if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
    //   materialInfo.cuttingLoss = this.shareService.isValidNumber((3.142 * this.isValidNumber(Number(Math.pow(Number(stockOuterDiameter / 2), 2) * 1)) * Number(materialInfo.density)) / 1000);
    // } else {
    materialInfo.cuttingLoss = this.shareService.isValidNumber((3.142 * this.isValidNumber(Number(Math.pow(Number(stockOuterDiameter / 2), 2) * 1)) * Number(materialInfo.density)) / 1000);
    // }
    //Coil end loss (gm)
    //Need to check
    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight != null) {
      materialInfo.unbendPartWeight = this.shareService.isValidNumber(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = 0;
      if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
        unbendPartWeight = this.shareService.isValidNumber(((Math.pow(Number(materialInfo.density), 2) * 3.142) / 4) * 2000 * this.shareService.isValidNumber(stockOuterDiameter / 1000));
      } else {
        unbendPartWeight = this.shareService.isValidNumber(((Math.pow(Number(materialInfo.density), 2) * 3.142) / 4) * 1000 * this.shareService.isValidNumber(stockOuterDiameter / 1000));
      }
      if (materialInfo?.unbendPartWeight != null) {
        materialInfo.unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterialInfo?.unbendPartWeight : materialInfo.unbendPartWeight;
      }
      materialInfo.unbendPartWeight = unbendPartWeight;
    }

    //Coil Weight(in Tonne) cold forging
    if (materialInfo.isVolumePurchasedDirty && materialInfo.volumePurchased != null) {
      materialInfo.volumePurchased = this.shareService.isValidNumber(materialInfo.volumePurchased);
    } else {
      const volumePurchased = 2;
      if (materialInfo?.volumePurchased != null) {
        materialInfo.volumePurchased = this.checkDirtyProperty('volumePurchased', fieldColorsList) ? selectedMaterialInfo?.volumePurchased : volumePurchased;
      }
    }

    //No of Parts Produced per Coil
    if (materialInfo.isPartsPerCoilDirty && materialInfo.partsPerCoil != null) {
      materialInfo.partsPerCoil = this.shareService.isValidNumber(materialInfo.partsPerCoil);
    } else {
      const partsPerCoil = this.shareService.isValidNumber(Math.round((materialInfo.volumePurchased * 1000000 - materialInfo.unbendPartWeight) / materialInfo.netWeight));

      if (materialInfo?.partsPerCoil != null) {
        materialInfo.partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : partsPerCoil;
      }
      materialInfo.partsPerCoil = partsPerCoil;
    }

    //Coil End loss Per part (gm)
    if (materialInfo.isWeldWeightWastageDirty && materialInfo.weldWeightWastage != null) {
      materialInfo.weldWeightWastage = this.shareService.isValidNumber(materialInfo.weldWeightWastage);
    } else {
      const endLoss = this.shareService.isValidNumber(materialInfo.unbendPartWeight / materialInfo.partsPerCoil);

      if (materialInfo?.weldWeightWastage != null) {
        materialInfo.weldWeightWastage = this.checkDirtyProperty('weldWeightWastage', fieldColorsList) ? selectedMaterialInfo?.weldWeightWastage : materialInfo.weldWeightWastage;
      }
      materialInfo.weldWeightWastage = endLoss;
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.isValidNumber(Number(materialInfo.weldWeightWastage) + Number(materialInfo.netWeight) + Number(materialInfo.cuttingLoss));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      scrapWeight = this.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }
    //Length of raw material
    if (materialInfo?.grossWeight != null) {
      materialInfo.sheetLength = this.shareService.isValidNumber((materialInfo.grossWeight * 1000) / materialInfo.density / (3.142 * Math.pow(Number(stockOuterDiameter / 2), 2)));
    }

    let totalCostOfRawMaterials = 0;
    if (materialInfo.isTotalCostOfRawMaterialsDirty && materialInfo.totalCostOfRawMaterials != null) {
      totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    } else {
      totalCostOfRawMaterials = this.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
      if (materialInfo?.totalCostOfRawMaterials != null) {
        totalCostOfRawMaterials = this.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
      }
      materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    }

    let yeildUtilization = 0;
    if (materialInfo.yeildUtilization && materialInfo.yeildUtilization != null) {
      yeildUtilization = Number(materialInfo.yeildUtilization);
    } else {
      yeildUtilization = this.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo?.yeildUtilization != null) {
        yeildUtilization = this.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : yeildUtilization;
      }
      materialInfo.yeildUtilization = yeildUtilization;
    }

    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      let scrapRecCost = this.shareService.isValidNumber(this.isValidNumber((Number(materialInfo.scrapWeight) / 1000) * Number(materialInfo.scrapPricePerKg)));
      if (materialInfo?.scrapRecCost != null) {
        scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapRecCost : scrapRecCost;
      }
      materialInfo.scrapRecCost = scrapRecCost;
    }

    materialInfo.netMatCost = this.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }
  public calculationsForConnectorAssembly(materialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public calculationsForWireCuttingTermination(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    materialInfo.materialCostPart = this.isValidNumber(Number((Number(materialInfo.netWeight) * Number(materialInfo.materialPricePerKg)) / 1000));

    if (materialInfo.isCoilLengthDirty && materialInfo.coilLength != null) {
      materialInfo.coilLength = Number(materialInfo.coilLength);
    } else {
      let coilLength = this.getLookUpValue(StampingMaterialLookUpCatEnum.WireCuttingTerminationCoilLength, materialInfo?.sheetThickness); //600 * 10000;
      if (materialInfo?.coilLength != null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterialInfo?.coilLength : coilLength;
      }
      materialInfo.coilLength = coilLength;
    }

    if (materialInfo.isUnfoldedLength && materialInfo.dimUnfoldedX != null) {
      materialInfo.dimUnfoldedX = Number(materialInfo.dimUnfoldedX);
    } else {
      let dimUnfoldedX = this.shareService.isValidNumber(this.shareService.isValidNumber(materialInfo.partVolume) / this.shareService.isValidNumber(materialInfo.partProjectedArea));
      if (materialInfo?.dimUnfoldedX != null) {
        dimUnfoldedX = this.checkDirtyProperty('unfoldedLength', fieldColorsList) ? selectedMaterialInfo?.dimUnfoldedX : dimUnfoldedX;
      }
      materialInfo.dimUnfoldedX = dimUnfoldedX;
    }

    if (materialInfo.isPitchForWireCutting && materialInfo.pitchForWireCutting != null) {
      materialInfo.pitchForWireCutting = Number(materialInfo.pitchForWireCutting);
    } else {
      let pitchForWireCutting = materialInfo.dimUnfoldedX * 1.15;
      if (materialInfo?.pitchForWireCutting != null) {
        pitchForWireCutting = this.checkDirtyProperty('pitchForWireCutting', fieldColorsList) ? selectedMaterialInfo?.pitchForWireCutting : pitchForWireCutting;
      }
      materialInfo.pitchForWireCutting = pitchForWireCutting;
    }

    if (materialInfo?.isGrossWeightCoilDirty && materialInfo?.grossWeight != null) {
      materialInfo.grossWeight = Number(materialInfo?.grossWeight);
    } else {
      let grossWeight = this.isValidNumber(Number(materialInfo.pitchForWireCutting * materialInfo.partProjectedArea) * Number(materialInfo.density / 1000));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil != null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = Math.trunc(this.isValidNumber(materialInfo.coilLength / materialInfo.pitchForWireCutting));
      if (materialInfo?.partsPerCoil != null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = partsPerCoil;
    }

    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      const scrapCost = this.isValidNumber(((this.isValidNumber(materialInfo.grossWeight) - this.isValidNumber(materialInfo.netWeight)) * this.isValidNumber(materialInfo.scrapPricePerKg)) / 1000);
      materialInfo.scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : scrapCost;
    }
    materialInfo.netMatCost = this.isValidNumber(materialInfo.materialCostPart) + this.isValidNumber(materialInfo.scrapRecCost);
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : value;
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList?.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }
  private getSupplierRevenueValue(revValueType: number, revMapList: Map<number, string>) {
    for (const item of revMapList) {
      if (item[0] === revValueType) {
        return item[0];
      }
    }
    return '';
  }
  // private getPartDetailsById() {
  //   this._partInfo$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: PartInfoDto) => {
  //     if (result) {
  //       this.currentPart = {
  //         ...result,
  //       };
  //     }
  //   });
  // }

  async getSupplier() {
    await this.vendorService.getVendorList().subscribe((result: VendorDto[]) => {
      if (result && result?.length > 0) {
        this.vendorDto = [...result];
      }
    });
  }
  getVolumeDiscount(materialInfo: MaterialInfoDto) {
    let volumeDiscountPer: number = 0;
    let materialdeta = new MaterialMasterDto();
    // this.getPartDetailsById();
    this.getSupplier();
    if (materialInfo?.materialDescriptionList?.length > 0) {
      materialdeta = materialInfo?.materialDescriptionList?.find((x) => x?.materialMasterId == Number(materialInfo?.materialMasterId));
    }
    let supplierRevenue;
    if (this.currentPart !== null && this.vendorDto?.length > 0) {
      const supplier = this.currentPart?.supplierInfoId && this.currentPart?.supplierInfoId > 0 ? this.vendorDto?.find((x) => x?.id == this.currentPart?.supplierInfoId) : null;
      supplierRevenue = supplier !== null && supplier?.anulRevType > 0 ? this.getSupplierRevenueValue(supplier?.anulRevType, AnnualRevenueTypeNameMap) : null;
    }
    if (supplierRevenue === AnnualRevenueTypeEnum.FIVEMTO25M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.oneMTDiscount);
    } else if (supplierRevenue === AnnualRevenueTypeEnum.TWENTYFIVEMTO100M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.twentyFiveMTDiscount);
    } else if (supplierRevenue === AnnualRevenueTypeEnum.MT100M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.fiftyMTDiscount);
    } else {
      volumeDiscountPer = 1.0;
    }
    return volumeDiscountPer;
  }

  private getLookUpValue(categoryId: number, value: number): number {
    const expectedValue = this._stampingMetrialLookUpData.filter(
      (x) => x.categoryId === categoryId && x.min < this.shareService.isValidNumber(value) && x.max >= this.shareService.isValidNumber(value)
    );
    if (expectedValue && expectedValue?.length > 0) {
      return expectedValue[0]?.expectedValue;
    }
    return null;
  }
}
