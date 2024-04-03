import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalPendingComponent } from './approval-pending.component';

const routes: Routes = [
  {
    path: "",
    component: ApprovalPendingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalPendingRoutingModule { }
