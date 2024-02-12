import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MySubscriptionComponent } from './my-subscription.component';

const routes: Routes = [
  {
    path: "",
    component: MySubscriptionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MySubscriptionRoutingModule { }
