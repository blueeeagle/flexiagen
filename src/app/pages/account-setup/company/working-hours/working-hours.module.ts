import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkingHoursRoutingModule } from './working-hours-routing.module';
import { WorkingHoursComponent } from './working-hours.component';


@NgModule({
  declarations: [
    WorkingHoursComponent
  ],
  imports: [
    CommonModule,
    WorkingHoursRoutingModule
  ]
})
export class WorkingHoursModule { }
