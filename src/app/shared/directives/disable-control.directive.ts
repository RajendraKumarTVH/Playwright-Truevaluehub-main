import { Directive, Input, OnChanges } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDisableControl]',
  standalone: true,
})
export class DisableControlDirective implements OnChanges {
  @Input() appDisableControl: boolean;

  constructor(private ngControl: NgControl) {}
  ngOnChanges(): void {
    if (this.ngControl?.control) {
      if (this.appDisableControl) {
        this.ngControl.control.disable({ emitEvent: false });
      } else {
        this.ngControl.control.enable({ emitEvent: false });
      }
    }
  }
}
