import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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
  userButton:boolean=true
  modalstatus: boolean = false ;
  dialCodeList: Array<any> = [];
  masterList : any = {};
  userForm: FormGroup = new FormGroup({});
  profileImg: any = '';
  usersList!: Array<any>;
  roles: Array<any> = [];
  mode: 'Create' | 'Update' = 'Create';
  _: any = _;
  isLoading: boolean = false;
  searchValue: string = '';
  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService, private sanitizer: DomSanitizer){}
  
  @Input() editData: any = {};


  ngOnInit() {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/setup/users","/setup/roles","/address/dialCode"] });

    this.loadForm();

    this.getBaseDetails();

    this.getUsersList();
	
  }

  getUsersList() {

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };
    
    this.service.postService({ url: "/setup/users", params }).subscribe((res: any) => {
      
      if (res.status == "ok") {
          
        this.usersList = res.status=='ok' ? res.data : [];

        this.totalCount = res.totalCount || 0;


      }
      
    },(error: any) => {
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    });

  }

  
  getBaseDetails() {
    
    forkJoin({

      "roles": this.service.getService({ url: "/setup/roles" }),
      
      "dialCodes": this.service.getService({ "url": "/address/dialCode" }) 
      
    }).subscribe((res: any) => {

      if(res.roles.status == "ok") this.masterList["roleList"] = res.roles.data;

      if(res.dialCodes.status == "ok") this.dialCodeList = res.dialCodes.data;
      
    });
    
  }

  // Load Form

  loadForm() {

    this.userForm = this.service.fb.group({

      'name': [ this.editData?.name || '', Validators.required ],

      'email': [ this.editData?.email || '', [Validators.required,Validators.email] ],

      'userName': [ this.editData?.userName || '', Validators.required ],

      'dialCode': [this.editData?.dialCode || null, [Validators.required]],

      'mobile': [this.editData?.mobile || '', [Validators.required]],
      
      'role': [this.editData?.role?._id || null, [Validators.required]],

      'userType': [ this.editData?.userType == 'driver' || false ],

      'is_active': [ _.isEmpty(this.editData) ? true : (this.editData?.is_active || null), [Validators.required]],

      'profileImg': [this.editData?.profileImg ? this.service.getFullImagePath({ 'imgUrl': this.editData.profileImg }) : '' ],

    });

    if(_.isEmpty(this.editData)) {

      fetch('https://ipapi.co/json/').then((res: any) => res.json()).then((res: any) => {
  
        this.userForm.get('dialCode')?.setValue(res.country_calling_code);
  
      });   

    }

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.userForm.controls; }

  openAsideBar(data?: any) {

    this.formSubmitted = false;
    
    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.loadForm();

    setTimeout(() => {
      
      this.openCanvas = true;

    }, 100);

  }

  uploadFile(event:any) {

    const file = event.target?.files[0]; // Here we use only the first file (single file)

    if(file) {

      const reader = new FileReader();

      // validate file type & size

      const validFileExtensions = ['image/jpeg','image/jpg','image/png'];

      if(!validFileExtensions.includes(file.type)) return this.service.showToastr({ data: { type: "error", message: "Invalid file type" } });

      if(file.size > 1048576) return this.service.showToastr({ data: { type: "error", message: "File size should not exceed 1MB" } });

      // check dimensions of image

      // const img = new Image();

      // img.src = window.URL.createObjectURL(file);

      // img.onload = () => {

      //   if(img.width != 150 || img.height != 150) return this.service.showToastr({ data: { type: "error", message: "Image should be 150px X 150px" } });

      //   else {

          // File Preview
      
          reader.onload = () => {

            this.userForm.patchValue({ "profileImg": reader.result as string });

            this.profileImg = file;

          }

          reader.readAsDataURL(file);

      //   }

      // }

    }

  }

  pageChanged(event: any) {

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.getUsersList();

  }
  
  submit() {
        
    this.formSubmitted = true;

    if (this.userForm.invalid) return this.service.showToastr({ data: { type: "info", message: "Please fill all required fields" } });

    this.isLoading = true;

    const payload = _.omit(this.userForm.getRawValue(),'profileImg');

    payload["companyId"] = this.service.companyDetails._id;

    payload['userType'] = payload['userType'] ? 'driver' : 'agentUser';

    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    if(this.profileImg) formData.append("profileImg", this.profileImg);

    forkJoin({

      "result": this.mode == 'Create' ? 
      
          this.service.postService({ url: "/setup/user", payload : formData })
        
            : this.service.patchService({ url: `/setup/user/${this.editData?._id}`, payload : formData })
      
    }).subscribe({
      
      next: (res: any) => {

        if (res.result.status == "ok") {

          this.canvas?.close();

          this.service.showToastr({ data: { type: "success", message:  `User ${this.mode == 'Create' ? 'Created' : 'Updated'} Success` } });
  
          this.getUsersList();
  
          this.loadForm();
  
        }

        this.isLoading = false;

      },

      error: (error: any) => {
        
        this.isLoading = false;

        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `User ${this.mode == 'Create' ? 'Creation' : 'Updation'} failed` } });

      }

    });

  }

  updateActiveStatus(data: any) {

    const formData = new FormData();

    const payload = { "is_active": data.is_active };
    
    formData.append("data", JSON.stringify(payload));

    this.service.patchService({ "url": `/setup/user/${data?._id}`, "payload": formData }).subscribe((res: any) => {
  
      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": `User ${ data.is_active ? 'activated' : 'inactivated' } successfully!`, "type": "success" } });

        // this.usersList.splice(_.findIndex(this.usersList,{ "_id": res.data._id }), 1, res.data);

      }

    });

  }

}
