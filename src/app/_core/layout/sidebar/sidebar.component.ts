import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { animate, style, transition, trigger } from '@angular/animations';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('dropInOutAnim', [
      transition(':enter', [
        style({ opacity: 0, top: -10 }), //apply default styles before animation starts
        animate(
          '.5s ease-in-out',
          style({ opacity: 1, top: 0 })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: 0 }), //apply default styles before animation starts
        animate(
          '.5s ease-in-out',
          style({ opacity: 0, top: -10 })
        ),
      ]),
    ]),
  ]
})
export class SidebarComponent implements OnInit {

  isMenuOpen: Boolean = true;
  logoUrl : any;
  _: any = _;

  @Input() set menuStatus(value: Boolean) { this.isMenuOpen = value }

  get menuStatus() { return this.isMenuOpen; }

  @Output() menuEvent: EventEmitter<Boolean> = new EventEmitter();
  
  menuList: any = [
    {
      "label": "Dashboard",
      "allow": true,
      "url": "dashboard",
      "icon": "bi bi-bar-chart",
    },
    {
      "label": "Account Setup",
      "allow": true,
      "url": "account-setup",
      "icon": "bi bi-file-earmark-plus",
      "subMenu": [
        {
          "label": "Company",
          "allow": true,
          "url": "account-setup/company",
          "icon": "bi bi-building",
          "subMenu" : [ 
            {
              "label": "Company-Details",
              "allow": true,
              "url": "account-setup/company/company-details",
              "icon": "bi bi-geo-alt"
            },
            {
              "label": "Service-Details",
              "allow": true,
              "url": "account-setup/company/service-details",
              "icon": "bi bi-geo-alt"
            },
            {
              "label": "Address-Details",
              "allow": true,
              "url": "account-setup/company/address-details",
              "icon": "bi bi-geo-alt"
            },
            {
              "label": "Account-Details",
              "allow": true,
              "url": "account-setup/company/account-details",
              "icon": "bi bi-geo-alt"
            },
          ]
        },
        {
          "label": "Location",
          "allow": true,
          "url": "account-setup/location",
          "icon": "bi bi-geo-alt"
        },
        {
          "label": "Timeslot",
          "allow": true,
          "url": "account-setup/timeslot",
          "icon": "bi bi-clock-history"
        },
        {
          "label": "Users",
          "allow": true,
          "url": "account-setup/users",
          "icon": "bi bi-person-workspace"
        }, 
        {
          "label": "My Subscription",
          "allow": true,
          "url": "account-setup/subscription",
          "icon": "bx bx-coin"
        },                
      ]
    },
    {
      "label": "Create Order",
      "allow": true,
      "url": "create-order",
      "icon": "bi bi-cart-plus"
    },
    {
      "label": "Orders",
      "allow": true,
      "url": "orders",
      "icon": "bi bi-calendar2-check"
    },
    {
      "label": "Customers",
      "allow": true,
      "url": "customers",
      "icon": "bi-person-vcard"
    },
    {
      "label": "Reports",
      "allow": true,
      "url": "reports",
      "icon": "bi bi-bar-chart"
    },
    {
      "label": "Settings",
      "allow": true,
      "url": "settings",
      "icon": "bi bi-gear"
    }
  ];

  constructor(public service: CommonService, private router: Router) {}

  ngOnInit(): void {
    
    var url = this.router.url.split('/');

    url.splice(0,2);

    this.selectMenuChanges(url);

    this.router.events.subscribe(e=>{

      if(e instanceof NavigationEnd) {

        let url = e.url.split('/');

        url.splice(0,2);
        
        this.selectMenuChanges(url);

      }

    })

  }

  logImgErrorHandling(){ this.logoUrl = './assets/images/logo.png'; }

  selectMenuChanges(url: any) {

    this.menuList = _.map(this.menuList,(menuDet: any)=>{

      menuDet['isExpand'] = menuDet.url == url[0];

      menuDet['isSelected'] = menuDet.url == url[0];

      menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

        subMenuOneDet['isExpand'] = subMenuOneDet.url == url[0] + '/' + url[1];

        subMenuOneDet['isSelected'] = subMenuOneDet.url == url[0] + '/' + url[1];

        subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

          subMenuTwoDet['isExpand'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];

          subMenuTwoDet['isSelected'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];

          return subMenuTwoDet;

        });

        return subMenuOneDet;

      })

      return menuDet;

    });

  }

  openMenu({ path = "", menuLevel = 0 }: { path?: String, menuLevel?: number }) {

    this.isMenuOpen = true;

     this.menuEvent.emit(this.isMenuOpen);

     let url = path.split('/');
     
     let menu = url[0];

     let subMenuOne = url[0] + '/' + url[1];

     let subMenuTwo = url[0] + '/' + url[1] + '/' + url[2];

     this.menuList = _.map(this.menuList,(menuDet: any)=>{

      menuDet['isExpand'] = menuDet.url == menu && menuLevel == 0 ? !menuDet['isExpand'] : menuDet.url != menu ? false : menuDet['isExpand'];

      menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

        subMenuOneDet['isExpand'] = subMenuOneDet.url == subMenuOne && menuLevel == 1 ? !subMenuOneDet['isExpand'] : subMenuOneDet.url != subMenuOne ? false : subMenuOneDet['isExpand'];

          subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

            subMenuTwoDet['isExpand'] = subMenuTwoDet.url == subMenuTwo && menuLevel == 2 ? !subMenuTwoDet['isExpand'] : subMenuTwoDet.url != subMenuTwo ? false : subMenuTwoDet['isExpand'] ;
  
            return subMenuTwoDet;
  
          });

        return subMenuOneDet;

      });

      return menuDet;

    });

  }
  
}
