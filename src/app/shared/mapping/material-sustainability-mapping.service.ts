import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MaterialSustainabilityMappingService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}
  getMaterialSustainabilityFormFields(materialInfoList) {
    return {
      co2KgMaterial: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].materialMarketData?.esgImpactCO2Kg) : 0],
      co2KgScrap: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].materialMarketData?.esgImpactCO2Kg) : 0],
      co2KgPart: [
        {
          value:
            materialInfoList?.length > 0
              ? this.sharedService.isValidNumber(
                  (materialInfoList[0].grossWeight / 1000) * materialInfoList[0].materialMarketData?.esgImpactCO2Kg -
                    (materialInfoList[0].scrapWeight / 1000) * materialInfoList[0].materialMarketData?.esgImpactCO2Kg
                )
              : 0,
          disabled: true,
        },
      ],
      co2AnnualVolumeKg: [{ value: materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight * materialInfoList[0].eav) : 0, disabled: true }],
      co2AnnualKgCO2: [{ value: materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].esgImpactCO2Kg * materialInfoList[0].esgAnnualVolumeKg) : 0, disabled: true }],
      co2AnnualKgCO2Part: [{ value: materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].esgAnnualKgCO2 / materialInfoList[0].eav) : 0, disabled: true }],
    };
  }

  materialSustainabilityFormFieldsReset() {
    return {
      co2KgMaterial: 0,
      co2KgScrap: 0,
      co2KgPart: 0,
      co2AnnualVolumeKg: 0,
      co2AnnualKgCO2: 0,
      co2AnnualKgCO2Part: 0,
    };
  }

  materialSustainabilityFormPatch(materialInfo: MaterialInfoDto) {
    return {
      co2KgMaterial: this.sharedService.isValidNumber(materialInfo?.esgImpactCO2Kg) || 0,
      co2KgScrap: this.sharedService.isValidNumber(materialInfo?.esgImpactCO2KgScrap) || 0,
      co2KgPart: this.sharedService.isValidNumber(materialInfo?.esgImpactCO2KgPart) || 0,
      co2AnnualVolumeKg: this.sharedService.isValidNumber(materialInfo?.esgAnnualVolumeKg) || 0,
      co2AnnualKgCO2: this.sharedService.isValidNumber(materialInfo?.esgAnnualKgCO2) || 0,
      co2AnnualKgCO2Part: this.sharedService.isValidNumber(materialInfo?.esgAnnualKgCO2Part) || 0,
    };
  }

  materialSustainabilitySetCalculationObject(materialInfo, material) {
    materialInfo.esgImpactCO2Kg = Number(material['co2KgMaterial'].value);
    materialInfo.esgImpactCO2KgScrap = Number(material['co2KgScrap'].value);
    materialInfo.esgImpactCO2KgPart = Number(material['co2KgPart'].value);
    materialInfo.esgAnnualVolumeKg = Number(material['co2AnnualVolumeKg'].value);
    materialInfo.esgAnnualKgCO2 = Number(material['co2AnnualKgCO2'].value);
    materialInfo.esgAnnualKgCO2Part = Number(material['co2AnnualKgCO2Part'].value);

    materialInfo.isEsgImpactCO2KgDirty = material['co2KgMaterial'].dirty;
    materialInfo.isEsgImpactCO2KgScrapDirty = material['co2KgScrap'].dirty;
  }

  materialSustainabilityFormPatchResults(result: MaterialInfoDto) {
    return {
      co2KgMaterial: this.sharedService.isValidNumber(Number(result.esgImpactCO2Kg)),
      co2KgScrap: this.sharedService.isValidNumber(Number(result.esgImpactCO2KgScrap)),
      co2KgPart: this.sharedService.isValidNumber(Number(result.esgImpactCO2KgPart)),
      co2AnnualVolumeKg: this.sharedService.isValidNumber(Number(result.esgAnnualVolumeKg)),
      co2AnnualKgCO2: this.sharedService.isValidNumber(Number(result.esgAnnualKgCO2)),
      co2AnnualKgCO2Part: this.sharedService.isValidNumber(Number(result.esgAnnualKgCO2Part)),
    };
  }

  materialSustainabilitySetPayload(material) {
    return {
      esgImpactCO2Kg: Number(material['co2KgMaterial'].value),
      esgImpactCO2KgScrap: Number(material['co2KgScrap'].value),
      esgImpactCO2KgPart: Number(material['co2KgPart'].value),
      esgAnnualVolumeKg: Number(material['co2AnnualVolumeKg'].value),
      esgAnnualKgCO2: Number(material['co2AnnualKgCO2'].value),
      esgAnnualKgCO2Part: Number(material['co2AnnualKgCO2Part'].value),
    };
  }
}
