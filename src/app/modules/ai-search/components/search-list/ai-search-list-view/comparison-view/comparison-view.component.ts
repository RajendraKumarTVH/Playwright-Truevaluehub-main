import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { AiSearchService } from 'src/app/shared/services';
import { ComparePartInfo } from 'src/app/modules/ai-search/models/ai-image-similarity-result';

@Component({
  selector: 'app-comparison-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TableModule],
  templateUrl: './comparison-view.component.html',
  styleUrls: ['./comparison-view.component.scss'],
})
export class ComparisonViewComponent implements OnInit, OnDestroy {
  parts: ComparePartInfo[] = [];
  users: { [key: number]: string };
  commodities: { [key: number]: string } = {};
  private readonly $unsubscribe: Subject<undefined> = new Subject<undefined>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<ComparisonViewComponent>,
    private readonly aiSearchService: AiSearchService
  ) {}

  ngOnInit(): void {
    this.users = this.data.users.reduce((acc: { [key: number]: any }, u: any) => {
      acc[u.userId] = `${u.firstName} ${u.lastName}`;
      return acc;
    }, {});
    this.commodities = this.data.commodityList.reduce((acc: { [key: number]: any }, u: any) => {
      acc[u.commodityId] = u.commodity;
      return acc;
    }, {});
    this.loadDataSource();
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next(undefined);
    this.$unsubscribe.complete();
  }

  close() {
    this.dialogRef.close();
  }

  removePart(index: number) {
    this.parts.splice(index, 1);
    if (this.parts.length === 0) {
      this.close();
    }
  }

  getUserName(userId: number): string {
    const user = this.data.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  private loadDataSource() {
    this.aiSearchService
      .getComparePartsInfo(this.data.partIds)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((res) => {
        this.parts = res;
      });
  }
}
