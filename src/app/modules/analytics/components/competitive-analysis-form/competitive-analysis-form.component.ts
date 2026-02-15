import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-competitive-analysis-form',
  imports: [MatDatepickerModule, MatDatepicker, MatFormFieldModule, MatSelectModule, MatIconModule, FormsModule, MatAutocompleteModule],
  templateUrl: './competitive-analysis-form.component.html',
  styleUrls: ['./competitive-analysis-form.component.scss'],
})
export class CompetitiveAnalysisFormComponent {
  today = new Date();
  selectedStartDate1 = this.today;
  selectedEndDate1 = this.today;
  selectedStartDate2 = this.today;
  selectedEndDate2 = this.today;
}
