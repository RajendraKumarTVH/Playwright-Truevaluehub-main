import { CommonModule, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { digitalFactoryRoutes } from './digital-factory.routing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SupplierInfoModule } from './Components/digital-factory/supplier-info/supplier-info.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TabViewModule } from 'primeng/tabview';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(digitalFactoryRoutes),
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    SharedModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    SupplierInfoModule,
    MatPaginatorModule,
    TabViewModule,
    PaginatorModule,
  ],
  exports: [],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DigitalFactoryModule {}
