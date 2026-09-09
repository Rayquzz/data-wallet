import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MassaWeb3Service } from '../../services/massa-web3.service';
import { BankCard } from '../../models/bankcard';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cards',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CardsComponent implements OnInit {
  cards: any[] = [];
  showLoading = false;
  showForm = false;
  cardForm: FormGroup;
  currentYear = new Date().getFullYear();
  editingIndex: number | null = null;

  // Wallet status properties
  walletConnected = false;
  walletAddress = '';
  walletBalance = '';
  showWalletInfo = false;

  cardTypes = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'MasterCard' },
    { value: 'american-express', label: 'American Express' },
    { value: 'maestro', label: 'Maestro' },
    { value: 'discover', label: 'Discover' },
    { value: 'diners', label: 'Diners Club' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private massaWeb3: MassaWeb3Service,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.cardForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.maxLength(30)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/), this.expiryYearValidator.bind(this)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      type: ['', Validators.required]
    });
  }

  enableLoading(): void {
    this.showLoading = true;
  }

  disableLoading(): void {
    this.showLoading = false;
  }

  async ngOnInit(): Promise<void> {
    console.log('CardsComponent initialized');
    console.log('Environment config:', environment.massa);

    await this.initializeWallet();

    if (this.walletConnected) {
      await this.loadData();
    }
  }

  async initializeWallet(): Promise<void> {
    console.log('Initializing wallet...');

    if (!environment.massa.defaultAccount?.privateKey) {
      console.warn('No wallet credentials found in environment');
      console.log('Please configure environment.local.ts with your wallet data');
      alert('Wallet not configured! Please add your wallet credentials to environment.local.ts and restart with --configuration=local');
      return;
    }

    try {
      this.enableLoading();

      // Check if wallet methods exist
      if (!this.massaWeb3.loadDefaultAccount) {
        console.error('loadDefaultAccount method not found in MassaWeb3Service');
        alert('Wallet service not properly configured');
        return;
      }

      const success = await this.massaWeb3.loadDefaultAccount();

      if (success) {
        this.walletAddress = this.massaWeb3.getAccountAddress();
        const balance = await this.massaWeb3.getAccountBalance();
        const balanceInMAS = Number(balance) / 1e9;
        this.walletBalance = `${balanceInMAS.toFixed(4)} MAS`;
        this.walletConnected = true;

        console.log('Wallet connected successfully!');
        console.log('Address:', this.walletAddress);
        console.log('Balance:', this.walletBalance);
      } else {
        console.error('Failed to connect wallet');
        alert('Failed to connect to wallet. Please check your credentials.');
      }
    } catch (error) {
      console.error('Wallet initialization error:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as any).message
        : 'Unknown error';
      alert('Error connecting to wallet: ' + errorMessage);
    } finally {
      this.disableLoading();
    }
  }

  async reconnectWallet(): Promise<void> {
    console.log('Reconnecting wallet...');
    await this.initializeWallet();

    if (this.walletConnected) {
      await this.loadData();
    }
  }

  toggleWalletInfo(): void {
    this.showWalletInfo = !this.showWalletInfo;
  }

  async copyWalletAddress(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.walletAddress);
      alert('Wallet address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
      const textArea = document.createElement('textarea');
      textArea.value = this.walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Wallet address copied to clipboard!');
    }
  }

  async checkBalance(): Promise<void> {
    if (!this.walletConnected) {
      alert('Wallet not connected!');
      return;
    }

    try {
      this.enableLoading();
      const balance = await this.massaWeb3.getAccountBalance();
      const balanceInMAS = Number(balance) / 1e9;
      this.walletBalance = `${balanceInMAS.toFixed(4)} MAS`;

      alert(`Current Balance: ${this.walletBalance}`);
      console.log('Balance updated:', this.walletBalance);
    } catch (error) {
      console.error('Error checking balance:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as any).message
        : 'Unknown error';
      alert('Error checking balance: ' + errorMessage);
    } finally {
      this.disableLoading();
    }
  }

  async loadData(): Promise<void> {
    if (!this.walletConnected) {
      console.warn('Wallet not connected, cannot load cards');
      return;
    }

    console.log('Loading cards data...');
    this.cards = [];

    try {
      this.enableLoading();
      const result = await this.massaWeb3.getBankCards();

      for (let v of result) {
        const card = {
          id: v.id,
          issuingBank: v.issuingBank,
          cardType: v.cardType,
          cardNumber: v.cardNumber,
          cardHolderFirstName: v.cardHolderFirstName,
          cardHolderLastName: v.cardHolderLastName,
          expirationDate: v.expirationDate,
          pin: v.pin,
          cvv: v.cvv,
          // UI properties
          firstName: v.cardHolderFirstName,
          lastName: v.cardHolderLastName,
          expiryMonth: this.getMonthFromDate(v.expirationDate),
          expiryYear: this.getYearFromDate(v.expirationDate),
          editing: false,
          showNumber: false,
          showCvv: false,
          showPin: false,
          originalData: null,
        };
        this.cards.push(card);
      }

      console.log(`Loaded ${this.cards.length} cards`);

    } catch (error) {
      console.error('Error loading cards:', error);
      if (error && typeof error === 'object' && 'message' in error &&
          typeof (error as any).message === 'string' &&
          (error as any).message.includes('Insufficient balance')) {
        alert('Insufficient balance to read data. Please add funds to your wallet.');
      } else {
        console.log('No cards found or contract not initialized yet.');
      }
    } finally {
      this.disableLoading();
    }
  }

  private getMonthFromDate(expirationDate: string): number {
    if (!expirationDate) return 1;
    const parts = expirationDate.split('/');
    return parseInt(parts[0]) || 1;
  }

  private getYearFromDate(expirationDate: string): number {
    if (!expirationDate) return this.currentYear;
    const parts = expirationDate.split('/');
    return parseInt(parts[1]) || this.currentYear;
  }

  expiryYearValidator(control: any) {
    const value = Number(control.value);
    if (!value || isNaN(value)) return { invalidExpiry: true };
    if (value < this.currentYear || value > this.currentYear + 20) {
      return { invalidExpiry: true };
    }
    return null;
  }

  getCardNumberInputValue(): string {
    return this.cardForm?.get('cardNumber')?.value || '';
  }

  onCardNumberInput(event: any): void {
    let val: string = event.target.value || '';
    val = val.replace(/\D/g, '').slice(0, 16);
    const parts = val.match(/.{1,4}/g);
    event.target.value = parts ? parts.join(' ') : '';
    this.cardForm.get('cardNumber')?.setValue(val, { emitEvent: false });
  }

  formatCardNumberForDisplay(num: string, showFull = false): string {
    if (!num) return '#### #### #### ####';
    const digits = num.replace(/\s+/g, '');
    if (showFull) {
      return digits.replace(/(\d{4})/g, '$1 ').trim();
    }
    return '•••• •••• •••• ' + digits.slice(-4);
  }

  getCardTypeLabel(type?: string): string {
    if (!type) return '';
    const cardType = this.cardTypes.find(ct => ct.value === type);
    return cardType ? cardType.label : (type.charAt(0).toUpperCase() + type.slice(1));
  }

  toggleShowNumber(card: any): void {
    card.showNumber = !card.showNumber;
    if (card.showNumber) {
      setTimeout(() => card.showNumber = false, 5000);
    }
    console.log('Card number visibility toggle for', card.firstName, card.lastName, ':', card.showNumber ? 'Showing' : 'Hiding');
  }

  toggleShowCvv(card: any): void {
    card.showCvv = !card.showCvv;
    if (card.showCvv) {
      setTimeout(() => card.showCvv = false, 5000);
    }
    console.log('CVV visibility toggle for', card.firstName, card.lastName, ':', card.showCvv ? 'Showing' : 'Hiding');
  }

  toggleShowPin(card: any): void {
    card.showPin = !card.showPin;
    if (card.showPin) {
      setTimeout(() => card.showPin = false, 5000);
    }
    console.log('PIN visibility toggle for', card.firstName, card.lastName, ':', card.showPin ? 'Showing' : 'Hiding');
  }

  addCard(): void {
    if (!this.walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    this.showForm = true;
    this.editingIndex = null;
    this.cardForm.reset();
  }

  editCard(index: number): void {
    if (!this.walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const card = this.cards[index];

    card.originalData = {
      firstName: card.firstName,
      lastName: card.lastName,
      cardNumber: card.cardNumber,
      cardType: card.cardType,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv,
      pin: card.pin,
    };

    this.editingIndex = index;
    this.showForm = true;

    this.cardForm.setValue({
      firstName: card.firstName,
      lastName: card.lastName,
      cardNumber: card.cardNumber,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv,
      pin: card.pin,
      type: card.cardType
    });

    console.log('Editing card:', card);
  }

  saveCard(): void {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      alert('Please fill all fields with valid data!');
      return;
    }

    if (!this.walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const formValue = this.cardForm.value;

    const bankCard = new BankCard();
    bankCard.issuingBank = 'Default Bank';
    bankCard.cardType = formValue.type;
    bankCard.cardNumber = formValue.cardNumber.replace(/\s+/g, '');
    bankCard.cardHolderFirstName = formValue.firstName.trim();
    bankCard.cardHolderLastName = formValue.lastName.trim();
    bankCard.expirationDate = `${formValue.expiryMonth.toString().padStart(2, '0')}/${formValue.expiryYear}`;
    bankCard.pin = formValue.pin;
    bankCard.cvv = formValue.cvv;

    this.enableLoading();
    this.showForm = false;

    if (this.editingIndex !== null && this.editingIndex >= 0) {
      const existingCard = this.cards[this.editingIndex];
      bankCard.id = existingCard.id;

      console.log('Updating card...');
      this.massaWeb3.updateBankCard(bankCard).then(async () => {
        console.log('Card updated successfully!');
        await this.loadData();
        this.disableLoading();
        this.editingIndex = null;
      }).catch(error => {
        console.error('Error updating card:', error);
        const errorMessage = error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Unknown error';

        this.disableLoading();
        alert('Error updating card: ' + errorMessage);
        this.showForm = true;
      });
    } else {
      console.log('Saving new card...');
      this.massaWeb3.saveBankCard(bankCard).then(async () => {
        console.log('Card saved successfully!');
        await this.loadData();
        this.disableLoading();
      }).catch(error => {
        console.error('Error saving card:', error);
        const errorMessage = error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Unknown error';
        this.disableLoading();
        alert('Error saving card: ' + errorMessage);
      });
    }
  }

  confirmDelete(index: number): void {
    this.deleteCard(index);
  }

  deleteCard(index: number): void {
    if (!this.walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const card = this.cards[index];

    if (confirm(`Are you sure you want to delete the card for "${card.firstName} ${card.lastName}"?`)) {
      console.log('Deleting card...');
      this.enableLoading();

      this.massaWeb3.deleteBankCard(Number(card.id)).then(async () => {
        console.log('Card deleted successfully!');
        await this.loadData();
        this.disableLoading();
      }).catch(error => {
        console.error('Error deleting card:', error);
        const errorMessage = error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Unknown error';
        this.disableLoading();
        alert('Error deleting card: ' + errorMessage);
      });
    }
  }

  cancelEdit(): void {
    if (this.editingIndex !== null && this.editingIndex >= 0) {
      const card = this.cards[this.editingIndex];
      if (card.originalData) {
        card.firstName = card.originalData.firstName;
        card.lastName = card.originalData.lastName;
        card.cardNumber = card.originalData.cardNumber;
        card.cardType = card.originalData.cardType;
        card.expiryMonth = card.originalData.expiryMonth;
        card.expiryYear = card.originalData.expiryYear;
        card.cvv = card.originalData.cvv;
        card.pin = card.originalData.pin;
        card.originalData = null;
      }
    }

    this.showForm = false;
    this.editingIndex = null;
    this.cardForm.reset();

    console.log('Edit cancelled');
  }

  toggleForm(editIndex: number | null = null): void {
    if (editIndex !== null) {
      this.editCard(editIndex);
    } else {
      if (this.showForm) {
        this.cancelEdit();
      } else {
        this.addCard();
      }
    }
  }

  async recreateCardWithValidId(index: number): Promise<void> {
    if (!this.walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const card = this.cards[index];
    const idNumber = typeof card.id === 'bigint' ? Number(card.id) : card.id;

    if (!confirm(`Are you sure you want to recreate the card for "${card.firstName} ${card.lastName}"? This will create a new card with a valid ID and delete the old one.`)) {
      return;
    }

    console.log(`Recreating card with ID ${idNumber}...`);
    this.enableLoading();

    try {
      const newBankCard = new BankCard();
      newBankCard.issuingBank = card.issuingBank;
      newBankCard.cardType = card.cardType;
      newBankCard.cardNumber = card.cardNumber;
      newBankCard.cardHolderFirstName = card.cardHolderFirstName;
      newBankCard.cardHolderLastName = card.cardHolderLastName;
      newBankCard.expirationDate = card.expirationDate;
      newBankCard.pin = card.pin;
      newBankCard.cvv = card.cvv;

      await this.massaWeb3.saveBankCard(newBankCard);

      console.log('Card recreated successfully!');
      await this.loadData();
      alert('Card recreated with valid ID!');

    } catch (error) {
      console.error('Error recreating card:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as any).message
        : 'Unknown error';
      alert('Error recreating card: ' + errorMessage);
    } finally {
      this.disableLoading();
    }
  }

  private checkCardIds(): void {
    console.log('Checking card IDs for U16 compatibility...');

    this.cards.forEach((card, index) => {
      const idNumber = typeof card.id === 'bigint' ? Number(card.id) : card.id;
      console.log(`Card ${index}: ID = ${idNumber} (${typeof card.id})`);
    });
  }
}
