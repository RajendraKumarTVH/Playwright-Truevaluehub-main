import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CompetitiveAnalysisFormComponent } from '../competitive-analysis-form/competitive-analysis-form.component';
import { SavedAnalysisComponent } from '../saved-analysis/saved-analysis.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-competitive-analysis',
  templateUrl: './competitive-analysis.component.html',
  styleUrls: ['./competitive-analysis.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatTabsModule, CompetitiveAnalysisFormComponent, SavedAnalysisComponent, MatIconModule],
})
export class CompetitiveAnalysisComponent {}
