import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PartInfoService } from 'src/app/shared/services';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageViewerComponent implements OnInit {
  data: any;
  part: any;
  documentCollectionId: any;
  documentUrl: any;
  @Output() saveFile: EventEmitter<FileList> = new EventEmitter<FileList>();

  @ViewChild('imageViewerContainer') imageViewerContainer: ElementRef;

  constructor(
    private partInfoService: PartInfoService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.documentUrl = 'data:image/png;base64,' + this.data.docInBase64;
    }
  }

  // ngAfterViewInit(): void {
  //   // const self = this;
  //   setTimeout(() => {
  //     const toolbarElement = this.imageViewerContainer.nativeElement;
  //   }, 10);
  // }

  close() {
    this.modalService.dismissAll();
  }

  save(e: any) {
    const fArray = this.data.docName?.split('.');
    const ext: string = fArray[fArray.length - 1];
    const fileName = this.data.docName.replace('.' + ext, '') + new Date().getTime() + '.' + ext;

    const file = new File([e], fileName, { type: 'image/jpeg', lastModified: Date.now() }) as File;
    const formData = new FormData();

    formData.append('formFile', file, fileName);
    formData.append('originalFileName', fileName);

    this.partInfoService.uploadPartDocuments(this.part.partInfoId, this.documentCollectionId, formData).subscribe(() => {
      this.close();
    });
  }
}
