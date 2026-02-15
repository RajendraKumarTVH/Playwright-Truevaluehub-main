import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToolingOptimizationGraphicalComponent } from '../simulation-sections/tooling-optimization-graphical/tooling-optimization-graphical.component';

@Component({
  selector: 'app-tooling-optimization',
  templateUrl: './tooling-optimization.component.html',
  styleUrls: ['./tooling-optimization.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ToolingOptimizationGraphicalComponent],
  standalone: true,
})
export class ToolingOptimizationComponent {}
