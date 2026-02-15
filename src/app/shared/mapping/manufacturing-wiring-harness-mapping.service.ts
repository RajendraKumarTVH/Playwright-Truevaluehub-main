import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingWiringHarnessMappingService {
  constructor(
    public sharedService: SharedService,
    private formbuilder: FormBuilder
  ) {}
  getFormFields() {
    return {
      subProcessList: this.formbuilder.array([]),
      subProcessTypeID: 0,
    };
  }

  manufacturingFormReset() {
    return {
      subProcessTypeID: 0,
    };
  }

  manufacturingFormPatch(obj: ProcessInfoDto) {
    return {
      subProcessTypeID: this.sharedService.isValidNumber(obj.subProcessTypeID),
    };
  }

  manufacturingFormSubmitPayLoad(formCtrl) {
    return {
      subProcessTypeID: formCtrl['subProcessTypeID'].value,
    };
  }
}
