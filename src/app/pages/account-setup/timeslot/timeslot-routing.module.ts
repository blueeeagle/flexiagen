import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeslotComponent } from './timeslot.component';

const routes: Routes = [
  {
    path: "",
    component: TimeslotComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeslotRoutingModule { }
