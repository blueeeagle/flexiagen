import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { config, forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.scss']
})
export class MySubscriptionComponent {

  reports: FormGroup = new FormGroup({});

  tableColumns = ['TRANSACTION ID','DATE','PLAN','CARD DETAILS','AMOUNT','PAYMENT STATUS'];
  cardList : Array<any> = [];
  transactionList: Array<any> = [];

  @ViewChild('CardCanvas') CardCanvas: OffcanvasComponent | undefined;

  // tableColumns = ['SL#', 'NAME', 'EMAIL ID', 'USERNAME', 'MOBILE', 'ROLE', 'STATUS', 'ACTION'];
  openCanvas: boolean = false;
  showCard: boolean = false;
  formSubmitted: boolean = false;
  userButton:boolean=true
  modalstatus: boolean = false ;
  dialCodeList: Array<any> = [];
  masterList : any = {};
  subscriptionForm: FormGroup = new FormGroup({});
  profileImg: any = '';
  usersList!: Array<any>;
  roles: Array<any> = [];
  mode: 'Create' | 'Update' = 'Create';
  _: any = _;
  subscriptionDet: any = { "expiryInDays": 0, "amount": 0.0 };
  expiryInDays: any;
  searchValue: string = '';
  paymentFormSubmitted: boolean = false;
  isPaymentLoading: boolean = false;
  paymentFailedMsg: string = '';
  adminSettings: any = {};
  appServiceChargeDet: any;
  subscriptionType: string = 'existing';

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService, private sanitizer: DomSanitizer, private route : ActivatedRoute){}
  
  @Input() editData: any = {};


  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      
      const paymentInitValue = JSON.parse(this.service.session({ method: 'get', key: 'paymentValue' }));

      if (!_.isEmpty(paymentInitValue)) {

        this.service.setApiLoaders({ "isLoading": true, "url": [`/payment/success/authorize/${paymentInitValue?.agentId}/${paymentInitValue?.currencyId}`] });
        
        this.service.getService({ url: `/payment/success/authorize/${paymentInitValue?.agentId}/${paymentInitValue?.currencyId}`, params }).subscribe((res: any) => {
          
          if (res.status == "ok") {
              
            location.reload();

            this.service.session({ method : 'remove', key : 'paymentValue'})

          }
  
        },
          (error: any) => {
          
            this.service.showToastr({ data: { message: "Sorry, We are unable to getting the payment details. Contact Admin", type: "warn" } });

            this.service.session({ method : 'remove', key : 'paymentValue'})
            // this.createCompany(companyPayload);
        });

      }

    });

    this.service.setApiLoaders({ "isLoading": true, "url": ["/setup/company", "/admin/configs"] });

    this.service.getCompanyDetails().subscribe((val: any) => {

      this.service.companyDetails = val;
            
      const currentDate = moment(); // Current date and time

      const nextSubscriptionDate = (this.service.companyDetails?.subscriptionDetail?.lastSubscriptionDate) ?  moment(this.service.companyDetails?.subscriptionDetail?.lastSubscriptionDate).add(30, 'days') : currentDate; // Replace with your actual date
  
      this.subscriptionDet["expiryInDays"] = nextSubscriptionDate.diff(currentDate, 'days');

      this.subscriptionDet["amount"] = (this.service.companyDetails?.subscriptionDetail?.amount || 0).toFixed(2);
  
      console.log(`Days until subscription expires: ${this.expiryInDays}`);

       this.service.loadAdminSettings().subscribe((configs: any) => {

      if (_.first(configs)) {
        
        this.adminSettings = configs[0];
  
      }
      
    },
      (err: any) => {
      
        this.service.showToastr({ data: { title: "Fetching failed", message: "Configurations getting failed" } });
    })


      // if (this.subscriptionDet["amount"])
        
      this.getBaseDetails();
      
      this.getAppServiceCharges();


    },
      (error: any) => {
      
        this.service.showToastr({ data: { message: "Sorry, Subscription details fetching failed", type : "warn"} });
    });
	
      this.loadForm();

  }

  
  getBaseDetails() {
    
    forkJoin({

      "cardList": this.service.getService({ url: "/payment/cards" }),
      
      "transactions" : this.service.getService({ url : "/payment/trans"}),
      
    }).subscribe((res: any) => {
      
      if (res.cardList.status == "ok") {
        
        this.cardList = res.cardList.data;

        this.cardList = _.map(this.cardList, (card: any) => {
          
          card["imgPath"] = "/./assets/images/" + card?.brand?.toLowerCase() + ".png";

          // console.log(this.service.companyDetails?.subscriptionDetail?.contractDet?.id, card?.id);
          
          if (this.service.companyDetails?.subscriptionDetail?.contractDet?.id == card?.id) card["primary"] = true;

          return card;

        });

      }

      if (res.transactions.status == "ok") {
        
        this.transactionList = res.transactions?.data;
        
      }
      
    });
    
  }

  // Load Form

  loadForm() {

    this.subscriptionForm = this.service.fb.group({

      "cardType": ["card", Validators.required],
      
      "cardDetails": this.fb.group({

        "card_id" : null,
        
        "card_number": [null, Validators.required],

        "exp_month": [null, Validators.compose([Validators.required])],

        "exp_year": [null, Validators.compose([Validators.required])],
          
        "scode": [null, Validators.compose([Validators.required, Validators.minLength(3)])],
        
        "name": [null, Validators.required]
      
      })

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.subscriptionForm.controls; }

  get cf() { return (this.subscriptionForm.get('cardDetails') as FormGroup).controls as any; }

  // Get Application Service List

  getAppServiceCharges() {

    this.appServiceChargeDet = { 'pos': '0', 'online': '0', 'logistics': '0' };

    console.log("company", this.service.companyDetails);
    

    this.service.getService({ "url": `/setup/charges/${this.service.companyDetails?.addressDetails?.countryId?._id}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.masterList['charges'] = res.data.charges;

        _.reduce({ 'pos': '0', 'online': '0', 'logistics': '0' }, (result: any, v: any, key: any) => {

          let chargesDet = _.find(res.data.charges, { 'name': key });

          const { value, type } = chargesDet;

          result[key] = `${value.toFixed(this.service.currencyDetails?.decimalPoints || 3)} ${this.service.currencyDetails?.currencyCode}`;

          if(key == "pos") result["amount"] = value

          return result;

        }, this.appServiceChargeDet);

        console.log("charge", this.appServiceChargeDet);
        
      }

    });

  }
  
  openAsideBar(data?: any) {

    if(_.isEmpty(this.adminSettings)) return this.service.showToastr({ "data" : { message : "Sorry, you can't subscribe now. contact admin", type : "warn"}})

    this.formSubmitted = false;
    
    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.loadForm();
    
    this.openCanvas = true;

  }

  prev_next() {

    if (this.subscriptionForm.value.cardDetails.card_id) {
      
      this.initiatePayment(this.subscriptionForm.value.cardDetails.card_id);
    }
    
    this.showCard = !this.showCard;

  }

  // Start subscription
  initiatePayment(cardId?: any) {
    
    console.log(cardId);
    

    this.paymentFormSubmitted = true;

    if (this.cf.invalid) return;
    
    this.confirmationDialog.confirm({

      title: "Subscription Confirmation",
      
      message: "Do you want to proceed the payment",
      
      type: "info",
      
    }).then((val: any) => {
      
      if (val) {
          
        console.log("payment initiated");

        const paymentValue = this.subscriptionForm.value;

        const cardDetails = cardId ? { 'card_id': cardId } : {  
        "card_number": paymentValue.cardDetails?.card_number ? parseInt(paymentValue.cardDetails?.card_number.replace(/\s+/g, '')) : "",
        "exp_month": parseInt(paymentValue.cardDetails?.exp_month),
        "exp_year": this.getFullYear(paymentValue.cardDetails?.exp_year),
        "scode": parseInt(paymentValue.cardDetails?.scode),
        "name": paymentValue.cardDetails?.name
      };

        const payload = {

          cardDetails,

          "amount": parseInt(this.adminSettings?.subscriptionFee),
          
          "countryId": this.service.companyDetails?.addressDetails?.countryId?._id,

          "currencyId": this.service.currencyDetails?._id,

          "_returnTo" : "/pages/account-setup/subscription"

        };

        const paymentCheckObj = {

          "agentId": this.service.userDetails._id,

          "currencyId" : this.service.currencyDetails?._id
        }

        console.log({ payload });
        
        // return;

    console.log({ paymentCheckObj });

    // return;

    this.isPaymentLoading = true;

    this.paymentFailedMsg = "";

    this.service.postService({ url: `/pg/initiatePayment`, payload }).subscribe((res: any) => {

      if (res.status == "ok") {
        
        const paymentRes = res.data;
  
        if (paymentRes.transaction?.url) {

          console.log(paymentRes.transaction?.url);
          
          this.service.session({ method: "set", key: "paymentValue", value: JSON.stringify(paymentCheckObj) });
  
          window.location.href = paymentRes.transaction?.url;

        }
        
      }
      
    },
    (error: any) => {

      console.log(error);
      
      this.paymentFailedMsg = "Sorry, your given payment details are invalid. Please check your provided details.";

      this.isPaymentLoading = false;
  });

  }
  })
    
  }

  // Cancel subscription
  cancelSubscription() {
    
    this.confirmationDialog.confirm({
        
      title: "Subscription Cancellation",
      message: "Do you want to cancel your subscription ?",
      type: "warn"
      
    }).then((val: boolean) => {
        
      if (val) {
            
        this.service.deleteService({ url: "/payment/cancel" }).subscribe((res: any) => {
              
          if (res.status == "ok") {
              
            location.reload();
            }
        },
          (error: any) => {
          
            this.service.showToastr({ "data": { message: "Sorry, Cancellation failed. Contact admin", type: "warn" } });
        });

          }
      })
  }

  deleteCard(cardDet: any) {
    
     this.confirmationDialog.confirm({
        
       title: "Delete card",
       
       message: `Do you want to delete your card ${cardDet?.first_six}****${cardDet?.last_four} ?`,
      
      type: "warn"
      
    }).then((val: boolean) => {
        
      if (val) {
            
        this.service.deleteService({ url: "/payment/card/"+cardDet?.id }).subscribe((res: any) => {
              
          if (res.status == "ok") location.reload();
        },
          (error: any) => {
          
            this.service.showToastr({ "data": { message: "Sorry, Deletion failed. Contact admin", type: "warn" } });
        });

          }
      })
    
  }

  getFullYear(year : any) {
  
      // Concatenate to form the full year
    let fullYear = (Math.floor(moment().year() / 100) * 100 + parseInt(year));
    
    return fullYear
  }

}