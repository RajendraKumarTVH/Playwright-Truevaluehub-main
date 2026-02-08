import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartInfoDto } from 'src/app/shared/models';
import { PcbBoarddetailsComponent } from '../pcb-boarddetails/pcb-boarddetails.component';

@Component({
  selector: 'app-bom-analysis',
  templateUrl: './bom-analysis.component.html',
  styleUrls: ['./bom-analysis.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PcbBoarddetailsComponent],
})
export class BomAnalysisComponent {
  @Input() partDto: PartInfoDto;
}
