import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import descriptions from 'src/assets/descriptions.json';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-tooltip',
  standalone: true,
  imports: [MatIconModule, NgbPopoverModule, CommonModule],
  templateUrl: './info-tooltip.component.html',
  styleUrl: './info-tooltip.component.scss',
})
export class InfoTooltipComponent {
  @Input() infoId!: string;
  @Input() popoverClass: string = '';
  @Input() container: string = '';
  @ViewChild('popoverHook', { static: false }) popoverHook?: NgbPopover;

  popupUrl: string = '';
  popupName: string = '';
  lstdescriptions: Array<{ id: string; imageUrl?: string; descriptions?: string }> = descriptions;

  showinfo() {
    console.log('showinfo called', this.infoId, this.popoverHook);
    if (!this.infoId) return;
    const objdesc = this.lstdescriptions.find((item) => item.id && item.id.toLowerCase() === this.infoId.toLowerCase());
    if (objdesc) {
      this.popupUrl = objdesc.imageUrl || '';
      this.popupName = (objdesc.descriptions || 'No description found.').replace(/\n/g, '<br>');
    } else {
      this.popupUrl = '';
      this.popupName = 'No description found.';
    }
    this.popoverHook?.open();
  }
}
