import { Component, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ModalComponent, OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;
  @ViewChild('OrderDetailsModal') OrderDetailsModal!: ModalComponent;

  openCanvas : boolean = false;
  filterForm: any = {};
  statusForm: any = {};
  paymentForm: any = {};
  orderList: any = [];
  totalCount: number = 0;
  tableColumns = ['ORDER NO', 'ORDER DATE', 'CUSTOMER NAME', 'MOBILE', 'NO OF ITEMS','BOOKED VIA','GROSS AMT','DISC AMT','NET AMT','PAYMENT RECEIVED','PAYMENT STATUS','ORDER STATUS','ACTION'];
  _: any = _;
  searchValue: string = "";
  pageSize: number = 10;
  pageIndex: number = 0;
  filterValues: any = null;
  companyDetails : any = {} ;
  orderDetails : any = {};
  canvasConfig: any = {
    "canvasName": "filter",
    "canvasTitle": "Filters",
    "applyBtnTxt": "Save",
    "cancelBtnTxt": "Clear",
    "showCancelBtn": true
  };
  formSubmitted: any =  {
    'statusForm': false,
    'paymentForm': false
  };
  deliveryAgentList: any = [];
  usersList: any;
  moment: any = moment;

  constructor(public service: CommonService, ){}

  ngOnInit() {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/agent/orders"] });

    this.loadForm();

    this.getDeliveryAgentList();

  }

  getDeliveryAgentList() {

    this.service.postService({ url: "/setup/users", payload: { 'userType': ['driver','agent','agentUser'] } }).subscribe((res: any) => {
      
      if (res.status == "ok") {
          
        this.deliveryAgentList = _.filter(res.data,{ 'userType': 'driver' });

        this.usersList = res.data;

      }
      
    },(error: any) => {
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    });

  }

  loadForm() {

    this.filterForm = this.service.fb.group({
      
      "orderType": [""],
      "fromDate": [""],
      "toDate": [""],
      "orderMode": [""],
      "orderStatus": [""],
      "paymentStatus": [""]

    });

    this.filterData();

  }

  loadStatusForm() {

    this.statusForm = this.service.fb.group({

      "status": ["",[Validators.required]],

      "driverId": [""],

      "remarks": ""

    });

    this.statusForm.get('status')?.setValue(_.find(this.orderDetails.statusHistory,(e)=>_.isUndefined(e.updated_at))?.status || "");

    this.statusForm.get('status')?.valueChanges.subscribe((value: any) => {

      if(value == 'Out for Delivery' || value == 'Pick Up') {

        this.statusForm.get('driverId')?.setValidators([Validators.required]);

      } else {

        this.statusForm.get('driverId')?.clearValidators();

      }

      this.statusForm.get('driverId')?.updateValueAndValidity();

    });

  }

  loadPaymentForm() {

    this.paymentForm = this.service.fb.group({

      "companyId": [this.orderDetails.companyId,[Validators.required]],

      "customerId": [this.orderDetails.customerId._id,[Validators.required]],

      "orderId": [this.orderDetails._id,[Validators.required]],

      "paymentMode": ["Cash",[Validators.required]],

      "paymentDate": [new Date(),[Validators.required]],

      "amount": ["",[Validators.required]],

      "remarks": "",

      "collected_by": [this.service.userDetails._id,[Validators.required]]

    });

  }

  get sf(): any { return this.statusForm.controls; }

  get pf(): any { return this.paymentForm.controls; }

  filterData() {

    if(_.isEqual(this.filterValues, _.pickBy(this.filterForm.value))) return this.canvas?.close();

    this.filterValues = _.pickBy(this.filterForm.value);

    this.pageIndex = 0;

    this.pageSize = 10;

    this.getOrderList({});

  }

  openModal(data: any) {

    this.companyDetails = this.service.companyDetails;

    this.orderDetails = data;

    this.OrderDetailsModal.open();

  }

  getOrderList({ isPageChange = false }: { isPageChange?: Boolean}) {

    if(!isPageChange) {

      this.pageIndex = 0;

      this.pageSize = 10;

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ url: "/agent/orders", "params": params, "payload": _.pickBy(this.filterForm.value) }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.orderList = res.data;

        this.totalCount = res.totalCount;

      }

      this.canvas?.close();
      
    },(error: any) => {

      this.canvas?.close();
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    })
    
  }

  openAsideBar({ canvasName = 'filter', data = {} }:  { canvasName: 'filter' | 'updateStatus' | 'updatePayment', data?: any }) {

    this.canvasConfig['canvasName'] = canvasName;

    this.canvasConfig['applyBtnTxt'] = 'Save';

    this.canvasConfig['cancelBtnTxt'] = 'Clear';

    this.canvasConfig['showCancelBtn'] = true;
    
    this.openCanvas = true;

    this.orderDetails = data;

    this.formSubmitted = {
      'statusForm': false,
      'paymentForm': false
    };

    if(canvasName == 'filter') {

      this.canvasConfig['canvasTitle'] = "Filters";

      this.canvasConfig['applyBtnTxt'] = "Apply";

    } else if(canvasName == 'updateStatus') {

      this.canvasConfig['canvasTitle'] = "Update Status";

      this.loadStatusForm();

    } else if(canvasName == 'updatePayment') {

      this.canvasConfig['canvasTitle'] = "Update Payment";

      this.loadPaymentForm();

    }

  }

  changeValue({ fieldName = "" }: { fieldName: string }) {

    if(fieldName == 'amount') {

      if(parseFloat(this.pf.amount.value) > (parseFloat(this.orderDetails.netAmt) - parseFloat(this.orderDetails.paymentReceived || 0))) {
        
        this.pf.amount.setValue(parseFloat(this.orderDetails.netAmt) - parseFloat(this.orderDetails.paymentReceived || 0));

        this.service.showToastr({ "data": { "message": "Payment amount should be less than or equal to pending amount", "type": "info" } });

      }

    }

  }


  asidebarSubmit(): any {

    if(this.canvasConfig['canvasName'] == 'filter') {

      this.filterData();

    } else if(this.canvasConfig['canvasName'] == 'updateStatus') {

      if(this.statusForm.invalid) return this.formSubmitted.statusForm = true;

      let payload = this.statusForm.value;

      if(_.isEmpty(payload.remarks)) delete payload.remarks;

      this.service.patchService({ url: "/agent/order/status/"+this.orderDetails._id, payload }).subscribe((res: any) => {

        if (res.status == "ok") {

          this.canvas?.close();

          this.service.showToastr({ data: { type: "success", message:  `Order Status Updated` } });

          this.getOrderList({});

        }

      });

    } else if(this.canvasConfig['canvasName'] == 'updatePayment') {

      if(this.paymentForm.invalid) return this.formSubmitted.paymentForm = true;

      let payload = this.paymentForm.value;

      payload['paymentDate'] = moment(payload['paymentDate']).format("YYYY-MM-DD");

      payload["transactionStatus"]= "Success";

      if(_.isEmpty(payload.remarks)) delete payload.remarks;

      this.service.postService({ url: "/agent/order/payment", payload }).subscribe((res: any) => {

        if (res.status == "ok") {

          this.canvas?.close();

          this.service.showToastr({ data: { type: "success", message:  `Order Payment Updated` } });

          this.getOrderList({});

        }

      });

    }
    
  }

}