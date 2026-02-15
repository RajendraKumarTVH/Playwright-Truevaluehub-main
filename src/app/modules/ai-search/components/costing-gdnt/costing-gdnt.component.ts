import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { AiGdntFigureDto } from 'src/app/shared/models/ai-gdnt-figure-dto';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';

@Component({
  selector: 'app-costing-gdnt',
  templateUrl: './costing-gdnt.component.html',
  styleUrls: ['./costing-gdnt.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CostingGdntComponent implements OnInit {
  @Input() partId: number;
  dataSource: AiGdntFigureDto[] = [];
  showLoader = false;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private searchService: AiSearchService,
    private activeModal: NgbActiveModal
  ) {}
  ngOnInit(): void {
    this.loadDataSource();
  }

  loadDataSource(): void {
    if (this.partId) {
      this.showLoader = true;
      this.searchService
        .getGdntParts(this.partId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.dataSource = data;
            this.showLoader = false;
          },
        });
    }
  }

  dismissAll() {
    this.activeModal.close();
  }
}
