import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MassaWeb3Service} from '../../services/massa-web3.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent {

  constructor(
    private router: Router,
    private massaWeb3: MassaWeb3Service
  ) {
  }


  async importPhrase(): Promise<void> {
    const input = window.prompt("Introduceți fraza pentru verificare:");

    if (input !== null) {
      const isValid = this.massaWeb3.isValidAccount(input);
      if (!isValid) {
        //todo add alert
      }

      await this.massaWeb3.importAccount(input);
      await this.router.navigate(['/home']);
    }
  }

  // Funcția pentru Generate
  async onGenerate() {
    await this.massaWeb3.generateAccount();
    await this.router.navigate(['/home']);
  }
}
