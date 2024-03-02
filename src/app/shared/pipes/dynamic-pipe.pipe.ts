import { DatePipe, DecimalPipe, JsonPipe, LowerCasePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Pipe, PipeTransform, Injector, Type } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Pipe({
  name: 'dynamicPipe'
})
export class DynamicPipe implements PipeTransform {

  pipeName = (pipe: string): any => ({ 
      
    'date': DatePipe,

    'number': DecimalPipe,
    
    'uppercase': UpperCasePipe,

    'lowercase': LowerCasePipe,

    'titlecase': TitleCasePipe,

    'json': JsonPipe,

    }[pipe] || ''
    
  )


  constructor(private injector: Injector, public service: CommonService) {}

  transform(value: any, requiredPipe: any, pipeArgs: any): any {

    let pipeName = _.cloneDeep(requiredPipe);

    requiredPipe = this.pipeName(requiredPipe);

    if(_.isEmpty(requiredPipe)) return value;

    const injector = Injector.create({

      name: 'DynamicPipe',

      parent: this.injector,

      providers: [

        { provide: requiredPipe },

      ]

    });

    pipeArgs = pipeName === 'number' && _.isEmpty(pipeArgs) ? '1.'+this.service.currencyDetails.decimalPoints+'-'+this.service.currencyDetails.decimalPoints : (pipeArgs || "");

    const pipe = injector.get(requiredPipe);

    return pipe.transform(value, pipeArgs);

  }

}