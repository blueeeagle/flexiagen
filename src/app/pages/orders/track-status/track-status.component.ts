import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-track-status',
  templateUrl: './track-status.component.html',
  styleUrls: ['./track-status.component.scss']
})
export class TrackStatusComponent {

  _: any = _;

  constructor(private router: Router, public service: CommonService) { 

    this.service.otherData.secondaryPageTitle = "Track Order Status";

    if(_.isEmpty(this.service.otherData?.orderDetails)) {

      let orderId: any = this.router.url.split('/').pop();

      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")

      if(checkForHexRegExp.test(orderId)) { 

        this.service.setApiLoaders({ "isLoading": true, "url": ["/agent/orders/"+orderId] });

        this.getOrderDetails(orderId);

      } else this.router.navigate(['/orders']);

    } 

  }

  getOrderDetails(orderId: any) {

    this.service.getService({ 'url': "/agent/orders/"+orderId }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.service.otherData.orderDetails = res.data;

      } else this.router.navigate(['/orders']);

    },(err: any) => { 

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't get order details" } });
      
      this.router.navigate(['/orders']); 
    
    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.service.otherData.orderDetails = {};
    this.service.otherData.secondaryPageTitle = '';
  }

}
