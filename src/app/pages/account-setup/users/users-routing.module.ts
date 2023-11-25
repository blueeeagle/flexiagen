import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "all-users",
    loadChildren: () => import('./all-users/all-users.module').then(m=>m.AllUsersModule)
  },
  {
    path: "permission-details",
    loadChildren: () => import('./permission-details/permission-details.module').then(m=>m.PermissionDetailsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
