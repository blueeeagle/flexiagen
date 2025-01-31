import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateOrderRoutingModule } from './create-order-routing.module';
import { CreateOrderComponent } from './create-order.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    CreateOrderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CreateOrderRoutingModule
  ]
})
export class CreateOrderModule { }
