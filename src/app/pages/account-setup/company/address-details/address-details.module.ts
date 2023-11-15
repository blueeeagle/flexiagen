import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddressDetailsRoutingModule } from './address-details-routing.module';
import { AddressDetailsComponent } from './address-details.component';


@NgModule({
  declarations: [
    AddressDetailsComponent
  ],
  imports: [
    CommonModule,
    AddressDetailsRoutingModule
  ]
})
export class AddressDetailsModule { }
