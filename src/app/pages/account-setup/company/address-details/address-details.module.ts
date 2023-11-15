import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddressDetailsRoutingModule } from './address-details-routing.module';
import { AddressDetailsComponent } from './address-details.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    AddressDetailsComponent
  ],
  imports: [
    CommonModule,
    AddressDetailsRoutingModule,
    SharedModule
  ]
})
export class AddressDetailsModule { }
