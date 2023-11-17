import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {

  openCanvas: boolean = false;
  locationFrom: FormGroup = new FormGroup({});

  location = [

    { 
      "areaName": "Area Name 1", 
      "name": "Hamala > Zallaq",
      "bhd" : "3.000 BHD",
      "bhdDes" : "Min Order Amount",
      "free" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 2", 
      "name": "Manama > Galali",
      "bhd" : "3.000 BHD",
      "bhdDes" : "Min Order Amount",
      "free" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 3", 
      "name": "Isa Town > Sitra",
      "bhd" : "3.000 BHD",
      "bhdDes" : "Min Order Amount",
      "free" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },

    { 
      "areaName": "Area Name 4", 
      "name": "Askar > Jaww",
      "bhd" : "3.000 BHD",
      "bhdDes" : "Min Order Amount",
      "free" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },
    { 
      "areaName": "Area Name 5", 
      "name": "Saar > Budaiya",
      "bhd" : "3.000 BHD",
      "bhdDes" : "Min Order Amount",
      "free" : "Free",
      "freeDes" : "Delivery Charges",
      "service" : " Service Available",
      "button" : "Update Changes"
    },
    
  ];

}
