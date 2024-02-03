import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'app-create-roles',
  templateUrl: './create-roles.component.html',
  styleUrls: ['./create-roles.component.scss']
})
export class CreateRolesComponent {

  openCanvas: boolean = false;
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  countryList: Array<any> = [];
  masterList : any = {};
  $: any = $;
  permissionForm: FormGroup = new FormGroup({});
  userSubscribe: any;
  mode: 'Create' | 'Update' = 'Create';
  @Input() editData: any = {};
  permissions: Array<any> = [];
  permissionOptions = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Edit', value: 'edit' },
    { label: 'Delete', value: 'delete' },
    { label: 'Print', value: 'print' }
  ];

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService, private router: Router) {

    if(this.router.url.split('/').pop() != 'roles') {

      let url = "/setup/roles/" + this.router.url.split('/').pop();

      this.service.setApiLoaders({ "isLoading": true, "url": [url] });

      this.mode = 'Update';

      this.service.getService({ "url": url }).subscribe((res: any): any => {

        if(res.status == 'ok') {

          this.editData = res.data;

          if(_.isEmpty(this.editData)) return this.router.navigate(['/pages/account-setup/users/roles']);

          this.loadForm();

        } else return this.router.navigate(['/pages/account-setup/users/roles']);

      });
    
    } else this.mode == 'Create';

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any)=>{

      if(!_.isEmpty(data)) this.loadForm();

    });

  }

  ngOnInit() {

    this.loadForm();

    this.getPermissions();
	
	}

  getPermissions() {

    this.service.getService({ "url": "/setup/permissions" }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['permissions'] = _.get(_.first(res.data),"permissions");

        this.permissions = _.cloneDeep(this.masterList['permissions']);

        this.constructPermission();

      }

    });

  }

  constructPermission() {

    this.permissions = _.map(this.permissions, (funcMenuDet: any) => {

      let menuDet: any = _.find(this.editData?.permissions,{ 'label': funcMenuDet.label }) || funcMenuDet;

      if(_.size(menuDet.subMenu) > 0) {

        menuDet['subMenu'] = _.map(funcMenuDet.subMenu, (subMenuDet: any) => {
  
          let subMenuOne: any = _.find(menuDet.subMenu, { 'label': subMenuDet.label }) || subMenuDet;

          if(_.size(subMenuOne.subMenu) > 0) {

            subMenuOne['subMenu'] = _.map(subMenuDet.subMenu, (subMenuTwoDet: any) => {
    
              let subMenuTwo: any = _.find(subMenuOne.subMenu, { 'label': subMenuTwoDet.label }) || subMenuTwoDet;

              subMenuTwo['permissions'] = _.map(this.permissionOptions, (permission: any) => {

                return {

                  "permission": permission.value,

                  "allow": _.includes(subMenuTwo.permissions, permission.value)

                }

              });
    
              return subMenuTwo;
    
            });

          } else {

            subMenuOne['permissions'] = _.map(this.permissionOptions, (permission: any) => {

              return {

                "permission": permission.value,

                "allow": _.includes(subMenuOne.permissions, permission.value)

              }

            });

          }

          return subMenuOne;
  
        });

      } else {

        menuDet['permissions'] = _.map(this.permissionOptions, (permission: any) => {

          return {

            "permission": permission.value,

            "allow": _.includes(menuDet.permissions, permission.value)

          }

        });

      }

      return menuDet
      
    });

    console.log(this.permissions);

  }
  
  loadForm() {

    this.permissionForm = this.service.fb.group({

      'companyId': [ this.editData.companyId || this.service.companyDetails._id ],

      'roleName': [ this.editData?.roleName || '', Validators.required ],

      'is_active': [ !_.isEmpty(this.editData) ? this.editData?.is_active : true ],

      'description': [ this.editData?.description || '', Validators.required ],

      'roleFor': 'agent',

      'permissions': this.fb.array([])

    });

    this.permissions.forEach((permissionDet: any) => {

      this.pf.push(this.getPermissionDetailForm({ permissionDet }));

    });

  }

  getPermissionDetailForm({ permissionDet = {}}: {permissionDet?: any}) : FormGroup  {
    
    return this.fb.group({

      "permissionId": [ permissionDet?.permissionId || permissionDet?._id || null ],

      "permission": [ permissionDet?.permission || '' ],

      "description": [ permissionDet?.description || '' ],

      "allow":  [ permissionDet?.allow || false ],
        
    })

  } 

  // convenience getter for easy access to form fields

  get f(): any { return this.permissionForm.controls; }

  get pf(): any {  return (<FormArray>this.permissionForm.controls["permissions"])};

  next(): any {

    if(this.permissionForm.invalid) return this.formSubmitted = true;

    (document.querySelector("[data-bs-target='#permission']") as any).click()

  }

  submit() {

    this.formSubmitted = true;

    if(this.permissionForm.invalid) return;

    let payload: any = this.permissionForm.value;

    payload['permissions'] = _.map(payload.permissions, (permission: any)=>_.pick(permission,['permissionId','allow']));

    this.service.postService({ 'url': '/setup/role', 'payload': payload }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.service.showToastr({ "data": { "message": "Role added successfully", "type": "success" } });

        (document.querySelector("[data-bs-target='#roles']") as any)?.click();

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}
