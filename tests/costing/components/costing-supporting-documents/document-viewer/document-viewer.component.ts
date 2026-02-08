import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { BlockUiService, PartInfoService } from 'src/app/shared/services';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDocViewerModule],
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  constructor(
    private partInfoService: PartInfoService,
    private modalService: NgbModal,
    private blockUiService: BlockUiService
  ) {}

  data: any;
  documentUrl: any;
  private timeoutId: any;
  private timeoutDuration: number = 3000;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  ngOnInit(): void {
    if (this.data) {
      this.getSasToken();
      this.startLoadingTimeout();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getSasToken() {
    // this.blockUiService.pushBlockUI('getSasToken');
    this.partInfoService.getSasToken().subscribe((response) => {
      // this.blockUiService.popBlockUI('getSasToken');
      this.documentUrl = this.data.docLocation + response;
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  onDocumentLoaded() {
    console.log('Document Loaded');
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.retryCount = 0;
  }

  startLoadingTimeout() {
    this.timeoutId = setTimeout(() => {
      this.handleLoadingTimeout();
    }, this.timeoutDuration);
  }

  handleLoadingTimeout() {
    console.log('Document failed to load within 3 seconds!');
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.getSasToken();
      this.startLoadingTimeout();
    } else {
      console.error('Max retries reached. Document failed to load.');
    }
  }
}
