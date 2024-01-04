import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;

  openCanvas : boolean = false;

  orderList: any = [

    {

      "orderNo" : "ORD-0001",
      "orderDate" : "2021-09-01",
      "customerName" : "Rajesh",
      "mobile" : "9876543210",
      "mail" : "rajesj14@gmail.com",
      "noOfItems" : 5,
      "bookedVia" : "App",
      "orderStatus" : "Delivered",
      "paymentStatus" : "Paid"

    },
    {

      "orderNo" : "ORD-0001",
      "orderDate" : "2021-09-01",
      "customerName" : "Rajesh",
      "mobile" : "9876543210",
      "mail" : "rajesj14@gmail.com",
      "noOfItems" : 5,
      "bookedVia" : "App",
      "orderStatus" : "Delivered",
      "paymentStatus" : "Paid"

    },
    {

      "orderNo" : "ORD-0001",
      "orderDate" : "2021-09-01",
      "customerName" : "Rajesh",
      "mobile" : "9876543210",
      "mail" : "rajesj14@gmail.com",
      "noOfItems" : 5,
      "bookedVia" : "App",
      "orderStatus" : "Delivered",
      "paymentStatus" : "Paid"

    },
    {

      "orderNo" : "ORD-0001",
      "orderDate" : "2021-09-01",
      "customerName" : "Rajesh",
      "mobile" : "9876543210",
      "mail" : "rajesj14@gmail.com",
      "noOfItems" : 5,
      "bookedVia" : "App",
      "orderStatus" : "Delivered",
      "paymentStatus" : "Paid"

    },
    {

      "orderNo" : "ORD-0001",
      "orderDate" : "2021-09-01",
      "customerName" : "Rajesh",
      "mobile" : "9876543210",
      "mail" : "rajesj14@gmail.com",
      "noOfItems" : 5,
      "bookedVia" : "App",
      "orderStatus" : "Delivered",
      "paymentStatus" : "Paid"

    },

  ]

  tableColumns = ['ORDER NO', 'ORDER DATE', 'CUSTOMER NAME', 'MOBILE', 'MAIL','NOOFITEMS' ,'BOOKEDVIA','ORDER STATUS','PAYMENT STATUS','ACTION'];

  _: any = _;

  constructor(public service: CommonService, ){}

  ngOnInit() {

    // this.service.setApiLoaders({ "isLoading": true, "url": ["/master/customers"] });
    
  }

  openAsideBar(){
    
    this.openCanvas = true;

  }

  closeBar(){

    this.openCanvas = false;

  }


}


