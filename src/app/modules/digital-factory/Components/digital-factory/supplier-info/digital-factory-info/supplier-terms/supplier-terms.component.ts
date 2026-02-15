import { Component, Input, OnInit } from '@angular/core';
import { DigitalFactoryCommonService } from '../../../../Shared/digital-factory-common-service';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EditToolbarComponent } from '../../../../Shared/edit-toolbar/edit-toolbar.component';
import { EditPageBase } from '../../../../Shared/edit-state/edit-page.base';

@Component({
  selector: 'app-supplier-terms',
  templateUrl: './supplier-terms.component.html',
  styleUrls: ['./supplier-terms.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, MatIconModule, EditToolbarComponent],
})
export class SupplierTermsComponent extends EditPageBase<DigitalFactoryDtoNew> implements OnInit {
  @Input() digitalFactoryInfo?: DigitalFactoryDtoNew;
  paymentTerms?: string;
  selectedIncoterm?: { name: string; value: number };
  selectedIncotermId: number;
  vmiType?: number;
  annualSpendType?: number;
  uniqueCategories?: string;
  clientSupplierContract?: string;
  contractStatus?: string;
  lastPricingNegotiation?: string;
  isSaveEnabled = false;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();
  incoterms = [
    {
      value: 1,
      name: 'EXW',
    },
    {
      value: 2,
      name: 'DDP',
    },
    {
      value: 3,
      name: 'DAP',
    },
    {
      value: 4,
      name: 'FOB',
    },
    {
      value: 5,
      name: 'FCA',
    },
  ];

  constructor(
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService,
    private readonly digitalFactoryService: DigitalFactoryService,
    readonly fb: FormBuilder
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.setForm();
    this.initEditPage();
  }

  protected load(): Observable<DigitalFactoryDtoNew> {
    // Simulate loading data from a service or API
    return of(this.digitalFactoryInfo);
  }

  protected buildForm(data: DigitalFactoryDtoNew): FormGroup {
    // Build a reactive form with validation
    this.form.patchValue({
      digitalFactoryId: data.digitalFactoryId,
      supplierId: this.digitalFactoryCommonService.dfSupplierMasterDetails?.supplierId,
      paymentTerms: data.paymentTerms,
      incotermId: data.incoterms,
      vmiType: data.vmiType,
      annualSpendType: data.anulSpendType,
      uniqueCategories: data.uniqueCategories,
      clientSupplierContract: data.clientSupplierContract,
      contractStatus: data.contractStatus,
    });
    return this.form;
  }

  protected saveApi(data: DigitalFactoryDtoNew): Observable<any> {
    // Call the service to save the data
    return this.digitalFactoryService.updateDigitalFactoryNew(data).pipe(takeUntil(this.unsubscribe$));
  }

  private setForm() {
    this.form = this.fb.group({
      digitalFactoryId: [],
      supplierId: [],
      paymentTerms: [],
      incotermId: [],
      vmiType: [],
      annualSpendType: [],
      uniqueCategories: [],
      clientSupplierContract: [],
      contractStatus: [],
    });
  }
}
