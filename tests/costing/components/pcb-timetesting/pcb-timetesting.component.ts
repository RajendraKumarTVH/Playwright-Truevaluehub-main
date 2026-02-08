import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pcb-timetesting',
  templateUrl: './pcb-timetesting.component.html',
  styleUrls: ['./pcb-timetesting.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PcbTimetestingComponent implements OnChanges {
  @Input() timeTestingForm: FormGroup;
  @Input() boardComponents: any[] = [];
  @Input() conversionCostId: number | undefined;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['boardComponents'] && changes['boardComponents'].currentValue != changes['boardComponents'].previousValue) {
      if (this.conversionCostId == undefined) {
        if (this.boardComponents && this.boardComponents.length > 0) {
          const icComponents = this.boardComponents.filter((x: any) => x.technology?.includes('IC'));
          const icVal = Number(10 / 60) * Number(icComponents?.length || 0);
          this.timeTestingForm.controls['ICProgramming'].setValue(icVal);
        }
      }
    }
  }
}
