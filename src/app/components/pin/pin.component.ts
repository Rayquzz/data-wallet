import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {MassaWeb3Service} from '../../services/massa-web3.service';
import { AlertService}  from '../../alert.service';

@Component({
  selector: 'app-pin',
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})

export class PinComponent implements OnInit {
  pin: string = '';
  confirmPin: string | null = null;
  maxLength: number = 4;
  dots: number[] = [];
  pinText = 'Enter your PIN';


  constructor(
    private router: Router,
    private massaWeb3: MassaWeb3Service,
    private alert: AlertService,
  ) {}

  ngOnInit() {
    this.dots = Array(this.maxLength).fill(0);
  }

  addDigit(num: number, form: NgForm) {
    if (this.pin.length < this.maxLength) {
      this.pin += num;
      form.control.markAsDirty();
    }
    if (this.pin.length === this.maxLength) {
      this.submitPin(form);
    }
  }

  deleteDigit(form: NgForm) {
    this.pin = this.pin.slice(0, -1);
    form.control.markAsDirty();
  }

  submitPin(form: NgForm) {
    if (this.pin.length !== this.maxLength) return;

    const isRegistered = this.massaWeb3.hasAccountInStorage();

    if (!isRegistered && !this.confirmPin) {
      this.confirmPin = this.pin;
      form.resetForm();
      form.control.markAsDirty();
      this.pin = '';
      this.pinText = 'Confirm PIN';
    } else if (isRegistered) {
      this.massaWeb3.loadAccount(this.pin).then(value => {
        if (value) {
          this.massaWeb3.pin = this.pin;
          localStorage.setItem('pinValid', 'true');
          this.router.navigate(['/home']).then();
        } else {
          this.alert.showError('Incorrect PIN, try again!');
          this.pin = '';
          form.resetForm();
          console.log('pin incorrect')
        }
      });
    } else {
      if (this.pin !== this.confirmPin) {
        form.resetForm();
        form.control.markAsDirty();
        this.pin = '';
        this.confirmPin = null;
        this.alert.showError('PIN not matching, try again!');
        console.log('error')
      } else {
        this.massaWeb3.pin = this.pin;
        localStorage.setItem('pinValid', 'true');
        this.router.navigate(['/import']).then();
      }
    }
  }
}


