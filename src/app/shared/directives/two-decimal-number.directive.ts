import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTwoDigitDecimaNumber]',
})
export class TwoDigitDecimaNumberDirective {
  private regex: RegExp = new RegExp(/^-?\d*(\.\d{0,4})?$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) {}
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    const input = this.el.nativeElement.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
