import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateOrderRoutingModule } from './create-order-routing.module';
import { CreateOrderComponent } from './create-order.component';


@NgModule({
  declarations: [
    CreateOrderComponent
  ],
  imports: [
    CommonModule,
    CreateOrderRoutingModule
  ]
})
export class CreateOrderModule { }
