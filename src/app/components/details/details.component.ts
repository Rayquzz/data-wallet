import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-details',
  standalone: false,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent {
  visible = false;
  username = 'Cristi';

  items: MenuItem[];
  profileMenuItems: MenuItem[];
  showProfileMenu = false;

  constructor() {
this.items = [
  { label: 'Passwords', icon: 'pi pi-key', routerLink: '/home/passwords', styleClass: 'menu-normal' },
  { label: 'Files', icon: 'pi pi-file', routerLink: '/home/files', styleClass: 'menu-normal' },
  { label: 'Favorites', icon: 'pi pi-star', routerLink: '/home/favorites', styleClass: 'menu-normal' },
  { label: 'Settings', icon: 'pi pi-cog', routerLink: '/home/settings', styleClass: 'menu-settings' },
  { label: 'Trash', icon: 'pi pi-trash', routerLink: '/home/trash', styleClass: 'menu-trash' },
  { label: 'Q&Q', icon: 'pi pi-question', routerLink: '/home/qandq', styleClass: 'menu-normal' }
];


    this.profileMenuItems = [
      { label: 'Profile', icon: 'pi pi-user', command: () => {} },
      { label: 'Wallet', icon: 'pi pi-wallet', command: () => {} },
      { label: 'Logout', icon: 'pi pi-signout', command: () => {} }
    ];
  }
}
