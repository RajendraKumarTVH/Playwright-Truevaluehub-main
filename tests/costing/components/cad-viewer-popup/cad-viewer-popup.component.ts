import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DFMSheetMetalAnalyzer } from 'src/app/shared/models/dfm-issues.model';
import { BaseExample } from './Common/BaseExample';
import { DetailedCADViewer } from './detailed-cad-viewer';
import { BlockUiService } from 'src/app/shared/services';
import { SharedService } from '../../services/shared.service';
import { CommentFieldService } from 'src/app/shared/services/comment-field.service';
import { MachiningService } from 'src/app/modules/costing/services/machining.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { MachiningHelperService } from 'src/app/modules/costing/services/machining.helper.service';
// declare const $: any;

@Component({
  selector: 'app-cad-viewer-popup',
  templateUrl: './cad-viewer-popup.component.html',
  styleUrls: ['./cad-viewer-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CadViewerPopupComponent implements AfterViewInit {
  @Input() public fileName: string;
  @Input() public partData: { [key: string]: any };
  @Input() public documentRecordId: number;
  @Input() public dfmIssuesAnalyzer: DFMSheetMetalAnalyzer;
  @Input() isCompare?: boolean;
  @Input() mainPartId?: string;
  @Input() comparePartId?: string;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  aSelectedVertexes: any = [];
  aSelectedMeasurements: any = [];
  aSceneBBox: any;
  aMeasurementFactory: any;
  aMeasurements: any = [];
  aFontSize: number;
  isDistanceUnitSelected = true;
  isAngleUnitsSelectorSelected = false;
  aLastPickResult: any;
  //aNotesManager: NoteManager;
  scene: any;
  anAlreadyUsedAxes: any = [];
  isLeftPanelSelected = 0;
  isRightPanelSelected = 0;
  aJsTree: any;
  aPMIFactory: any;
  aPMITree: any;
  aTreeRoot: any;
  theTextureBasePath: any;

  constructor(
    private modelService: NgbModal,
    private _blockUiService: BlockUiService,
    private _sharedService: SharedService,
    private machiningHelperService: MachiningHelperService,
    private commentFieldService: CommentFieldService,
    private machiningService: MachiningService,
    private _store: Store,
    private activeModal: NgbActiveModal,
    private partInfoSignalsService: PartInfoSignalsService
  ) {}

  ngAfterViewInit(): void {
    if (this.fileName) {
      const baseExample = new BaseExample(
        new DetailedCADViewer(
          this._blockUiService,
          this.partData,
          this.passEntry,
          this.modelService,
          this._sharedService,
          this.machiningHelperService,
          this.commentFieldService,
          this.machiningService,
          this.activeModal,
          this._store,
          this.partInfoSignalsService
        ),
        this._store
      );
      baseExample.initModelSelector(this.fileName, this.partData, this.documentRecordId, this.isCompare, this.mainPartId, this.comparePartId);
    }
  }

  dismissAll() {
    this.activeModal.close();
    this.passEntry.emit(false);
  }

  onChange(deviceValue: any) {
    if (deviceValue.target.value == 'Vertex') {
      this.isAngleUnitsSelectorSelected = true;
      this.isDistanceUnitSelected = false;
    } else if (deviceValue.target.value == 'Shape') {
      this.isAngleUnitsSelectorSelected = false;
      this.isDistanceUnitSelected = true;
    }
  }
}
