import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationDialogComponent } from 'src/app/messaging/confirmation-dialog/confirmation-dialog.component';

export interface VersionHistoryItem {
  versionId: number;
  versionNumber: number;
  date: Date;
  time: string;
  userName: string;
  totalCost: number;
  isLatest: boolean;
  selected?: boolean;
  materialCost?: number;
  manufacturingCost?: number;
  toolingCost?: number;
  overheadCost?: number;
  packingCost?: number;
  exwPartCost?: number;
  freightCost?: number;
  dutiesTariffCost?: number;
}

@Component({
  selector: 'app-version-history',
  templateUrl: './version-history.component.html',
  styleUrls: ['./version-history.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDialogModule, MatTooltipModule, TableModule, CheckboxModule],
})
export class VersionHistoryComponent implements OnInit {
  versionHistoryList: VersionHistoryItem[] = [];
  selectedVersions: VersionHistoryItem[] = [];
  currentViewingVersion: VersionHistoryItem | null = null;
  showCompareTable: boolean = false;
  compareRows = [
    { label: 'Material Cost', field: 'materialCost' },
    { label: 'Manufact. Cost', field: 'manufacturingCost' },
    { label: 'Tooling Cost', field: 'toolingCost' },
    { label: 'Overhead & Profit', field: 'overheadCost' },
    { label: 'Packing Cost', field: 'packingCost' },
    { label: 'EX-W Part Cost', field: 'exwPartCost' },
    { label: 'Freight Cost', field: 'freightCost' },
    { label: 'Duties & Tariff', field: 'dutiesTariffCost' },
    { label: 'Part Should Cost', field: 'totalCost', bold: true },
  ];
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadDummyData();
  }

  loadDummyData(): void {
    this.versionHistoryList = [
      {
        versionId: 10,
        versionNumber: 10,
        date: new Date('2024-07-22'),
        time: '10:45 am',
        userName: 'Sophia Lam Angis',
        totalCost: 245,
        isLatest: true,
        selected: false,
        materialCost: 2.1,
        manufacturingCost: 2.05,
        toolingCost: 9.81,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 11.86,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 9,
        versionNumber: 9,
        date: new Date('2024-06-02'),
        time: '11:30 pm',
        userName: 'Liam N.',
        totalCost: 300,
        isLatest: false,
        selected: false,
        materialCost: 3.6,
        manufacturingCost: 2.5,
        toolingCost: 10.2,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 16.3,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 8,
        versionNumber: 8,
        date: new Date('2024-05-07'),
        time: '09:00 am',
        userName: 'Mason J.',
        totalCost: 285,
        isLatest: false,
        selected: false,
        materialCost: 2.8,
        manufacturingCost: 2.3,
        toolingCost: 9.5,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 14.6,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 7,
        versionNumber: 7,
        date: new Date('2024-01-04'),
        time: '02:15 pm',
        userName: 'Olivia R.C.',
        totalCost: 200,
        isLatest: false,
        selected: false,
        materialCost: 2.8,
        manufacturingCost: 2.0,
        toolingCost: 8.5,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 13.3,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 6,
        versionNumber: 6,
        date: new Date('2024-02-14'),
        time: '08:00 pm',
        userName: 'Olivia R.C.',
        totalCost: 200,
        isLatest: false,
        selected: false,
        materialCost: 2.8,
        manufacturingCost: 2.0,
        toolingCost: 8.5,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 13.3,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 5,
        versionNumber: 5,
        date: new Date('2024-01-01'),
        time: '12:30 am',
        userName: 'Olivia R.C.',
        totalCost: 200,
        isLatest: false,
        selected: false,
        materialCost: 2.8,
        manufacturingCost: 2.0,
        toolingCost: 8.5,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 13.3,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 4,
        versionNumber: 4,
        date: new Date('2023-12-15'),
        time: '04:20 pm',
        userName: 'Noah W.',
        totalCost: 180,
        isLatest: false,
        selected: false,
        materialCost: 2.5,
        manufacturingCost: 1.8,
        toolingCost: 7.2,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 11.5,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 3,
        versionNumber: 3,
        date: new Date('2023-11-20'),
        time: '10:10 am',
        userName: 'Emma S.',
        totalCost: 150,
        isLatest: false,
        selected: false,
        materialCost: 2.2,
        manufacturingCost: 1.5,
        toolingCost: 6.8,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 10.5,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 2,
        versionNumber: 2,
        date: new Date('2023-10-15'),
        time: '03:45 pm',
        userName: 'James T.',
        totalCost: 120,
        isLatest: false,
        selected: false,
        materialCost: 2.0,
        manufacturingCost: 1.2,
        toolingCost: 5.5,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 8.7,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
      {
        versionId: 1,
        versionNumber: 1,
        date: new Date('2023-10-05'),
        time: '01:15 pm',
        userName: 'Elijah M.',
        totalCost: 840,
        isLatest: false,
        selected: false,
        materialCost: 5.0,
        manufacturingCost: 3.5,
        toolingCost: 15.0,
        overheadCost: 0,
        packingCost: 0,
        exwPartCost: 23.5,
        freightCost: 0,
        dutiesTariffCost: 0,
      },
    ];
  }

  onCheckboxChange(version: VersionHistoryItem, event: any): void {
    version.selected = event.checked;
    if (event.checked) {
      if (!this.selectedVersions.find((v) => v.versionId === version.versionId)) {
        this.selectedVersions.push(version);
      }
    } else {
      this.selectedVersions = this.selectedVersions.filter((v) => v.versionId !== version.versionId);
    }
    this.updateCompareTable();
  }

  toggleSelectAll(event: any): void {
    const checked = event.checked;
    this.versionHistoryList.forEach((version) => {
      version.selected = checked;
    });
    if (checked) {
      this.selectedVersions = [...this.versionHistoryList];
    } else {
      this.selectedVersions = [];
    }
    this.updateCompareTable();
  }

  isAllSelected(): boolean {
    return this.versionHistoryList.length > 0 && this.versionHistoryList.every((v) => v.selected);
  }

  clearSelection(): void {
    this.versionHistoryList.forEach((version) => (version.selected = false));
    this.selectedVersions = [];
    this.showCompareTable = false;
  }

  compareVersions(): void {
    if (this.selectedVersions.length >= 2) {
      this.showCompareTable = true;
    }
  }

  updateCompareTable(): void {
    this.showCompareTable = this.selectedVersions.length >= 2;
  }

  viewVersion(version: VersionHistoryItem): void {
    this.currentViewingVersion = version;
  }

  exitVersionView(): void {
    this.currentViewingVersion = null;
  }

  onRestoreVersion(version: VersionHistoryItem): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '460px',
      data: {
        title: 'Restore Version',
        message: `Are you sure you want to Restore '<b>Version ${version.versionNumber}</b>'?`,
        action: 'Restore',
        actionText: 'Restore',
        cancelText: 'Cancel',
      },
      panelClass: 'version-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Restoring version:', version.versionNumber);
      }
    });
  }
}
