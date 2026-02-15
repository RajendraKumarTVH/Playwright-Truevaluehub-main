import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BuLocationDto } from 'src/app/shared/models';
import { BuLocationService } from './../data/Service/bu-location.service';
import { GetBuLocation, GetSupplierList } from './../_actions/master-data.action';
import { tap } from 'rxjs/operators';
import { DigitalFactoryDtoNew } from '../digital-factory/Models/digital-factory-dto';
import { DigitalFactoryService } from '../digital-factory/Service/digital-factory.service';

export class SupplierStateModel {
  supplierList: DigitalFactoryDtoNew[];
}

export class BuLocationStateModel {
  buLocationList: BuLocationDto[];
}

@State<SupplierStateModel>({
  name: 'supplierList',
  defaults: {
    supplierList: [],
  },
})
@State<BuLocationStateModel>({
  name: 'buLocationList',
  defaults: {
    buLocationList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SupplierBuLocationState {
  constructor(
    private _buLocationService: BuLocationService,
    private _digitalFactoryService: DigitalFactoryService
  ) {}

  @Selector()
  static getSupplierList(state: SupplierStateModel) {
    return state.supplierList;
  }

  @Selector()
  static getBuLocationList(state: BuLocationStateModel) {
    return state.buLocationList;
  }

  @Action(GetSupplierList)
  getSupplierList(state: StateContext<SupplierStateModel>) {
    state.setState({
      supplierList: [],
    });
    this._digitalFactoryService.getAllDigitalFactorySuppliers().pipe(
      tap((result) => {
        if (result) {
          state.setState({
            supplierList: [...result],
          });
        }
      })
    );
  }

  @Action(GetBuLocation)
  getBuLocationList(state: StateContext<BuLocationStateModel>) {
    state.setState({
      buLocationList: [],
    });
    return this._buLocationService.getBuLocation().pipe(
      tap((result) => {
        if (result) {
          state.setState({
            buLocationList: [...result],
          });
        }
      })
    );
  }
}
