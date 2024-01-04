import { Component } from '@angular/core';
import { FormGroup,  } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  reports: FormGroup = new FormGroup({});

  tableColumns = ['DATE','ORDER ID','CUSTOMER NAME','MOBILE NO','TYPE','METHOD','RATING','RVIEW'];

  reviewAndRating: Array<any> = [
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
    {
      "date" : "20/20/20",

      "orderId" : "ORDO01",

      "customerName" : "Karthik Siva",

      "mobileNo" : "+6385877456",

      "type" : "Online",

      "method" : "Swipe",

      "rating" : "4.5/5",

    },
  ];

}
