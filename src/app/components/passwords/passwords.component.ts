import {Component, OnInit} from '@angular/core';
import {MassaWeb3Service} from '../../services/massa-web3.service';
import {Credential} from '../../models/credential';

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss'],
  standalone: false,
})
export class PasswordsComponent implements OnInit {
  credentials: any[] = [];
  showLoading = false;

  constructor(private massaWeb3: MassaWeb3Service) {
  }

  enableLoading() {
    this.showLoading = true;
  }

  disableLoading() {
    this.showLoading = false;
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.credentials = [];
    this.massaWeb3.getCredentials().then(result => {
      for (let v of result) {
        const pw = {
          id: v.id,
          name: v.name,
          password: v.password,
          editing: false,
          showPassword: false,
          originalData: null,
        }
        this.credentials.push(pw);
      }
    });
  }

  /**
   * Toggle pentru afișarea/ascunderea parolei individuale
   */
  togglePassword(password: any): void {
    password.showPassword = !password.showPassword;
    console.log(
      'Password visibility toggle for',
      password.name,
      ':',
      password.showPassword ? 'Showing' : 'Hiding'
    );
  }

  /**
   * Adaugă o parolă nouă în listă
   */
  addPassword(): void {
    const newPassword = {
      id: ``,
      name: ``,
      category: '',
      editing: true,
      showPassword: true,
      originalData: null,
    };

    this.credentials = [...this.credentials, newPassword];
  }

  /**
   * Activează modul de editare pentru o parolă
   */
  editPassword(password: any): void {
    password.originalData = {
      name: password.name,
      password: password.password,
    };

    password.editing = true;
    password.showPassword = true;
    console.log('Editing password:', password);
  }

  /**
   * Salvează modificările parolei
   */
  savePassword(credential: any): void {
    if (!credential.name || !credential.password) {
      alert('Please fill all fields with valid data!');
      return;
    }

    credential.editing = false;
    credential.showPassword = false;
    credential.originalData = null;
    const pw = new Credential();
    pw.id = credential.id;
    pw.name = credential.name;
    pw.password = credential.password;
    this.enableLoading();
    if (credential.id) {
      this.massaWeb3.updateCredential(pw).then(async () => {
        await this.loadData();
        this.disableLoading();
      });
    } else {
      this.massaWeb3.saveCredential(pw).then(async () => {
        await this.loadData();
        this.disableLoading();
      });
    }
  }

  /**
   * Anulează editarea și restaurează datele originale
   */
  cancelEdit(password: any): void {
    if (password.originalData) {
      password.name = password.originalData.name;
      password.password = password.originalData.password;
      password.originalData = null;
    } else {
      const index = this.credentials.findIndex((p) => p.id === password.id);
      if (index > -1) {
        this.credentials.splice(index, 1);
        this.credentials = [...this.credentials];
      }
    }

    password.editing = false;
    password.showPassword = false;
    console.log('Edit cancelled for password:', password);
  }

  /**
   * Șterge o parolă din listă
   */
  deletePassword(index: number): void {
    const password = this.credentials[index];

    if (confirm(`Are you sure you want to delete "${password.name}"?`)) {
     this.enableLoading();
     this.massaWeb3.deleteCredential(index).then(async () => {
       await this.loadData();
       this.disableLoading();
     })
    }
  }
}

