import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "company",
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
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
