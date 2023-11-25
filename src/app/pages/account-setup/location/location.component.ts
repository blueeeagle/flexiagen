import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {

  constructor(public service: CommonService) { 

    this.loadForm()

  }

  openCanvas: boolean = false;
  editData : any = {}
  formSubmitted: boolean = false;
  locationFrom: FormGroup = new FormGroup({});
  filterForm: FormGroup = new FormGroup({});

  location = [

    { 
      "areaName": "Area Name 1", 
      "name": "Hamala > Zallaq",
      "minOrderAmt" : "3.000",
      "bhdDes" : "Min Order Amount",
      "deliveryCharge" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 2", 
      "name": "Manama > Galali",
      "minOrderAmt" : "3.000",
      "bhdDes" : "Min Order Amount",
      "deliveryCharge" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 3", 
      "name": "Isa Town > Sitra",
      "minOrderAmt" : "3.000",
      "deliveryCharge" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 4", 
      "name": "Askar > Jaww",
      "minOrderAmt" : "3.000",
      "deliveryCharge" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },
    { 
      "areaName": "Area Name 5", 
      "name": "Saar > Budaiya",
      "minOrderAmt" : "3.000",
      "deliveryCharge" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },
    
  ];

  loadForm() {

    this.formSubmitted = false;

    this.filterForm = this.service.fb.group({

      "minOrderAmt" : this.editData?.minOrderAmt || 0,

      "deliveryCharge":  this.editData?.deliveryCharge || 'FREE',

      "deliveryAmt":  this.editData?.deliveryAmt || 0,
    
    });

  }

  openAsideBar(data : any){

    this.editData = data;

    console.log(this.editData);
    

    this.openCanvas = true

  }


  
  get f(): any { return this.filterForm.controls }

}
