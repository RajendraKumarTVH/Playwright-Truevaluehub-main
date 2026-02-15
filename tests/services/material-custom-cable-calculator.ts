
import { SharedService } from './shared';
import { MaterialCategory } from 'src/app/shared/enums';
import { CabType, PrimaryProcessType } from '../costing.config';
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';


export class MaterialCustomCableCalculatorService implements IMaterialCalculationByCommodity {
  constructor(private shareService: SharedService) { }
  private currentPart: PartInfoDto;

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.ConnectorAssembly:
        return this.calculationsForConnectorAssembly(materialInfo);
      case PrimaryProcessType.CustomizeCable:
        return this.calculationsForCustomizeCable(materialInfo, fieldColorsList, selectedMaterial, 0, false);

      default:
        return materialInfo;
    }
  }
  public calculationsForConnectorAssembly(materialInfo: MaterialInfoDto): MaterialInfoDto {
    return materialInfo;
  }
  public calculationsForCustomizeCable(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto, index = 0, isAutomation: boolean): MaterialInfoDto {
    materialInfo.totalCableLength = this.shareService.isValidNumber(materialInfo.eav * 1000);
    if (Number(materialInfo.typeOfCable) === CabType.Multiconductor) {
      let envelopID = 0;
      let envelopOD = 0;
      // let shealthMaterial = 0;
      //no of wire
      if (materialInfo.isNoOfCavitiesDirty && materialInfo.noOfCavities != null) {
        materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
      } else {
        let noOfCavities = 0;
        if ([MaterialCategory.Plastics, MaterialCategory.NonFerrous].includes(materialInfo.materialGroupId)) {
          if (isAutomation) {
            noOfCavities =
              [MaterialCategory.Plastics, MaterialCategory.NonFerrous].includes(materialInfo.materialGroupId) && materialInfo?.materialInfoList?.length < 2 ? materialInfo.noOfCablesWithSameDia : 1;
          } else {
            if (materialInfo.materialInfoId > 0 && materialInfo?.materialInfoList?.length > 0) {
              const materialIndex = materialInfo?.materialInfoList?.findIndex((x) => x.materialInfoId === materialInfo.materialInfoId);
              noOfCavities =
                (materialIndex === 0 && [MaterialCategory.Plastics].includes(materialInfo.materialGroupId)) ||
                  (materialIndex === 1 && [MaterialCategory.NonFerrous].includes(materialInfo.materialGroupId))
                  ? materialInfo.noOfCablesWithSameDia
                  : 1;
            }
          }
        }
        if (materialInfo.noOfCavities != null) {
          noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterialInfo?.noOfCavities : noOfCavities;
        }
        materialInfo.noOfCavities = noOfCavities;
      }

      for (let i = 0; i < materialInfo?.sandForCoreFormArray?.controls?.length; i++) {
        const info = materialInfo?.sandForCoreFormArray?.controls[index];
        envelopID = Number(info?.value?.coreLength);
        envelopOD = Number(info?.value?.coreWidth);
        // shealthMaterial = Number(info?.value?.coreHeight);
      }

      const numberOfWire = Number(materialInfo.noOfCavities);
      const envelopDia = envelopID;

      if (materialInfo.isPercentageOfReductionDirty && materialInfo.percentageOfReduction != null) {
        materialInfo.percentageOfReduction = Number(materialInfo.percentageOfReduction);
      } else {
        materialInfo.percentageOfReduction = this.shareService.checkDirtyProperty('percentageOfReduction', fieldColorsList) ? selectedMaterialInfo?.percentageOfReduction : 12;
      }
      if (materialInfo.isNoOfDrawStepsDirty && materialInfo.noOfDrawSteps != null) {
        materialInfo.noOfDrawSteps = Number(materialInfo.noOfDrawSteps);
      } else {
        materialInfo.noOfDrawSteps = this.shareService.checkDirtyProperty('noOfDrawSteps', fieldColorsList) ? selectedMaterialInfo?.noOfDrawSteps : 4;
      }

      //final length
      if (materialInfo.isSheetLengthDirty && materialInfo.sheetLength != null) {
        materialInfo.sheetLength = Number(materialInfo.sheetLength);
      } else {
        materialInfo.sheetLength = this.shareService.checkDirtyProperty('sheetLength', fieldColorsList) ? selectedMaterialInfo?.sheetLength : materialInfo.totalCableLength;
      }
      //envelopDia
      if (materialInfo.isPartInnerDiameterDirty && materialInfo.partInnerDiameter != null) {
        materialInfo.partInnerDiameter = Number(materialInfo.partInnerDiameter);
      } else {
        materialInfo.partInnerDiameter = this.shareService.checkDirtyProperty('partInnerDiameter', fieldColorsList) ? selectedMaterialInfo?.partInnerDiameter : envelopDia;
      }
      //initial diameter
      if (materialInfo.isPartOuterDiameterDirty && materialInfo.partOuterDiameter != null) {
        materialInfo.partOuterDiameter = Number(materialInfo.partOuterDiameter);
      } else {
        let partOuterDiameter = this.shareService.isValidNumber(Number(materialInfo.partInnerDiameter) * (1 + Number(materialInfo.percentageOfReduction / 100) * Number(materialInfo.noOfDrawSteps)));
        let initialDia = materialInfo.materialGroupId === MaterialCategory.Plastics ? envelopID : partOuterDiameter;
        if (materialInfo.mainInsulatorID > 0) {
          initialDia = materialInfo.mainInsulatorID;
        }
        partOuterDiameter = this.shareService.checkDirtyProperty('partOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.partOuterDiameter : initialDia;
        materialInfo.partOuterDiameter = partOuterDiameter;
      }

      //initial draw length
      if (materialInfo.isStockLengthDirty && materialInfo.stockLength != null) {
        materialInfo.stockLength = Number(materialInfo.stockLength);
      } else {
        const initialDrawLen = this.shareService.isValidNumber((Number(materialInfo.sheetLength) / Math.pow(Number(materialInfo.partOuterDiameter), 2)) * Math.pow(envelopDia, 2));
        let stockLength = materialInfo.materialGroupId === MaterialCategory.Plastics ? envelopOD : initialDrawLen;
        if (materialInfo.mainInsulatorOD > 0) {
          stockLength = materialInfo.mainInsulatorOD;
        }
        if (materialInfo.stockLength != null) {
          stockLength = this.shareService.checkDirtyProperty('stockLength', fieldColorsList) ? selectedMaterialInfo?.stockLength : stockLength;
        }
        materialInfo.stockLength = stockLength;
      }

      if (materialInfo.materialGroupId === MaterialCategory.Plastics) {
        // const totalNoOfCables = this.shareService.isValidNumber(materialInfo.noOfCablesWithSameDia);
        if (materialInfo.mainInsulatorID > 0 && materialInfo.mainInsulatorOD > 0) {
          materialInfo.partProjectedArea = this.shareService.isValidNumber(3.14 * (Math.pow(materialInfo.stockLength / 2, 2) - Math.pow(materialInfo.partOuterDiameter / 2, 2)));
        } else {
          materialInfo.partProjectedArea = this.shareService.isValidNumber(3.14 * (Math.pow(envelopOD / 2, 2) - Math.pow(envelopID / 2, 2)));
        }
        if (materialInfo.isPartVolumeDirty && materialInfo.partVolume != null) {
          materialInfo.partVolume = Number(materialInfo.partVolume);
        } else {
          let partVolume = this.shareService.isValidNumber(3.14 * (Math.pow(envelopOD / 2, 2) - Math.pow(envelopID / 2, 2)) * materialInfo.totalCableLength);
          if (materialInfo.mainInsulatorID > 0 && materialInfo.mainInsulatorOD > 0) {
            partVolume = materialInfo.partProjectedArea * materialInfo.totalCableLength;
          }
          if (materialInfo?.partVolume != null) {
            partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
          }
          materialInfo.partVolume = partVolume;
        }

        if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
          materialInfo.netWeight = Number(materialInfo.netWeight);
        } else {
          let netWeight = this.shareService.isValidNumber(Number(materialInfo.partVolume) * (Number(materialInfo?.density) / 1000));
          if (materialInfo?.netWeight != null) {
            netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
          }
          materialInfo.netWeight = netWeight;
        }

        if (materialInfo.isTotalPouringWeightDirty && !!materialInfo.totalPouringWeight) {
          materialInfo.totalPouringWeight = Number(materialInfo.totalPouringWeight);
        } else {
          let totalweight = this.shareService.isValidNumber(Number(materialInfo.netWeight) * numberOfWire);
          if (materialInfo?.totalPouringWeight != null) {
            totalweight = this.shareService.checkDirtyProperty('totalPouringWeight', fieldColorsList) ? selectedMaterialInfo?.totalPouringWeight : totalweight;
          }
          materialInfo.totalPouringWeight = totalweight;
        }
        materialInfo.grossWeight = this.shareService.isValidNumber(materialInfo.netWeight / 1000);
        const grossMaterialCost = this.shareService.isValidNumber(materialInfo.grossWeight * Number(materialInfo.materialPricePerKg));
        materialInfo.materialCostPart = grossMaterialCost;
        materialInfo.netMatCost = Number(materialInfo.materialCostPart) / (Number(materialInfo?.eav) * Number(materialInfo?.noOfCavities));
      } else {
        if (materialInfo.isPartVolumeDirty && materialInfo.partVolume != null) {
          materialInfo.partVolume = Number(materialInfo.partVolume);
        } else {
          let partVolume = this.shareService.isValidNumber(3.14 * Math.pow(Number(materialInfo.partOuterDiameter / 2), 2) * Number(materialInfo.stockLength));
          if (materialInfo?.partVolume != null) {
            partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
          }
          materialInfo.partVolume = partVolume;
        }

        if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
          materialInfo.netWeight = Number(materialInfo.netWeight);
        } else {
          let netWeight = this.shareService.isValidNumber(Number(materialInfo.partVolume) * (Number(materialInfo?.density) / 1000));
          if (materialInfo?.netWeight != null) {
            netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
          }
          materialInfo.netWeight = netWeight;
        }

        if (materialInfo.isTotalPouringWeightDirty && !!materialInfo.totalPouringWeight) {
          materialInfo.totalPouringWeight = Number(materialInfo.totalPouringWeight);
        } else {
          let totalweight = this.shareService.isValidNumber(Number(materialInfo.netWeight) * numberOfWire);
          if (materialInfo?.totalPouringWeight != null) {
            totalweight = this.shareService.checkDirtyProperty('totalPouringWeight', fieldColorsList) ? selectedMaterialInfo?.totalPouringWeight : totalweight;
          }
          materialInfo.totalPouringWeight = totalweight;
        }
        materialInfo.grossWeight = this.shareService.isValidNumber(materialInfo.totalPouringWeight / 1000);
        const grossMaterialCost = this.shareService.isValidNumber(materialInfo.grossWeight * Number(materialInfo.materialPricePerKg));
        materialInfo.materialCostPart = grossMaterialCost;
        materialInfo.netMatCost = Number(materialInfo.materialCostPart) / (Number(materialInfo?.eav) * Number(materialInfo?.noOfCavities));
      }
    } else if (Number(materialInfo.typeOfCable) === CabType.SolidCore) {
      if (materialInfo.isPercentageOfReductionDirty && materialInfo.percentageOfReduction != null) {
        materialInfo.percentageOfReduction = Number(materialInfo.percentageOfReduction);
      } else {
        materialInfo.percentageOfReduction = this.shareService.checkDirtyProperty('percentageOfReduction', fieldColorsList) ? selectedMaterialInfo?.percentageOfReduction : 13;
      }
      if (materialInfo.isNoOfDrawStepsDirty && materialInfo.noOfDrawSteps != null) {
        materialInfo.noOfDrawSteps = Number(materialInfo.noOfDrawSteps);
      } else {
        materialInfo.noOfDrawSteps = this.shareService.checkDirtyProperty('noOfDrawSteps', fieldColorsList) ? selectedMaterialInfo?.noOfDrawSteps : 12;
      }

      if (materialInfo.isNoOfCavitiesDirty && materialInfo.noOfCavities != null) {
        materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
      } else {
        let noOfCavities = materialInfo?.noOfCables;
        if (materialInfo.noOfCavities != null) {
          noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterialInfo?.noOfCavities : noOfCavities;
        }
        materialInfo.noOfCavities = noOfCavities;
      }

      if (materialInfo.isPartInnerDiameterDirty && materialInfo.partInnerDiameter != null) {
        //envelopDia
        materialInfo.partInnerDiameter = Number(materialInfo.partInnerDiameter);
      } else {
        let partInnerDiameter = materialInfo.flashVolume;
        if (materialInfo.materialGroupId === MaterialCategory.Plastics) {
          partInnerDiameter = this.shareService.isValidNumber(3.14 * (Math.pow(materialInfo.mainInsulatorOD / 2, 2) - Math.pow(materialInfo.mainInsulatorID / 2, 2)));
        }
        materialInfo.partInnerDiameter = this.shareService.checkDirtyProperty('partInnerDiameter', fieldColorsList) ? selectedMaterialInfo?.partInnerDiameter : partInnerDiameter;
      }

      if (materialInfo.isTotalCableLengthDirty && materialInfo.totalCableLength != null) {
        //final length
        materialInfo.totalCableLength = Number(materialInfo.totalCableLength);
      } else {
        materialInfo.totalCableLength = this.shareService.checkDirtyProperty('totalCableLength', fieldColorsList) ? selectedMaterialInfo?.totalCableLength : materialInfo.totalCableLength;
      }

      if (materialInfo.isSheetLengthDirty && materialInfo.sheetLength != null) {
        //Envelop OD
        materialInfo.sheetLength = Number(materialInfo.sheetLength);
      } else {
        const envelopOD = materialInfo.materialGroupId === MaterialCategory.NonFerrous ? materialInfo.totalCableLength : materialInfo.mainInsulatorOD;
        materialInfo.sheetLength = this.shareService.checkDirtyProperty('sheetLength', fieldColorsList) ? selectedMaterialInfo?.sheetLength : envelopOD;
      }

      if (materialInfo.isPartOuterDiameterDirty && materialInfo.partOuterDiameter != null) {
        //initial diameter
        materialInfo.partOuterDiameter = Number(materialInfo.partOuterDiameter);
      } else {
        let initialDia = 0;
        if (materialInfo.materialGroupId === MaterialCategory.NonFerrous) {
          initialDia = this.shareService.isValidNumber(Number(materialInfo.partInnerDiameter) * (1 + Number(materialInfo.percentageOfReduction / 100) * Number(materialInfo.noOfDrawSteps)));
        } else if (materialInfo.materialGroupId === MaterialCategory.Plastics) {
          initialDia = materialInfo.mainInsulatorID;
        }
        initialDia = this.shareService.checkDirtyProperty('partOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.partOuterDiameter : initialDia;
        materialInfo.partOuterDiameter = initialDia;
      }

      if (materialInfo.isStockLengthDirty && materialInfo.stockLength != null) {
        //Initial Draw Length/Envelop Length/Part(mm)
        materialInfo.stockLength = Number(materialInfo.stockLength);
      } else {
        let initialDrawLen = 0;
        if (materialInfo.materialGroupId === MaterialCategory.NonFerrous) {
          initialDrawLen = this.shareService.isValidNumber((materialInfo.totalCableLength / Math.pow(materialInfo.partOuterDiameter, 2)) * Math.pow(materialInfo.partInnerDiameter, 2));
        } else if (materialInfo.materialGroupId === MaterialCategory.Plastics) {
          initialDrawLen = materialInfo.totalCableLength;
        }
        if (materialInfo.stockLength != null) {
          initialDrawLen = this.shareService.checkDirtyProperty('stockLength', fieldColorsList) ? selectedMaterialInfo?.stockLength : initialDrawLen;
        }
        materialInfo.stockLength = initialDrawLen;
      }

      if (materialInfo.isPartVolumeDirty && materialInfo.partVolume != null) {
        materialInfo.partVolume = Number(materialInfo.partVolume);
      } else {
        let partVolume = this.shareService.isValidNumber(3.14 * Math.pow(Number(materialInfo.partOuterDiameter / 2), 2) * Number(materialInfo.stockLength));

        if (materialInfo.materialGroupId === MaterialCategory.Plastics) {
          partVolume = this.shareService.isValidNumber(3.14 * (Math.pow(materialInfo.mainInsulatorOD / 2, 2) - Math.pow(materialInfo.mainInsulatorID / 2, 2)) * materialInfo.stockLength);
        }
        if (materialInfo?.partVolume != null) {
          partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
        }
        materialInfo.partVolume = partVolume;
      }

      if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
        materialInfo.netWeight = Number(materialInfo.netWeight);
      } else {
        let netWeight = this.shareService.isValidNumber(Number(materialInfo.partVolume) * (Number(materialInfo?.density) / 1000));
        if (materialInfo?.netWeight != null) {
          netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
        }
        materialInfo.netWeight = netWeight;
      }

      if (materialInfo.isTotalPouringWeightDirty && !!materialInfo.totalPouringWeight) {
        materialInfo.totalPouringWeight = Number(materialInfo.totalPouringWeight);
      } else {
        let totalweight =
          materialInfo.materialGroupId === MaterialCategory.Plastics ? Number(materialInfo.netWeight) : this.shareService.isValidNumber(Number(materialInfo.netWeight) * materialInfo.noOfCavities);
        if (materialInfo?.totalPouringWeight != null) {
          totalweight = this.shareService.checkDirtyProperty('totalPouringWeight', fieldColorsList) ? selectedMaterialInfo?.totalPouringWeight : totalweight;
        }
        materialInfo.totalPouringWeight = totalweight;
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(materialInfo.totalPouringWeight / 1000);
      const grossMaterialCost = this.shareService.isValidNumber(materialInfo.grossWeight * Number(materialInfo.materialPricePerKg));
      materialInfo.materialCostPart = grossMaterialCost;
      materialInfo.netMatCost = Number(materialInfo.materialCostPart) / Number(materialInfo?.eav);
    }
    // return new Observable((obs) => { obs.next(materialInfo); });
    return materialInfo;
  }
}
