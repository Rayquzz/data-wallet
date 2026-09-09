import {Component} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Drawer} from 'primeng/drawer';

@Component({
  selector: 'app-qAndA',
  standalone: false,
  templateUrl: './qAndA.component.html',
  styleUrl: './qAndA.component.scss'
})

export class qAndAComponent {
  visible = false;

  items: MenuItem[];
  profileMenuItems: MenuItem[];
  showProfileMenu = false;

  constructor() {

    this.profileMenuItems = [
      { label: 'Wallet', icon: 'pi pi-wallet', command: () => {} },
      { label: 'Logout', icon: 'pi pi-sign-out', command: () => {} }
    ];
  }
}