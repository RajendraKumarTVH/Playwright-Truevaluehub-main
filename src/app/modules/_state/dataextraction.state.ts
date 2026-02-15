import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CadService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { GetExtractDataByPartInfoId } from '../_actions/dataextraction.action';

export class DataExtractionStateModel {
  dataExtraction: DataExtraction;
}
@State<DataExtractionStateModel>({
  name: 'DataExtraction',
  defaults: {
    dataExtraction: null,
  },
})
@Injectable({ providedIn: 'root' })
export class DataExtractionState {
  constructor(private cadService: CadService) {}
  @Selector()
  static getDataExtraction(state: DataExtractionStateModel) {
    return state?.dataExtraction;
  }

  @Action(GetExtractDataByPartInfoId)
  getExtractDataByPartInfoId(state: StateContext<DataExtractionStateModel>, payload: GetExtractDataByPartInfoId) {
    return this.cadService.getCadExtractedValuesByPartInfoId(payload?.partInfoId).pipe(
      tap((result) => {
        if (result) {
          state.setState({
            dataExtraction: result,
          });
        }
      })
    );
  }
}
