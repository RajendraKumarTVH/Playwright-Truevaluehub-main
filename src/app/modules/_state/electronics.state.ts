import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BomService } from 'src/app/shared/services';
import { BlockUiService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { BillOfMaterialDto } from 'src/app/shared/models';
import { GetBoardLoadedComponents } from '../_actions/bom.action';

export class BomModel {
  bom: BillOfMaterialDto[];
}

@State<BomModel>({
  name: 'bom',
  defaults: {
    bom: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ElectronicsState {
  constructor(
    private _bomService: BomService,
    private _blockUiService: BlockUiService
  ) {}

  @Selector()
  static getBoardLoadedComponents(state: BomModel) {
    return state.bom;
  }

  @Action(GetBoardLoadedComponents)
  getBoardLoadedComponents(state: StateContext<BomModel>, payload: GetBoardLoadedComponents) {
    // state.setState({
    //   bom: [],
    // });
    // this._blockUiService.pushBlockUI('getBoardLoadedComponents');
    return this._bomService.getBoardLoadedComponents(payload.projectId, payload.partInfoId).pipe(
      tap((result) => {
        state.setState({
          bom: result,
        });
        // this._blockUiService.popBlockUI('getBoardLoadedComponents');
      })
    );
  }
}
