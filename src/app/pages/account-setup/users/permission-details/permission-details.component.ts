import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'app-permission-details',
  templateUrl: './permission-details.component.html',
  styleUrls: ['./permission-details.component.scss']
})
export class PermissionDetailsComponent {

  openCanvas: boolean = false;
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  countryList: Array<any> = [];
  masterList : any = {};
  $: any = $;
  permissionForm: FormGroup = new FormGroup({});
  userSubscribe: any;

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService) {

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any)=>{

      if(!_.isEmpty(data)) this.loadForm();

    });

  }

  @Input() editData: any = {};

  permissions: Array<any> = [];

  ngOnInit() {

    this.loadForm();

    this.getPermissions();
	
	}

  getPermissions() {

    this.service.getService({ "url": "/setup/permissions" }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.permissions = res.data;

        this.loadForm();

      }

    });

  }
  
  loadForm() {

    this.permissionForm = this.service.fb.group({

      'companyId': [ this.service.companyDetails._id || null ],

      'roleName': [ this.editData?.roleName || '', Validators.required ],

      'is_active': [ !_.isEmpty(this.editData) ? this.editData?.is_active : true ],

      'description': [ this.editData?.description || '', Validators.required ],

      'roleFor': 'agent',

      'permissionList': this.fb.array([])

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

  get pf(): any {  return (<FormArray>this.permissionForm.controls["permissionList"])};

  next(): any {

    if(this.permissionForm.invalid) return this.formSubmitted = true;

    (document.querySelector("[data-bs-target='#permission']") as any).click()

  }

  submit() {

    this.formSubmitted = true;

    if(this.permissionForm.invalid) return;

    let payload: any = this.permissionForm.value;

    payload['permissionList'] = _.map(payload.permissionList, (permission: any)=>_.pick(permission,['permissionId','allow']));

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
