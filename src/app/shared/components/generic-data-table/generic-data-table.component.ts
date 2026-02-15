import { Component, Input, Output, EventEmitter, OnInit, SecurityContext } from '@angular/core';
import { TableColumn } from '../../data-models/table-column.model';
import { catchError, debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HtsMasterService } from '../../services';
import { of, Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generic-data-table',
  templateUrl: './generic-data-table.component.html',
  styleUrls: ['./generic-data-table.component.scss'],
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class GenericDataTableComponent implements OnInit {
  @Input() apiUrl!: string;
  @Input() dataKey: string;
  @Input() columns: TableColumn[] = [];
  @Input() selectable: boolean = false;
  @Output() rowSelect = new EventEmitter<any>();

  data: any[] = [];
  totalRecords = 0;
  loading = false;
  globalFilter = '';
  selectedRow: any;
  globalFilterFields: string[] = [];
  skip = 0;
  limit = 20;

  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  private searchSubject = new Subject<string>();

  constructor(
    private htsMasterService: HtsMasterService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.columns) {
      this.globalFilterFields = this.columns.map((c) => c.field);
    }
    this.setupSearchSubscription();
    this.loadData({ first: 0, rows: 20 });
  }

  setupSearchSubscription() {
    this.searchSubject
      .pipe(
        debounceTime(500),
        tap(() => (this.loading = true)),
        switchMap((search) =>
          this.htsMasterService.getMasterData(this.apiUrl, this.skip, this.limit, search).pipe(
            catchError((error) => {
              console.error('Search error', error);
              this.loading = false;
              return of({ data: [], totalRecords: 0 }); // return empty data on error
            })
          )
        ),
        takeUntil(this.unsubscribeAll$)
      )
      .subscribe((res: any) => {
        this.data = res?.data || [];
        this.totalRecords = res?.totalRecords || 0;
        this.loading = false;
      });
  }

  loadData(event: TableLazyLoadEvent) {
    this.skip = event.first;
    this.limit = event.rows;
    this.searchSubject.next(this.globalFilter);
  }

  onSearch() {
    if (this.globalFilter.length < 1 || this.globalFilter.length > 2) {
      this.skip = 0;
      this.limit = 20;
      this.searchSubject.next(this.globalFilter);
    }
  }

  clearSearch() {
    this.skip = 0;
    this.limit = 20;
    this.globalFilter = '';
    this.searchSubject.next(this.globalFilter);
  }

  handleRowSelect(event: any) {
    this.rowSelect.emit(event.data);
  }

  highlight(value: any): SafeHtml {
    if (!value || typeof value !== 'string') return value;

    const filter = this.globalFilter?.trim();
    if (!filter) return value;

    // Split filter into individual words and escape them for regex
    const words = filter
      ?.split(/\s+/)
      ?.filter((w) => w.length > 0)
      ?.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // escape regex chars

    if (words.length === 0) return value;

    // Build a regex that matches any word (with global + case-insensitive flags)
    const re = new RegExp(`(${words.join('|')})`, 'gi');

    // Replace and wrap matches with <mark>
    const highlighted = value.replace(re, '<mark>$1</mark>');
    return this.sanitizer.sanitize(SecurityContext.HTML, highlighted) || '';
  }
}
