import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkingHoursRoutingModule } from './working-hours-routing.module';
import { WorkingHoursComponent } from './working-hours.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    WorkingHoursComponent
  ],
  imports: [
    CommonModule,
    WorkingHoursRoutingModule,
    SharedModule
  ]
})
export class WorkingHoursModule { }
