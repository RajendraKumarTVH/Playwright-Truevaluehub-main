import { Component, inject, Inject, ViewChild, AfterViewInit, ViewEncapsulation, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, formatDate } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SharedService } from '../../services/shared.service';
import { WorkflowProcessDto, WorkflowProcessMapDto, WorkflowProcessStatusDto } from 'src/app/modules/settings/models';

@Component({
  selector: 'app-costing-workflow',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  imports: [
    CommonModule,
    MatOptionModule,
    MatStepperModule,
    MatStepper,
    MatFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
  ],
  templateUrl: './costing-workflow.component.html',
  styleUrl: './costing-workflow.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class CostingWorkflowComponent implements OnInit, AfterViewInit {
  projCreatedBy: string = '';
  extractionCompletedDate: string = '';
  sharedService = inject(SharedService);
  workFlowProcesses: WorkflowProcessDto[] = [];
  workFlowProcessMap: WorkflowProcessMapDto[] = [];
  workFlowProcessStatus: WorkflowProcessStatusDto[] = [];
  selectedWorkFlow: any;
  workFlowSteps: any = [];
  currentStepIndex: number = 2;
  matselectedValue: string = '';
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private _mdr: MatDialogRef<CostingWorkflowComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      projCreatedBy: string;
      extractionCompletedDate: string;
      costingStartDate: string;
      workFlowProcesses: WorkflowProcessDto[];
      workFlowProcessMap: WorkflowProcessMapDto[];
      workFlowProcessStatus: WorkflowProcessStatusDto[];
    }
  ) {
    this.workFlowProcesses = data.workFlowProcesses;
    this.workFlowProcessMap = data.workFlowProcessMap;
    this.workFlowProcessStatus = data.workFlowProcessStatus.map((x) => (x.completedWorkFlowId === undefined ? { ...x, completedWorkFlowId: 0 } : x));
    this.projCreatedBy = data.projCreatedBy;
    this.extractionCompletedDate = data.extractionCompletedDate;
  }
  ngOnInit(): void {
    const lastIndx = this.workFlowProcessStatus
      .slice()
      .reverse()
      .find((x) => x.completedWorkFlowId === 0);
    const currentWorkFlows = lastIndx
      ? this.workFlowProcessStatus.filter((x) => x.completedWorkFlowId >= 0 && x.workflowProcessStatusId >= lastIndx.workflowProcessStatusId)
      : this.workFlowProcessStatus.filter((x) => x.completedWorkFlowId >= 0);

    this.workFlowProcesses
      .filter((process) => process.canShowInWorkFlow)
      .sort((a, b) => {
        if (a.orderNumber < b.orderNumber) return -1;
        if (a.orderNumber > b.orderNumber) return 1;
        return 0;
      })
      .forEach((process, index) => {
        const stepcontent = [];
        let isCompleted = false;
        let isEditable = false;
        let startDate = '';
        if (process.workflowProcessId < currentWorkFlows[currentWorkFlows.length - 1]?.currentWorkFlowId) {
          startDate = formatDate(currentWorkFlows[currentWorkFlows.length - 1]?.createDate, 'MMM d, y h:mm a', 'en-US');
        }
        if (currentWorkFlows.length === 0) {
          if (index === 0) {
            ({ isCompleted, isEditable } = this.getEditableWorkFlow());
          } else {
            ({ isCompleted, isEditable } = this.getNonCompletedNonEditableWorkFlow());
          }
        } else {
          if (process.workflowProcessId < currentWorkFlows[currentWorkFlows.length - 1]?.currentWorkFlowId) {
            ({ isCompleted, isEditable } = this.getCompletedNonEditableWorkFlow());
          } else {
            if (index >= currentWorkFlows[currentWorkFlows.length - 1].currentWorkFlowId) {
              ({ isCompleted, isEditable } = this.getNonCompletedNonEditableWorkFlow());
            } else {
              ({ isCompleted, isEditable } = this.getEditableWorkFlow());
            }
          }
        }

        this.workFlowProcessMap
          .filter((x) => x.workflowProcessKey === process.workflowProcessId)
          .forEach((workFlow) => {
            const workFlowProcess = this.workFlowProcesses.find((x) => x.workflowProcessId === workFlow.workflowProcessValue);
            const statusName = workFlowProcess?.workflowProcessName;
            const displayIcon = workFlowProcess?.iconName;
            stepcontent.push({ statusName, displayIcon });
          });

        this.workFlowSteps.push({
          step: {
            stepName: process.workflowProcessName,
            isCompleted,
            isEditable,
            startDate,
            displayIcon: process.iconName,
            bkColorId: process?.colorCode?.split(';')[0],
            colorId: process?.colorCode?.split(';')[1],
            borderColorId: process?.colorCode?.split(';')[2],
            content: stepcontent,
          },
        });
      });

    if (currentWorkFlows.length > 0) {
      const stepIndex = currentWorkFlows[currentWorkFlows.length - 1]?.currentWorkFlowId + 1;
      this.currentStepIndex = stepIndex;
    }
  }

  getEditableWorkFlow() {
    return { isCompleted: false, isEditable: true };
  }

  getCompletedNonEditableWorkFlow() {
    return { isCompleted: true, isEditable: false };
  }

  getNonCompletedNonEditableWorkFlow() {
    return { isCompleted: false, isEditable: false };
  }

  ngAfterViewInit() {
    this.stepper.selectedIndex = this.currentStepIndex;
  }

  public onCostingStatusChange(event: any) {
    let currentWorkflowId = this.workFlowProcesses.find((x) => x.workflowProcessName === this.matselectedValue)?.workflowProcessId;
    let completedWorkFlowId = currentWorkflowId === 1 ? 0 : this.workFlowProcesses.find((x) => x.workflowProcessName === event.headerName)?.workflowProcessId;
    this.selectedWorkFlow = { completedWorkFlowId, currentWorkflowId };
  }

  onCloseClick(): void {
    this._mdr.close(this.selectedWorkFlow);
  }
}
