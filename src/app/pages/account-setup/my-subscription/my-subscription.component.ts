import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';

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

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService, private sanitizer: DomSanitizer){}
  
  @Input() editData: any = {};


  ngOnInit() {


    this.service.setApiLoaders({ "isLoading": true, "url": ["/setup/company"] });

    this.service.getCompanyDetails().subscribe((val: any) => {
            
      const currentDate = moment(); // Current date and time

      const nextSubscriptionDate = (this.service.companyDetails?.subscriptionDetail?.lastSubscriptionDate) ?  moment(this.service.companyDetails?.subscriptionDetail?.lastSubscriptionDate).add(30, 'days') : currentDate; // Replace with your actual date
  
      this.subscriptionDet["expiryInDays"] = nextSubscriptionDate.diff(currentDate, 'days');

      this.subscriptionDet["amount"] = this.service.companyDetails?.subscriptionDetail?.amount.toFixed(2);
  
      console.log(`Days until subscription expires: ${this.expiryInDays}`);


     if(this.subscriptionDet["amount"]) this.getBaseDetails();


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
        
        "card_number": [null, Validators.required],

        "exp_month": [null, Validators.compose([Validators.required])],

        "exp_year": [null, Validators.compose([Validators.required])],
          
        "scode": [null, Validators.compose([Validators.required, Validators.minLength(3)])],
        
        "name": [null, Validators.required]
      
      })

    });

    // this.cf.exp_month.valueChanges.subscribe((value: any) => {

    //   if(value) this.cf.exp_month.setValue(moment(parseInt(value), 'M').format('MM'), { emitEvent: false });
    // });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.subscriptionForm.controls; }

  get cf() {  return (this.subscriptionForm.get('cardDetails') as FormGroup).controls as any; }
  openAsideBar(data?: any) {

    this.formSubmitted = false;
    
    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.loadForm();
    
    this.openCanvas = true;

  }

  prev_next() {
    
    this.showCard = !this.showCard;

    // if(!this.showCard) this.CardCanvas?.close();
  }

  initiatePayment() {

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

        const payload = {

          "cardDetails": {
            "card_number": (paymentValue.cardDetails?.card_number) ? parseInt(paymentValue.cardDetails?.card_number.replace(/\s+/g, '')) : "",
            "exp_month": parseInt(paymentValue.cardDetails?.exp_month),
            "exp_year": this.getFullYear(paymentValue.cardDetails?.exp_year),
            "scode": parseInt(paymentValue.cardDetails?.scode),
            "name": paymentValue.cardDetails?.name
          },

          "amount": 3,
          
          "countryCode": this.service.companyDetails?.countryId

        };

        const paymentCheckObj = {

          "agentId": this.service.userDetails._id,

          "countryId" : this.service.companyDetails?.countryId
        }

    console.log({ payload });

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

          this.isPaymentLoading = false;

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

   getFullYear(year : any) {
  
      // Concatenate to form the full year
    let fullYear = (Math.floor(moment().year() / 100) * 100 + parseInt(year));
    
    return fullYear
  }

}
