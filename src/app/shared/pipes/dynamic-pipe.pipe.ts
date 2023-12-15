import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform, Injector, Type } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Pipe({
  name: 'dynamicPipe'
})
export class DynamicPipe implements PipeTransform {

  constructor(private injector: Injector, public service: CommonService, private currencyPipe: CurrencyPipe) {}

  transform(value: any, requiredPipe: Type<any>, pipeArgs: any): any {

    const injector = Injector.create({

      name: 'DynamicPipe',

      parent: this.injector,

      providers: [

        { provide: requiredPipe },

      ]

    });

    const pipe = injector.get(requiredPipe);

    return pipe.transform(value, pipeArgs);

  }

}