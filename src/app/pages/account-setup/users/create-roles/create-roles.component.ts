import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
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
    { label: 'Delete', value: 'delete' }
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

    this.loadForm();

    // console.log(this.permissions);

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

    this.permissions.forEach((permissionDet: any, index: number) => {

      this.pf.push(this.getPermissionDetailForm({ permissionDet }));

    });

  }

  getPermissionDetailForm({ permissionDet = {}}: {permissionDet?: any}) : FormGroup  {

    let form: any = this.fb.group({

      "label": [ permissionDet?.label || '' ],

      "url": [ permissionDet?.url || '' ],

      ...!_.isEmpty(permissionDet?.icon) ? { "icon": [ permissionDet?.icon || null ] } : {},

      ..._.size(permissionDet.subMenu) > 0 ? 
      
        { "subMenu": this.fb.array([]) } : 
        
          { "permissions": this.fb.array([]) }
        
    });

    _.forEach(permissionDet.subMenu, (subMenuDet: any) => {

      form.get('subMenu').push(this.getPermissionDetailForm({ "permissionDet": subMenuDet }));

    });

    _.forEach(permissionDet.permissions, (menuDet: any) => {

      form.get('permissions').push(this.fb.group({

        "allow": menuDet.allow,

        "permission": menuDet.permission

      }));

    });

    return form;

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

    let payload: any = _.cloneDeep(this.permissionForm.value);

    payload['permissions'] = _.map(payload['permissions'],(permissionDet: any)=>{

      if(_.size(permissionDet.subMenu) > 0) {

        permissionDet['subMenu'] = _.map(permissionDet.subMenu, (subMenuDet: any) => {

          if(_.size(subMenuDet.subMenu) > 0) {

            subMenuDet['subMenu'] = _.map(subMenuDet.subMenu, (subMenuTwoDet: any) => {

              subMenuTwoDet['permissions'] = _.map(_.filter(subMenuTwoDet.permissions, { allow: true }),'permission');

              return subMenuTwoDet;

            });

          }

          if(_.size(subMenuDet.permissions) > 0) subMenuDet['permissions'] = _.map(_.filter(subMenuDet.permissions, { allow: true }),'permission');

          return subMenuDet;
          
        });

      }

      if(_.size(permissionDet.permissions) > 0) permissionDet['permissions'] = _.map(_.filter(permissionDet.permissions, { allow: true }),'permission');

      return permissionDet;

    });

    payload['permissions'] = _.filter(payload['permissions'], (permissionDet: any) => {

      if(_.size(permissionDet['subMenu']) > 0) 
      
      permissionDet['subMenu'] = _.filter(permissionDet['subMenu'], (subMenuDet: any) => {

        if(_.size(subMenuDet['subMenu']) > 0) 
        
        subMenuDet['subMenu'] = _.filter(subMenuDet['subMenu'], (subMenuTwoDet: any) => {

          return _.size(subMenuTwoDet['permissions']) > 0;

        });

        return _.size(subMenuDet['permissions']) > 0 || _.size(subMenuDet['subMenu']) > 0;

      });
      
      return _.size(permissionDet['permissions']) > 0 || _.size(permissionDet['subMenu']) > 0;

    });

    if(_.size(payload['permissions']) == 0) return this.service.showToastr({ "data": { "message": "Please select at least one permission", "type": "error" } });

    forkJoin({

      "result": this.mode == 'Create' ? 

        this.service.postService({ 'url': '/setup/role', 'payload': payload }) :

          this.service.patchService({ 'url': `/setup/role/${this.editData._id}`, 'payload': payload })

    }).subscribe({

      next: (res: any) => {

        if(res.result.status == 'ok') {

          this.service.showToastr({ "data": { "message": `Role ${ this.mode == 'Create' ? 'added' : 'updated' } successfully`, "type": "success" } });

          this.router.navigate(['/pages/account-setup/users/roles-and-permissions']);

        }

      },

      error: (error: any) => {

        this.service.showToastr({ "data": { "message": error?.message || "Something went wrong!", "type": "error" } });

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}
