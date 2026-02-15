import { FormArray } from '@angular/forms';
import { PartInfoDto, ProcessInfoDto, CountryDataMasterDto } from 'src/app/shared/models';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';

export interface AutomateProcessParams {
  thisCurrentPart: PartInfoDto;
  machineInfoList: ProcessInfoDto[];
  defaultValues: any;
  processTypeOrginalList: any[];
  fieldColorsList: FieldColorsDto[];
  manufacturingObj: ProcessInfoDto;
  laborCountByMachineType: any;
  subProcessFormArray: FormArray;
  inputSelectedProcessInfoId: number;
  inputFormIdentifier: CommentFieldFormIdentifierModel;
  // inputAutomationProcessCount: number;
  totSubProcessCount: number;
  toolingMasterData: ToolingCountryData[];
  commodity: { isInjMoulding: boolean; isSheetMetal: boolean; isCasting: boolean };
  countryList: CountryDataMasterDto[];
  newCoreAdded: boolean;
  // inputMachineTypeDescription: MedbMachinesMasterDto[];
}
