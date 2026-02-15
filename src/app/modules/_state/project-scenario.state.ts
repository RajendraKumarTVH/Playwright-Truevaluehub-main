// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
// import { CopyScenarioDto } from 'src/app/shared/models/copy-scenario.model';
// import { BlockUiService } from 'src/app/shared/services';
// import { ScenarioService } from 'src/app/shared/services/scenario.service';
// import { CopyScenario, GetAllActiveScenarioByProjectId, RemoveScenario, GetAllPartScenarioByProjectId, ClearScenarioInfos } from '../_actions/project-scenario-action';
// // import * as BomActions from 'src/app/modules/_actions/bom.action';
// import * as ScenarioAction from 'src/app/modules/_actions/project-scenario-action';
// import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
// import { tap } from 'rxjs/operators';

// export class ScenarioStateModel {
//   projectScenario: ProjectScenarioDto[];
//   projectScenarioWithParts: ProjectScenarioDto[];
// }

// @State<ScenarioStateModel>({
//   name: 'projectScenario',
//   defaults: {
//     projectScenario: [],
//     projectScenarioWithParts: [],
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class ScenarioState {
//   constructor(
//     private _ScenarioService: ScenarioService,
//     private _blockUiService: BlockUiService,
//     private _store: Store,
//     private bomInfoSignalsService: BomInfoSignalsService
//   ) {}

//   @Selector()
//   static getAllActiveScenarioByProjectId(state: ScenarioStateModel) {
//     return state.projectScenario;
//   }

//   @Selector()
//   static GetAllPartScenarioByProjectId(state: ScenarioStateModel) {
//     return state.projectScenarioWithParts;
//   }

//   @Action(GetAllActiveScenarioByProjectId)
//   getAllActiveScenarioByProjectId(state: StateContext<ScenarioStateModel>, payload: GetAllActiveScenarioByProjectId) {
//     // state.patchState({
//     //   projectScenario: [],
//     // });
//     // this._blockUiService.pushBlockUI('GetAllProjectPartScenario');
//     return this._ScenarioService.getAllActiveScenarioByProjectId(payload.projectInfoId).pipe(
//       tap((result) => {
//         state.patchState({
//           projectScenario: result,
//         });
//         // this._blockUiService.popBlockUI('GetAllProjectPartScenario');
//       })
//     );
//   }

//   @Action(ClearScenarioInfos)
//   clearScenarioInfos(state: StateContext<ScenarioStateModel>) {
//     state.setState({
//       projectScenario: [],
//       projectScenarioWithParts: [],
//     });
//   }

//   @Action(GetAllPartScenarioByProjectId)
//   GetAllPartScenarioByProjectId(state: StateContext<ScenarioStateModel>, payload: GetAllPartScenarioByProjectId) {
//     // state.setState({
//     //   projectScenario: [],
//     // });
//     // this._blockUiService.pushBlockUI('GetAllProjectPartScenario');
//     return this._ScenarioService.getAllPartScenarioByProjectId(payload.projectInfoId).pipe(
//       tap((result) => {
//         state.patchState({
//           projectScenarioWithParts: result,
//         });
//         // this._blockUiService.popBlockUI('GetAllProjectPartScenario');
//       })
//     );
//   }

//   @Action(CopyScenario)
//   copyScenario(state: StateContext<CopyScenarioDto>, payload: CopyScenario) {
//     // this._blockUiService.pushBlockUI('copyScenario');
//     return this._ScenarioService.copyScenario(payload.copyScenarioDto).pipe(
//       tap((result) => {
//         if (result) {
//           // this._store.dispatch(new ScenarioAction.GetAllPartScenarioByProjectId(result.projectInfoId));
//         }

//         // this._blockUiService.popBlockUI('copyScenario');
//       })
//     );
//   }

//   @Action(RemoveScenario)
//   removeScenario(state: StateContext<ScenarioStateModel>, payload: RemoveScenario) {
//     // this._blockUiService.pushBlockUI('removeScenario');
//     return this._ScenarioService.removeScenario(payload.projectId, payload.scenarioId).pipe(
//       tap((result) => {
//         if (result) {
//           let scenarioId = 0;
//           if (state?.getState()?.projectScenario && state?.getState()?.projectScenario.length > 0) {
//             state.patchState({
//               projectScenario: state.getState().projectScenario.filter((x) => x.scenarioId !== payload.scenarioId),
//               projectScenarioWithParts: state.getState().projectScenario.filter((x) => x.scenarioId !== payload.scenarioId),
//             });

//             scenarioId = state.getState().projectScenario[state.getState().projectScenario.length - 1].scenarioId;
//           } else {
//             this._store.dispatch(new ScenarioAction.GetAllActiveScenarioByProjectId(payload.projectId));
//           }
//           // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(payload.projectId, scenarioId));
//           this.bomInfoSignalsService.getBomTreeByProjectId(payload.projectId, scenarioId);
//         }
//         // this._blockUiService.popBlockUI('removeScenario');
//       })
//     );
//   }
// }
