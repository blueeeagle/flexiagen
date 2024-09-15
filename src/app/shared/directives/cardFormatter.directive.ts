import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[cardNumberFormatter]'
})
export class CardNumberFormatterDirective {
  private isFormatting: boolean = false;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if (this.isFormatting) {
      return;
    }

    this.isFormatting = true;

    const input = this.el.nativeElement as HTMLInputElement;
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    // Limit the value to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    // Format the card number in 4-digit segments   
    let formattedValue = '';
    for (let i = 0; i < value.length; i += 4) {
      if (i > 0) {
        formattedValue += ' ';
      }
      formattedValue += value.substring(i, i + 4);
    }
    // Update the input value with the formatted value
    input.value = formattedValue;

    // Manually trigger the input event to ensure Angular form control updates
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    this.isFormatting = false;
  }
}
