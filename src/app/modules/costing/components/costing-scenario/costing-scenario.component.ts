import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigurationService } from 'src/app/shared/services';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
// import { ScenarioState } from 'src/app/modules/_state/project-scenario.state';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
// import * as ScenarioAction from 'src/app/modules/_actions/project-scenario-action';
import { AddScenarioComponent } from '../add-scenario/add-scenario.component';
import { CompareScenariosComponent } from '../compare-scenarios/compare-scenarios.component';
import { EditScenarioComponent } from '../edit-scenario/edit-scenario.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ScenarioService } from 'src/app/shared/services';
import { SharedService } from '../../services/shared.service';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { ProjectScenarioSignalsService } from 'src/app/shared/signals/project-scenario-signals.service';

@Component({
  selector: 'app-costing-scenario',
  templateUrl: './costing-scenario.component.html',
  styleUrls: ['./costing-scenario.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, CdkDrag, CdkDropList, CdkDragPlaceholder],
})
export class CostingScenarioComponent implements OnChanges, OnInit, OnDestroy {
  @Input() selectedProjectId: number;
  @Input() selectedProject: any;
  @Input() _pData!: any;
  @Input() selectedScenario: ProjectScenarioDto;
  @Output() scenarioChange: EventEmitter<any> = new EventEmitter<ProjectScenarioDto>();
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  public currentProjectId: number;
  currentUserId: number = 0;
  canUpdate: boolean = false;
  private isAdmin: boolean = false;
  public scenarioList: ProjectScenarioDto[];
  private unSubscribeAll$ = new Subject<void>();
  // _scenarioList$: Observable<ProjectScenarioDto[]>;
  private userInfoService = inject(UserInfoService);
  private sharedService = inject(SharedService);
  newScenarioAddedId: number = 0;
  projectScenarioEffect = effect(() => {
    const projectScenarioWithParts = this.projectScenarioSignalsService.projectScenarioWithParts();
    if (projectScenarioWithParts) {
      this.loadScenarioList(projectScenarioWithParts);
    }
  });

  constructor(
    private messaging: MessagingService,
    private modalService: NgbModal,
    protected appConfigurationService: AppConfigurationService,
    private _scenarioService: ScenarioService,
    private _store: Store,
    private bomInfoSignalsService: BomInfoSignalsService,
    private projectScenarioSignalsService: ProjectScenarioSignalsService
  ) {
    // this._scenarioList$ = this._store.select(ScenarioState.GetAllPartScenarioByProjectId);
    this.userInfoService.getUserValue().subscribe((user) => {
      this.currentUserId = user?.userId;
      this.isAdmin = user?.roleId === 1;
    });
    this._canUserUpdateCosting$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((result: boolean) => {
      this.canUpdate = result;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedProjectId'] && changes['selectedProjectId'].currentValue != changes['selectedProjectId'].previousValue) {
      this.currentProjectId = changes['selectedProjectId'].currentValue;
      this.selectedProject = localStorage.getItem('lastVisitedProject') ? JSON.parse(localStorage.getItem('lastVisitedProject')) : '';
    }
  }

  ngOnInit() {
    // this.loadScenarioList();
    this.canUserUpdate();
  }

  private canUserUpdate() {
    // this.canUpdate = this.isAdmin || this.currentUserId === this.selectedProject?.createdUserId || this.selectedProject?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
    this.canUpdate =
      this.isAdmin ||
      this.sharedService.hasSameGroup(this.selectedProject?.createdUserId, this.currentUserId) ||
      this.currentUserId === this.selectedProject?.createdUserId ||
      this.selectedProject?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
  }

  loadScenarioList(list: ProjectScenarioDto[]) {
    // this._scenarioList$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((list: ProjectScenarioDto[]) => {
    if (Array.isArray(list)) {
      this.scenarioList = [...list].sort((a, b) => a.sortOrder - b.sortOrder);
      if (this.newScenarioAddedId) {
        const newScenario = this.scenarioList.find((scenario) => scenario.scenarioId === this.newScenarioAddedId);
        if (newScenario) {
          this.scenarioChange.emit(newScenario);
          // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(newScenario.projectInfoId, newScenario.scenarioId));
          this.bomInfoSignalsService.getBomTreeByProjectId(newScenario.projectInfoId, newScenario.scenarioId);
          this.newScenarioAddedId = 0;
          return;
        }
      }
      if (this.scenarioList.length > 0) {
        this.scenarioChange.emit(this.scenarioList[0]);
      }
    }
    // });
  }

  public addScenario(event: any) {
    const isDirty = this._pData.checkIfDirty();
    if (isDirty) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Leave',
          message: 'You have unsaved data which will be lost. Do you still want to proceed?',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
        panelClass: 'add-scenario-modal',
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          event.preventDefault();
          return;
        } else {
          this.addScenarioCall();
        }
      });
    } else {
      this.addScenarioCall();
    }
  }

  public async addScenarioCall() {
    const modalRef = this.modalService.open(AddScenarioComponent, { windowClass: 'modal-xl' });
    modalRef.componentInstance.projectInfoId = this.currentProjectId;
    modalRef.componentInstance.projectName = this.selectedProject?.projectName;
    try {
      const result = await modalRef.result;

      if (result?.scenarioId) {
        this.newScenarioAddedId = result.scenarioId;
      }
    } catch {
      this.messaging.openSnackBar('Scenario creation was cancelled.', '', {
        duration: 3000,
      });
    }
  }

  public editScenarioCall(node: any) {
    if (node) {
      const modalRef = this.modalService.open(EditScenarioComponent, { windowClass: 'modal-l edit-scenario-modal' });
      modalRef.componentInstance.scenarioData = node;
      modalRef.componentInstance.projectName = this.selectedProject?.projectName;
      modalRef.componentInstance.scenarioList = this.scenarioList;
    }
  }

  public compareScenarios() {
    const modalRef = this.modalService.open(CompareScenariosComponent, { windowClass: 'modal-xl h-full min-h-0 scenario-modal' });
    modalRef.componentInstance.projectInfoId = this.currentProjectId;
    modalRef.componentInstance.projectName = this.selectedProject?.projectName;
  }

  public onSelectScenarioClick(event: Event, node: ProjectScenarioDto) {
    if (!node) return;

    const isDirty = this._pData.checkIfDirty();
    if (isDirty) {
      event.preventDefault();
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Leave',
          message: 'You have unsaved data which will be lost. Do you still want to proceed?',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.selectScenario(node);
        }
      });
    } else {
      this.selectScenario(node);
    }
  }

  private selectScenario(node: ProjectScenarioDto) {
    // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(node.projectInfoId, node.scenarioId));
    this.bomInfoSignalsService.getBomTreeByProjectId(node.projectInfoId, node.scenarioId);
    this.scenarioChange.emit(node);
  }

  dropScenario(event: CdkDragDrop<ProjectScenarioDto[]>) {
    const updatedList = [...this.scenarioList];
    moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
    this.scenarioList = updatedList;
    const orderedList = this.scenarioList.map((x, i) => ({ id: x.scenarioId, sortOrder: i }));
    console.log(orderedList);
    this.scenarioList.length > 0 && this.updateScenarioSortOrder(orderedList);
  }

  private updateScenarioSortOrder(orderedList: { id: number; sortOrder: number }[]) {
    this._scenarioService
      .updateScenarioSortOrder(this.currentProjectId, orderedList)
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe(() => {
        // this._store.dispatch(new ScenarioAction.GetAllActiveScenarioByProjectId(this.currentProjectId));
        this.projectScenarioSignalsService.getAllActiveScenarioByProjectId(this.currentProjectId);
      });
  }

  public onSelectDeleteScenarioClick(event: any, node: any) {
    if (node) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete',
          message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        } else {
          // this._store.dispatch(new ScenarioAction.RemoveScenario(Number(node.projectInfoId), node.scenarioId));
          this.projectScenarioSignalsService.removeScenario(Number(node.projectInfoId), node.scenarioId);
          const scenarioAfterDeletion = this.scenarioList.filter((x) => x.scenarioId !== node.scenarioId).map((x, i) => ({ id: x.scenarioId, sortOrder: i }));
          this.updateScenarioSortOrder(scenarioAfterDeletion);
          this.messaging.openSnackBar(`Data has been delete successfully.`, '', { duration: 5000 });
        }
      });
    }
  }

  ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
    this.projectScenarioEffect.destroy();
  }
}
