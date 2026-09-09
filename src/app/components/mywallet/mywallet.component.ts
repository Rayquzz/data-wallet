import {Component, OnInit} from '@angular/core';
import {MassaWeb3Service} from '../../services/massa-web3.service';

@Component({
  selector: 'app-mywallet',
  standalone: false,
  templateUrl: './mywallet.component.html',
  styleUrl: './mywallet.component.scss',
})
export class MywalletComponent implements OnInit {
  privateKey = '';
  publicKey = '';
  address = '';
  balance = 0;

  showPrivate = false;

  // Toast notification properties
  showToast = false;
  toastMessage = '';

  constructor(private massaWeb3: MassaWeb3Service) {

  }

  get hiddenPrivate() {
    return ''.padEnd(this.privateKey.length, '•');
  }

  async ngOnInit(): Promise<void> {
    const account = this.massaWeb3.account;
    this.privateKey = account.privateKey.toString();
    this.address = account.address.toString();
    this.publicKey = account.publicKey.toString();
    const bal = await this.massaWeb3.provider.balance(false);
    this.balance = Number(bal) / 10**9;
  }

  toggle(type: string) {
    if (type === 'private') this.showPrivate = !this.showPrivate;
  }

  copyToClipboard(text: string, label: string): void {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showToastMessage(`${label} copied!`);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          this.showToastMessage('Failed to copy!');
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        this.showToastMessage(`${label} copied!`);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        this.showToastMessage('Failed to copy!');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    // Hide toast after 2 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }
}
