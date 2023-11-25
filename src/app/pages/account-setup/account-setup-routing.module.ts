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
    path: "users",
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
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
