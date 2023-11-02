import { Pipe, PipeTransform, Injector, Type } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Pipe({
  name: 'dynamicPipe'
})
export class DynamicPipe implements PipeTransform {

  constructor(private injector: Injector, public service: CommonService) {}

  transform(value: any, requiredPipe: Type<any>, pipeArgs: any): any {

    const injector = Injector.create({

      name: 'DynamicPipe',

      parent: this.injector,

      providers: [

        { provide: requiredPipe },

      ]

    });

    const pipe = injector.get(requiredPipe);

    requiredPipe.name=='InrPipe' ? value = this.service.decimalPipe.transform(value,"1.0-2") : null;

    return pipe.transform(value, pipeArgs);

  }

}