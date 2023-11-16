import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent {

  isMenuOpen:Boolean = true;

  constructor() {}

}
