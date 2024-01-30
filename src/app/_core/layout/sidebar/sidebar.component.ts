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

  @Output() pageTitleEvent: EventEmitter<String> = new EventEmitter();
  
  menuList: any = [
    {
        "label": "Dashboard",
        "url": "dashboard",
        "icon": "bi bi-bar-chart",
    },
    {
        "label": "Account Setup",
        "url": "account-setup",
        "icon": "bi bi-file-earmark-plus",
        "subMenu" : [
            {
                "label": "Company",
                "url": "account-setup/company",
                "icon": "bi bi-building",
                "subMenu" : [
                    {
                        "label": "Company Details",
                        "url": "account-setup/company/company-details"
                    },
                    {
                        "label": "Address Details",
                        "url": "account-setup/company/address-details"
                    },
                    {
                        "label": "Service Details",
                        "url": "account-setup/company/service-details"
                    },            
                    {
                        "label": "Account Details",
                        "url": "account-setup/company/account-details"
                    },
                    {
                        "label": "Working Hours",
                        "url": "account-setup/company/working-hours"
                    }   
                ]
            },
            {
                "label": "Users",
                "url": "account-setup/users",
                "icon": "bi bi-person-workspace",
                "subMenu" : [
                    {
                        "label": "All Users",
                        "url": "account-setup/users/users"
                    },
                    {
                        "label": "Roles & Permissions",
                        "url": "account-setup/users/roles-and-permissions" 
                    }
                ]
            },
            {
                "label": "Locations & Charges",
                "url": "account-setup/location",
                "icon": "bi bi-geo-alt"
            },
            {
                "label": "Timeslot",
                "url": "account-setup/timeslot",
                "icon": "bi bi-clock-history"
            },
            {
                "label": "Items Pricing",
                "url": "account-setup/item-pricing",
                "icon": "bi-coin"
            }, 
            {
                "label": "My Subscription",
                "url": "account-setup/subscription",
                "icon": "bx bx-coin"
            }
        ]
    },
    {
        "label": "Create Order",
        "url": "create-order",
        "icon": "bi bi-cart-plus"
    },
    {
        "label": "Orders",
        "url": "orders",
        "icon": "bi bi-calendar2-check"
    },
    {
        "label": "Customers",
        "url": "customers",
        "icon": "bi-person-vcard"
    },
    {
        "label": "Reports",
        "url": "reports",
        "icon": "bi bi-bar-chart"
    },
    {
        "label": "Settings",
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

      if(menuDet['isExpand']) this.pageTitleEvent.emit(menuDet.label);

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
