import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MaterialCoreDetailsDto } from '../models/Material-Core-Details.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialCoreCostDetailMappingService {
  constructor(private formbuilder: FormBuilder) {}

  mapCoreCostDetailsToFormArray(formArray, coreCostDetails, materialInfoId) {
    for (let i = 0; i < coreCostDetails?.length; i++) {
      const info = coreCostDetails[i];
      const formGroup: FormGroup = this.formbuilder.group({
        coreCostDetailsId: [info.coreCostDetailsId],
        materialInfoId: materialInfoId || 0,
        coreShape: info.coreShape,
        coreArea: info.coreArea,
        coreHeight: [info.coreHeight],
        coreLength: info.coreLength,
        coreVolume: info.coreVolume,
        coreWeight: info.coreWeight,
        coreWidth: info.coreWidth,
        noOfCore: info.noOfCore,
        coreSandPrice: info.coreSandPrice || 0,
        weldSide: info.weldSide || 0,
        grindFlush: info.grindFlush || 0,
        coreName: info.coreName || '',
      });
      formArray.push(formGroup);
    }
    return formArray;
  }

  mapFormArrayToCoreCostDetails(formArray, materialInfoId) {
    const coreCostDetails: MaterialCoreDetailsDto[] = [];
    for (let i = 0; i < formArray?.controls?.length; i++) {
      const info = formArray?.controls[i];
      const coreCostDetail = new MaterialCoreDetailsDto();
      coreCostDetail.coreCostDetailsId = info.value.coreCostDetailsId || 0;
      coreCostDetail.materialInfoId = materialInfoId || 0;
      coreCostDetail.coreShape = info.value.coreShape || 1;
      coreCostDetail.iscoreShapeDirty = info.get('coreShape')?.dirty;
      coreCostDetail.coreArea = info.value.coreArea || 1;
      coreCostDetail.iscoreAreaDirty = info.get('coreArea')?.dirty;
      coreCostDetail.coreHeight = info.value.coreHeight || 0;
      coreCostDetail.iscoreHeightDirty = info.get('coreHeight')?.dirty;
      coreCostDetail.coreLength = info.value.coreLength || 0;
      coreCostDetail.iscoreLengthDirty = info.get('coreLength')?.dirty;
      coreCostDetail.coreVolume = info.value.coreVolume || 0;
      coreCostDetail.iscoreVolumeDirty = info.get('coreVolume')?.dirty;
      coreCostDetail.coreWeight = info.value.coreWeight || 0;
      coreCostDetail.iscoreWeightDirty = info.get('coreWeight')?.dirty;
      coreCostDetail.coreWidth = info.value.coreWidth || 0;
      coreCostDetail.iscoreWidthDirty = info.get('coreWidth')?.dirty;
      coreCostDetail.noOfCore = info.value.noOfCore || 1;
      coreCostDetail.isnoOfCoreDirty = info.get('noOfCore')?.dirty;
      coreCostDetail.coreSandPrice = info.value.coreSandPrice || 0;
      coreCostDetail.iscoreSandPriceDirty = info.get('coreSandPrice')?.dirty;
      coreCostDetail.weldSide = info.value.weldSide || 0;
      coreCostDetail.isweldSideDirty = info.get('weldSide')?.dirty;
      coreCostDetail.grindFlush = info.value.grindFlush || 0;
      coreCostDetail.isgrindFlushDirty = info.get('grindFlush')?.dirty;
      coreCostDetail.coreName = info.value.coreName || '';
      coreCostDetails.push(coreCostDetail);
    }
    return coreCostDetails;
  }
  mapToCoreCostDetails(coreDetails: MaterialCoreDetailsDto[], materialInfoId) {
    const coreCostDetails: MaterialCoreDetailsDto[] = [];
    coreDetails.forEach((info) => {
      const coreCostDetail = new MaterialCoreDetailsDto();
      coreCostDetail.coreCostDetailsId = 0;
      coreCostDetail.materialInfoId = materialInfoId || 0;
      coreCostDetail.coreShape = info.coreShape || 1;
      coreCostDetail.coreArea = info.coreArea || 1;
      coreCostDetail.coreHeight = info.coreHeight || 0;
      coreCostDetail.coreLength = info.coreLength || 0;
      coreCostDetail.coreVolume = info.coreVolume || 0;
      coreCostDetail.coreWeight = info.coreWeight || 0;
      coreCostDetail.coreWidth = info.coreWidth || 0;
      coreCostDetail.noOfCore = info.noOfCore || 1;
      coreCostDetail.coreSandPrice = info.coreSandPrice || 0;
      coreCostDetail.weldSide = info.weldSide || 0;
      coreCostDetail.coreName = info.coreName || '';
      coreCostDetails.push(coreCostDetail);
    });
    return coreCostDetails;
  }
}
