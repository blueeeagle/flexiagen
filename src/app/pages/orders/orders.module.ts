import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { SharedModule } from '@shared/shared.module';
import { OrdersComponent } from './orders.component';


@NgModule({
  declarations: [

    OrdersComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    SharedModule
  ]
})
export class OrdersModule { }
