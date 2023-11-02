import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  size: number = 10;
  index: number = 0;
  length: number = 0;
  totalPages: number = 0;

  @Input() set pageSize(value: number) { 
    
    this.size = value; 

    this.totalPages = Math.ceil(this.length / this.size);
  
  }

  get pageSize(): number { return this.size }

  @Input() set totalcount(value: number) { 
    
    this.length = value; 

    this.totalPages = Math.ceil(this.length / this.size);
  
  }

  get totalcount(): number { return this.length }

  @Input() pageSizeOptions: number[] = this.service.pageSizeList;

  @Output() page: EventEmitter<any> = new EventEmitter();

  constructor(private service: CommonService) { }

  ngOnInit(): void { }

  changePageSize() {

    this.totalPages = Math.ceil(this.length / this.size);
    
    this.index = this.index + 1 >= this.totalPages ? this.totalPages - 1 : this.index;

    this.page.emit({ 'pageSize': this.size, 'length': this.length, 'pageIndex': this.index });
    
  }

  pageChanged(num: number) {

    if((this.index+1 == this.totalPages && num == 1) || (this.index == 0 && num == -1)) return;

    this.index = this.index + num;

    this.page.emit({ 'pageSize': this.size, 'length': this.length, 'pageIndex': this.index });
    
  }

}
