import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { BlockUiService, ProjectInfoService } from 'src/app/shared/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { Store } from '@ngxs/store';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressBarComponent } from 'src/app/shared/components';
import { TableModule } from 'primeng/table';
// import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FileUploadModule } from 'primeng/fileupload';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectStatus } from 'src/app/shared/enums';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';

@Component({
  selector: 'app-slider-content',
  templateUrl: './slider-content.component.html',
  styleUrls: ['./slider-content.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TabViewModule, TableModule, MultiSelectModule, CommonModule, ButtonModule, RippleModule, ProgressBarComponent, FileUploadModule, MatIconModule, MatTooltipModule],
})
export class SliderContentComponent implements OnInit {
  @Input() rowData: any;
  private unSubscribe$: Subject<void> = new Subject<void>();
  uploadedPartFilesCount = 0;
  selectedRowData: any;
  @Input({ required: true }) currentUserId: number;
  @Input({ required: true }) isAdmin: boolean;
  canUpdate: boolean = false;
  sharedService = inject(SharedService);

  constructor(
    private blockUiService: BlockUiService,
    private messaging: MessagingService,
    private projectInfoService: ProjectInfoService,
    private _store: Store,
    private bomInfoSignalsService: BomInfoSignalsService
  ) {}

  ngOnInit(): void {
    this.canUserUpdate();
  }

  private canUserUpdate() {
    this.canUpdate =
      this.isAdmin ||
      this.sharedService.hasSameGroup(this.rowData?.createdUserId, this.currentUserId) ||
      this.currentUserId === this.rowData?.createdUserId ||
      this.rowData?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
  }
  updateNewDocumentForFailedRecord(event: any, partInfoId: number, documentRecordId: number, item: any) {
    this.blockUiService.pushBlockUI('updateNewDocumentForFailedRecord');
    const files = event.files;

    if (files?.length > 0) {
      const formData = new FormData();
      for (const file of files) {
        let fileName = file.name;
        const parts = item?.partDetailsByProjectDto?.find((x) => x.partInfoId === partInfoId);
        if (parts?.intPartNumber) {
          const revision = parts.partRevision || '0';
          fileName = `${parts.intPartNumber}-${revision}-${file.name}`;
        }
        formData.append('formFile', file, fileName);
        formData.append('originalFileName', file.name);
      }

      this.projectInfoService
        .updateNewDocumentForFailedRecord(partInfoId, documentRecordId, formData)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((data) => {
          this.blockUiService.popBlockUI('updateNewDocumentForFailedRecord');
          if (data) {
            this.messaging.openSnackBar(`New drawing has updated successfully.`, '', { duration: 5000 });
            item.isRefreshRequired = true;
            this.selectedRowData = item;
            this.onViewPart();
          }
        });
    }
  }

  onViewPart() {
    const item = this.selectedRowData;
    this.blockUiService.pushBlockUI('getPartDetailsByProjectId');
    this.projectInfoService
      .getPartDetailsByProjectId(item.projectInfoId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(
        (result) => {
          this.blockUiService.popBlockUI('getPartDetailsByProjectId');
          item.partDetails = result;
        },
        (error) => console.error(error)
      );
  }

  onRefreshIconClick() {
    this.selectedRowData = this.rowData;
    this.onViewPart();
  }

  onRetryIconClick() {
    this.selectedRowData = this.rowData;
    const projectInfo = this.selectedRowData;

    if (projectInfo?.projectInfoId) {
      if (projectInfo?.projectStatusId === ProjectStatus.Completed || projectInfo?.projectStatusId === ProjectStatus.Costing) {
        projectInfo.projectStatusId = ProjectStatus.DataExtractionReprocessing;
      }

      this.projectInfoService
        .updateProjectStatus(projectInfo?.projectInfoId, projectInfo?.projectStatusId)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe(() => {
          this.projectInfoService.refreshProject(projectInfo?.projectInfoId);
          this.messaging.openSnackBar(`Data Extraction Restarted Successfully.`, '', { duration: 5000 });
        });
    }
  }

  get shouldShowRetryButton(): boolean {
    return Array.isArray(this.rowData?.partDetails) && this.rowData.partDetails.some((part) => part.isRefreshRequired);
  }

  public removeBomClick(projectInfoId: number, bomId: number, scenarioId: number, item: any) {
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
        // this._store.dispatch(new BomActions.RemoveBillOfMaterial(Number(bomId), projectInfoId, scenarioId));
        this.bomInfoSignalsService.removeBillOfMaterial(Number(bomId), projectInfoId, scenarioId);
        setTimeout(() => {
          this.selectedRowData = item;
          this.onViewPart();
        }, 1500);

        this.messaging.openSnackBar(`Data has been delete successfully.`, '', {
          duration: 5000,
        });
      }
    });
  }
}
