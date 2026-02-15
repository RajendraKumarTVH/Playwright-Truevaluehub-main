import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { BlockUiService } from 'src/app/shared/services';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { DeleteLogisticInfo, GetContainerSize, GetLogisticsSummaryByPartId, SaveSummaryInfo } from '../_actions/logistics-summary.action';
import { ContainerSize } from './../../shared/models/container-size.model';
import { GetDefaultModeOfTransport } from './../_actions/logistics-summary.action';
import { LogisticsSummaryDto } from './../../shared/models/logistics-summary.model';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';

export class ContainerSizeStateModel {
  containerSize: ContainerSize[];
}

export class DefaultTransportStateModel {
  defaultModeOfTransport: number;
}

export class LogisticsSummaryStateModel {
  logisticsSummary: LogisticsSummaryDto;
}

export class SaveLogisticsSummaryStateModel {
  logisticsSummaryDto: LogisticsSummaryDto;
}

@State<ContainerSizeStateModel>({
  name: 'ContainerSize',
  defaults: {
    containerSize: [],
  },
})
@State<DefaultTransportStateModel>({
  name: 'DefaultModeOfTransport',
  defaults: {
    defaultModeOfTransport: 0,
  },
})
@State<LogisticsSummaryStateModel>({
  name: 'LogisticsSummary',
  defaults: {
    logisticsSummary: null,
  },
})
@State<SaveLogisticsSummaryStateModel>({
  name: 'SaveSummaryInfo',
  defaults: {
    logisticsSummaryDto: null,
  },
})
@Injectable({ providedIn: 'root' })
export class LogisticsSummaryState {
  constructor(
    private _logisticsSummaryService: LogisticsSummaryService,
    private _blockUiService: BlockUiService,
    private _store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  @Selector()
  static getContainerSize(state: ContainerSizeStateModel) {
    return state.containerSize;
  }

  @Selector()
  static getDefaultModeOfTransport(state: DefaultTransportStateModel) {
    return state.defaultModeOfTransport;
  }

  @Selector()
  static getLogisticsSummaryByPartId(state: LogisticsSummaryStateModel) {
    return state.logisticsSummary;
  }

  @Selector()
  static saveSummaryInfo(state: SaveSummaryInfo) {
    return state.logisticsInfo;
  }

  @Action(GetContainerSize)
  getContainerSize(state: StateContext<ContainerSizeStateModel>) {
    state.setState({
      containerSize: [],
    });
    return this._logisticsSummaryService.getContainerSize().pipe(
      tap((result) => {
        state.setState({
          containerSize: [...result],
        });
      })
    );
  }

  @Action(GetDefaultModeOfTransport)
  getDefaultModeOfTransport(state: StateContext<DefaultTransportStateModel>, payLoad: GetDefaultModeOfTransport) {
    state.setState({
      defaultModeOfTransport: 0,
    });
    return this._logisticsSummaryService.getDefaultModeOfTransport(payLoad.mfrCountryId, payLoad.deliveryCountryId).pipe(
      tap((result) => {
        state.setState({
          defaultModeOfTransport: result,
        });
      })
    );
  }

  @Action(GetLogisticsSummaryByPartId)
  getLogisticsSummaryByPartId(state: StateContext<LogisticsSummaryStateModel>, payLoad: GetLogisticsSummaryByPartId) {
    state.setState({
      logisticsSummary: null,
    });
    return this._logisticsSummaryService.getLogisticsSummary(payLoad.partInfoId).pipe(
      tap((result) => {
        state.setState({
          logisticsSummary: result,
        });
      })
    );
  }

  @Action(SaveSummaryInfo)
  saveSummaryInfo(state: StateContext<SaveLogisticsSummaryStateModel>, payload: SaveSummaryInfo) {
    // this._blockUiService.pushBlockUI('saveSummaryInfo');
    return this._logisticsSummaryService.saveSummaryInfo(payload.logisticsInfo).pipe(
      tap((result) => {
        if (result) {
          state.setState({
            logisticsSummaryDto: result,
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(result.partInfoId);
        }
        // this._blockUiService.popBlockUI('saveSummaryInfo');
      })
    );
  }

  @Action(DeleteLogisticInfo)
  deleteLogisticInfo(state: StateContext<LogisticsSummaryStateModel>, payload: DeleteLogisticInfo) {
    // this._blockUiService.pushBlockUI('deleteLogisticInfo');
    return this._logisticsSummaryService.deleteLogisticInfo(payload.partInfoId).pipe(
      tap((result) => {
        if (result) {
          state.setState({
            logisticsSummary: null,
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.partInfoId);
        }
        // this._blockUiService.popBlockUI('deleteLogisticInfo');
      })
    );
  }
}
