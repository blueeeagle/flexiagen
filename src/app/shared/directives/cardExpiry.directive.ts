import { Directive, ElementRef, HostListener } from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[expirationDateFormatter]'
})
export class ExpirationDateFormatterDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Format the expiration date
    if (value.length > 2) {
      const month = value.substring(0, 2);
      const year = value.substring(2);

      // Check if month is valid
      if (parseInt(month) > 12) {
        input.value = '12/';
      } else {
        input.value = `${month}/`;
      }

      if (year.length === 2) {
        const fullYear = moment(year, 'YY').format('YYYY');
        input.value += fullYear; // Append the formatted year
      } else {
        input.value += year; // Append the remaining characters if less than 2
      }
    } else if (value.length === 2) {
      input.value = `${value}/`; // Add "/" after MM
    } else {
      input.value = value; // Just set the value if less than 2
      }
      
      
  }
}
