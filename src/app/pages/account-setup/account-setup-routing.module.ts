import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "company",
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
  },
  {
    path: "location",
    loadChildren: () => import('./location/location.module').then(m => m.LocationModule)
  },
  {
    path: "timeslot",
    loadChildren: () => import('./timeslot/timeslot.module').then(m => m.TimeslotModule)
  },
  {
    path : "item-pricing",
    loadChildren: () => import('./item-pricing/item-pricing.module').then(m => m.ItemPricingModule)
  },
  {
    path: "users",
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
  },
  {
    path: "subscription",
    loadChildren: () => import('./my-subscription/my-subscription.module').then(m => m.MySubscriptionModule)
  },
  {
    path: "",
    redirectTo: "company", 
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "company",
    pathMatch: "full"
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountSetupRoutingModule { }
