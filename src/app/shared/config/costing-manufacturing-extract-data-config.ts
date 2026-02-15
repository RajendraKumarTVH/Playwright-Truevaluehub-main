import { Injectable } from '@angular/core';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ManufacturingConfigService } from './cost-manufacturing-config';
import { FormGroup } from '@angular/forms';
import { BillOfMaterialDto, PartInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CostingManufacturingExtractDataConfigService {
  constructor(
    private sharedService: SharedService,
    private _manufacturingConfig: ManufacturingConfigService
  ) {}

  setExtractData(
    processFlag: any,
    costingManufacturingInfoform: FormGroup<any>,
    castingFormGroup: FormGroup<any>,
    conversionValue: any,
    isEnableUnitConversion: boolean,
    currentPart: PartInfoDto,
    billOfMaterialList: BillOfMaterialDto[],
    forging?: any,
    fieldColorsList?: any
  ) {
    if (this.sharedService.extractedProcessData) {
      if (processFlag.IsProcessTypeCutting) {
        if (!costingManufacturingInfoform.controls['lengthOfCut'].dirty || costingManufacturingInfoform.controls['lengthOfCut'].value == null) {
          costingManufacturingInfoform.controls['lengthOfCut'].patchValue(
            this.sharedService.convertUomInUI(
              this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.InternalPerimeter + this.sharedService.extractedProcessData?.ExternalPerimeter),
              conversionValue,
              isEnableUnitConversion
            )
          );
        }
      } else {
        if (!costingManufacturingInfoform.controls['lengthOfCut'].dirty || costingManufacturingInfoform.controls['lengthOfCut'].value == null) {
          costingManufacturingInfoform.controls['lengthOfCut'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.LengthOfCut), conversionValue, isEnableUnitConversion)
          );
        }
      }

      if (!costingManufacturingInfoform.controls['lengthOfCutInternal']?.dirty || costingManufacturingInfoform.controls['lengthOfCutInternal']?.value == null) {
        costingManufacturingInfoform.controls['lengthOfCutInternal']?.patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.LengthOfCutInternal), conversionValue, isEnableUnitConversion)
        );
      }

      const bendWithLargerLength = this.sharedService.extractedProcessData?.ProcessBendingInfo?.sort((a, b) => b.Length - a.Length);
      const bendingLineLength = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Length : 0);
      const shoulderWidth = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Width : 0);
      let totalBendCount = 0;
      this.sharedService.extractedProcessData?.ProcessBendingInfo?.forEach((element) => {
        if (element.Type === 'Rolled Hem Bend(s)') {
          totalBendCount += Number(element.BendCount * 2);
        } else {
          totalBendCount += Number(element.BendCount);
        }
      });

      if (forging.hotForgingClosedDieHot || forging.trimmingPress) {
        if (costingManufacturingInfoform.controls['noOfBends'].value === null || costingManufacturingInfoform.controls['noOfBends'].value === 0) {
          costingManufacturingInfoform.controls['noOfBends'].patchValue(2);
        }
      } else {
        if (
          (totalBendCount && !costingManufacturingInfoform.controls['noOfBends'].dirty && !this.sharedService.checkDirtyProperty('noOfBends', fieldColorsList)) ||
          costingManufacturingInfoform.controls['noOfBends'].value == null
        ) {
          costingManufacturingInfoform.controls['noOfBends'].patchValue(this.sharedService.isValidNumber(totalBendCount));
        }
      }
      if (!costingManufacturingInfoform.controls['bendingLineLength'].dirty || costingManufacturingInfoform.controls['bendingLineLength'].value == null) {
        costingManufacturingInfoform.controls['bendingLineLength'].patchValue(this.sharedService.convertUomInUI(bendingLineLength, conversionValue, isEnableUnitConversion));
      }
      if (!costingManufacturingInfoform.controls['cuttingLength']?.dirty || costingManufacturingInfoform.controls['cuttingLength']?.value == null) {
        costingManufacturingInfoform.controls['cuttingLength']?.patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.CuttingLength), conversionValue, isEnableUnitConversion)
        );
      }

      if (!costingManufacturingInfoform.controls['shoulderWidth']?.dirty || costingManufacturingInfoform.controls['shoulderWidth']?.value == null) {
        costingManufacturingInfoform.controls['shoulderWidth']?.patchValue(this.sharedService.convertUomInUI(this.sharedService.isValidNumber(shoulderWidth), conversionValue, isEnableUnitConversion));
      }
      if (
        (this.sharedService.extractedProcessData?.NoOfStartsPierce &&
          !costingManufacturingInfoform.controls['noOfStartsPierce'].dirty &&
          !this.sharedService.checkDirtyProperty('noOfStartsPierce', fieldColorsList)) ||
        costingManufacturingInfoform.controls['noOfStartsPierce'].value == null
      ) {
        costingManufacturingInfoform.controls['noOfStartsPierce'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.NoOfStartsPierce) || 1);
      }

      if (processFlag.IsProcessGravityDieCasting) {
        if (!castingFormGroup.controls['partArea'].dirty || !castingFormGroup.controls['partArea'].value) {
          castingFormGroup.controls['partArea'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.ProjectedArea), conversionValue, isEnableUnitConversion)
          );
        }
        if (!castingFormGroup.controls['flashArea'].dirty || !castingFormGroup.controls['flashArea'].value) {
          castingFormGroup.controls['flashArea'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartSurfaceArea), conversionValue, isEnableUnitConversion)
          );
        }
      } else {
        if (!costingManufacturingInfoform.controls['partArea'].dirty || !costingManufacturingInfoform.controls['partArea'].value) {
          // const pArea = (processFlag.IsProcessHighPressureDieCasting || processFlag.IsProcessGravityDieCasting) ? this.extractedMaterialData.ProjectedArea : this.sharedService.extractedProcessData?.PartArea;
          costingManufacturingInfoform.controls['partArea'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.PartArea), conversionValue, isEnableUnitConversion)
          );
        }
      }

      if (!costingManufacturingInfoform.controls['partThickness'].dirty || costingManufacturingInfoform.controls['partThickness'].value == null) {
        costingManufacturingInfoform.controls['partThickness'].patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.PartThickness), conversionValue, isEnableUnitConversion)
        );
      }
      if (!costingManufacturingInfoform.controls['innerRadius'].dirty || costingManufacturingInfoform.controls['innerRadius'].value == null) {
        costingManufacturingInfoform.controls['innerRadius'].patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.InnerRadius), conversionValue, isEnableUnitConversion)
        );
      }
      if (!costingManufacturingInfoform.controls['noOfHoles'].dirty || costingManufacturingInfoform.controls['noOfHoles'].value == null) {
        costingManufacturingInfoform.controls['noOfHoles'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.NoOfHoles));
      }
      if (!costingManufacturingInfoform.controls['utilisation'].dirty || costingManufacturingInfoform.controls['utilisation'].value == null) {
        costingManufacturingInfoform.controls['utilisation'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.Utilisation));
      }
      if (!costingManufacturingInfoform.controls['formPerimeter'].dirty || costingManufacturingInfoform.controls['formPerimeter'].value == null) {
        costingManufacturingInfoform.controls['formPerimeter'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.FormPerimeter));
      }

      if (!costingManufacturingInfoform.controls['noofStroke'].dirty || costingManufacturingInfoform.controls['noofStroke'].value == null) {
        if (this.sharedService.extractedProcessData?.NoOfStrokes) {
          costingManufacturingInfoform.controls['noofStroke'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.noOfStrokes));
        }

        if (!costingManufacturingInfoform.controls['machineStrokes'].dirty || costingManufacturingInfoform.controls['machineStrokes'].value == null) {
          if (this.sharedService.extractedProcessData?.MachineStrokes) {
            costingManufacturingInfoform.controls['machineStrokes'].patchValue(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.MachineStrokes));
          }
        }
      }

      let totalPinPopulation = 0;
      let bomPins = 0;
      let typesOfPin = 0;
      if (currentPart.commodityId === CommodityType.Electricals) {
        totalPinPopulation = this._manufacturingConfig.calculateTotalPinPopulation(billOfMaterialList);
        typesOfPin = this._manufacturingConfig.calculateNoOfTypesOfPins(billOfMaterialList);
        bomPins = this._manufacturingConfig.calculateBomMaxQtyOfIndividualPinTypes(billOfMaterialList);
      }

      if (!costingManufacturingInfoform.controls['totalPinPopulation'].dirty || costingManufacturingInfoform.controls['totalPinPopulation'].value == null) {
        if (totalPinPopulation) {
          costingManufacturingInfoform.controls['totalPinPopulation'].patchValue(this.sharedService.isValidNumber(totalPinPopulation));
        }
      }

      if (!costingManufacturingInfoform.controls['noOfTypesOfPins'].dirty || costingManufacturingInfoform.controls['noOfTypesOfPins'].value == null) {
        if (typesOfPin) {
          costingManufacturingInfoform.controls['noOfTypesOfPins'].patchValue(this.sharedService.isValidNumber(typesOfPin));
        }
      }

      if (!costingManufacturingInfoform.controls['maxBomQuantityOfIndividualPinTypes'].dirty || costingManufacturingInfoform.controls['maxBomQuantityOfIndividualPinTypes'].value == null) {
        if (bomPins) {
          costingManufacturingInfoform.controls['maxBomQuantityOfIndividualPinTypes'].patchValue(this.sharedService.isValidNumber(bomPins));
        }
      }
    }
  }

  resetDataExtracted(costingManufacturingInfoform: FormGroup<any>) {
    const fieldNames = ['lengthOfCut', 'noOfBends', 'bendingLineLength', 'cuttingLength', 'partArea', 'partThickness', 'innerRadius', 'noOfHoles', 'noofStroke'];
    fieldNames.forEach((fieldName) => {
      costingManufacturingInfoform.controls[fieldName]?.markAsPristine();
    });
  }
}
