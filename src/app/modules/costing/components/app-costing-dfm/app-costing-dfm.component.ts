import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PartInfoDto } from 'src/app/shared/models';
import { PartInfoService } from 'src/app/shared/services';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
import { Store } from '@ngxs/store';
import { CommodityType } from '../../costing.config';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-costing-dfm',
  templateUrl: './app-costing-dfm.component.html',
  styleUrls: ['./app-costing-dfm.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatExpansionModule],
})
export class CostingDfmComponent implements OnInit, OnChanges, OnDestroy {
  @Input() part: PartInfoDto;
  currentPart: PartInfoDto;
  dfmIssues: any;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  _dataExtraction$: Observable<DataExtraction>;
  extractedData: any;

  constructor(
    private modalService: NgbModal,
    private partInfoService: PartInfoService,
    private _store: Store
  ) {
    this._dataExtraction$ = this._store.select(DataExtractionState.getDataExtraction);
  }

  ngOnInit() {
    //this.getDfmIssueData();
    this.getExtractedData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue as PartInfoDto;
    }
  }

  getExtractedData() {
    this._dataExtraction$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: DataExtraction) => {
      if (res && res?.partInfoId > 0) {
        this.extractedData = {
          material: JSON.parse(res?.materialInfoJson),
          process: JSON.parse(res?.processInfoJson),
        };
        if ([CommodityType.SheetMetal, CommodityType.StockMachining].includes(this.currentPart.commodityId)) {
          this.dfmIssues = res?.dfmIssues ? JSON.parse(res?.dfmIssues) : null;
        }
      } else {
        this.extractedData = null;
      }
    });
  }

  viewDfmIssues() {
    const modalRef = this.modalService.open(CadViewerPopupComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.dfmIssuesAnalyzer = this.dfmIssues;
    modalRef.componentInstance.fileName = `${this.currentPart?.azureFileSharedId}_dfm`;
    modalRef.componentInstance.partData = {
      caller: 'dfm',
      partId: this.currentPart?.partInfoId,
      volume: this.extractedData?.material?.DimVolume,
      surfaceArea: this.extractedData?.material?.DimArea,
      projectedArea: this.extractedData?.material?.ProjectedArea,
      dimentions: { dimX: this.extractedData?.material?.DimX, dimY: this.extractedData?.material?.DimY, dimZ: this.extractedData?.material?.DimZ },
      centerMass: { centroidX: this.extractedData?.process?.CentroidX, centroidY: this.extractedData?.process?.CentroidY, centroidZ: this.extractedData?.process?.CentroidZ },
    };
  }

  // static fromJson(json: any): DFMSheetMetalAnalyzer {
  //   return new DFMSheetMetalAnalyzer(json.TotalIssues, json.DFMSheetMetalAnalyzerInfos);
  // }

  // getDfmIssueData() {
  //   if ([CommodityType.SheetMetal, CommodityType.StockMachining].includes(this.currentPart.commodityId)) {
  //     this.partInfoService
  //       .getDfmIssues(this.currentPart.partInfoId)
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe((dfmIssuesAnalyzer: DFMSheetMetalAnalyzer) => {
  //         this.dfmIssues = dfmIssuesAnalyzer;
  //       }, (error) => {
  //         console.error(error);
  //       });
  //     return this.dfmIssues;
  //   }
  //   return this.dfmIssues;
  // }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
