import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent {

  isMenuOpen: Boolean = true;
  logoUrl: any;

  @Input() set menuStatus(value: Boolean) { this.isMenuOpen = value }

  get menuStatus() { return this.isMenuOpen; }

  @Output() menuEvent: EventEmitter<Boolean> = new EventEmitter();

  logImgErrorHandling(){ this.logoUrl = './assets/images/logo.png'; }

}
