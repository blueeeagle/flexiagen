import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;

  tableColumns = ['SL#', 'NAME', 'EMAIL ID', 'USERNAME', 'MOBILE', 'ROLE', 'STATUS', 'ACTION'];
  openCanvas: boolean = false;
  formSubmitted: boolean = false;
  dialCodeList: Array<any> = [];
  masterList : any = {};
  addUserForm: FormGroup = new FormGroup({});
  usersList: Array<any> = [];
  roles: Array<any> = [];
  mode: 'Create' | 'Update' = 'Create';

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService){}
  
  @Input() editData: any = {};


  ngOnInit() {

    this.loadForm();

    this.getBaseDetails();

    this.getUsersList();
	
  }
  
  getBaseDetails() {
    
    forkJoin({

      "roles": this.service.getService({ url: "/setup/roles" }),
      
      "dialCodes": this.service.getService({ "url": "/address/dailCode" }) 
      
    }).subscribe((res: any) => {

      console.log(res);
      
      if (res.roles.status == "ok") this.masterList["roleList"] = res.roles.data;

      if (res.dialCodes.status == "ok") this.dialCodeList = res.dialCodes.data;
      
    });
    
  }


  // Load Form

  loadForm() {

    this.addUserForm = this.service.fb.group({

      'name': [ this.editData?.name || '', Validators.required ],

      'email': [ this.editData?.email || '', Validators.required ],

      'userName': [ this.editData?.userName || '', Validators.required ],

      'dialCode': [this.editData?.dialCode || null, [Validators.required]],

      'mobile': [this.editData?.mobile || '', [Validators.required]],
      
      'role': [this.editData?.role?._id || null, [Validators.required]],

      'is_active': [ _.isEmpty(this.editData) ? true : (this.editData?.is_active || null), [Validators.required]],

      'profile': [this.editData?.profile || null ],

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.addUserForm.controls; }

  openAsideBar(data?: any) {
    
    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.loadForm();
    
    this.openCanvas = true;

  }

  getUsersList() {
    
    this.service.postService({ url: "/agent/users" }).subscribe((res: any) => {
      
      if (res.status == "ok") {
          
        this.usersList = res.data;

      }
      
    },
      (error: any) => {
      
        this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });
    })
  }

  createUser() {
        
    this.formSubmitted = true;

    console.log(this.addUserForm.controls);
    
    if (this.addUserForm.invalid) return this.service.showToastr({ data: { type: "info", message: "Please fill all required fields" } });

    const payload = this.addUserForm.getRawValue();

    payload["companyId"] = this.service.companyDetails._id;

    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    _.forEach(formData, (item: any) => console.log(item));

    forkJoin({

      "result": this.mode == 'Create' ? this.service.postService({ url: "/agent/user", payload : formData })
        
        : this.service.patchService({ url: `/agent/user/${this.editData?._id}`, payload : formData })
      
    }).subscribe((res: any) => {

      console.log(res);
      
      if (res.result.status == "ok") {

        this.canvas?.close();

        this.service.showToastr({ data: { type: "success", message:  `User ${this.mode == 'Create' ? 'Created' : 'Updated'} Success` } });

        this.getUsersList();

        this.loadForm();

      }

    },
    
      (error: any) => {
      
        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `User ${this.mode == 'Create' ? 'Creation' : 'Updation'} failed` } });
        
    })

  }

  updateUserAction(data: any) {

    const formData = new FormData();

    const payload = { "is_active": data.is_active };
    
    formData.append("data", JSON.stringify(payload));

    this.service.patchService({ "url": `/agent/user/${data?._id}`, "payload": formData }).subscribe((res: any) => {
  
      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": `User ${ data.is_active ? 'activated' : 'inactivated' } successfully!`, "type": "success" } });

        // this.usersList.splice(_.findIndex(this.usersList,{ "_id": res.data._id }), 1, res.data);

      }

    });

  }

}
