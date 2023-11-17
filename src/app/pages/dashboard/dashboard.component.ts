import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  ordersList = [
    { 
      "imgPath": "/./assets/images/dashbord/Name.png",
      "name": "Ahmed Yousif", 
      "orderNum": "Order Number",
      "date" : "01/03/23",
      "online" : "Online",
      "Booking" : "Booked",
    },
    { 
      "imgPath": "/./assets/images/dashbord/Name.png",
      "name": "Ammar", 
      "orderNum": "Order Number",
      "date" : "12/12/23",
      "online" : "Online",
      "Booking" : "Booked",
    },
    { 
      "imgPath": "/./assets/images/dashbord/Name.png",
      "name": "Muhammad", 
      "orderNum": "Order Number",
      "date" : "08/05/23",
      "online" : "POS",
      "Booking" : "Booked",
    },
    { 
      "imgPath": "/./assets/images/dashbord/Name.png",
      "name": "Khalifa", 
      "orderNum": "Order Number",
      "date" : "04/02/23",
      "online" : "POS",
      "Booking" : "Booked",
    },
    { 
      "imgPath": "/./assets/images/dashbord/Name.png",
      "name": "Fatima", 
      "orderNum": "Order Number",
      "date" : "11/03/23",
      "online" : "POS",
      "Booking" : "Booked",
    }
  ];

}
