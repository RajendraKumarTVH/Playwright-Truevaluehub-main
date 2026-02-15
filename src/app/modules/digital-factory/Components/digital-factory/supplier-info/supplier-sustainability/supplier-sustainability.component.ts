import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SustainabilityAnnualUsageComponent } from '../supplier-sustainability/sustainability-annual-usage/sustainability-annual-usage.component';
import { SustainabilityFuelsComponent } from '../supplier-sustainability/sustainability-fuels/sustainability-fuels.component';
import { SustainabilityGasesUtilizedComponent } from '../supplier-sustainability/sustainability-gases-utilized/sustainability-gases-utilized.component';
import { SustainabilityWasteGeneratedComponent } from '../supplier-sustainability/sustainability-waste-generated/sustainability-waste-generated.component';
import { SustainabilityMarketCompetitivenessComponent } from '../supplier-sustainability/sustainability-market-competitiveness/sustainability-market-competitiveness.component';
@Component({
  selector: 'app-supplier-sustainability',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    SustainabilityAnnualUsageComponent,
    SustainabilityFuelsComponent,
    SustainabilityGasesUtilizedComponent,
    SustainabilityWasteGeneratedComponent,
    SustainabilityMarketCompetitivenessComponent,
  ],
  templateUrl: './supplier-sustainability.component.html',
  styleUrl: './supplier-sustainability.component.scss',
})
export class SupplierSustainabilityComponent {}
