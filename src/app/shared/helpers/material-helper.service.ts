import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormGroupKeysMaterial } from 'src/app/shared/enums/material-formgroups.enum';
import { CommodityType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class MaterialHelperService {
  constructor() {}
  getMatchingFormGroupByElement(el: string, processFlag: any, forging: any, currentPart: any, getFormGroup: (key: FormGroupKeysMaterial) => FormGroup): FormGroup | false {
    const formMap: { key: FormGroupKeysMaterial; flag: boolean }[] = [
      { key: FormGroupKeysMaterial.Machining, flag: processFlag.IsProcessMachining },
      { key: FormGroupKeysMaterial.TubeBending, flag: processFlag.IsProcessTubeBending },
      { key: FormGroupKeysMaterial.Casting, flag: processFlag.IsProcessCasting },
      { key: FormGroupKeysMaterial.MetalExtrusion, flag: processFlag.IsProcessMetalTubeExtrusion || processFlag.IsProcessMetalExtrusion },
      { key: FormGroupKeysMaterial.InsulationJacket, flag: processFlag.IsProcessInsulationJacket },
      { key: FormGroupKeysMaterial.Pcb, flag: processFlag.IsProcessConventionalPCB || processFlag.IsProcessRigidFlexPCB || processFlag.IsProcessSemiRigidFlexPCB },
      { key: FormGroupKeysMaterial.PlasticTubeExtrusion, flag: processFlag.IsProcessPlasticTubeExtrusion },
      // { key: FormGroupKeysMaterial.CompressionMolding, flag: processFlag.IsProcessPlasticVacuumForming },
      { key: FormGroupKeysMaterial.HotForgingClosedDieHot, flag: forging?.hotForgingClosedDieHot },
      { key: FormGroupKeysMaterial.CustomCable, flag: processFlag.IsProcessCustomizeCable },
      { key: FormGroupKeysMaterial.Pcba, flag: currentPart?.commodityId === CommodityType.Electronics },
      { key: FormGroupKeysMaterial.InjectionMolding, flag: processFlag.IsProcessTypeInjectionMolding || processFlag.IsProcessTypeRubberInjectionMolding },

      {
        key: FormGroupKeysMaterial.CompressionMolding,
        flag:
          processFlag.IsProcessTypeCompressionMolding ||
          processFlag.IsProcessTypeBlowMolding ||
          processFlag.IsProcessTypeTransferMolding ||
          processFlag.IsProcessTypeThermoForming ||
          processFlag.IsProcessThermoForming ||
          processFlag.IsProcessPlasticVacuumForming,
      },
      {
        key: FormGroupKeysMaterial.SheetMetal,
        flag:
          processFlag.IsProcessLaserCutting ||
          processFlag.IsProcessPlasmaCutting ||
          processFlag.IsProcessOxyCutting ||
          processFlag.IsProcessTubeLaserCutting ||
          processFlag.IsProcessTPP ||
          processFlag.IsProcessStampingStage ||
          processFlag.IsProcessStampingProgressive ||
          processFlag.IsProcessTransferPress ||
          processFlag.IsProcessMigWelding ||
          processFlag.IsProcessTigWelding ||
          processFlag.IsProcessTypeZincPlating ||
          processFlag.IsProcessTypeChromePlating ||
          processFlag.IsProcessTypeNickelPlating ||
          processFlag.IsProcessTypeCopperPlating ||
          processFlag.IsProcessTypeTinPlating ||
          processFlag.IsProcessTypeGoldPlating ||
          processFlag.IsProcessTypeSilverPlating ||
          processFlag.IsProcessTypeR2RPlating ||
          processFlag.IsProcessTypeGalvanization ||
          processFlag.IsProcessTypePowderCoating ||
          processFlag.IsProcessTypePowderPainting,
      },
      // { key: FormGroupKeysMaterial.MaterialSustainability, flag: true },
    ];

    const match = formMap.find((item) => item.key === el && item.flag);
    return match ? getFormGroup(match.key) : false;
  }

  getSubFormGroup(processFlag, forging, getFormGroup: (key: FormGroupKeysMaterial) => any): any {
    const processChecks: [boolean, FormGroupKeysMaterial][] = [
      [processFlag.IsProcessCasting, FormGroupKeysMaterial.Casting],
      [processFlag.IsProcessMetalTubeExtrusion || processFlag.IsProcessMetalExtrusion, FormGroupKeysMaterial.MetalExtrusion],
      [processFlag.IsProcessMachining, FormGroupKeysMaterial.Machining],
      [processFlag.IsProcessTubeBending, FormGroupKeysMaterial.TubeBending],
      [processFlag.IsProcessInsulationJacket, FormGroupKeysMaterial.InsulationJacket],
      [processFlag.IsProcessCustomizeCable, FormGroupKeysMaterial.CustomCable],
      [processFlag.IsProcessConventionalPCB, FormGroupKeysMaterial.Pcb],
      [processFlag.IsProcessRigidFlexPCB, FormGroupKeysMaterial.Pcb],
      [processFlag.IsProcessSemiRigidFlexPCB, FormGroupKeysMaterial.Pcb],
      [processFlag.IsProcessPlasticTubeExtrusion, FormGroupKeysMaterial.PlasticTubeExtrusion],
      [processFlag.IsProcessPlasticVacuumForming, FormGroupKeysMaterial.CompressionMolding],
      [processFlag.IsProcessTypeInjectionMolding || processFlag.IsProcessTypeRubberInjectionMolding, FormGroupKeysMaterial.InjectionMolding],
      [processFlag.IsProcessTypeCompressionMolding, FormGroupKeysMaterial.CompressionMolding],
      [processFlag.IsProcessTypeTransferMolding, FormGroupKeysMaterial.CompressionMolding],
      [processFlag.IsProcessTypeBlowMolding, FormGroupKeysMaterial.CompressionMolding],
      [processFlag.IsProcessThermoForming, FormGroupKeysMaterial.CompressionMolding],
      [processFlag.IsProcessLaserCutting, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTubeLaserCutting, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessPlasmaCutting, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessOxyCutting, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTPP, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessStampingStage, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessStampingProgressive, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTransferPress, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessMigWelding, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTigWelding, FormGroupKeysMaterial.SheetMetal],
      [forging.hotForgingClosedDieHot, FormGroupKeysMaterial.HotForgingClosedDieHot],

      [processFlag.IsProcessTypeZincPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeChromePlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeNickelPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeCopperPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeTinPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeGoldPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeSilverPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeR2RPlating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypeGalvanization, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypePowderCoating, FormGroupKeysMaterial.SheetMetal],
      [processFlag.IsProcessTypePowderPainting, FormGroupKeysMaterial.SheetMetal],
    ];
    for (const [flag, key] of processChecks) {
      if (flag) return getFormGroup(key);
    }
    return false;
  }

  public markFormGroupControls(element: any, processFlag: any, forging: any, costingMaterialInfoform: FormGroup) {
    if (!element?.formControlName) return;
    const controlName = element.formControlName;
    const formGroupKeys = [
      processFlag.IsProcessMachining && 'machiningMaterial',
      processFlag.IsProcessTubeBending && 'tubeBendingMaterial',
      processFlag.IsProcessInsulationJacket && 'insulationJacketMaterial',
      processFlag.IsProcessCasting && FormGroupKeysMaterial.Casting,
      (processFlag.IsProcessMetalTubeExtrusion || processFlag.IsProcessMetalExtrusion) && 'metalExtrusionMaterial',
      processFlag.IsProcessPlasticTubeExtrusion && 'plasticTubeExtrusionMaterial',
      processFlag.IsProcessPlasticVacuumForming && 'plasticVacuumFormingMaterial',
      processFlag.IsProcessCustomizeCable && 'customCableMaterial',
      (processFlag.IsProcessConventionalPCB || processFlag.IsProcessRigidFlexPCB || processFlag.IsProcessSemiRigidFlexPCB) && 'pcbMaterial',
      (processFlag.IsProcessTypeInjectionMolding || processFlag.IsProcessTypeRubberInjectionMolding) && 'injectionMoldingMaterial',
      (processFlag.IsProcessTypeCompressionMolding ||
        processFlag.IsProcessTypeBlowMolding ||
        processFlag.IsProcessTypeTransferMolding ||
        processFlag.IsProcessThermoForming ||
        processFlag.IsProcessPlasticVacuumForming) &&
        'compressionMoldingMaterial',
      (processFlag.IsProcessLaserCutting ||
        processFlag.IsProcessPlasmaCutting ||
        processFlag.IsProcessOxyCutting ||
        processFlag.IsProcessTubeLaserCutting ||
        processFlag.IsProcessTPP ||
        processFlag.IsProcessStampingStage ||
        processFlag.IsProcessStampingProgressive ||
        processFlag.IsProcessTransferPress ||
        processFlag.IsProcessMigWelding ||
        processFlag.IsProcessTigWelding ||
        processFlag.IsProcessTypeZincPlating ||
        processFlag.IsProcessTypeChromePlating ||
        processFlag.IsProcessTypeNickelPlating ||
        processFlag.IsProcessTypeCopperPlating ||
        processFlag.IsProcessTypeTinPlating ||
        processFlag.IsProcessTypeGoldPlating ||
        processFlag.IsProcessTypeSilverPlating ||
        processFlag.IsProcessTypeR2RPlating ||
        processFlag.IsProcessTypeGalvanization ||
        processFlag.IsProcessTypePowderCoating ||
        processFlag.IsProcessTypePowderPainting) &&
        'sheetMetalMaterial',
      forging.hotForgingClosedDieHot && 'hotForgingClosedDieHotMaterial',
      'materialSustainability',
    ].filter(Boolean);
    if (element.isTouched) {
      costingMaterialInfoform.get(controlName)?.markAsTouched();
    }
    if (element.isDirty) {
      costingMaterialInfoform.get(controlName)?.markAsDirty();
    }
    formGroupKeys.forEach((key) => {
      const formGroup = costingMaterialInfoform.get(key) as FormGroup;
      if (element.isTouched) {
        formGroup?.get(controlName)?.markAsTouched();
      }
      if (element.isDirty) {
        formGroup?.get(controlName)?.markAsDirty();
      }
    });
  }
}
