import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { AdditionalPackagingDto } from '../models/packaging-info.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PackagingMappingService {
  constructor(public sharedService: SharedService) {}

  mapToAdditionalPackagingDto(packingMaterials: any[], packagingPriceMultiplier): AdditionalPackagingDto[] {
    return packingMaterials.map((item) => {
      const material = item.material;

      const dto: AdditionalPackagingDto = {
        adnlId: 0,
        adlnalid: 0,
        packagingId: item.packingMaterialMasterId,

        costPerUnit: (material.bulkPrice || 0) * (packagingPriceMultiplier || 1),
        units: 0, // default or computed externally

        packagingTypeId: material.packagingTypeId,
        packagingFormId: material.packagingFormId,
        packageDescriptionId: material.packageDescriptionMasterId,

        packagingWeight: material.weightInGms,
        packageMaxCapacity: material.maxWeightInGms ?? 0,
        packageMaxVolume: material.maxVolumeInCm3 ?? 0,

        cO2PerUnit: 0, // placeholder or compute based on material
        unitId: material.unitId,
        esgkgCo2: material.esgkgCo2,
        laborTimeSec: material.laborTimeSec,

        // Newly added fields
        packingMaterialMasterId: item.packingMaterialMasterId,
        description: material.description,
        weightInGms: material.weightInGms,
        lengthInMm: material.lengthInMm,
        heightInMm: material.heightInMm,
        widthInMm: material.widthInMm,
        maxWeightInGms: material.maxWeightInGms,
        maxVolumeInCm3: material.maxVolumeInCm3,
        basePrice: material.basePrice,
        bulkPrice: (material.bulkPrice || 0) * (packagingPriceMultiplier || 1),
        packagingType: material.packagingType,
        packagingForm: material.packagingForm,
        unit: material.unit,
        packagingSizeId: material.packagingSizeId,
        packagingSize: material.packagingSize,
        materialFinishId: material.materialFinishId,
        materialFinish: material.materialFinish,
        fragileStatusId: material.fragileStatusId,
        fragileStatus: material.fragileStatus,
        freightId: material.freightId,
        freight: material.freight,
        environmentalId: material.environmentalId,
        environmental: material.environmental,

        // Optionally include these if used/calculated externally
        totalPackagingTime: 0,
        directLaborRate: 0,
        laborCostPerPart: 0,
        partsPerContainer: 0,
        qtyNeededPerShipment: 0,
        costPerContainer: (material.bulkPrice || 0) * (packagingPriceMultiplier || 1),

        // Initialize "Dirty" flags as false (default in class)
        isTotalPackagingTimeDirty: material.isTotalPackagingTimeDirty || false,
        isDirectLaborRateDirty: material.isDirectLaborRateDirty || false,
        isPartsPerContainerDirty: material.isPartsPerContainerDirty || false,
        // isCostPerUnitDirty: material.isCostPerUnitDirty || false,
        isQtyNeededPerShipmentDirty: material.isQtyNeededPerShipmentDirty || false,
        isCostPerContainerDirty: material.isCostPerContainerDirty || false,
        isCO2PerUnitDirty: material.isCO2PerUnitDirty || false,
      };

      return dto;
    });
  }
}
