import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
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

  constructor(public service: CommonService, private fb: FormBuilder,private confirmationDialog: ConfirmationDialogService){}

  @Input() editData: any = {};

  roleList: Array<any> = [
    {
      "roleName": "View Laundry Customers",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "roleName": "View Laundry Customers",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "roleName": "View Laundry Customers",
      "description": "Allows users to view list of customers associated with the laundry",
    },
    {
      "roleName": "View Laundry Customers",
      "description": "Allows users to view list of customers associated with the laundry",
    },
  ];

  ngOnInit() {

    this.loadForm();
	
	}
  
  loadForm() {

    this.permissionForm = this.service.fb.group({

      'roleName': [ this.editData?.roleName || '', Validators.required ],

      'status': [ this.editData?.status || '', Validators.required ],

      'description': [ this.editData?.description || '', Validators.required ],

      'permissionList': this.fb.array([])


    });

    this.pf.push(this.getPermissionDetailForm({}));

  }

  getPermissionDetailForm({ permissionDet = {}}: {permissionDet?: any}) : FormGroup  {
    
    return this.fb.group({

      "isChecked":  [ permissionDet?.isChecked || false ],
      
  })

  } 

  // convenience getter for easy access to form fields

  get f(): any { return this.permissionForm.controls; }

  get pf(): any {  return (<FormArray>this.permissionForm.controls["permissionList"])};

  submit(){


  }

}
