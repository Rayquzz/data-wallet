import {Component, HostListener} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {MassaWeb3Service} from '../../services/massa-web3.service';
//import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  visible = false;

  items: MenuItem[];
  profileMenuItems: MenuItem[];
  showProfileMenu = false;
  showAddItemButtons = false;

  constructor(private router: Router, private massaWeb3: MassaWeb3Service) {
this.items = [
  { label: 'Passwords', icon: 'pi pi-key', routerLink: '/home/passwords', styleClass: 'menu-normal' },
  { label: 'Cards', icon: 'pi pi-plus', routerLink: '/home/cards'},
  { label: 'Files', icon: 'pi pi-file', routerLink: '/home/files', styleClass: 'menu-normal' },
  //{ label: 'About', icon: 'pi pi-star', routerLink: '/home/about', styleClass: 'menu-normal' },
     // PENTRU ABOUT PAGE ( STERGE COMENTARIU)
  { label: 'FAQ', icon: 'pi pi-question', routerLink: '/home/qAndA', styleClass: 'menu-normal' },
];

  this.profileMenuItems = [
    {
      label: 'Wallet', icon: 'pi pi-wallet', command: () => {
        this.router.navigate(['/home/wallet']);
      }
    },
    {
      label: 'Logout', icon: 'pi pi-sign-out', command: () => {
        this.massaWeb3.logout();
        this.router.navigate(['/']);
      }
    }
  ];

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // show buttons only on /home exactly
      this.showAddItemButtons = event.urlAfterRedirects === '/home';
    });
  }

 addFile() {
    console.log('Add File button clicked');
    // aici scrii logica de adăugare fișier
  }

  addPassword() {
    console.log('Add Password button clicked');
    // aici logica de adăugare parolă
  }

  addCard() {
    console.log('Add Card button clicked');
    // aici logica de adăugare card
  }

  onClickProfileMenu(e: any): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

 
  @HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const target = event.target as HTMLElement;
  const profileContainer = target.closest('.profile-menu-container');
  
  if (!profileContainer) {
    this.showProfileMenu = false;
  }
}

}

