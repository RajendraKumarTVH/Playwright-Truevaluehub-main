import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CostToolingDto } from '../models/tooling.model';
import { ToolingConfigService } from '../config/cost-tooling-config';
import { ToolingBopInfoMappingService } from './tooling-bop-info-mapping.service';
import { ToolingOverheadMappingService } from './tooling-overhead-mapping.service';
import { ToolingProcessMappingService } from './tooling-process-mapping.service';
import { ToolingMaterialMappingService } from './tooling-material-mapping.service';
import { ToolingInfoMappingService } from './tooling-info-mapping.service';
@Injectable({
  providedIn: 'root',
})
export class CostingToolingMappingService {
  constructor(
    private fb: FormBuilder,
    public _toolConfig: ToolingConfigService,
    public _bopMapper: ToolingBopInfoMappingService,
    public ohMapper: ToolingOverheadMappingService,
    public _processMapper: ToolingProcessMappingService,
    public _materialMapper: ToolingMaterialMappingService,
    public _toolingInfoMapper: ToolingInfoMappingService
  ) {}

  public createForm() {
    return {
      // toolingId: [0],
      partInfoId: [0],
      processInfoId: [0],
      toolingFormGroup: this.fb.group(this._toolingInfoMapper.getFormFields()),
      materialFormGroup: this.fb.group(this._materialMapper.getFormFields()),
      processFormGroup: this.fb.group(this._processMapper.getDefaultProcessFormFields()),
      bopFormGroup: this.fb.group(this._bopMapper.getDefaultBopFormFields()),
      OHFormGroup: this.fb.group(this.ohMapper.getDefaultOhFormFields()),
    };
  }

  public resetForm() {
    return {
      processFormGroup: this._processMapper.getDefaultProcessFormFields,
      bopFormGroup: this._bopMapper.getDefaultBopFormFields,
      OHFormGroup: this.ohMapper.getDefaultOhFormFields,
      toolingFormGroup: this._toolingInfoMapper.resetForm,
      materialFormGroup: this._materialMapper.resetForm,
    };
  }

  costingToolingFormPatch(tool: CostToolingDto) {
    return {
      // toolingId: tool?.toolingId,
      partInfoId: tool?.partInfoId,
      processInfoId: tool?.processInfoId,
    };
  }

  onEditToolInfoDefaultValues() {
    return {
      totCoreCost: 0,
      totCoreWeight: 0,
      totMouldWieght: 0,
      totMouldCost: 0,
      totCopperCost: 0,
      totCopperWeight: 0,
      totOtherCost: 0,
      totOtherWeight: 0,
      totElectrodCost: 0,
      totElectrodWeight: 0,
      totDiePunchCost: 0,
      totDiePunchWeight: 0,
    };
  }
}
