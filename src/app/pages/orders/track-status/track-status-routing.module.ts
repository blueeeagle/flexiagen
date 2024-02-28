import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackStatusComponent } from './track-status.component';

const routes: Routes = [
  {
    path: '',
    component: TrackStatusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackStatusRoutingModule { }
