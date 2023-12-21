import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
declare var $: any;

@Directive({
  selector: 'input[decimalNumbersOnly]'
})
export class DecimalNumberDirective {

  @Input() digits: number = 3;

  constructor(private _el: ElementRef, private control: NgControl, private service: CommonService) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    
    const initalValue = this._el.nativeElement.value;

    this._el.nativeElement.value = removeInvalidFloatPoints(initalValue.replace(/[^0-9.]*/g,''));

    if(initalValue !== this._el.nativeElement.value) event.stopPropagation();

    if($(this._el.nativeElement).attr('formControlName')) this.control.control?.setValue(this._el.nativeElement.value);
    
    function removeInvalidFloatPoints(str: string) {
      
      return str.replace( /^([^.]*\.)(.*)$/, function ( a, b, c ) { return b + c.replace( /\./g, '' ); });

    }

  }

  @HostListener('change', ['$event']) onChange(event: any) {

    this._el.nativeElement.value = parseFloat(this._el.nativeElement.value || 0).toFixed(this.service.currencyDetails.decimalPoints || this.digits);

    if($(this._el.nativeElement).attr('formControlName')) this.control.control?.setValue(this._el.nativeElement.value);

  }

}
