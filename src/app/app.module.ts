import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {ButtonModule} from 'primeng/button';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {HomeComponent} from './components/home/home.component';
import {DrawerModule} from 'primeng/drawer';
import {DetailsComponent} from './components/details/details.component';
import {MenuModule} from 'primeng/menu';
import {PasswordsComponent} from './components/passwords/passwords.component';
import {AboutComponent} from './components/about/about.component';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FloatLabelModule} from 'primeng/floatlabel';
import {MywalletComponent} from './components/mywallet/mywallet.component';
import {TableModule} from 'primeng/table';
import {FilesComponent} from './components/files/files.component';
import {ImportComponent} from './components/import/import.component';
import {UploadDocumentComponent} from './components/upload-document/upload-document.component';
import {CommonModule} from '@angular/common';
import {CardsComponent} from './components/cards/add-card.component';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {RippleModule} from 'primeng/ripple';
import { qAndAComponent } from './components/qAndA/qAndA.component';

@NgModule({
  declarations: [
    AppComponent,
    DetailsComponent,
    HomeComponent,
    PasswordsComponent,
    AboutComponent,
    AboutComponent, //3 about?
    MywalletComponent,
    MywalletComponent,
    AboutComponent,
    qAndAComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    DrawerModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    TableModule,
    FilesComponent,
    ImportComponent,
    CommonModule,
    FormsModule,
    ToastModule,
    RippleModule,
    ImportComponent,
    ReactiveFormsModule,
    UploadDocumentComponent,
    CommonModule,
    CardsComponent
  ],
  providers: [
    MessageService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
