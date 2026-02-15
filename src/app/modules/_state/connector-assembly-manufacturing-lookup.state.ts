import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { ConnectorAssemblyManufacturingLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { GetConnectorAssemblyManufacturingLookUpList } from '../_actions/master-data.action';

export class GetConnectorAssemblyManufacturingLookUpModel {
  ConnectorAssemblyManufacturingLookUpList: ConnectorAssemblyManufacturingLookUp[];
}

@State<GetConnectorAssemblyManufacturingLookUpModel>({
  name: 'ConnectorAssemblyManufacturingLookUp',
  defaults: {
    ConnectorAssemblyManufacturingLookUpList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ConnectorAssemblyManufacturingLookUpState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getConnectorAssemblyManufacturingLookUp(state: GetConnectorAssemblyManufacturingLookUpModel) {
    return state.ConnectorAssemblyManufacturingLookUpList;
  }

  @Action(GetConnectorAssemblyManufacturingLookUpList)
  getConnectorAssemblyManufacturingLookUpList(state: StateContext<GetConnectorAssemblyManufacturingLookUpModel>) {
    state.setState({
      ConnectorAssemblyManufacturingLookUpList: [],
    });
    return this.sheetMetalLookupService.getConnectorAssemblyManufacturingLookUpAll().pipe(
      tap((result) => {
        state.setState({
          ConnectorAssemblyManufacturingLookUpList: [...result],
        });
      })
    );
  }
}
