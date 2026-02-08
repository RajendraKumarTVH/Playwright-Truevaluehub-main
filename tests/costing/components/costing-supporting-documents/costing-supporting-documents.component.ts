import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FileFormat, PartInfoDto, ProjectInfoDto } from 'src/app/shared/models';
import { DocumentCollectionDto } from 'src/app/shared/models/document-collection.model';
import { DocumentRecordDto } from 'src/app/shared/models/document-records.model';
import { AppConfigurationService, BlockUiService, PartInfoService } from 'src/app/shared/services';
import { costingEndpoints } from '../../costing.endpoints';
import { takeUntil, first } from 'rxjs/operators';
import { ConfirmationDialogConfig, FilesupportDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { FileValidatorService } from 'src/app/shared/services/FileValidatorService.service';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
import { Store } from '@ngxs/store';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FileSizeMbPipe } from 'src/app/shared/pipes';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { SharedService } from '../../services/shared.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-costing-supporting-documents',
  templateUrl: './costing-supporting-documents.component.html',
  styleUrls: ['./costing-supporting-documents.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, FileSizeMbPipe, MatSlideToggle],
})
export class CostingSupportingDocumentsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() part: PartInfoDto;
  @Input() selectedProject: ProjectInfoDto;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @ViewChild('fileInput') fileInput: ElementRef<any>;
  public currentPart: PartInfoDto;
  public documentCollectionId: number;
  public currentList: DocumentRecordDto[] = [];
  public currentListCount = 0;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  _dataExtraction$: Observable<DataExtraction>;
  extractedData: any;
  currentUserId = 0;
  canUpdate = false;
  private isAdmin: boolean = false;
  sharedService = inject(SharedService);
  private userInfoService = inject(UserInfoService);
  rejectedExtensions = ['exe', 'sh', 'bat', 'js', 'php', 'asp', 'aspx', 'jsp', 'html'];

  constructor(
    private partInfoService: PartInfoService,
    private messaging: MessagingService,
    private config: AppConfigurationService,
    private fileValidatorService: FileValidatorService,
    private _blockUiService: BlockUiService,
    private modalService: NgbModal,
    private store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._dataExtraction$ = this.store.select(DataExtractionState.getDataExtraction);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;
      this.currentList = this.currentPart.documentCollectionDto?.documentRecords || [];
      this.currentList = this.currentList.filter((x) => !x.deleted);
      this.currentListCount = this.currentList.length;
      this.documentCollectionId = this.currentList[0]?.documentCollectionId;
    }
  }

  ngOnInit(): void {
    this.userInfoService.getUserValue().subscribe((user) => {
      this.currentUserId = user?.userId;
      this.isAdmin = user?.roleId === 1;
    });
    this.getExtractedData();
    this.canUserDate();
  }
  canUserDate() {
    this.canUpdate =
      this.isAdmin ||
      this.sharedService.hasSameGroup(this.selectedProject?.createdUserId, this.currentUserId) ||
      this.currentUserId === this.selectedProject?.createdUserId ||
      this.selectedProject?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
  }
  public onChangePrivate(evt: any, document: DocumentRecordDto) {
    const value = evt.checked;
    this.partInfoService
      .updateDocumentRecordPrivate(this.currentPart.partInfoId, document.documentRecordId, value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data) {
          const index = this.currentList.findIndex((x) => x.documentRecordId == document.documentRecordId);
          if (index > -1) {
            document.isPrivate = value;
            this.currentList[index] = document;
            this.currentPart.documentCollectionDto = this.currentPart.documentCollectionDto || ({} as DocumentCollectionDto);
            this.currentPart.documentCollectionDto = { ...this.currentPart.documentCollectionDto, documentRecords: this.currentList };
            this.emitData();
          }
        }
      });
  }

  public getLink(documentRecordId: number) {
    return costingEndpoints.downloadDocument(this.config.configuration.apiBaseUrl, documentRecordId);
  }

  getExtractedData() {
    this._dataExtraction$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: DataExtraction) => {
      if (res && res?.partInfoId > 0) {
        this.extractedData = {
          material: JSON.parse(res?.materialInfoJson),
          process: JSON.parse(res?.processInfoJson),
        };
      } else {
        this.extractedData = null;
      }
    });
  }

  public getFileView(data: any) {
    const fileName = data.docName;

    const fArray = fileName?.split('.');
    const ext: string = fArray[fArray.length - 1];

    if (['doc', 'docx', 'txt', 'pdf', 'xls', 'xlsx', 'csv', 'png', 'jpeg', 'jpg', 'smg', 'webm', 'json'].includes(ext?.toLowerCase())) {
      this.openDocumentViewer(data);
    }
    // else if (['png', 'jpeg', 'jpg'].includes(ext?.toLowerCase())) {
    //   this.openImageViewer(data);
    // }
    else {
      const modalRef = this.modalService.open(CadViewerPopupComponent, { windowClass: 'fullscreen' });
      modalRef.componentInstance.fileName = `${fileName}.cdxfb`;
      modalRef.componentInstance.partData = {
        caller: 'supporting-documents',
        partId: this.currentPart.partInfoId,
        volume: this.extractedData?.material?.DimVolume,
        surfaceArea: this.extractedData?.material?.DimArea,
        projectedArea: this.extractedData?.material?.ProjectedArea,
        dimentions: { dimX: this.extractedData?.material?.DimX, dimY: this.extractedData?.material?.DimY, dimZ: this.extractedData?.material?.DimZ },
        centerMass: { centroidX: this.extractedData?.process?.CentroidX, centroidY: this.extractedData?.process?.CentroidY, centroidZ: this.extractedData?.process?.CentroidZ },
      };
    }
  }

  private uploadForm(files: FileList) {
    if (files?.length > 0) {
      // this._blockUiService.pushBlockUI('Supported document upload');
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        const revisionLevel = this.currentPart.partRevision ? this.currentPart.partRevision : '0';
        const fileName = this.currentPart.intPartNumber + '-' + revisionLevel + '-' + file.name;
        formData.append('formFile', file, fileName);
        formData.append('originalFileName', file.name);
      }

      if (this.documentCollectionId > 0) {
        this.partInfoService
          .uploadPartDocuments(this.currentPart.partInfoId, this.documentCollectionId, formData)
          // .pipe(takeUntil(this.unsubscribe$))
          .subscribe((data) => {
            if (data) {
              this.currentPart.documentCollectionDto ??= { documentRecords: [] } as DocumentCollectionDto;
              this.fileInput.nativeElement.value = null;
              this.currentPart.documentCollectionDto.documentRecords.push(data);
              this.emitData();
              //   this._blockUiService.popBlockUI('Supported document upload');
              // } else {
              //   this._blockUiService.popBlockUI('Supported document upload');
            }
            this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
          });
      } else {
        this.partInfoService
          .uploadPartDocumentCollection(this.currentPart.partInfoId, formData)
          // .pipe(takeUntil(this.unsubscribe$))
          .subscribe((data) => {
            if (data) {
              this.documentCollectionId = data.documentCollectionId;
              this.currentPart.documentCollectionDto = data;
              this.fileInput.nativeElement.value = null;
              this.emitData();
              //   this._blockUiService.popBlockUI('Supported document upload');
              // } else {
              //   this._blockUiService.popBlockUI('Supported document upload');
            }
            this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
          });
      }
    }
  }

  // public onUpload(files: FileList | null) {
  //   if (files && files.length > 0) {
  //     let validate = false;
  //     const file = files[0] as File;
  //     validate = this.fileValidatorService.isValidFileFormat(file.name);

  //     if (validate) {
  //       this.uploadForm(files);
  //     } else {
  //       const message = 'The selected file  is not supported';
  //       this.messaging.openSnackBar(message, '', {
  //         duration: 5000,
  //       });

  //       return;
  //     }
  //   }
  // }
  public onUpload(files: FileList | null) {
    if (files && files.length > 0) {
      const filteredFiles = Array.from(files).filter((file) => {
        const extension = file.name?.split('.').pop()?.toLowerCase();
        return extension && !this.rejectedExtensions.includes(extension);
      });

      if (filteredFiles.length === 0) {
        const message = 'No valid supported files were selected.';
        this.messaging.openSnackBar(message, '', { duration: 5000 });
        return;
      }

      const validFileList = this.arrayToFileList(filteredFiles);

      const firstFile = validFileList[0];
      const isValid = this.fileValidatorService.isValidFileFormat(firstFile.name);

      if (isValid) {
        this.uploadForm(validFileList);
      } else {
        const message = 'The selected file type is not supported';
        this.messaging.openSnackBar(message, '', { duration: 5000 });
      }
    }
  }

  private arrayToFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

  showSupportedFormats(): void {
    const supportedFormats = Object.values(FileFormat) as string[];
    this.messaging.openSupportDocuments(<FilesupportDialogConfig>{
      data: {
        supportFile: supportedFormats,
      },
    });
  }

  public onDelete(document: DocumentRecordDto) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          this.partInfoService
            .deleteDocument(this.currentPart.partInfoId, document.documentRecordId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data) => {
              if (data) {
                this.currentList = this.currentList.filter((x) => x.documentRecordId != document.documentRecordId);
                this.currentPart.documentCollectionDto = this.currentPart.documentCollectionDto || ({} as DocumentCollectionDto);
                this.currentPart.documentCollectionDto = { ...this.currentPart.documentCollectionDto, documentRecords: this.currentList };
                this.emitData();
              }
            });
        }
      });
  }

  openDocumentViewer(data: any) {
    const modalRef = this.modalService.open(DocumentViewerComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.data = data;
  }

  openImageViewer(data: any) {
    const modalRef = this.modalService.open(ImageViewerComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.data = data;
    modalRef.componentInstance.part = this.currentPart;
    modalRef.componentInstance.documentCollectionId = this.documentCollectionId;
    modalRef.result.then(
      () => {
        this.emitData();
      },
      () => {
        this.emitData();
      }
    );
  }

  private emitData() {
    this.partChange.emit(this.currentPart);
  }

  public ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
