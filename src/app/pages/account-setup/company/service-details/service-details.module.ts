import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceDetailsRoutingModule } from './service-details-routing.module';
import { ServiceDetailsComponent } from './service-details.component';


@NgModule({
  declarations: [
    ServiceDetailsComponent
  ],
  imports: [
    CommonModule,
    ServiceDetailsRoutingModule
  ]
})
export class ServiceDetailsModule { }
