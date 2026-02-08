import { Injectable } from '@angular/core';
import { SheetMetalProcessGroup, SheetMetalTool, StampingMaterialLookUpCatEnum, ToolingMaterialSheetMetal } from 'src/app/shared/enums';
import { ToolingMaterialInfoDto, ToolingProcessInfoDto, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { SharedService } from './shared.service';
import { ToolingSharedCalculatorService } from './tooling-shared-calculator.service';
import { CommodityType } from '../costing.config';
import { ProcessInfoDto } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class ToolingSmCalculatorService {
  constructor(
    public sharedService: SharedService,
    protected toolingSharedCalculatorService: ToolingSharedCalculatorService
  ) {}

  public calculateMaterialCostForSm(
    matInfo: ToolingMaterialInfoDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    tool: CostToolingDto,
    selectedToolMaterial: ToolingMaterialInfoDto,
    fieldColorsList: any
  ) {
    //StampingTool material calculation
    if ([SheetMetalTool.StampingTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.CompoundTool, SheetMetalTool.FormingTool, SheetMetalTool.BendingTool].includes(tool.toolingNameId)) {
      this.calculateMaterialCostForStampingTool(matInfo, toolingMaterialInfoList, tool, selectedToolMaterial, fieldColorsList);
      // matInfo.totalPlateWeight = matInfo.totalPlateWeight;
    } else {
      let envHeight = 0,
        envWidth = 0,
        envLength = 0;
      if (matInfo.moldDescription == ToolingMaterialSheetMetal.DieBlock || ToolingMaterialSheetMetal.PunchBlock) {
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(
            Math.pow(Number(matInfo.moldBaseLength * 2 + Number(matInfo.moldBaseWidth * 2) * 2 * Number(matInfo.tensileStrength) * Number(80 / 100)), 1 / 3)
          );
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(matInfo.moldBaseWidth) + Number(envHeight) * 2);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(matInfo.moldBaseLength) + Number(envHeight) * 2);
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.Die) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.DieBlock);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber((Number(materialInfo?.height) * 30) / 100);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber((Number(materialInfo?.width) * 50) / 100);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber((Number(materialInfo?.length) * 50) / 100);
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.Punch) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.Die);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height));
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.TopPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.DieBlock);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height) * 1.5);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width) * 2.5);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length) * 2.5);
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.TopPunchBackPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.Punch);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height) * 0.5);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width) * 2.5);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length) * 2.5);
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.TopPunchHolderPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPunchBackPlate);
        const punchMaterialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.Punch);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(punchMaterialInfo?.height) * 0.75);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.BottomPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.DieBlock);
        const topPlateMaterialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPlate);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height) * 2);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(topPlateMaterialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(topPlateMaterialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.BottomDieBackPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPunchBackPlate);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height));
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.BottomDieHolderPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPunchHolderPlate);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height));
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.StripperPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.DieBlock);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height) * 0.5);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.KnockOutPlate) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.PunchBlock);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(materialInfo?.height) * 0.5);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.width));
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length));
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.GuidePillar) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPlate);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber(Number(matInfo.length) * 3);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber((Number(materialInfo?.length) * 15) / 100);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber((Number(materialInfo?.length) * 15) / 100);
        }
      } else if (matInfo.moldDescription == ToolingMaterialSheetMetal.GuideBush) {
        const materialInfo = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.GuidePillar);
        if (!matInfo.isHeightDirty) {
          envHeight = this.sharedService.isValidNumber((Number(materialInfo?.height) * 20) / 100);
        }
        if (!matInfo.isWidthDirty) {
          envWidth = this.sharedService.isValidNumber(Number(materialInfo?.length) * 2);
        }
        if (!matInfo.isLengthDirty) {
          envLength = this.sharedService.isValidNumber(Number(materialInfo?.length) * 2);
        }
      } else {
        matInfo.length = envLength;
        matInfo.width = envWidth;
        matInfo.height = envHeight;
        if (!matInfo.isTotalPlateWeightDirty) {
          matInfo.totalPlateWeight = Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6));
          // matInfo.totalPlateWeight = matInfo.totalPlateWeight;
        }
      }
    }
  }

  private calculateMaterialCostForStampingTool(
    matInfo: ToolingMaterialInfoDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    tool: CostToolingDto,
    selectedToolMaterial: ToolingMaterialInfoDto,
    fieldColorsList: any
  ) {
    switch (matInfo.moldDescription) {
      case ToolingMaterialSheetMetal.Die: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = tool?.noOfDieStages; //default as per the template
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(tool?.dieSizeLength);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(tool?.dieSizeWidth);
        }

        this.resetHeightForStampingMaterialDiePunches(matInfo, tool, selectedToolMaterial, fieldColorsList, StampingMaterialLookUpCatEnum.DieInsertHeight);
        this.resetNetweightForStampingToolMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.Punch: {
        const die = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.Die);
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = tool?.noOfDieStages; //default as per the template

        if ([SheetMetalTool.CompoundTool, SheetMetalTool.FormingTool, SheetMetalTool.BendingTool].includes(tool?.toolingNameId)) {
          if (!matInfo.isLengthDirty) {
            matInfo.length = this.sharedService.isValidNumber(die?.length);
          }
          if (!matInfo.isWidthDirty) {
            matInfo.width = this.sharedService.isValidNumber(die?.width);
          }
        } else {
          if (!matInfo.isLengthDirty) {
            matInfo.length = this.sharedService.isValidNumber(tool?.envelopLength);
          }
          if (!matInfo.isWidthDirty) {
            matInfo.width = this.sharedService.isValidNumber(tool?.envelopWidth);
          }
        }

        this.resetHeightForStampingMaterialDiePunches(matInfo, tool, selectedToolMaterial, fieldColorsList, StampingMaterialLookUpCatEnum.PunchHeight);
        this.resetNetweightForStampingToolMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.BottomDieHolderPlate: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = 1; //default as per the template
        const dieInsert = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.Die);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(tool?.dieSetSizeLength);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(tool?.dieSetSizeWidth);
        }

        if (matInfo.isHeightDirty && matInfo?.height != null) {
          //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
          matInfo.height = Number(matInfo.height);
        } else {
          let height = dieInsert.height;
          if (matInfo.height != null) {
            height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
          }
          matInfo.height = height;
        }

        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.BottomDieBackPlate: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = 1; //default as per the template
        const bottomDieHolderPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.BottomDieHolderPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(bottomDieHolderPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(bottomDieHolderPlate.width);
        }

        if (matInfo.isHeightDirty && matInfo?.height != null) {
          //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
          matInfo.height = Number(matInfo.height);
        } else {
          const vol = tool?.toolingNameId === SheetMetalTool.CompoundTool ? 0 : tool?.annualVolume > 0 ? tool.annualVolume : 15;
          let height = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.DieBackPlate, vol);

          if (matInfo.height != null) {
            height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
          }
          matInfo.height = height;
        }

        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.TopPunchHolderPlate: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = 1; //default as per the template
        const bottomDieBackPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.BottomDieBackPlate);
        const dieHolderPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.BottomDieHolderPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(bottomDieBackPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(bottomDieBackPlate.width);
        }

        if (matInfo.isHeightDirty && matInfo?.height != null) {
          //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
          matInfo.height = Number(matInfo.height);
        } else {
          let height = this.sharedService.isValidNumber(this.sharedService.isValidNumber(dieHolderPlate.height) + 30 + 30);
          if (matInfo.height != null) {
            height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
          }
          matInfo.height = height;
        }

        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = this.sharedService.isValidNumber(matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo)));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.TopPunchBackPlate: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = 1; //default as per the template
        const topPunchHolderPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPunchHolderPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(topPunchHolderPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(topPunchHolderPlate.width);
        }

        if (matInfo.isHeightDirty && matInfo?.height != null) {
          //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
          matInfo.height = Number(matInfo.height);
        } else {
          const vol = tool?.toolingNameId === SheetMetalTool.CompoundTool ? 0 : tool?.annualVolume > 0 ? tool.annualVolume : 15;
          let height = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.PunchBackPlate, vol);
          if (matInfo.height != null) {
            height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
          }
          matInfo.height = height;
        }

        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = this.sharedService.isValidNumber(matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo)));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.StripperPlate: {
        this.resetPriceDensity(matInfo, selectedToolMaterial, fieldColorsList);
        matInfo.quantity = 1; //default as per the template
        const widthPunchBackPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPunchBackPlate);
        const lengthdieHolderPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.BottomDieHolderPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(lengthdieHolderPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(widthPunchBackPlate.width);
        }
        // if (!matInfo.isHeightDirty) {
        //   const expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.StripperPlate, tool?.partThickness);//tool?.partThickness
        //   matInfo.height = 30;
        // }

        if (matInfo.isHeightDirty && matInfo?.height != null) {
          //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
          matInfo.height = Number(matInfo.height);
        } else {
          let expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.StripperPlate, tool?.partThickness); //tool?.partThickness
          if (matInfo.height != null) {
            expectedValue = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : expectedValue;
          }
          matInfo.height = expectedValue;
        }
        // else {
        //   const expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.StripperPlate, tool?.partThickness);//tool?.partThickness
        //   matInfo.height = expectedValue;
        // }

        //matInfo.netWeight = this.sharedService.isValidNumber((this.sharedService.isValidNumber(matInfo.length) * this.sharedService.isValidNumber(matInfo.width) * this.sharedService.isValidNumber(matInfo.height) * this.sharedService.isValidNumber(matInfo.density) * Math.pow(10, -6) * this.sharedService.isValidNumber(1)));//matInfo.quantity
        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = this.sharedService.isValidNumber(matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo)));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.TopPlate: {
        matInfo.quantity = 1; //default as per the template
        const stripperPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.StripperPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(stripperPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(stripperPlate.width);
        }
        //Question?
        matInfo.height = 100;
        // }
        //matInfo.netWeight = this.sharedService.isValidNumber((this.sharedService.isValidNumber(matInfo.length) * this.sharedService.isValidNumber(matInfo.width) * this.sharedService.isValidNumber(matInfo.height) * this.sharedService.isValidNumber(matInfo.density) * Math.pow(10, -6) * this.sharedService.isValidNumber(1)));//matInfo.quantity
        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = this.sharedService.isValidNumber(matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo)));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      case ToolingMaterialSheetMetal.BottomPlate: {
        matInfo.quantity = 1; //default as per the template
        const topPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialSheetMetal.TopPlate);
        if (!matInfo.isLengthDirty) {
          matInfo.length = this.sharedService.isValidNumber(topPlate.length);
        }
        if (!matInfo.isWidthDirty) {
          matInfo.width = this.sharedService.isValidNumber(topPlate.width);
        }
        matInfo.height = this.sharedService.isValidNumber(topPlate.height);
        //matInfo.netWeight = this.sharedService.isValidNumber((this.sharedService.isValidNumber(matInfo.length) * this.sharedService.isValidNumber(matInfo.width) * this.sharedService.isValidNumber(matInfo.height) * this.sharedService.isValidNumber(matInfo.density) * Math.pow(10, -6) * this.sharedService.isValidNumber(1)));//matInfo.quantity
        this.resetNetweightForStampingToolOtherMaterials(matInfo, tool, selectedToolMaterial, fieldColorsList);
        matInfo.totalPlateWeight = this.sharedService.isValidNumber(matInfo.netWeight * (1 + this.toolingSharedCalculatorService.calculateMaterialAllowance(matInfo)));
        this.toolingSharedCalculatorService.calculateTotalMaterialCost(matInfo, selectedToolMaterial, fieldColorsList);
        break;
      }
      default:
        break;
    }
  }

  private resetPriceDensity(matInfo: ToolingMaterialInfoDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      matInfo.materialPrice = Number(matInfo.materialPrice);
    } else {
      let materialPrice = Number(matInfo.materialPrice);
      if (matInfo.materialPrice != null) {
        materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      }
      matInfo.materialPrice = materialPrice;
    }

    if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      matInfo.scrapPrice = Number(matInfo.scrapPrice);
    } else {
      let scrapPrice = Number(matInfo.scrapPrice);
      if (matInfo.scrapPrice != null) {
        scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      }
      matInfo.scrapPrice = scrapPrice;
    }

    if (matInfo.isdensityDirty && matInfo.density != null) {
      matInfo.density = Number(matInfo.density);
    } else {
      let density = Number(matInfo.density);
      if (matInfo.density != null) {
        density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      }
      matInfo.density = density;
    }
  }

  private resetHeightForStampingMaterialDiePunches(
    matInfo: ToolingMaterialInfoDto,
    tool: CostToolingDto,
    selectedToolMaterial: ToolingMaterialInfoDto,
    fieldColorsList: any,
    lookUpEnum: StampingMaterialLookUpCatEnum
  ) {
    if (matInfo.isHeightDirty && matInfo?.height != null) {
      //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
      matInfo.height = Number(matInfo.height);
    } else if (matInfo.height != null) {
      if (this.sharedService.checkDirtyProperty('height', fieldColorsList)) {
        matInfo.height = selectedToolMaterial?.height;
      } else {
        const expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(lookUpEnum, tool?.partThickness); //tool?.partThickness
        matInfo.height = this.sharedService.isValidNumber(tool?.partThickness) + this.sharedService.isValidNumber(expectedValue); //tool?.partThickness
      } // (this.sharedService.isValidNumber(moldInfo.dimUnfoldedX * 1.5));
    } else {
      const expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(lookUpEnum, tool?.partThickness); //tool?.partThickness
      matInfo.height = this.sharedService.isValidNumber(tool?.partThickness) + this.sharedService.isValidNumber(expectedValue); //tool?.partThickness
    }
  }

  private resetNetweightForStampingToolMaterials(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    if (matInfo.isnetWeightDirty && matInfo?.netWeight != null) {
      //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
      matInfo.netWeight = Number(matInfo.netWeight);
    } else {
      let newWeight = this.sharedService.isValidNumber(
        this.sharedService.isValidNumber(matInfo.length) *
          this.sharedService.isValidNumber(matInfo.width) *
          this.sharedService.isValidNumber(matInfo.height) *
          this.sharedService.isValidNumber(matInfo.density) *
          Math.pow(10, -6) *
          this.sharedService.isValidNumber(tool.noOfDieStages)
      ); //matInfo.quantity
      if (matInfo.netWeight != null) {
        newWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : newWeight; // (this.sharedService.isValidNumber(moldInfo.dimUnfoldedX * 1.5));
      }
      matInfo.netWeight = newWeight;
    }
  }

  private resetNetweightForStampingToolOtherMaterials(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    if (matInfo.isnetWeightDirty && matInfo?.netWeight != null) {
      //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
      matInfo.netWeight = Number(matInfo.netWeight);
    } else {
      let newWeight = this.sharedService.isValidNumber(
        this.sharedService.isValidNumber(matInfo.length) *
          this.sharedService.isValidNumber(matInfo.width) *
          this.sharedService.isValidNumber(matInfo.height) *
          this.sharedService.isValidNumber(matInfo.density) *
          Math.pow(10, -6) *
          this.sharedService.isValidNumber(1)
      );
      if (matInfo.netWeight != null) {
        newWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : newWeight; // (this.sharedService.isValidNumber(moldInfo.dimUnfoldedX * 1.5));
      }
      matInfo.netWeight = newWeight;
    }
  }

  private resetHeightForStampingOtherMaterial(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    if (matInfo.isHeightDirty && matInfo?.height != null) {
      //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
      matInfo.height = Number(matInfo.height);
    } else if (matInfo.height != null) {
      matInfo.height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : matInfo.height;
    }
  }

  calculateSubSequenctialCostForSheetMetal(tool: CostToolingDto) {
    let materialCost = 0;
    let subSequentialCost = 0;
    tool.toolingMaterialInfos?.forEach((material) => {
      //if (material.moldDescription === ToolingMaterialSheetMetal.Die || material.moldDescription === ToolingMaterialSheetMetal.Punch) {
      materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
      //}
    });
    subSequentialCost += materialCost * 0.2;

    if (tool.bopCostTooling) {
      tool.bopCostTooling?.forEach((bop) => {
        subSequentialCost += this.sharedService.isValidNumber(bop.totalProcessCost);
      });
    }

    if (tool.toolingProcessInfos && tool.toolingProcessInfos.length > 0) {
      tool.toolingProcessInfos?.forEach((processInfo) => {
        if (processInfo.processGroupId === SheetMetalProcessGroup.MachineOperations) {
          subSequentialCost += this.sharedService.isValidNumber(processInfo.totalProcessCost);
        } else if (processInfo.processGroupId === SheetMetalProcessGroup.Validation && processInfo.totalProcessCost > 0) {
          const validationCost = processInfo.totalProcessCost * 0.5;
          subSequentialCost += this.sharedService.isValidNumber(validationCost);
        }
      });
    }
    subSequentialCost = subSequentialCost * this.sharedService.isValidNumber(tool.noOfSubsequentTool);
    tool.subsequentToolCost = subSequentialCost;
  }

  calculateStagesForProgressDieProcess(costTooling: CostToolingDto) {
    let stages = 0;
    if (costTooling || costTooling?.noOfSubProcessTypeInfos > 0) {
      const featureCount = costTooling?.noOfSubProcessTypeInfos - 1;
      if (featureCount <= 5) {
        stages = this.sharedService.isValidNumber(3 + (featureCount + Number(featureCount / 2)) + 1 + 0);
      } else if (featureCount > 5 && featureCount <= 8) {
        stages = this.sharedService.isValidNumber(3 + featureCount + Number(featureCount / 2 + 1) + 1 + 1);
      } else {
        stages = this.sharedService.isValidNumber(4 + featureCount + Number(featureCount / 2) + 1 + 2);
      }
    }
    return Math.round(stages);
  }

  calculatePartSectionToolingFields(moldInfo: CostToolingDto, selectedTool: CostToolingDto, currentPart: any, fieldColorsList: any, processInfo: ProcessInfoDto = null) {
    if (currentPart.commodityId == CommodityType.SheetMetal) {
      switch (selectedTool.toolingNameId) {
        case SheetMetalTool.StampingTool:
        case SheetMetalTool.BalnkAndPierce: {
          const expectedValue = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.DieInsertWidth, moldInfo.partWidth);
          if (moldInfo.isNoOfDieStagesDirty && moldInfo?.noOfDieStages != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.noOfDieStages = Number(moldInfo.noOfDieStages);
          } else {
            let noOfDieStages = 1;
            if (SheetMetalTool.StampingTool === selectedTool.toolingNameId) {
              // stamping tool progressive
              noOfDieStages = processInfo.noOfStartsPierce ?? this.calculateStagesForProgressDieProcess(moldInfo); // logic changed 29 Jan - suggested by Thridnath
            }
            if (moldInfo.noOfDieStages != null) {
              noOfDieStages = this.sharedService.checkDirtyProperty('noOfDieStages', fieldColorsList) ? selectedTool?.noOfDieStages : noOfDieStages;
            }
            moldInfo.noOfDieStages = noOfDieStages;
          }

          if (moldInfo.isNoOfStagesAlongDirty && moldInfo?.noOfStagesAlong != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.noOfStagesAlong = Number(moldInfo.noOfStagesAlong);
          } else {
            let noOfStagesAlong = moldInfo.noOfDieStages;
            if (moldInfo.noOfStagesAlong != null) {
              noOfStagesAlong = this.sharedService.checkDirtyProperty('noOfStagesAlong', fieldColorsList) ? selectedTool?.noOfStagesAlong : noOfStagesAlong;
            }
            moldInfo.noOfStagesAlong = noOfStagesAlong;
          }

          if (moldInfo.isNoOfStagesAcrossDirty && moldInfo?.noOfStagesAcross != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.noOfStagesAcross = Number(moldInfo.noOfStagesAcross);
          } else {
            let noOfStagesAcross = this.sharedService.isValidNumber(moldInfo.noOfDieStages) / this.sharedService.isValidNumber(moldInfo.noOfStagesAlong);
            if (SheetMetalTool.StampingTool === selectedTool.toolingNameId) {
              // stamping tool progressive
              noOfStagesAcross = processInfo.noofStroke ?? noOfStagesAcross; // logic changed 29 Jan - suggested by Thridnath
            }
            if (moldInfo.noOfStagesAcross != null) {
              noOfStagesAcross = this.sharedService.checkDirtyProperty('noOfStagesAcross', fieldColorsList) ? selectedTool?.noOfStagesAcross : noOfStagesAcross;
            }
            moldInfo.noOfStagesAcross = noOfStagesAcross;
          }

          if (moldInfo.isDieSizeLengthDirty && moldInfo?.dieSizeLength != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.dieSizeLength = Number(moldInfo.dieSizeLength);
          } else {
            let dieLength = this.sharedService.isValidNumber(moldInfo.dimUnfoldedX * 1.5);
            if (moldInfo.dieSizeLength != null) {
              dieLength = this.sharedService.checkDirtyProperty('dieSizeLength', fieldColorsList) ? selectedTool?.dieSizeLength : dieLength;
            }
            moldInfo.dieSizeLength = dieLength;
          }

          if (moldInfo.isDieSizeWidthDirty && moldInfo?.dieSizeWidth != null) {
            // (moldInfo?.dieSizeWidth === null || moldInfo?.dieSizeWidth === undefined || !moldInfo.isDieSizeWidthDirty)) {//|| moldInfo?.dieSizeWidth <= 0
            moldInfo.dieSizeWidth = Number(moldInfo.dieSizeWidth);
          } else {
            let dieWidht = this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue);
            if (moldInfo.dieSizeWidth != null) {
              dieWidht = this.sharedService.checkDirtyProperty('dieSizeWidth', fieldColorsList) ? selectedTool?.dieSizeWidth : dieWidht; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
            }
            moldInfo.dieSizeWidth = dieWidht;
          }

          moldInfo.dieSetSizeLength =
            this.sharedService.isValidNumber(moldInfo.dieSizeLength) * this.sharedService.isValidNumber(moldInfo.noOfStagesAlong) + this.sharedService.isValidNumber(moldInfo.sideGapLength) * 2;
          moldInfo.dieSetSizeWidth =
            this.sharedService.isValidNumber(moldInfo.dieSizeWidth) * this.sharedService.isValidNumber(moldInfo.noOfStagesAcross) + this.sharedService.isValidNumber(moldInfo.sideGapWidth) * 2;

          if (moldInfo.isnoOfToolDirty && moldInfo?.noOfTool != null) {
            //(moldInfo?.noOfTool === null || moldInfo?.noOfTool === undefined) && (!moldInfo.isnoOfToolDirty || moldInfo?.noOfTool <= 0)) {
            moldInfo.noOfTool = Number(moldInfo.noOfTool);
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          } else if (moldInfo.noOfTool != null) {
            moldInfo.noOfTool = this.sharedService.checkDirtyProperty('noOfTool', fieldColorsList) ? selectedTool?.noOfTool : moldInfo.noOfTool; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
          } else {
            moldInfo.noOfTool = Math.round(this.sharedService.isValidNumber(Number(currentPart?.prodLifeRemaining) / (Number(moldInfo?.toolLifeNoOfShots) * Number(moldInfo?.noOfDieStages))));
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          }
          moldInfo.noOfSubsequentTool = this.sharedService.isValidNumber(moldInfo.noOfTool) - this.sharedService.isValidNumber(moldInfo.noOfNewTool);
          break;
        }
        case SheetMetalTool.CompoundTool: {
          const lookUpvalues = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.DieInsertWidth, moldInfo.partWidth);
          if ((moldInfo?.noOfDieStages === null || moldInfo?.noOfDieStages === undefined) && (!moldInfo.isNoOfDieStagesDirty || moldInfo?.noOfDieStages <= 0)) {
            moldInfo.noOfDieStages = 1; //default value;
          }
          if (moldInfo.isNoOfDieStagesDirty && moldInfo?.noOfDieStages != null) {
            moldInfo.noOfDieStages = 1;
          } else {
            let noOfDieStages = 1;
            if (moldInfo?.noOfDieStages != null) {
              noOfDieStages = this.sharedService.checkDirtyProperty('noOfDieStages', fieldColorsList) ? selectedTool?.noOfDieStages : noOfDieStages;
            }
            moldInfo.noOfDieStages = noOfDieStages;
          }

          if (moldInfo.isDieSizeLengthDirty && moldInfo?.dieSizeLength != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.dieSizeLength = Number(moldInfo.dieSizeLength);
          } else {
            let dieLength = this.sharedService.isValidNumber(moldInfo.dimUnfoldedX * 1.5); //its 1 for bending
            if (moldInfo.dieSizeLength != null) {
              dieLength = this.sharedService.checkDirtyProperty('dieSizeLength', fieldColorsList) ? selectedTool?.dieSizeLength : dieLength;
            }
            moldInfo.dieSizeLength = dieLength;
          }

          if (moldInfo.isDieSizeWidthDirty && moldInfo?.dieSizeWidth != null) {
            // (moldInfo?.dieSizeWidth === null || moldInfo?.dieSizeWidth === undefined || !moldInfo.isDieSizeWidthDirty)) {//|| moldInfo?.dieSizeWidth <= 0
            moldInfo.dieSizeWidth = Number(moldInfo.dieSizeWidth);
          } else {
            let dieWidht = this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(lookUpvalues);
            if (moldInfo.dieSizeWidth != null) {
              dieWidht = this.sharedService.checkDirtyProperty('dieSizeWidth', fieldColorsList) ? selectedTool?.dieSizeWidth : dieWidht; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
            }
            moldInfo.dieSizeWidth = dieWidht;
          }

          moldInfo.dieSetSizeLength = this.sharedService.isValidNumber(moldInfo.dieSizeLength) + this.sharedService.isValidNumber(moldInfo.sideGapLength) * 2;
          if (moldInfo.toolingNameId === SheetMetalTool.CompoundTool) {
            moldInfo.dieSetSizeWidth = this.sharedService.isValidNumber(moldInfo.dieSizeWidth) + this.sharedService.isValidNumber(moldInfo.sideGapWidth) * 2;
          } else {
            moldInfo.dieSetSizeWidth =
              this.sharedService.isValidNumber(moldInfo.dieSizeWidth) * this.sharedService.isValidNumber(moldInfo.noOfStagesAcross) + this.sharedService.isValidNumber(moldInfo.sideGapWidth) * 2;
          }
          if (moldInfo.isnoOfToolDirty && moldInfo?.noOfTool != null) {
            //(moldInfo?.noOfTool === null || moldInfo?.noOfTool === undefined) && (!moldInfo.isnoOfToolDirty || moldInfo?.noOfTool <= 0)) {
            moldInfo.noOfTool = Number(moldInfo.noOfTool);
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          } else if (moldInfo.noOfTool != null) {
            moldInfo.noOfTool = this.sharedService.checkDirtyProperty('noOfTool', fieldColorsList) ? selectedTool?.noOfTool : moldInfo.noOfTool; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
          } else {
            moldInfo.noOfTool = Math.round(this.sharedService.isValidNumber(Number(currentPart?.prodLifeRemaining) / (Number(moldInfo?.toolLifeNoOfShots) * Number(moldInfo?.noOfDieStages))));
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          }
          moldInfo.noOfSubsequentTool = this.sharedService.isValidNumber(moldInfo.noOfTool) - this.sharedService.isValidNumber(moldInfo.noOfNewTool);
          break;
        }
        case SheetMetalTool.FormingTool:
        case SheetMetalTool.BendingTool: {
          const forminglookUpvalues = this.toolingSharedCalculatorService.getStampingMaterialLookUpValue(StampingMaterialLookUpCatEnum.DieInsertWidth, moldInfo.partWidth);
          if ((moldInfo?.noOfDieStages === null || moldInfo?.noOfDieStages === undefined) && (!moldInfo.isNoOfDieStagesDirty || moldInfo?.noOfDieStages <= 0)) {
            moldInfo.noOfDieStages = 1; //default value;
          }
          if (moldInfo.isNoOfDieStagesDirty && moldInfo?.noOfDieStages != null) {
            moldInfo.noOfDieStages = Number(moldInfo.noOfDieStages);
          } else {
            let noOfDieStages = 1;
            if (moldInfo?.noOfDieStages != null) {
              noOfDieStages = this.sharedService.checkDirtyProperty('noOfDieStages', fieldColorsList) ? selectedTool?.noOfDieStages : noOfDieStages;
            }
            moldInfo.noOfDieStages = noOfDieStages;
          }

          if (moldInfo.isDieSizeLengthDirty && moldInfo?.dieSizeLength != null) {
            //(moldInfo?.dieSizeLength === null || moldInfo?.dieSizeLength === undefined || !moldInfo.isDieSizeLengthDirty)) { // || moldInfo?.dieSizeLength <= 0
            moldInfo.dieSizeLength = Number(moldInfo.dieSizeLength);
          } else {
            const extralen = SheetMetalTool.BendingTool === selectedTool.toolingNameId ? 1 : 1.5;
            let dieLength = this.sharedService.isValidNumber(moldInfo.envelopLength * extralen); //its 1 for bending
            if (moldInfo.dieSizeLength != null) {
              dieLength = this.sharedService.checkDirtyProperty('dieSizeLength', fieldColorsList) ? selectedTool?.dieSizeLength : dieLength;
            }
            moldInfo.dieSizeLength = dieLength;
          }

          if (moldInfo.isDieSizeWidthDirty && moldInfo?.dieSizeWidth != null) {
            // (moldInfo?.dieSizeWidth === null || moldInfo?.dieSizeWidth === undefined || !moldInfo.isDieSizeWidthDirty)) {//|| moldInfo?.dieSizeWidth <= 0
            moldInfo.dieSizeWidth = Number(moldInfo.dieSizeWidth);
          } else {
            let dieWidht = this.sharedService.isValidNumber(moldInfo.envelopWidth) + this.sharedService.isValidNumber(forminglookUpvalues);
            if (moldInfo.dieSizeWidth != null) {
              dieWidht = this.sharedService.checkDirtyProperty('dieSizeWidth', fieldColorsList) ? selectedTool?.dieSizeWidth : dieWidht; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
            }
            moldInfo.dieSizeWidth = dieWidht;
          }

          moldInfo.dieSetSizeLength = this.sharedService.isValidNumber(moldInfo.dieSizeLength) + this.sharedService.isValidNumber(moldInfo.sideGapLength * 2);
          moldInfo.dieSetSizeWidth = this.sharedService.isValidNumber(moldInfo.dieSizeWidth) + this.sharedService.isValidNumber(moldInfo.sideGapWidth) * 2;

          if (moldInfo.isnoOfToolDirty && moldInfo?.noOfTool != null) {
            //(moldInfo?.noOfTool === null || moldInfo?.noOfTool === undefined) && (!moldInfo.isnoOfToolDirty || moldInfo?.noOfTool <= 0)) {
            moldInfo.noOfTool = Number(moldInfo.noOfTool);
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          } else if (moldInfo.noOfTool != null) {
            moldInfo.noOfTool = this.sharedService.checkDirtyProperty('noOfTool', fieldColorsList) ? selectedTool?.noOfTool : moldInfo.noOfTool; //(this.sharedService.isValidNumber(moldInfo.dimUnfoldedY) + this.sharedService.isValidNumber(expectedValue));
          } else {
            moldInfo.noOfTool = Math.round(this.sharedService.isValidNumber(Number(currentPart?.prodLifeRemaining) / (Number(moldInfo?.toolLifeNoOfShots) * Number(moldInfo?.noOfDieStages))));
            moldInfo.noOfTool = moldInfo.noOfTool == 0 ? 1 : moldInfo.noOfTool;
          }
          moldInfo.noOfSubsequentTool = this.sharedService.isValidNumber(moldInfo.noOfTool) - this.sharedService.isValidNumber(moldInfo.noOfNewTool);
          break;
        }
      }
    }
  }

  calculateStampingToolDieSetHeight(costTooling: CostToolingDto, currentPart: any) {
    let dieSetHeight = 0;
    if (
      currentPart.commodityId == CommodityType.SheetMetal &&
      [SheetMetalTool.StampingTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.FormingTool, SheetMetalTool.CompoundTool, SheetMetalTool.BendingTool].includes(costTooling.toolingNameId)
    ) {
      const dieInserTotalMaterialCost = costTooling.toolingMaterialInfos?.filter((x) => x.moldDescriptionId != ToolingMaterialSheetMetal.Die && x.moldDescriptionId != ToolingMaterialSheetMetal.Punch);
      dieInserTotalMaterialCost?.forEach((material) => {
        if (material.moldDescriptionId != ToolingMaterialSheetMetal.Die && material.moldDescriptionId != ToolingMaterialSheetMetal.Punch) {
          dieSetHeight += this.sharedService.isValidNumber(material.height);
        }
      });
    }
    costTooling.dieSetSizeHeight = dieSetHeight;
  }

  calculateProcessCostForStampingTool(processInfo: ToolingProcessInfoDto, toolingMaterialInfoList: ToolingMaterialInfoDto[], tool: CostToolingDto): number {
    let totalProcessCost = 0;
    if (
      processInfo.isCommoditySheetMetal &&
      [SheetMetalTool.StampingTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.CompoundTool, SheetMetalTool.FormingTool, SheetMetalTool.BendingTool].includes(tool.toolingNameId)
    ) {
      const dataValues = tool?.toolingMasterData.find(
        (x) =>
          x.costType === processInfo.processGroupId &&
          x.commodityTypeId === processInfo.commodityTypeId &&
          x.countryId == tool.sourceCountryId &&
          x.min <= tool.partThickness &&
          x.max >= tool?.partThickness
      );
      if (dataValues) {
        const complexValue = Number(dataValues?.cost);
        totalProcessCost = this.sharedService.isValidNumber(Number(tool?.totalSheetCost) * Number(complexValue));
        processInfo.hourRate = Number(dataValues?.hourRate);
        processInfo.totalNoOfHours = this.sharedService.isValidNumber(totalProcessCost / processInfo.hourRate);
      }
    }
    return totalProcessCost;
  }
}
