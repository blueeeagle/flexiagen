import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemPricingComponent } from './item-pricing.component';

const routes: Routes = [
  { 
    path:"",
    component : ItemPricingComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemPricingRoutingModule { }
