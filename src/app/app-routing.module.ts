import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guard/auth/auth.guard';

const routes: Routes = [
  {
    path: "home",
    loadChildren: () => import("./home/home.module").then(m => m.HomeModule)
  },
  {
    path: "auth",
    loadChildren: () => import("./_core/auth/auth.module").then(m => m.AuthModule),
  },
  {
    path: "pages",
    loadChildren: () => import("./pages/pages.module").then(m => m.PagesModule),
    canActivate: [AuthGuard]
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "home",
    pathMatch: "full"
  }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
