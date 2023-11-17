import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationRoutingModule } from './location-routing.module';
import { LocationComponent } from './location.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    LocationComponent
  ],
  imports: [
    CommonModule,
    LocationRoutingModule,
    SharedModule
  ]
})
export class LocationModule { }
