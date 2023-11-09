import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: "**",
        redirectTo: "dashboard",
        pathMatch: "full"
      },
      {
        path: "",
        redirectTo: "dashboard", 
        pathMatch: "full"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
