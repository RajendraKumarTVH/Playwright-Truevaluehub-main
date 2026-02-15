import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PredictiveAnalyticsGraphicalComponent } from '../simulation-sections/predictive-analytics-graphical/predictive-analytics-graphical.component';

@Component({
  selector: 'app-predictive-analytics',
  templateUrl: './predictive-analytics.component.html',
  styleUrls: ['./predictive-analytics.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [PredictiveAnalyticsGraphicalComponent],
})
export class PredictiveAnalyticsComponent {}
