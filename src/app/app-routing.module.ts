import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {PasswordsComponent} from './components/passwords/passwords.component';
import {AboutComponent} from './components/about/about.component';
import {PinComponent} from './components/pin/pin.component';
import {ImportComponent} from './components/import/import.component';
import {CardsComponent} from './components/cards/add-card.component';
import {MywalletComponent} from './components/mywallet/mywallet.component';
import {DetailsComponent} from "./components/details/details.component";
import {FilesComponent} from './components/files/files.component';
import { qAndAComponent } from './components/qAndA/qAndA.component';
const routes: Routes = [
  {
    path: '',
    component: PinComponent
  },
  {
    path: 'import',
    component: ImportComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {path: '', component: AboutComponent},
      {path: 'passwords', component: PasswordsComponent},
      {path: 'wallet', component: MywalletComponent},
      {path: 'cards', component: CardsComponent},
      {path: 'files', component: FilesComponent},
      {path: 'qAndA', component: qAndAComponent}
    ],
  },
  {
    path: 'details',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
