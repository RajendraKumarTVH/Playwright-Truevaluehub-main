import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { CountryPlatingMasterDto } from 'src/app/shared/models';
import { CountryPlatingService } from 'src/app/shared/services/country-plating.service';
import { GetCountryPlatingData } from '../_actions/master-data.action';

export class CountryPlatingStateModel {
  countryPlatingList: CountryPlatingMasterDto[];
}

@State<CountryPlatingStateModel>({
  name: 'CountryPlating',
  defaults: {
    countryPlatingList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class CountryPlatingState {
  constructor(private _countryPlatingService: CountryPlatingService) {}

  @Selector()
  static getPlatingData(state: CountryPlatingStateModel) {
    return state.countryPlatingList;
  }

  @Action(GetCountryPlatingData)
  getCountryPlatingData(state: StateContext<CountryPlatingStateModel>) {
    state.setState({
      countryPlatingList: [],
    });
    return this._countryPlatingService.getCountryPlatingData().pipe(
      tap((result) => {
        state.setState({
          countryPlatingList: [...result],
        });
      })
    );
  }
}
