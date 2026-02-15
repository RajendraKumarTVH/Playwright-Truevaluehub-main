import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { FileUploadModule } from 'primeng/fileupload';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { GerberImageInfoDto } from 'src/app/modules/costing/models/gerber-reader-response-dto';
import { GerberReaderService } from 'src/app/modules/costing/services/gerber-reader.service';
// import { PartInfoDto } from 'src/app/shared/models/part-info.model';
import { Store } from '@ngxs/store';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';

@Component({
  selector: 'app-gerber-viewer-ai',
  templateUrl: './gerber-viewer-ai.component.html',
  styleUrls: ['./gerber-viewer-ai.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, FileUploadModule, ButtonModule, MatIconModule, TableModule],
})
export class GerberViewerAiComponent implements OnInit, OnDestroy, OnChanges {
  @Input() partInfoId: number;
  gerberDataSource?: GerberImageInfoDto[];
  //   copperLayers: LayerInfo[] = [];
  modalImage?: string;
  // _partInfo$: Observable<PartInfoDto>;
  showSpinner = true;
  selectedFileName: string = '';
  private readonly spinnerSubscription?: Subscription;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly gerberReaderService: GerberReaderService,
    private readonly blockerUiService: BlockUiService,
    private readonly _store: Store
  ) {
    // this._partInfo$ = this._store.select(PartInfoState.getPartInfo);
    this.spinnerSubscription = timer(100000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.getGerberDetailsByPartInfoId();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partInfoId'] && !changes['partInfoId'].firstChange && changes['partInfoId'].currentValue != changes['partInfoId'].previousValue) {
      this.modalImage = undefined;
      this.getGerberDetailsByPartInfoId();
    }
  }

  ngOnInit(): void {
    if (this.partInfoId) {
      this.getGerberDetailsByPartInfoId();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onGerberFileSelect(fileName?: string) {
    this.selectedFileName = fileName || '';
    this.modalImage = this.gerberDataSource?.find((gerber) => gerber.fileName === fileName)?.imageData;
  }

  getGerberDetailsByPartInfoId() {
    this.blockerUiService.pushBlockUI('getGerberDetailsByPartInfoId');
    this.gerberDataSource = [];
    this.gerberReaderService
      .getGerberImageInfoByPartInfoId(this.partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.spinnerSubscription?.unsubscribe();
          this.showSpinner = false;
          if (response?.length > 0) {
            this.gerberDataSource = response;
            this.onGerberFileSelect(this.gerberDataSource[0]?.fileName);
          }
          this.blockerUiService.popBlockUI('getGerberDetailsByPartInfoId');
        },
        error: () => {
          this.spinnerSubscription?.unsubscribe();
          this.blockerUiService.popBlockUI('getGerberDetailsByPartInfoId');
        },
      });
  }
}
