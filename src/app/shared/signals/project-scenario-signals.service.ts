import { Injectable, signal } from '@angular/core';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { ScenarioService } from 'src/app/shared/services/scenario.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectScenarioSignalsService {
  private readonly _projectScenarioSignal = signal<ProjectScenarioDto[]>([]);
  private readonly _projectScenarioWithPartsSignal = signal<ProjectScenarioDto[]>([]);

  projectScenario = this._projectScenarioSignal.asReadonly();
  projectScenarioWithParts = this._projectScenarioWithPartsSignal.asReadonly();

  constructor(
    private _ScenarioService: ScenarioService,
    private bomInfoSignalsService: BomInfoSignalsService
  ) {}

  getAllActiveScenarioByProjectId(projectInfoId: number) {
    this._ScenarioService.getAllActiveScenarioByProjectId(projectInfoId).subscribe((result: ProjectScenarioDto[]) => {
      // if (result) {
      this._projectScenarioSignal.set([...(result ?? [])]);
      // }
    });
  }

  clearProjectScenarios() {
    this._projectScenarioSignal.set([]);
    this._projectScenarioWithPartsSignal.set([]);
  }

  GetAllPartScenarioByProjectId(projectInfoId: number) {
    this._ScenarioService.getAllPartScenarioByProjectId(projectInfoId).subscribe((result: ProjectScenarioDto[]) => {
      this._projectScenarioWithPartsSignal.set([...(result ?? [])]);
    });
  }

  // copyScenario(copyScenarioDto: CopyScenarioDto) {
  //   return this._ScenarioService.copyScenario(copyScenarioDto).subscribe(() => {});
  // }

  removeScenario(projectId: number, scenarioId: number) {
    this._ScenarioService.removeScenario(projectId, scenarioId).subscribe((result: boolean) => {
      if (result) {
        let nextScenarioId = 0;
        // if (state?.getState()?.projectScenario && state?.getState()?.projectScenario.length > 0) {
        const currentScenarios = this._projectScenarioSignal();
        if (currentScenarios?.length > 0) {
          const filteredAfterDeletion = currentScenarios.filter((x) => x.scenarioId !== scenarioId);
          this._projectScenarioSignal.set(filteredAfterDeletion);
          this._projectScenarioWithPartsSignal.set(filteredAfterDeletion);
          if (filteredAfterDeletion.length > 0) {
            nextScenarioId = filteredAfterDeletion[filteredAfterDeletion.length - 1].scenarioId;
          }
          // state.patchState({
          //   projectScenario: state.getState().projectScenario.filter((x) => x.scenarioId !== scenarioId),
          //   projectScenarioWithParts: state.getState().projectScenario.filter((x) => x.scenarioId !== scenarioId),
          // });

          // scenarioId = state.getState().projectScenario[state.getState().projectScenario.length - 1].scenarioId;
        } else {
          this.getAllActiveScenarioByProjectId(projectId);
        }
        this.bomInfoSignalsService.getBomTreeByProjectId(projectId, nextScenarioId);
      }
    });
  }
}
