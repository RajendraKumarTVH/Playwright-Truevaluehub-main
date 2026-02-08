import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plastic-vacuum-forming',
  templateUrl: './plastic-vacuum-forming.component.html',
  styleUrls: ['./plastic-vacuum-forming.component.scss'],
  standalone: true,
})
export class PlasticVacuumFormingComponent {
  @Input() compVals: any;
}
