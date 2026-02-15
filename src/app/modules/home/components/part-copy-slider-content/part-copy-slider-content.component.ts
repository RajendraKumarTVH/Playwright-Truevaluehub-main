import { CommonModule, DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { ProgressBarComponent } from 'src/app/shared/components';
import { PartGroup, PartInputDto, PartRecord } from 'src/app/shared/models/copy-scenario.model';
import { BlockUiService, ProjectInfoService, ScenarioService } from 'src/app/shared/services';
import { TabsModule } from 'primeng/tabs';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-part-copy-slider-content',
  templateUrl: './part-copy-slider-content.component.html',
  styleUrls: ['./part-copy-slider-content.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    TableModule,
    MultiSelectModule,
    CommonModule,
    DropdownModule,
    RippleModule,
    MenuModule,
    InputTextModule,
    AutoCompleteModule,
    RadioButtonModule,
    ButtonModule,
    ProgressBarComponent,
    TabsModule,
    MatTooltip,
  ],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class PartCopySliderContentComponent implements OnInit {
  @Input() rowData: any;
  @Input() userData: any;
  @Input({ required: true }) currentUserId: number;
  @Input({ required: true }) isAdmin: boolean;
  rawData: PartRecord[] = [];
  clientId: number;
  canUpdate: boolean = false;
  groupedData: PartGroup[] = [];
  selectedChildRowMap: { [key: string]: PartRecord } = {};
  expandedRows: { [key: string]: boolean } = {};
  sharedService = inject(SharedService);
  private users: any[] = [];
  digitalFactoryDto: DigitalFactoryDtoNew[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private projectInfoService: ProjectInfoService,
    private blockUiService: BlockUiService,
    private scenarioService: ScenarioService,
    private messaging: MessagingService,
    private router: Router,
    private digitalFactoryService: DigitalFactoryService
  ) {}

  ngOnInit(): void {
    this.users = this.userData;
    this.getSupplierList()
      .pipe(
        switchMap(() => {
          this.blockUiService.pushBlockUI('getCopyPartDetailsById');
          return this.projectInfoService.getCopyPartDetailsById(this.rowData.projectInfoId);
        }),
        tap(() => {
          this.blockUiService.popBlockUI('getCopyPartDetailsById');
        })
      )
      .subscribe((result) => {
        this.rawData = result.map((record) => ({
          ...record,
          createdUserName: this.getUserName(record.createdUserId),
          supplierName: this.getSupplierName(record.vendorId),
        }));

        this.groupedData = this.groupByIntPartNumber(this.rawData);

        this.groupedData.forEach((group) => {
          this.expandedRows[group.intPartNumber] = true;
          this.selectedChildRowMap[group.intPartNumber] = null;
        });
      });
    this.canUserUpdate();
  }
  private canUserUpdate() {
    this.canUpdate =
      this.isAdmin ||
      this.sharedService.hasSameGroup(this.rowData?.createdUserId, this.currentUserId) ||
      this.currentUserId === this.rowData?.createdUserId ||
      this.rowData?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
  }
  private groupByIntPartNumber(data: PartRecord[]): PartGroup[] {
    const map = new Map<string, PartRecord[]>();

    data.forEach((item) => {
      if (!map.has(item.intPartNumber)) {
        map.set(item.intPartNumber, []);
      }
      map.get(item.intPartNumber)!.push(item);
    });

    return Array.from(map.entries()).map(([intPartNumber, records]) => ({
      intPartNumber,
      records,
    }));
  }

  getTotalSelectedParts(): number {
    return Object.values(this.selectedChildRowMap).filter(Boolean).length;
  }

  getSelectedChildRow(key: string): PartRecord | null {
    return this.selectedChildRowMap[key] ?? null;
  }

  onChildSelectionChange(key: string, selection: PartRecord | null): void {
    this.selectedChildRowMap = {
      ...this.selectedChildRowMap,
      [key]: selection,
    };
  }

  getUserName(userId: number): string {
    const user = this.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  getSupplierName(vendorId: number): string {
    const supplier = this.digitalFactoryDto.find((x) => x.supplierId === vendorId);
    return supplier ? `${supplier?.supplierDirectoryMasterDto?.vendorName}` : 'Unknown Supplier';
  }

  getPartInputList(data: { [key: string]: PartRecord | null }): PartInputDto[] {
    const result: PartInputDto[] = [];

    for (const key in data) {
      const record = data[key];
      if (record) {
        result.push({
          intPartNumber: record.intPartNumber,
          projectInfoId: record.projectInfoId,
          partInfoId: record.partInfoId,
        });
      }
    }

    return result;
  }

  startCosting(): void {
    const costingData = this.getPartInputList(this.selectedChildRowMap);

    this.blockUiService.pushBlockUI('copyPart');

    this.scenarioService.copyPart(costingData, this.rowData.projectInfoId).subscribe({
      next: (result) => {
        this.blockUiService.popBlockUI('copyPart');
        const message = result ? 'Costing started successfully.' : 'Costing could not be started.';
        this.messaging.openSnackBar(message, '', { duration: 5000 });
        this.router.navigate(['/costing', this.rowData.projectInfoId]);
      },
      error: (error) => {
        this.blockUiService.popBlockUI('copyPart');
        console.error('Error starting costing:', error);
        this.messaging.openSnackBar('An error occurred while starting costing.', '', { duration: 5000 });
      },
      complete: () => {
        this.blockUiService.popBlockUI('copyPart');
      },
    });
  }

  getSupplierList(): Observable<DigitalFactoryDtoNew[]> {
    this.blockUiService.pushBlockUI('getVendorList');

    return this.digitalFactoryService.getAllDigitalFactorySuppliers().pipe(
      takeUntil(this.unsubscribeAll$),
      tap((result) => {
        this.digitalFactoryDto = result;
        this.blockUiService.popBlockUI('getVendorList');
      }),
      catchError(() => {
        this.blockUiService.popBlockUI('getVendorList');
        return of([]);
      })
    );
  }
}
