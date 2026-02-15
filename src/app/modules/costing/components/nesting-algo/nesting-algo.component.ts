import { AfterViewInit, Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NestingAlgo } from 'src/app/shared/models/nesting-algo.model';
import { BlockUiService, NestingAlgoService } from 'src/app/shared/services';
import { PrimaryProcessType } from '../../costing.config';
import { Store } from '@ngxs/store';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-nesting-algo',
  templateUrl: './nesting-algo.component.html',
  styleUrls: ['./nesting-algo.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class NestingAlgoComponent implements AfterViewInit {
  @Input() public partInfoId: number;
  @Input() public dimX: number;
  @Input() public dimY: number;
  @Input() public dimZ: number;
  @Input() public process: number;
  @Input() public maximumSheetLength: number;
  @Input() public sheetWidth: number;
  @Input() unfoldedPartHeight: number;
  @Input() unfoldedPartWidth: number;
  isLoaded: boolean = false;
  isError: boolean = false;

  existingUploadedData: any;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  constructor(
    private searchService: NestingAlgoService,
    private blockUiService: BlockUiService,
    private modalService: NgbModal,
    private store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  ngAfterViewInit(): void {
    const formData = new NestingAlgo();
    formData.maximumSheetLength = this.maximumSheetLength;
    formData.ierationNumber = 'test1';
    formData.sheetWidth = this.sheetWidth;
    formData.margin = 0.5;
    formData.multiPartsSystem = false;
    formData.image = true;
    formData.scale = true;
    formData.rectangularWidth = this.unfoldedPartWidth;
    formData.rectangularHeight = this.unfoldedPartHeight;
    if (this.process === PrimaryProcessType.StampingProgressive || this.process === PrimaryProcessType.StampingStage) {
      formData.softTooling = false;
      formData.numberOfLanes = 2;
    } else {
      formData.softTooling = true;
    }

    formData.patternBased = true;
    formData.partInfoId = this.partInfoId;
    formData.quickSoftTooling = false;

    this.searchService
      .search(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any) => {
        try {
          console.log(JSON.parse(result));
          this.existingUploadedData = JSON.parse(result);
          if (!this.existingUploadedData?.status) {
            this.isError = true;
          } else {
            this.existingUploadedData.file = 'data:image/jpg;base64,' + this.existingUploadedData.file;
            console.log(this.existingUploadedData);
          }

          this.isLoaded = true;
          this.costSummarySignalsService.getCostSummaryByPartInfoId(this.partInfoId);
        } catch (ex) {
          console.log(ex);
          this.isLoaded = true;
          this.isError = true;
        }
      });
  }
}
