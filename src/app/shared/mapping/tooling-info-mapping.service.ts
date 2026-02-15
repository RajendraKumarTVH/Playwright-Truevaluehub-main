import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CostToolingDto } from '../models/tooling.model';
import { FormGroup } from '@angular/forms';
import { ToolingConfigService } from '../config/cost-tooling-config';

@Injectable({
  providedIn: 'root',
})
export class ToolingInfoMappingService {
  constructor(
    private sharedService: SharedService,
    private _costingConfig: ToolingConfigService
  ) {}
  getFormFields() {
    return {
      toolingId: [0],
      toolingNameId: [0],
      toolLifeInParts: [0],
      sourceCountryId: [0],
      envelopLength: [0],
      envelopWidth: [0],
      envelopHeight: [0],
      runnerGapLength: [0],
      runnerGapWidth: [0],
      sideGapLength: [0],
      sideGapWidth: [0],
      moldBaseLength: [0],
      moldBaseWidth: [0],
      moldBaseHeight: [0],
      cavityMaxLength: 0,
      noOfCavity: 0,
      cavityMaxWidth: 0,
      noOfTool: 0,
      noOfNewTool: 0,
      noOfSubsequentTool: 0,
      toolLifeNoOfShots: 0,
      noOfCopperElectrodes: 0,
      noOfGraphiteElectrodes: 0,
      surfaceFinish: 0,
      textureGrade: 'YS Number',
      mouldCriticality: 0,
      undercutsSideCores: 0,
      undercutsAngularSlides: 0,
      undercutsUnscrewing: 0,
      mouldTypeId: { value: 0, disabled: true },
      mouldSubTypeId: 0,
      noOfDrop: 0,
      hotRunnerCost: 0,
      electrodeMaterialCostGr: 0,
      electrodeMaterialCostCu: 0,
      totalSheetCost: 0,
      totalCoreCavityWeight: 0,
      totalMouldBaseWeight: 0,
      totalMouldBaseMaterialCost: 0,
      totalCoreCavityMaterialCost: 0,
      noOfDieStages: 0,
      noOfStagesAlong: 0,
      noOfStagesAcross: 0,
      dieSizeLength: 0,
      dieSizeWidth: 0,
      dieSetSizeLength: 0,
      dieSetSizeWidth: 0,
      dieSetSizeHeight: 0,
    };
  }

  resetForm() {
    return {
      toolingNameId: [0],
      toolLifeInParts: [0],
      sourceCountryId: [0],
      envelopLength: [0],
      envelopWidth: [0],
      envelopHeight: [0],
      runnerGapLength: [0],
      runnerGapWidth: [0],
      sideGapLength: [0],
      sideGapWidth: [0],
      moldBaseLength: [0],
      moldBaseWidth: [0],
      moldBaseHeight: [0],
      cavityMaxLength: 0,
      noOfCavity: 0,
      cavityMaxWidth: 0,
      noOfTool: 0,
      noOfNewTool: 0,
      noOfSubsequentTool: 0,
      toolLifeNoOfShots: 0,
      noOfCopperElectrodes: 0,
      noOfGraphiteElectrodes: 0,
      surfaceFinish: 0,
      textureGrade: 'YS Number',
      mouldCriticality: 0,
      undercutsSideCores: 0,
      undercutsAngularSlides: 0,
      undercutsUnscrewing: 0,
      mouldTypeId: 0,
      mouldSubTypeId: 0,
      noOfDrop: 0,
      hotRunnerCost: 0,
      electrodeMaterialCostGr: 0,
      electrodeMaterialCostCu: 0,
      totalSheetCost: 0,
      totalCoreCavityWeight: 0,
      totalMouldBaseWeight: 0,
      totalMouldBaseMaterialCost: 0,
      totalCoreCavityMaterialCost: 0,
      noOfDieStages: 0,
      noOfStagesAlong: 0,
      noOfStagesAcross: 0,
      dieSizeLength: 0,
      dieSizeWidth: 0,
      dieSetSizeLength: 0,
      dieSetSizeWidth: 0,
      dieSetSizeHeight: 0,
    };
  }

  clearMoldForm() {
    return {
      toolingNameId: [0],
      toolLifeInParts: [0],
      sourceCountryId: [0],
      //sourceCountryId: '',
      envelopLength: [0],
      envelopWidth: [0],
      envelopHeight: [0],
      runnerGapLength: [0],
      runnerGapWidth: [0],
      sideGapLength: [0],
      sideGapWidth: [0],
      moldBaseLength: [0],
      moldBaseWidth: [0],
      moldBaseHeight: [0],
      cavityMaxLength: 0,
      noOfCavity: 0,
      cavityMaxWidth: 0,
      noOfTool: 0,
      noOfNewTool: 0,
      noOfSubsequentTool: 0,
      toolLifeNoOfShots: 0,
      noOfCopperElectrodes: 0,
      noOfGraphiteElectrodes: 0,
      surfaceFinish: 0,
      textureGrade: 'YS Number',
      mouldCriticality: 0,
      undercutsSideCores: 0,
      undercutsAngularSlides: 0,
      undercutsUnscrewing: 0,
      mouldTypeId: 0,
      mouldSubTypeId: 0,
      noOfDrop: 0,
      hotRunnerCost: 0,
      electrodeMaterialCostGr: 0,
      electrodeMaterialCostCu: 0,
      totalSheetCost: 0,
      noOfDieStages: 0,
      noOfStagesAlong: 0,
      noOfStagesAcross: 0,
      dieSizeLength: 0,
      dieSizeWidth: 0,
      dieSetSizeLength: 0,
      dieSetSizeWidth: 0,
      dieSetSizeHeight: 0,
    };
  }

  onEditToolPatch(tool: CostToolingDto, primaryMaterialCavity, cavColsRows, conversionValue, isEnableUnitConversion) {
    return {
      toolingId: tool?.toolingId,
      toolingNameId: tool?.toolingNameId,
      toolLifeInParts: tool?.toolLifeInParts || 1000000,
      toolLifeNoOfShots: tool?.toolLifeNoOfShots,
      envelopLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.envelopLength), conversionValue, isEnableUnitConversion),
      envelopWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.envelopWidth), conversionValue, isEnableUnitConversion),
      envelopHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.envelopHeight), conversionValue, isEnableUnitConversion),
      runnerGapLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.runnerGapLength), conversionValue, isEnableUnitConversion),
      runnerGapWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.runnerGapWidth), conversionValue, isEnableUnitConversion),
      sideGapLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.sideGapLength), conversionValue, isEnableUnitConversion),
      sideGapWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.sideGapWidth), conversionValue, isEnableUnitConversion),
      moldBaseLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseLength), conversionValue, isEnableUnitConversion),
      moldBaseWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseWidth), conversionValue, isEnableUnitConversion),
      moldBaseHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseHeight), conversionValue, isEnableUnitConversion),
      noOfCavity: this.sharedService.isValidNumber(primaryMaterialCavity),
      // cavityMaxLength: cavColsRows.columns,
      // cavityMaxWidth: cavColsRows.rows,
      cavityMaxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.cavityMaxLength), conversionValue, isEnableUnitConversion),
      // cavityMaxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.cavityMaxWidth), conversionValue, isEnableUnitConversion),
      // cavityMaxLength: this.sharedService.isValidNumber(this._costingConfig.setCavityLenght(primaryMaterialCavity)),
      cavityMaxWidth: this.sharedService.isValidNumber(Math.round(Number(primaryMaterialCavity) / Number(tool?.cavityMaxLength))),
      noOfDieStages: this.sharedService.isValidNumber(tool?.noOfDieStages),
      noOfStagesAlong: this.sharedService.isValidNumber(tool?.noOfStagesAlong),
      noOfStagesAcross: this.sharedService.isValidNumber(tool?.noOfStagesAcross),
      dieSizeLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.dieSizeLength), conversionValue, isEnableUnitConversion),
      dieSizeWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.dieSizeWidth), conversionValue, isEnableUnitConversion),
      dieSetSizeLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.dieSetSizeLength), conversionValue, isEnableUnitConversion),
      dieSetSizeWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.dieSetSizeWidth), conversionValue, isEnableUnitConversion),
      dieSetSizeHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.dieSetSizeHeight), conversionValue, isEnableUnitConversion),
      noOfTool: this.sharedService.isValidNumber(tool?.noOfTool),
      noOfNewTool: this.sharedService.isValidNumber(tool?.noOfNewTool),
      noOfSubsequentTool: this.sharedService.isValidNumber(tool?.noOfSubsequentTool),
      noOfCopperElectrodes: this.sharedService.isValidNumber(tool?.noOfCopperElectrodes),
      noOfGraphiteElectrodes: this.sharedService.isValidNumber(tool?.noOfGraphiteElectrodes),
      surfaceFinish: this.sharedService.isValidNumber(tool?.surfaceFinish),
      textureGrade: tool?.textureGrade,
      mouldCriticality: this.sharedService.isValidNumber(tool?.mouldCriticality),
      undercutsSideCores: this.sharedService.isValidNumber(tool?.undercutsSideCores),
      undercutsAngularSlides: this.sharedService.isValidNumber(tool?.undercutsAngularSlides),
      undercutsUnscrewing: this.sharedService.isValidNumber(tool?.undercutsUnscrewing),
      mouldTypeId: this.sharedService.isValidNumber(tool?.mouldTypeId),
      mouldSubTypeId: this.sharedService.isValidNumber(tool?.mouldSubTypeId),
      noOfDrop: this.sharedService.isValidNumber(tool?.noOfDrop),
      hotRunnerCost: this.sharedService.isValidNumber(tool?.hotRunnerCost),
      electrodeMaterialCostGr: this.sharedService.isValidNumber(tool?.electrodeMaterialCostGr),
      electrodeMaterialCostCu: this.sharedService.isValidNumber(tool?.electrodeMaterialCostCu),
      totalSheetCost: this.sharedService.isValidNumber(tool?.totalSheetCost),
    };
  }

  calculateMaterialCostPatchToolResult(tool, conversionValue, isEnableUnitConversion) {
    return {
      moldBaseLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseLength), conversionValue, isEnableUnitConversion),
      moldBaseWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseWidth), conversionValue, isEnableUnitConversion),
      moldBaseHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseHeight), conversionValue, isEnableUnitConversion),
    };
  }

  bulkUpdateToolingModel(toolingFormGroup: FormGroup, conversionValue, isEnableUnitConversion): CostToolingDto {
    const tool = new CostToolingDto();
    tool.toolingNameId = Number(toolingFormGroup.controls['toolingNameId'].value);
    tool.toolLifeNoOfShots = Number(toolingFormGroup.controls['toolLifeNoOfShots'].value);
    tool.toolLifeInParts = Number(toolingFormGroup.controls['toolLifeInParts'].value);
    tool.envelopLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['envelopLength'].value), conversionValue, isEnableUnitConversion);
    tool.envelopWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['envelopWidth'].value), conversionValue, isEnableUnitConversion);
    tool.envelopHeight = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['envelopHeight'].value), conversionValue, isEnableUnitConversion);
    tool.runnerGapLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['runnerGapLength'].value), conversionValue, isEnableUnitConversion);
    tool.runnerGapWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['runnerGapWidth'].value), conversionValue, isEnableUnitConversion);
    tool.sideGapLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['sideGapLength'].value), conversionValue, isEnableUnitConversion);
    tool.sideGapWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['sideGapWidth'].value), conversionValue, isEnableUnitConversion);
    tool.moldBaseLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['moldBaseLength'].value), conversionValue, isEnableUnitConversion);
    tool.moldBaseWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['moldBaseWidth'].value), conversionValue, isEnableUnitConversion);
    tool.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.controls['moldBaseHeight'].value), conversionValue, isEnableUnitConversion);
    tool.cavityMaxLength = Number(toolingFormGroup.get('cavityMaxLength').value);
    tool.cavityMaxWidth = Number(toolingFormGroup.get('cavityMaxWidth').value);
    tool.noOfTool = toolingFormGroup.get('noOfTool').value;
    tool.noOfNewTool = toolingFormGroup.get('noOfNewTool').value;
    tool.noOfSubsequentTool = toolingFormGroup.get('noOfSubsequentTool').value;
    tool.noOfDieStages = toolingFormGroup.get('noOfDieStages').value;
    tool.noOfStagesAlong = toolingFormGroup.get('noOfStagesAlong').value;
    tool.noOfStagesAcross = toolingFormGroup.get('noOfStagesAcross').value;
    tool.dieSizeLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.get('dieSizeLength').value), conversionValue, isEnableUnitConversion);
    tool.dieSizeWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.get('dieSizeWidth').value), conversionValue, isEnableUnitConversion);
    tool.dieSetSizeLength = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.get('dieSetSizeLength').value), conversionValue, isEnableUnitConversion);
    tool.dieSetSizeWidth = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.get('dieSetSizeWidth').value), conversionValue, isEnableUnitConversion);
    tool.dieSetSizeHeight = this.sharedService.convertUomToSaveAndCalculation(Number(toolingFormGroup.get('dieSetSizeHeight').value), conversionValue, isEnableUnitConversion);
    tool.noOfCopperElectrodes = toolingFormGroup.get('noOfCopperElectrodes').value;
    tool.noOfGraphiteElectrodes = toolingFormGroup.get('noOfGraphiteElectrodes').value;
    tool.surfaceFinish = toolingFormGroup.get('surfaceFinish').value;
    tool.textureGrade = toolingFormGroup.get('textureGrade')?.value || 'YS Number';
    tool.noOfCavity = toolingFormGroup.get('noOfCavity').value;
    tool.mouldCriticality = toolingFormGroup.get('mouldCriticality').value;
    tool.undercutsSideCores = toolingFormGroup.get('undercutsSideCores').value;
    tool.undercutsAngularSlides = toolingFormGroup.get('undercutsAngularSlides').value;
    tool.undercutsUnscrewing = toolingFormGroup.get('undercutsUnscrewing').value;
    tool.mouldTypeId = toolingFormGroup.get('mouldTypeId').value;
    tool.mouldSubTypeId = toolingFormGroup.get('mouldSubTypeId').value;
    tool.noOfDrop = toolingFormGroup.get('noOfDrop').value;
    tool.hotRunnerCost = toolingFormGroup.get('hotRunnerCost').value;
    tool.electrodeMaterialCostGr = toolingFormGroup.get('electrodeMaterialCostGr').value;
    tool.electrodeMaterialCostCu = toolingFormGroup.get('electrodeMaterialCostCu').value;
    tool.totalSheetCost = toolingFormGroup.get('totalSheetCost').value;
    tool.UnScrewingCost = 0;
    tool.SideCoreCost = 0;
    tool.AngularSliderCost = 0;
    return tool;
  }

  addToolingMoldInfo(currentPart): CostToolingDto {
    const moldInfo = new CostToolingDto();
    moldInfo.toolingMaterialInfos = [];
    moldInfo.toolingProcessInfos = [];
    moldInfo.bopCostTooling = [];
    moldInfo.partInfoId = currentPart?.partInfoId;
    moldInfo.projectInfoId = currentPart?.projectInfoId;
    moldInfo.processInfoId = null;
    moldInfo.UnScrewingCost = 0;
    moldInfo.SideCoreCost = 0;
    moldInfo.AngularSliderCost = 0;
    return moldInfo;
  }

  calculateMoldCostPatch(result, conversionValue, isEnableUnitConversion) {
    return {
      envelopLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.envelopLength), conversionValue, isEnableUnitConversion),
      envelopWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.envelopWidth), conversionValue, isEnableUnitConversion),
      envelopHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.envelopHeight), conversionValue, isEnableUnitConversion),
      moldBaseLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBaseLength), conversionValue, isEnableUnitConversion),
      moldBaseWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBaseWidth), conversionValue, isEnableUnitConversion),
      moldBaseHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBaseHeight), conversionValue, isEnableUnitConversion),
      hotRunnerCost: this.sharedService.isValidNumber(result?.hotRunnerCost),
      noOfCopperElectrodes: this.sharedService.isValidNumber(result?.noOfCopperElectrodes),
      noOfGraphiteElectrodes: this.sharedService.isValidNumber(result?.noOfGraphiteElectrodes),
      electrodeMaterialCostGr: this.sharedService.isValidNumber(result?.electrodeMaterialCostGr),
      electrodeMaterialCostCu: this.sharedService.isValidNumber(result?.electrodeMaterialCostCu),
      noOfTool: this.sharedService.isValidNumber(result?.noOfTool),
      noOfNewTool: this.sharedService.isValidNumber(result?.noOfNewTool),
      noOfSubsequentTool: this.sharedService.isValidNumber(result?.noOfSubsequentTool),
      mouldTypeId: this.sharedService.isValidNumber(result?.mouldTypeId),
      mouldSubTypeId: this.sharedService.isValidNumber(result?.mouldSubTypeId),
      noOfDrop: this.sharedService.isValidNumber(result?.noOfDrop),
      //Stamping tooling fields
      noOfDieStages: this.sharedService.isValidNumber(result?.noOfDieStages),
      noOfStagesAlong: this.sharedService.isValidNumber(result?.noOfStagesAlong),
      noOfStagesAcross: this.sharedService.isValidNumber(result?.noOfStagesAcross),
      dieSizeLength: this.sharedService.isValidNumber(result?.dieSizeLength),
      dieSizeWidth: this.sharedService.isValidNumber(result?.dieSizeWidth),
      dieSetSizeLength: this.sharedService.isValidNumber(result?.dieSetSizeLength),
      dieSetSizeWidth: this.sharedService.isValidNumber(result?.dieSetSizeWidth),
      dieSetSizeHeight: this.sharedService.isValidNumber(result?.dieSetSizeHeight),
      cavityMaxLength: this.sharedService.isValidNumber(result?.cavityMaxLength),
      cavityMaxWidth: this.sharedService.isValidNumber(result?.cavityMaxWidth),
    };
  }

  recalculateModel(tool, selectedMaterial, currentPart) {
    tool.partLength = selectedMaterial?.dimX;
    tool.partWidth = selectedMaterial?.dimY;
    tool.partHeight = selectedMaterial?.dimZ;
    tool.partThickness = selectedMaterial.dimUnfoldedZ;
    tool.annualVolume = currentPart?.eav;
    tool.dimUnfoldedX = selectedMaterial.dimUnfoldedX;
    tool.dimUnfoldedY = selectedMaterial.dimUnfoldedY;
    tool.noOfCavity = selectedMaterial?.noOfCavities;
  }

  toolingFormDirtyCheck(moldInfo, frmctrl) {
    moldInfo.isNoOfStagesAlongDirty = frmctrl['noOfStagesAlong'].dirty;
    moldInfo.isNoOfDieStagesDirty = frmctrl['noOfDieStages'].dirty;
    moldInfo.isMoldBaseLengthDirty = frmctrl['moldBaseLength'].dirty;
    moldInfo.isMoldBaseWidthDirty = frmctrl['moldBaseWidth'].dirty;
    moldInfo.isMoldBaseHeightDirty = frmctrl['moldBaseHeight'].dirty;
    moldInfo.ishotRunnerCostDirty = frmctrl['hotRunnerCost'].dirty;
    moldInfo.ismouldTypeIdDirty = frmctrl['mouldTypeId'].dirty;
    moldInfo.ismouldSubTypeIdDirty = frmctrl['mouldSubTypeId'].dirty;
    moldInfo.isnoOfDropDirty = frmctrl['noOfDrop'].dirty;
    moldInfo.isNoOfStagesAcrossDirty = frmctrl['noOfStagesAcross'].dirty;
    moldInfo.isDieSizeLengthDirty = frmctrl['dieSizeLength'].dirty;
    moldInfo.isDieSizeWidthDirty = frmctrl['dieSizeWidth'].dirty;
    moldInfo.isEnvelopLengthDirty = frmctrl['envelopLength'].dirty;
    moldInfo.isEnvelopWidthDirty = frmctrl['envelopWidth'].dirty;
    moldInfo.isEnvelopHeightDirty = frmctrl['envelopHeight'].dirty;
    moldInfo.isnoOfToolDirty = frmctrl['noOfTool'].dirty;
    moldInfo.isnoOfSubsequentToolDirty = frmctrl['noOfSubsequentTool'].dirty;
    moldInfo.isnoOfNewToolDirty = frmctrl['noOfNewTool'].dirty;
    moldInfo.isnoOfCopperElectrodesDirty = frmctrl['noOfCopperElectrodes'].dirty;
    moldInfo.isnoOfGraphiteElectrodesDirty = frmctrl['noOfGraphiteElectrodes'].dirty;
    moldInfo.iscavityMaxWidthDirty = frmctrl['cavityMaxWidth'].dirty;
    moldInfo.iscavityMaxLengthDirty = frmctrl['cavityMaxLength'].dirty;
  }

  toolingFormAssignValue(moldInfo, frmctrl, toolingMasterData, materialInfoList, processInfoList, conversionValue, isEnableUnitConversion) {
    moldInfo.toolingMasterData = toolingMasterData;
    moldInfo.partLength = materialInfoList?.length && materialInfoList[0]?.dimX;
    moldInfo.partWidth = materialInfoList?.length && materialInfoList[0]?.dimY;
    moldInfo.partHeight = materialInfoList?.length && materialInfoList[0]?.dimZ;
    moldInfo.partThickness = materialInfoList?.length && materialInfoList[0]?.dimUnfoldedZ;
    moldInfo.noOfCavity = (materialInfoList?.length && materialInfoList[0]?.noOfCavities) || 1;
    moldInfo.dimUnfoldedX = materialInfoList?.length && materialInfoList[0]?.dimUnfoldedX;
    moldInfo.dimUnfoldedY = materialInfoList?.length && materialInfoList[0]?.dimUnfoldedY;
    moldInfo.noOfSubProcessTypeInfos = processInfoList?.length && processInfoList[0]?.subProcessTypeInfos?.length > 0 ? processInfoList[0]?.subProcessTypeInfos?.length : 0;
    moldInfo.toolLifeInParts = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['toolLifeInParts'].value), conversionValue, isEnableUnitConversion);
    moldInfo.envelopLength = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['envelopLength'].value), conversionValue, isEnableUnitConversion);
    moldInfo.envelopWidth = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['envelopWidth'].value), conversionValue, isEnableUnitConversion);
    moldInfo.envelopHeight = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['envelopHeight'].value), conversionValue, isEnableUnitConversion);
    moldInfo.runnerGapLength = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['runnerGapLength'].value), conversionValue, isEnableUnitConversion);
    moldInfo.runnerGapWidth = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['runnerGapWidth'].value), conversionValue, isEnableUnitConversion);
    moldInfo.sideGapLength = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['sideGapLength'].value), conversionValue, isEnableUnitConversion);
    moldInfo.sideGapWidth = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['sideGapWidth'].value), conversionValue, isEnableUnitConversion);
    moldInfo.cavityMaxLength = Number(frmctrl['cavityMaxLength'].value);
    moldInfo.cavityMaxWidth = Number(frmctrl['cavityMaxWidth'].value);
    moldInfo.surfaceFinish = frmctrl['surfaceFinish'].value;
    moldInfo.textureGrade = frmctrl['textureGrade']?.value || 'YS Number';
    moldInfo.mouldCriticality = frmctrl['mouldCriticality'].value;
    moldInfo.undercutsSideCores = frmctrl['undercutsSideCores'].value;
    moldInfo.undercutsAngularSlides = frmctrl['undercutsAngularSlides'].value;
    moldInfo.undercutsUnscrewing = frmctrl['undercutsUnscrewing'].value;
    moldInfo.noOfDieStages = !frmctrl['noOfDieStages'].dirty ? 1 : frmctrl['noOfDieStages'].value;
    moldInfo.noOfStagesAlong = !frmctrl['noOfStagesAlong'].dirty ? 1 : frmctrl['noOfStagesAlong'].value;
    moldInfo.noOfStagesAcross = frmctrl['noOfStagesAcross'].value;
    moldInfo.dieSizeLength = frmctrl['dieSizeLength'].value;
    moldInfo.dieSizeWidth = frmctrl['dieSizeWidth'].value;
    moldInfo.dieSetSizeLength = frmctrl['dieSetSizeLength'].value;
    moldInfo.dieSetSizeWidth = frmctrl['dieSetSizeWidth'].value;
    moldInfo.dieSetSizeHeight = frmctrl['dieSetSizeHeight'].value;
    moldInfo.noOfTool = Number(frmctrl['noOfTool'].value);
    moldInfo.noOfSubsequentTool = Number(frmctrl['noOfSubsequentTool'].value);
    moldInfo.noOfNewTool = Number(frmctrl['noOfNewTool'].value);
    moldInfo.noOfCopperElectrodes = Number(frmctrl['noOfCopperElectrodes'].value);
    moldInfo.noOfGraphiteElectrodes = Number(frmctrl['noOfGraphiteElectrodes'].value);
    moldInfo.mouldTypeId = Number(frmctrl['mouldTypeId'].value);
    moldInfo.mouldSubTypeId = Number(frmctrl['mouldSubTypeId'].value);
    moldInfo.noOfDrop = Number(frmctrl['noOfDrop'].value);
    moldInfo.moldBaseLength = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['moldBaseLength'].value), conversionValue, isEnableUnitConversion);
    moldInfo.moldBaseWidth = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['moldBaseWidth'].value), conversionValue, isEnableUnitConversion);
    moldInfo.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['moldBaseHeight'].value), conversionValue, isEnableUnitConversion);
    moldInfo.hotRunnerCost = Number(frmctrl['hotRunnerCost'].value);
    const contry = frmctrl['sourceCountryId'].value;
    moldInfo.sourceCountryId = contry ? contry?.countryId : 0;
    const toolingNameId = frmctrl['toolingNameId'].value;
    moldInfo.toolingNameId = toolingNameId ? toolingNameId : 0;
  }
}
