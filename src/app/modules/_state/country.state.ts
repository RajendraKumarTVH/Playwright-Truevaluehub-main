import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CountryDataService } from 'src/app/shared/services';
import { take, tap } from 'rxjs/operators';
import { CountryDataMasterDto } from 'src/app/shared/models';
import { GetCountryData } from '../_actions/master-data.action';
import { patch } from '@ngxs/store/operators';

export class CountryDataStateModel {
  countryDataList: CountryDataMasterDto[];
}

@State<CountryDataStateModel>({
  name: 'CountryData',
  defaults: {
    countryDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class CountryDataState {
  constructor(private _countryDataService: CountryDataService) {}

  @Selector()
  static getCountryData(state: CountryDataStateModel) {
    return state.countryDataList;
  }

  @Action(GetCountryData)
  getCountryData(state: StateContext<CountryDataStateModel>) {
    const stateV = state.getState();
    state.setState({
      countryDataList: stateV.countryDataList,
    });
    return this._countryDataService.getCountryData().pipe(
      tap((result) => {
        state.setState(
          patch({
            countryDataList: [...result],
          })
        );
      }),
      take(1)
    );
  }
}
