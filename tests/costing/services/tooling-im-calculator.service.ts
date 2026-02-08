import { Injectable } from '@angular/core';
import { ToolingMaterialIM } from 'src/app/shared/enums';
import { ToolingMaterialInfoDto, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { SharedService } from './shared.service';
import { ToolingSharedCalculatorService } from './tooling-shared-calculator.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';

@Injectable({
  providedIn: 'root',
})
export class ToolingImCalculatorService {
  constructor(
    public sharedService: SharedService,
    protected toolingSharedCalculatorService: ToolingSharedCalculatorService,
    protected _toolConfig: ToolingConfigService
  ) {}

  public calculateMaterialCostForIm(
    matInfo: ToolingMaterialInfoDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    tool: CostToolingDto,
    selectedToolMaterial: ToolingMaterialInfoDto,
    fieldColorsList: any
  ) {
    const dataValues = tool?.toolingMasterData.find((x) => x.countryId === tool.sourceCountryId && x.ciriticality === tool.mouldCriticality && x.commodityTypeId === 1);
    // let envHeight = 0,
    //   envWidth = 0,
    //   envLength = 0;
    if (matInfo.moldDescription == ToolingMaterialIM.CavityInsert) {
      matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
      matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(tool.noOfCavity);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }
      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreInsert) {
      matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
      matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40 + 20;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      if (toolingMaterial?.height) {
        matInfo.moldBaseHeight = toolingMaterial.height + 20;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(tool.noOfCavity);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);

      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));

      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CavityHoldingPlate) {
      this.toolingSharedCalculatorService.calculationForCavityHoldingPlate(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);

      // matInfo.moldBaseLength = Number(tool.envelopLength);
      // matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
      // matInfo.moldBaseHeight = Number(tool.envelopHeight);

      // const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      // if (toolingMaterial?.length) {
      //   matInfo.moldBaseLength = this.sharedService.isValidNumber(Number(toolingMaterial.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2);
      // }
      // if (toolingMaterial?.width) {
      //   matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(toolingMaterial.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2);
      // }
      // if (toolingMaterial?.height) {
      //   matInfo.moldBaseHeight = toolingMaterial.height + 40;
      // }
      // this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);

      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreHoldingPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight);
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      if (toolingMaterial?.length) {
        matInfo.moldBaseHeight = toolingMaterial.height + 20;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreBackPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
      matInfo.moldBaseHeight = 50;

      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CavitySideClampingPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 40;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width) + 30 * 2;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));

      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreSideClampingPlate) {
      this.toolingSharedCalculatorService.calculationForCoreSideClampingPlate(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);
      // matInfo.moldBaseLength = Number(tool.envelopLength);
      // matInfo.moldBaseWidth = Number(tool.envelopWidth);
      // matInfo.moldBaseHeight = Number(tool.envelopHeight);

      // const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
      // if (toolingMaterial?.length) {
      //   matInfo.moldBaseLength = toolingMaterial.length;
      // }
      // if (toolingMaterial?.width) {
      //   matInfo.moldBaseWidth = Number(toolingMaterial.width);
      // }
      // if (toolingMaterial?.height) {
      //   matInfo.moldBaseHeight = toolingMaterial.height;
      // }
      // this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));

      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
      //Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6));
    } else if (matInfo.moldDescription == ToolingMaterialIM.EjectorPlate) {
      matInfo.moldBaseLength = (Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2) * tool.cavityMaxLength;
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth;
      matInfo.moldBaseHeight = 25;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = Number(toolingMaterial.length) * Number(tool.cavityMaxLength);
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width) * Number(tool.cavityMaxWidth);
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }
      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.EjectorReturnerPlate) {
      matInfo.moldBaseLength = (Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2) * tool.cavityMaxLength;
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth;
      matInfo.moldBaseHeight = 30;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = Number(toolingMaterial.length);
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width);
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(1);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ParallelBlock) {
      this.toolingSharedCalculatorService.calculationsForParallelBlock(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);
      // matInfo.moldBaseLength = Number(tool.envelopLength);
      // matInfo.moldBaseWidth = Number(tool.envelopWidth);
      // matInfo.moldBaseHeight = Number(tool.envelopHeight);
      // const cavityHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      // const coreHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
      // const ejectorPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      // const ejectorReturnerPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
      // if (cavityHoldingPlate?.length) {
      //   matInfo.moldBaseLength = Number(cavityHoldingPlate.length);
      // }
      // if (coreHoldingPlate?.width && ejectorPlate?.width) {
      //   matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(coreHoldingPlate.width) - Number(ejectorPlate.width));
      // }
      // if (ejectorReturnerPlate?.height && ejectorPlate.height) {
      //   matInfo.moldBaseHeight = this.sharedService.isValidNumber(1.5 * tool.envelopHeight + Number(ejectorReturnerPlate.height) + Number(ejectorPlate.height));
      // }
      // this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(2);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ManifoldPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 0;
      if (tool.mouldTypeId == 1) {
        // hot runner
        matInfo.moldBaseHeight = this._toolConfig.getMouldSubtype().find((x) => x.id == Number(tool.mouldSubTypeId)).manifoldPlate || 0;
      }
      const cavityHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      const coreSideClampingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreSideClampingPlate);
      // const ejectorPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      // const ejectorReturnerPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
      if (cavityHoldingPlate?.length) {
        matInfo.moldBaseLength = Number(cavityHoldingPlate.length);
      }
      if (coreSideClampingPlate?.width) {
        matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(coreSideClampingPlate.width));
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      if (matInfo.isquantityDirty && matInfo.quantity != null) {
        matInfo.quantity = Number(matInfo.quantity);
      } else {
        let quantity = 0;
        if (tool.mouldTypeId == 1) {
          // hot runner
          // if (tool.mouldSubTypeId == 1 || tool.mouldSubTypeId == 2) {
          //   quantity = 0;
          // } else { // 3, 4
          //   quantity = 1;
          // }
          quantity = [3, 4].includes(Number(tool.mouldSubTypeId)) ? 1 : 0;
          // } else {
          //   quantity = 0;
        }
        if (matInfo.quantity != null) {
          quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
        }
        matInfo.quantity = quantity;
      }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost1) {
      // copper
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 50;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(tool.noOfCopperElectrodes);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);

      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(((Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost2) {
      // graphite
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 50;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // if (matInfo.isLengthDirty && matInfo.length != null) {
      //   matInfo.length = Number(matInfo.length);
      // } else {
      //   let length = Number(matInfo.moldBaseLength);
      //   if (matInfo.length != null) {
      //     length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      //   }
      //   matInfo.length = length;
      // }

      // if (matInfo.isWidthDirty && matInfo.width != null) {
      //   matInfo.width = Number(matInfo.width);
      // } else {
      //   let width = Number(matInfo.moldBaseWidth);
      //   if (matInfo.width != null) {
      //     width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      //   }
      //   matInfo.width = width;
      // }

      // if (matInfo.isHeightDirty && matInfo.height != null) {
      //   matInfo.height = Number(matInfo.height);
      // } else {
      //   let height = Number(matInfo.moldBaseHeight);
      //   if (matInfo.height != null) {
      //     height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      //   }
      //   matInfo.height = height;
      // }

      // if (matInfo.isquantityDirty && matInfo.quantity != null) {
      //   matInfo.quantity = Number(matInfo.quantity);
      // } else {
      //   let quantity = Number(tool.noOfGraphiteElectrodes);
      //   if (matInfo.quantity != null) {
      //     quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
      //   }
      //   matInfo.quantity = quantity;
      // }

      // if (matInfo.ismaterialPriceDirty && matInfo.materialPrice != null) {
      //   matInfo.materialPrice = Number(matInfo.materialPrice);
      // } else {
      //   let materialPrice = Number(matInfo.materialPrice);
      //   if (matInfo.materialPrice != null) {
      //     materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      //   }
      //   matInfo.materialPrice = materialPrice;
      // }

      // if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      //   matInfo.scrapPrice = Number(matInfo.scrapPrice);
      // } else {
      //   let scrapPrice = Number(matInfo.scrapPrice);
      //   if (matInfo.scrapPrice != null) {
      //     scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      //   }
      //   matInfo.scrapPrice = scrapPrice;
      // }

      // if (matInfo.isdensityDirty && matInfo.density != null) {
      //   matInfo.density = Number(matInfo.density);
      // } else {
      //   let density = Number(matInfo.density);
      //   if (matInfo.density != null) {
      //     density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      //   }
      //   matInfo.density = density;
      // }

      // envLength = Number(matInfo.length);
      // envWidth = Number(matInfo.width);
      // envHeight = Number(matInfo.height);
      // if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      //   matInfo.netWeight = Number(matInfo.netWeight);
      // } else {
      //   let netWeight = this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)));
      //   if (matInfo.netWeight != null) {
      //     netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      //   }
      //   matInfo.netWeight = netWeight;
      // }
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(((Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
    } else if (matInfo.moldDescription == ToolingMaterialIM.SideCoreCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost = Math.round(Number(values?.sideCoreCostDefault / values?.sideCoreCostDivider) * values?.sideCoreRatio) * Number(tool.undercutsSideCores) * Number(tool.noOfCavity);

        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.AngularCoreCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost =
          Math.round(Number(values?.angularCostDefault / values?.angularCostDivider) * values?.angularSlideRatio) * Number(tool.undercutsAngularSlides) * Number(tool.noOfCavity);

        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.UnscrewingCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost =
          Math.round(Number(values?.unscrewingCostDefault / values?.unscrewingCostDivider) * values?.unscrewingRatio) * Number(tool.undercutsUnscrewing) * Number(tool.noOfCavity);
        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.HotRunnerCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }
      let hotRunnerCalc = Number(75000 / 82);
      if (tool.mouldTypeId == 1) {
        if (tool.mouldSubTypeId == 1) {
          tool.hotRunnerCost = Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 2) {
          hotRunnerCalc = Number(150000 / 82);
          tool.hotRunnerCost = Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 3) {
          hotRunnerCalc = Number(130000 / 82);
          tool.hotRunnerCost = Number(tool.noOfDrop) * Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 4) {
          hotRunnerCalc = Number(225000 / 82);
          tool.hotRunnerCost = Number(tool.noOfDrop) * Number(hotRunnerCalc) * values?.hotRatio;
        }
      } else {
        tool.hotRunnerCost = 0;
        matInfo.quantity = 0;
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost = tool.hotRunnerCost;
        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    }
  }
}
