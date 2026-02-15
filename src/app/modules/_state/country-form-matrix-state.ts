import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { CountryFormMatrixDto } from 'src/app/shared/models';
import { GetCountryFormMatrix } from '../_actions/master-data.action';

export class CountryFormMatrixStateModel {
  countryFormMatrix: CountryFormMatrixDto[];
}

@State<CountryFormMatrixStateModel>({
  name: 'CountryFormMatrixType',
  defaults: {
    countryFormMatrix: [],
  },
})
@Injectable({ providedIn: 'root' })
export class CountryFormMatrixState {
  constructor(private _materialMasterService: MaterialMasterService) {}

  @Selector()
  static getCountryFormMatrixs(state: CountryFormMatrixStateModel) {
    return state.countryFormMatrix;
  }

  @Action(GetCountryFormMatrix)
  getCountryFormMatrix(state: StateContext<CountryFormMatrixStateModel>) {
    state.setState({
      countryFormMatrix: [],
    });
    return this._materialMasterService.getCountryFormMatrix().pipe(
      tap((result) => {
        state.setState({
          countryFormMatrix: [...result],
        });
      })
    );
  }
}
