import { Component } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {

  _: any = _;

  notifications: Array<any> = [
    {
      "orderId": "54215",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "orderId": "54215",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "orderId": "54215",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "orderId": "54215",
      "description": "Allows users to view list of customers associated with the laundry",
    },

  ];

  removeCard(index: number): void {

    if (index >= 0 && index < this.notifications.length) {

      this.notifications.splice(index, 1);

    }
  
  }

}
