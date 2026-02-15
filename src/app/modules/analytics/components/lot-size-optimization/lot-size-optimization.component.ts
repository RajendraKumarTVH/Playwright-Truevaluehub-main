import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LotsizeOptimizationGraphicalComponent } from '../simulation-sections/lotsize-optimization-graphical/lotsize-optimization-graphical.component';

@Component({
  selector: 'app-lot-size-optimization',
  templateUrl: './lot-size-optimization.component.html',
  styleUrls: ['./lot-size-optimization.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [LotsizeOptimizationGraphicalComponent],
})
export class LotSizeOptimizationComponent {}
