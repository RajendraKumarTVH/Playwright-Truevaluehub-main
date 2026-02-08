import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { FileUploadModule } from 'primeng/fileupload';
import { GerberReaderService } from '../../../services/gerber-reader.service';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { GerberReaderResponseDto, LayerInfo } from '../../../models/gerber-reader-response-dto';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';

@Component({
  selector: 'app-gerber-reader-ai',
  templateUrl: './gerber-reader-ai.component.html',
  styleUrls: ['./gerber-reader-ai.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, FileUploadModule, ButtonModule, MatIconModule, TableModule],
})
export class GerberReaderAiComponent implements OnInit, OnDestroy {
  @Input() partInfoId: string;
  gerberDataSource?: GerberReaderResponseDto;
  copperLayers: LayerInfo[] = [];
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly gerberReaderService: GerberReaderService,
    private readonly blockerUiService: BlockUiService
  ) {}

  ngOnInit(): void {
    if (this.partInfoId) {
      this.getGerberDetailsByPartInfoId();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onUpload(files: FileList) {
    if (!files || files.length !== 1) {
      return;
    }
    const formData = new FormData();
    const file = files[0];
    formData.append('formFile', file, file.name);
    formData.append('originalFileName', file.name);
    this.gerberReaderService
      .getGerberReaderDetails(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.gerberDataSource = response;
        this.copperLayers = response.layerInfo?.filter((layer) => layer.layerType === 'copper') || [];
      });
  }

  getGerberDetailsByPartInfoId() {
    this.blockerUiService.pushBlockUI('getGerberDetailsByPartInfoId');
    this.gerberReaderService
      .getGerberDetailsByPartInfoId(Number(this.partInfoId))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          if (response?.gerberInfoJson) {
            this.gerberDataSource = JSON.parse(response.gerberInfoJson);
            this.copperLayers = this.gerberDataSource?.layerInfo?.filter((layer) => layer.layerType === 'copper') || [];
          }
          this.blockerUiService.popBlockUI('getGerberDetailsByPartInfoId');
        },
        error: () => {
          this.blockerUiService.popBlockUI('getGerberDetailsByPartInfoId');
        },
      });
  }
}
