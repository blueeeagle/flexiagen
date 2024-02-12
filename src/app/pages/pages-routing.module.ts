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
        path : "account-setup",
        loadChildren: () => import('./account-setup/account-setup.module').then(m => m.AccountSetupModule)
      },
      {
        path : "create-order",
        loadChildren: () => import('./create-order/create-order.module').then(m => m.CreateOrderModule)
      },
      {
        path : "orders",
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
      },  
      {
        path : "customers",
        loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
      },      
      {
        path : "notification",
        loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)
      },
      {
        path : "reports",
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path : "settings",
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
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
