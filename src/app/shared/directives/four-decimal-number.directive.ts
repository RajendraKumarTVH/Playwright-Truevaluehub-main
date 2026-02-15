import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFourDigitDecimaNumber]',
})
export class FourDigitDecimaNumberDirective {
  private regex: RegExp = new RegExp(/^-?\d*(\.\d{0,4})?$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) {}
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const reg = /^-?\d*(\.\d{0,4})?$/;
    const input = this.el.nativeElement.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }

    // console.log(this.el.nativeElement.value);
    // if (this.specialKeys.indexOf(event.key) !== -1) {
    //   return;
    // }
    // let current: string = this.el.nativeElement.value;
    // const position = this.el.nativeElement.selectionStart;
    // const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    // if (next && !String(next).match(this.regex)) {
    //   event.preventDefault();
    // }
  }
}
