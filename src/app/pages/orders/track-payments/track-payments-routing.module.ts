import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackPaymentsComponent } from './track-payments.component';

const routes: Routes = [
  {
    path: '',
    component: TrackPaymentsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackPaymentsRoutingModule { }
