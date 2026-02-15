import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AiSearchService, BlockUiService } from 'src/app/shared/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CustomSplit } from 'src/app/shared/pipes';

@Component({
  selector: 'app-ai-search-doc',
  templateUrl: './ai-search-doc.component.html',
  styleUrls: ['./ai-search-doc.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, CustomSplit],
})
export class AiSearchDocComponent implements OnInit {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  documentDetails: any;
  isLoaded: boolean = false;
  constructor(
    private searchService: AiSearchService,
    private route: ActivatedRoute,
    private blockUiService: BlockUiService,
    private modelService: NgbModal
  ) {}

  ngOnInit(): void {
    const uid = this.route.snapshot.queryParamMap.get('uid');
    this.blockUiService.pushBlockUI('loadExistingUploads');
    this.searchService
      .getDocumentsUID(uid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any) => {
        this.blockUiService.popBlockUI('loadExistingUploads');
        this.documentDetails = JSON.parse(result);
        this.isLoaded = true;
      });
  }

  dismissAll() {
    this.modelService.dismissAll();
  }
}
