import { Component, HostListener, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, debounceTime, map } from 'rxjs/operators';
import { ProjectInfoDto } from 'src/app/shared/models';
import { CostingInformationComponent } from '../../components/costing-information/costing-information.component';
import { DirtyModel } from 'src/app/models';
import { CostingCostSummaryComponent, CostingProjectBomDetailsComponent, CostingProjectDetailsComponent } from '../../components';
// import { DocumentRecordDto } from './../../../../shared/models/document-records.model';
import { UndoRedoService } from '../../services/undo-redo.service';
import { BlockUiService } from 'src/app/shared/services';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SummaryCommentsComponent } from 'src/app/modules/comments/components/summary-comments/summary-comments.component';
import { SharedService } from '../../services/shared.service';
import { Store } from '@ngxs/store';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { CostingScenarioComponent } from '../../components/costing-scenario/costing-scenario.component';
import { GerberViewerAiComponent } from '../../components/costing-cost-summary/gerber-reader/gerber-viewer/gerber-viewer-ai.component';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { ProjectScenarioSignalsService } from 'src/app/shared/signals/project-scenario-signals.service';
import { AuthenticationHelperService } from 'src/app/shared/helpers/authentication-helper.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-costing-page',
  templateUrl: './costing-page.component.html',
  styleUrls: ['./costing-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CostingProjectDetailsComponent,
    CostingProjectBomDetailsComponent,
    CostingScenarioComponent,
    CostingInformationComponent,
    CostingCostSummaryComponent,
    SummaryCommentsComponent,
    MatIconModule,
    // NgClass,
    MatTabsModule,
    GerberViewerAiComponent,
  ],
})
export class CostingPageComponent implements OnInit, OnDestroy {
  public selectedPartId: number;
  public currentPartCommodityId: number;
  public azureSharedId: string;
  public projectInfoList: ProjectInfoDto[] = [];
  public bomQty: number;
  public bomId: number;
  public selectedProjectId: number;
  public specificProjectId: number;
  sharedService = inject(SharedService);
  _store = inject(Store);
  // public docRecord: DocumentRecordDto;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  @ViewChild('constingInformation') costinfoChild: CostingInformationComponent;
  @ViewChild(CostingCostSummaryComponent) costingCostSummary: CostingCostSummaryComponent;
  @ViewChild(CostingProjectBomDetailsComponent)
  bomChild: CostingProjectBomDetailsComponent;
  isCostSummarydirty = false;
  @Input() costingPageApi!: any;
  public selectedScenario: ProjectScenarioDto;
  isDataChanged = false;
  hostUrl = window.location.origin;
  showRecentVisits = false;
  commodityId: number;
  pcbCommodities = [16];
  public savedPartInfoId!: { id: number };
  public canUpdate: boolean = false;

  public undoRedoFormSubject$ = new Subject<any>();
  public formsArr: { componentName: string; formName: string; loadTime: number }[] = [];
  projectVistHistory = [];
  public selectedProject: ProjectInfoDto;
  public navLinks: any[];
  isCollapsed = false;

  constructor(
    private route: ActivatedRoute,
    public undoRedoService: UndoRedoService,
    protected _blockUIService: BlockUiService,
    private materialInfoSignalsService: MaterialInfoSignalsService,
    private processInfoSignalsService: ProcessInfoSignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private projectScenarioSignalsService: ProjectScenarioSignalsService,
    private authenticationHelperService: AuthenticationHelperService,
    private partInfoSignalsService: PartInfoSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  canDeactivate(): Observable<DirtyModel> | DirtyModel {
    return this.costinfoChild.checkIfChildComponentDirty();
  }

  ngOnInit() {
    this.selectedProjectId = 0;
    this.selectedPartId = 0;
    this.specificProjectId = 0;
    this.clearStatesOnLoad();
    this.specificProjectId = +(this.route.snapshot.paramMap.get('projectId') || 0);
    this.route.data
      .pipe(
        map<any, ProjectInfoDto[]>((data) => data['projectInfoList']),
        filter((projectInfoList) => !!projectInfoList),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectInfoList) => {
        setTimeout(() => {
          this._blockUIService.popBlockUI('projectInfoList');
        }, 3000);
        this.projectInfoList = projectInfoList || [];
      });
    this.showRecentVisits = localStorage.getItem('showRecentVisits')?.toLocaleLowerCase() === 'true' || false;

    if (this.undoRedoService.isEnabledUndoRedo) {
      this.formsArr = [
        { componentName: 'costPartComponent', formName: 'costingPartInfoform', loadTime: 0 },
        { componentName: 'materialInfoComponent', formName: 'costingMaterialInfoform', loadTime: 15000 },
        { componentName: 'costManufacturingComponent', formName: 'costingManufacturingInfoform', loadTime: 15000 },
        { componentName: 'costToolingComponent', formName: 'costingToolingform', loadTime: 5000 },
        // { componentName: 'costSecondaryProcessComponent', formName: 'costingSecProcessform', loadTime: 0 },
        { componentName: 'purchasedCatalougeComponent', formName: 'costingCOTsInfoform', loadTime: 4000 },
        { componentName: 'overHeadProfitComponent', formName: 'costingOverHeadProfitForm', loadTime: 0 },
        { componentName: 'packageInfoComponent', formName: 'costingPackagingForm', loadTime: 18000 },
        { componentName: 'logisticsComponent', formName: 'logisticsInformationForm', loadTime: 14000 },
        // { componentName: 'dutiesAndTariffComponent', formName: 'dutiesTariffForm', loadTime: 5000 },
        // { componentName: 'spendClassificationComponent', formName: 'spendClassificationForm', loadTime: 5000 },
        { componentName: 'costingCostSummaryComponent', formName: 'costSummaryInfoForm', loadTime: 0 },
      ];
      this.registerUndoRedoForms();
      this.registerFormsUpdates();
      this.undoRedoService.formsCount = this.formsArr.length;
    }
  }

  registerDynamicComponentForms(componentName: string, formName: string, loadTime = 0) {
    const alreadyExists = this.formsArr.some((f) => f.formName === formName);
    if (!alreadyExists) {
      const newForm = { componentName, formName, loadTime };
      this.formsArr.push(newForm);
      this.undoRedoService.formsCount = this.formsArr.length;
      this.undoRedoFormSubject$.next([newForm]);
    }
  }

  private clearStatesOnLoad() {
    // this._store.dispatch(new ProcessInfoActions.ClearProcessInfos());
    this.processInfoSignalsService.clearProcessInfos();
    // this._store.dispatch(new BomActions.ClearBomInfos());
    this.bomInfoSignalsService.clearBomInfos();
    // this._store.dispatch(new MaterialInfoActions.ClearMaterialInfos());
    this.materialInfoSignalsService.clearMaterialInfos();
    // this._store.dispatch(new ScenarioAction.ClearScenarioInfos());
    this.projectScenarioSignalsService.clearProjectScenarios();
    this.partInfoSignalsService.clearPartInfo();
    this.costSummarySignalsService.clearCostSummaryInfos();
  }

  @HostListener('document:keydown.control.z', ['$event'])
  onControlZKeydown(event: KeyboardEvent) {
    if (this.undoRedoService.isEnabledUndoRedo) {
      event.preventDefault();
      this.undoRedoService.undoRedoSubject$.next('undo');
    }
  }

  @HostListener('document:keydown.control.y', ['$event'])
  onControlYKeydown(event: KeyboardEvent) {
    if (this.undoRedoService.isEnabledUndoRedo) {
      event.preventDefault();
      this.undoRedoService.undoRedoSubject$.next('redo');
    }
  }

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:click', ['$event'])
  onUserInteractionEvent(event: KeyboardEvent | MouseEvent) {
    if (this.undoRedoService.isEnabledUndoRedo) {
      if (!this.undoRedoService.actionNeeded) {
        // only if actionNeeded is false should it check the tag/key
        if (event instanceof KeyboardEvent) {
          // formchanges can be captured if the action is not related to alt/ctrl
          this.undoRedoService.actionNeeded = !(event.ctrlKey || event.altKey || event.shiftKey || event.code === 'Tab');
        } else if (event instanceof MouseEvent) {
          // formchanges can be captured if action includes click on certain elements
          const targetElement = event.target as HTMLElement;
          this.undoRedoService.actionNeeded = ['SELECT', 'INPUT', 'TEXTAREA'].includes(targetElement.tagName);
        }
      }

      if (!this.undoRedoService.userInteracted && this.undoRedoService.formsLoaded) {
        // undo/redo init condition
        this.undoRedoService.userInteracted = true;
        this.undoRedoService.undoRedoInit();
      }
    }
  }

  public registerUndoRedoForms() {
    this.undoRedoFormSubject$
      .asObservable()
      .pipe(
        debounceTime(2000),
        // switchMap((action) => of(action)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((forms: Array<{ componentName: string; formName: string; loadTime: number }>) => {
        if (forms.length === this.undoRedoService.formsCount) {
          this.undoRedoService.formChangeListPointer = -1;
          this.undoRedoService.formChangeList = [];
          this.undoRedoService.unsubscribeUndoRedoForm();
        }
        const frms = forms.filter((f) => {
          // if (f.componentName === 'dutiesAndTariffComponent' && this.costinfoChild[f.componentName] && this.costinfoChild[f.componentName][f.formName]) {
          //   // setTimeout(() => {
          //   // if (f.componentName === 'dutiesAndTariffComponent' && this.costinfoChild[f.componentName] && this.costinfoChild[f.componentName][f.formName]) {
          //   this.undoRedoService.setupFormChange(f.componentName, this.costinfoChild[f.componentName][f.formName], f.formName, f.loadTime);
          //   // }
          //   // }, 5000);
          //   return false;
          // } else
          if (f.componentName === 'costingCostSummaryComponent') {
            if (this.costingCostSummary && this.costingCostSummary[f.formName]) {
              this.undoRedoService.setupFormChange(f.componentName, this.costingCostSummary[f.formName], f.formName, f.loadTime);
              return false;
            }
          } else if (this.costinfoChild[f.componentName] && this.costinfoChild[f.componentName][f.formName]) {
            this.undoRedoService.setupFormChange(f.componentName, this.costinfoChild[f.componentName][f.formName], f.formName, f.loadTime);
            return false;
          }
          return true;
        });

        if (forms.length > 0) {
          this.undoRedoFormSubject$.next(frms);
        }
      });
  }

  registerFormsUpdates() {
    this.undoRedoService.formUpdateSubscribe$
      .asObservable()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((componentForm) => {
        const formValue = this.costinfoChild[componentForm.componentName][componentForm.formName].value;
        const event = { currentTarget: { value: formValue[componentForm.formControlName] } };
        switch (componentForm.formName) {
          case 'costingMaterialInfoform': {
            if (componentForm.formControlName === 'matPrimaryProcessName') {
              this.costinfoChild[componentForm.componentName].onPrimaryProcessChange(event);
            } else if (componentForm.formControlName === 'stockForm') {
              this.costinfoChild[componentForm.componentName].onStockFormChange(event);
            } else if (componentForm.formControlName === 'materialCategory') {
              this.costinfoChild[componentForm.componentName].onGroupChange(event);
            } else if (componentForm.formControlName === 'materialFamily') {
              this.costinfoChild[componentForm.componentName].onMaterialTypeChange(event);
            }
            break;
          }
          case 'costingManufacturingInfoform': {
            if (componentForm.formControlName === 'processTypeID') {
              this.costinfoChild[componentForm.componentName].onProcessTypeChange({ currentTarget: { value: formValue.processTypeID } });
            } else if (componentForm.formControlName === 'manufacturePkgs.subProcessTypeID' && formValue.manufacturePkgs[componentForm.index]?.subProcessTypeID) {
              this.costinfoChild[componentForm.componentName].setFormBasedOnSubProcessType(
                { currentTarget: { value: formValue.manufacturePkgs[componentForm.index].subProcessTypeID } },
                componentForm.index
              );
            }
            break;
          }
          case 'costingSecProcessform': {
            if (componentForm.formControlName === 'Secondary_Process') {
              this.costinfoChild[componentForm.componentName].viewCTDetails(event);
            }
            break;
          }
          case 'costingPackagingForm': {
            if (componentForm.formControlName === 'shrinkWrap') {
              this.costinfoChild[componentForm.componentName].onShrinkWrapChange({ target: { value: formValue[componentForm.formControlName] } });
            }
            break;
          }
          case 'logisticsInformationForm': {
            if (componentForm.formControlName === 'ModeOfTransport') {
              this.costinfoChild[componentForm.componentName].setValuesBasedOnModeOfTransport(formValue);
            } else if (componentForm.formControlName === 'ShipmentType') {
              this.costinfoChild[componentForm.componentName].setValuesBasedOnShipmentType(formValue.ShipmentType);
            } else if (componentForm.formControlName === 'ContainerType') {
              this.costinfoChild[componentForm.componentName].onContainerTypeChange();
            }
            break;
          }
        }
      });
  }

  submissionTriggered(event: string) {
    if (this.undoRedoService.isEnabledUndoRedo) {
      if (event === 'updateSave') {
        this.undoRedoFormSubject$.next(this.formsArr.map((f) => ({ ...f, loadTime: 0 })));
      } else {
        this.undoRedoFormSubject$.next(this.formsArr);
      }
    }

    if (['updateSave', 'recalculate'].includes(event)) {
      this.isCostSummarydirty = false;
      this.costingCostSummary.saveCostSummary();
      if (event === 'updateSave') {
        this.savedPartInfoId = { id: this.selectedPartId };
      }
    }
  }

  dirtyCheck(isDirty: boolean) {
    this.isCostSummarydirty = isDirty;
    if (!this.isCostSummarydirty) {
      this.isCostSummarydirty = isDirty;
    }
  }

  checkCostInfoDirty() {
    this.isDataChanged = this.costinfoChild.checkIfChildComponentDirty()?.isAnyChildDirty;
    return this.isDataChanged;
  }

  getCostInfoDirtyMethod(): any {
    return {
      checkIfDirty: () => {
        return this.checkCostInfoDirty();
      },
    };
  }

  public onBomSelected(bomObj: any) {
    if (bomObj.partId && bomObj.partId > 0) {
      this.selectedPartId = bomObj.partId;
      if (this.undoRedoService.isEnabledUndoRedo) {
        this.undoRedoFormSubject$.next(this.formsArr);
      }
    }
    // else {
    //   this.selectedPartId = {} as number;
    // }
    this.bomQty = bomObj.partQty;
    this.bomId = bomObj.bomId;

    if (this.bomChild) {
      //this.bomChild.clearViewer();
      this.azureSharedId = '';
    }
  }

  public onScenarioChange(scenario: ProjectScenarioDto): void {
    this.selectedScenario = scenario;
    this.selectedPartId = scenario.partInfos && scenario.partInfos.length > 0 ? scenario.partInfos[0].partInfoId : 0;
    this.currentPartCommodityId = scenario.partInfos && scenario.partInfos.length > 0 ? scenario.partInfos[0].commodityId : 0;
  }

  public onProjectIdChange(selectedProjectId: number): void {
    if (selectedProjectId !== this.selectedProjectId && selectedProjectId > 0) {
      this.selectedProjectId = selectedProjectId;
      this.authenticationHelperService.forceLogoutIfStateInvalid();

      setTimeout(() => {
        this.projectVistHistory = JSON.parse(localStorage.getItem('projectVistHistory')).slice(0, -1) || [];
      }, 3000);
    }
  }

  public onCommodityChange(commodityId: number): void {
    this.currentPartCommodityId = commodityId;
  }

  public onProjectSelected(selectedProject: ProjectInfoDto): void {
    selectedProject && (this.selectedProject = { ...selectedProject });
    if (this.specificProjectId === 0) {
      this.specificProjectId = selectedProject?.projectInfoId || 0;
    }
    let marketMonth = this.selectedProject?.marketMonth;
    if (!marketMonth) {
      marketMonth = this.sharedService.getMarketMonth(this.selectedProject?.marketQuarter);
    }
    const mon = (+marketMonth.slice(0, 2)).toString().padStart(2, '0');
    const year = (+marketMonth.slice(2)).toString();
    this._store.dispatch(new MasterDataActions.GetMarketMonth(mon + year.toString()));
  }

  setAzureSharedId(azureSharedId: string) {
    this.azureSharedId = azureSharedId;
    if (!azureSharedId) {
      if (this.bomChild) {
        this.bomChild.clearViewer();
        this.azureSharedId = '';
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
