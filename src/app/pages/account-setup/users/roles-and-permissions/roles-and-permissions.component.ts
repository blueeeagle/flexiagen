import { Component, } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent {

  tableColumns = ['SL#', 'ROLE NAME', 'DESCRIPTION', 'STATUS', 'ACTION'];
  roleList!: Array<any>;
  isLoading: boolean = false;
  _: any = _;

  searchValue: string = '';
  rolesCount: number = 0;
  totalCount: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;


  constructor(public service: CommonService) { 

    this.getRoles();

  }

  pageChanged(event: any) {

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.getRoles();

  }

  getRoles() {

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.getService({ url: "/setup/roles", params, "options": { loaderState: true } }).subscribe((res: any) => {

      this.roleList = res.status=='ok' ? res.data : [];

      this.totalCount = res.totalCount || 0 

      this.rolesCount = _.size(this.roleList);

    },(error: any)=>{

      this.service.showToastr({ "data": { "message": error?.message || "Something went wrong!", "type": "error" } });

    });

  }

  updateActiveStatus(data: any) {

    const formData = new FormData();

    const payload = { "is_active": data.is_active };
    
    formData.append("data", JSON.stringify(payload));

    this.service.patchService({ "url": `/setup/user/${data?._id}`, "payload": formData }).subscribe((res: any) => {
  
      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": `User ${ data.is_active ? 'activated' : 'inactivated' } successfully!`, "type": "success" } });

      }

    });

  }

}
