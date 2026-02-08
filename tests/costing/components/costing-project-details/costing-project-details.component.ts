import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, inject, OnChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { FormBuilder, AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, take, takeUntil } from 'rxjs'; // Observable
import { ProjectInfoDto, User } from 'src/app/shared/models';
// import { map, startWith } from 'rxjs/operators';
// import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NotSavedService } from 'src/app/services/not-saved.service';
// import { CostingCompletionPercentageCalculator } from '../../services';
// import { Router } from '@angular/router';
import { CommonModule, Location, formatDate } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
// import { MatOptionModule } from '@angular/material/core';
import { ProjectStatus } from 'src/app/shared/enums';
import { Select, SelectChangeEvent } from 'primeng/select';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { SharedService } from '../../services/shared.service';
import { MatTooltip } from '@angular/material/tooltip';
import { CostingWorkflowComponent } from '../costing-workflow/costing-workflow.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { WorkflowProcessDto, WorkflowProcessMapDto, WorkflowProcessStatusDto } from 'src/app/modules/settings/models';
// import { TagManagerComponent } from '../tag-manager/tag-manager.component';

@Component({
  selector: 'app-costing-project-details',
  templateUrl: './costing-project-details.component.html',
  styleUrls: ['./costing-project-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, Select, MatIconModule, MatTooltip], // MatAutocompleteModule, FormsModule, ReactiveFormsModule, MatIconModule, MatOptionModule,
})
export class CostingProjectDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectInfoList: ProjectInfoDto[];
  @Input() specificProjectId: number;
  @Input() canUpdate: boolean = false;
  @Output() projectIdChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectedProject: EventEmitter<ProjectInfoDto> = new EventEmitter<ProjectInfoDto>();
  private unSubscribeAll$ = new Subject<void>();
  public currentprojectInfoList: ProjectInfoDto[] = [];
  private extractionCompletedDate: string = '';
  // public costingProjectDetails: FormGroup;
  // public filteredProjects$: Observable<ProjectInfoDto[]>;
  // public projectSearchControlName = 'projectSearch';
  // public projectDescriptionControlName = 'projectDescription';
  public currentProjectId: number;
  public selectedProj: ProjectInfoDto;
  hasProjectSelChangeEventSub$: Subscription = Subscription.EMPTY;
  isfirstLoad: boolean = true;
  user: User;
  showMore = true;
  targetMonth: string;
  customFilterValue: string;
  selectedWorkFlowStatus: string = '';
  matDialogRef: MatDialogRef<CostingWorkflowComponent>;
  matDialog = inject(MatDialog);
  workFlowStatusIcon: any;
  userInfoService = inject(UserInfoService);
  workFlowProcesses: WorkflowProcessDto[] = [];
  workFlowProcessMap: WorkflowProcessMapDto[] = [];
  workFlowProcessStatus: WorkflowProcessStatusDto[] = [];
  colorId: string = '';
  bkColorId: string = '';
  borderColorId: string = '';

  constructor(
    // private formbuilder: FormBuilder,
    private notSavedService: NotSavedService,
    // private percentageCal: CostingCompletionPercentageCalculator,
    // private router: Router,
    private location: Location,
    private userService: UserService,
    private sharedService: SharedService
  ) {
    this.userInfoService
      .getWorkFlowProcess()
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe((workFlowProcesses) => {
        if (workFlowProcesses && workFlowProcesses.length > 0) {
          this.workFlowProcesses = workFlowProcesses;
          this.currentProjectId &&
            this.currentProjectId > 0 &&
            this.userInfoService
              .getWorkFlowProcessStatus(this.currentProjectId)
              .pipe(takeUntil(this.unSubscribeAll$))
              .subscribe((status) => {
                if (status && status.length > 0) {
                  this.workFlowProcessStatus = status;
                }
                if (this.workFlowProcessStatus.length === 0) {
                  this.selectedWorkFlowStatus = this.workFlowProcesses[0]?.workflowProcessName;
                  this.bkColorId = this.workFlowProcesses[0]?.colorCode?.split(';')[0];
                  this.colorId = this.workFlowProcesses[0]?.colorCode?.split(';')[1];
                  this.borderColorId = this.workFlowProcesses[0]?.colorCode?.split(';')[2];
                  this.workFlowStatusIcon = this.workFlowProcesses[0]?.iconName;
                  this.sharedService.setWorkFlowStatus(true);
                } else {
                  const workflowProcess = this.workFlowProcesses.find((x) => x.workflowProcessId === this.workFlowProcessStatus[this.workFlowProcessStatus.length - 1].currentWorkFlowId);
                  this.selectedWorkFlowStatus = workflowProcess?.workflowProcessName;
                  this.workFlowStatusIcon = workflowProcess?.iconName;
                  this.bkColorId = workflowProcess?.colorCode?.split(';')[0];
                  this.colorId = workflowProcess?.colorCode?.split(';')[1];
                  this.borderColorId = workflowProcess?.colorCode?.split(';')[2];
                  this.sharedService.setWorkFlowStatus(workflowProcess?.canUpdate ?? false);
                }
              });
        }
      });
    this.userInfoService
      .getWorkFlowProcessMap()
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe((workFlowProcessMap) => {
        if (workFlowProcessMap && workFlowProcessMap.length > 0) {
          this.workFlowProcessMap = workFlowProcessMap;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['specificProjectId'] && changes['specificProjectId'].currentValue != changes['specificProjectId'].previousValue) {
      this.currentProjectId = changes['specificProjectId'].currentValue;
    }
    if (changes['projectInfoList'] && changes['projectInfoList'].currentValue != changes['projectInfoList'].previousValue) {
      this.currentprojectInfoList = changes['projectInfoList'].currentValue;
      this.currentprojectInfoList = this.currentprojectInfoList.filter(
        (project) =>
          project.projectStatusId !== ProjectStatus.DataExtractionInprogress &&
          project.projectStatusId !== ProjectStatus.DataExtractionReprocessing &&
          project.projectStatusId !== ProjectStatus.NeedsReview
      );
    }
  }

  ngOnInit(): void {
    // this.formInit();
    // this.filteredProjects$ = this.projectSearchControl.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this._filter(value || ''))
    // );
    // if (this.currentprojectInfoList && this.currentprojectInfoList.length > 0 && this.currentProjectId && this.currentProjectId > 0) {
    const selectedProject = this.currentprojectInfoList.find((x) => x.projectInfoId === this.currentProjectId);
    this.sharedService.getMaterialInfoCreateDate().subscribe((createDate) => {
      if (createDate) {
        this.extractionCompletedDate = createDate;
      }
    });
    // this.costingProjectDetails.patchValue({
    //   [this.projectSearchControlName]: selectedProject?.projectName,
    //   // [this.projectDescriptionControlName]: selectedProject?.projectDesc,
    // });
    // } //Load from local storage
    this.listenProjectSelChangeEvents();
    if (selectedProject) {
      this.mapOnProjectSelected(selectedProject);
    } else {
      this.loadProjectFromLocalstorage();
    }
  }

  // get projectSearchControl(): AbstractControl {
  //   return this.costingProjectDetails.get(this.projectSearchControlName) as AbstractControl;
  // }

  // private formInit() {
  //   this.costingProjectDetails = this.formbuilder.group({
  //     [this.projectSearchControlName]: [''],
  //     // [this.projectDescriptionControlName]: [{ value: '', disabled: true }],
  //   });
  // }

  // private _filter(value: any): ProjectInfoDto[] {
  //   let filterValue = '';
  //   if (value instanceof Object) {
  //     filterValue = (value.projectName || '').toLowerCase() + ` - ${value.projectInfoId}`;
  //   } else {
  //     filterValue = (value || '').toLowerCase();
  //   }
  //   return this.currentprojectInfoList.filter((project) => ((project.projectName || '').toLowerCase() + ` - ${project.projectInfoId}`).includes(filterValue));
  // }

  // public projectOptionSelected(event: MatAutocompleteSelectedEvent) {
  //   const selectedProject = event.option.value as ProjectInfoDto;
  //   this.location.replaceState('/costing/' + selectedProject.projectInfoId);
  //   if (this.isfirstLoad) {
  //     this.mapOnProjectSelected(selectedProject);
  //   } else {
  //     this.notSavedService.dispatchProjectSelectionChanges(selectedProject);
  //   }
  //   this.isfirstLoad = false;
  // }

  public projectOptionSelected(_event: SelectChangeEvent) {
    this.location.replaceState('/costing/' + this.selectedProj.projectInfoId);
    if (this.isfirstLoad) {
      this.mapOnProjectSelected(this.selectedProj);
    } else {
      this.notSavedService.dispatchProjectSelectionChanges(this.selectedProj);
    }
    this.isfirstLoad = false;
  }

  private mapOnProjectSelected(selectedProject: ProjectInfoDto | undefined) {
    if (selectedProject) {
      // this.costingProjectDetails.get(this.projectDescriptionControlName)?.setValue(selectedProject?.projectDesc);
      // this.costingProjectDetails.get(this.projectSearchControlName)?.setValue(selectedProject);
      // this.costingProjectDetails.get(this.projectDescriptionControlName)?.disable();
      this.projectIdChange.emit(selectedProject.projectInfoId);
      this.selectedProject.emit(selectedProject);
      this.selectedProj = selectedProject;
      this.targetMonth = this.selectedProj?.marketMonth
        ? this.sharedService.getMonthName(Number(this.selectedProj?.marketMonth?.substring(0, 2))) + ' ' + this.selectedProj?.marketMonth?.substring(2, 6)
        : '';
      this.getUserById(selectedProject.createdUserId);
      localStorage.setItem('lastVisitedProject', JSON.stringify(selectedProject));
      this.updateProjectVisitHistory(selectedProject);
    }
  }

  updateProjectVisitHistory(selectedProject: ProjectInfoDto) {
    let projectVistHistory = JSON.parse(localStorage.getItem('projectVistHistory')) || [];
    projectVistHistory = projectVistHistory.filter((x) => x.projectInfoId !== selectedProject.projectInfoId);
    projectVistHistory.push({ projectInfoId: selectedProject.projectInfoId, projectName: selectedProject.projectName });
    projectVistHistory.length > 11 && (projectVistHistory = projectVistHistory.slice(projectVistHistory.length - 11));
    localStorage.setItem('projectVistHistory', JSON.stringify(projectVistHistory));
  }

  // public displayProject(project: ProjectInfoDto): string {
  //   return project ? `${project?.projectName} - ${project?.projectInfoId}` : '';
  // }

  private listenProjectSelChangeEvents(): void {
    this.hasProjectSelChangeEventSub$ = this.notSavedService
      .hasProjectSelectionCompletedEvent()
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe((data) => {
        this.mapOnProjectSelected(data);
      });
  }

  private loadProjectFromLocalstorage() {
    const lastProject = localStorage.getItem('lastVisitedProject');
    if (lastProject != null && lastProject != undefined) {
      const obj = JSON.parse(lastProject);
      this.mapOnProjectSelected(obj);
      this.notSavedService.dispatchPreviousProjectLoaded(obj.projectInfoId);
    }
  }

  private getUserById(userId: number) {
    this.userService
      .getUsersById(userId)
      .pipe(take(1))
      .subscribe((response: User) => {
        this.user = response;
      });
  }
  launchWorkFlow() {
    this.matDialogRef = this.matDialog.open(CostingWorkflowComponent, {
      data: {
        workFlowProcesses: this.workFlowProcesses,
        workFlowProcessMap: this.workFlowProcessMap,
        workFlowProcessStatus: this.workFlowProcessStatus,
        projCreatedBy: this.user.firstName + ' ' + this.user.lastName + ',' + formatDate(this.selectedProj.createDate, 'MMM d, y h:mm a', 'en-US'),
        extractionCompletedDate: this.extractionCompletedDate,
      },
      width: '600px',
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '300ms',
      height: 'auto',
      autoFocus: true,
    });
    this.matDialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.userInfoService
          .createOrUpdateWorkflowProcessStatus({
            projectInfoId: this.selectedProj.projectInfoId,
            workflowProcessStatusId: 0,
            currentWorkFlowId: data.currentWorkflowId,
            completedWorkFlowId: data.completedWorkFlowId,
            createDate: new Date(),
            createdUserId: this.user?.id,
          } as WorkflowProcessStatusDto)
          .subscribe((data) => {
            this.workFlowProcessStatus.push(data);
            const workflowProcess = this.workFlowProcesses.find((x) => x.workflowProcessId === this.workFlowProcessStatus[this.workFlowProcessStatus.length - 1].currentWorkFlowId);
            this.selectedWorkFlowStatus = workflowProcess?.workflowProcessName;
            this.workFlowStatusIcon = workflowProcess?.iconName;
            this.bkColorId = workflowProcess?.colorCode?.split(';')[0];
            this.colorId = workflowProcess?.colorCode?.split(';')[1];
            this.borderColorId = workflowProcess?.colorCode?.split(';')[2];
            this.sharedService.setWorkFlowStatus(workflowProcess?.canUpdate ?? false);
          });
      }
    });
  }
  ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
  }
  // Uncomment below code to enable Tag Manager modal
  // openTagManager() {
  //   this.matDialog.open(TagManagerComponent, {
  //     width: '360px',
  //     enterAnimationDuration: '400ms',
  //     exitAnimationDuration: '300ms',
  //     height: 'auto',
  //     autoFocus: true,
  //     panelClass: 'tag-manager-modal',
  //   });
  // }
}
