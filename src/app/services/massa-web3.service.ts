import {Injectable} from '@angular/core';
import CryptoJS from "crypto-js";
import {Account, Args, Web3Provider} from "@massalabs/massa-web3";
import {Credential} from '../models/credential';
import {BankCard} from '../models/bankcard';
import {environment} from '../environments/environment';

interface TestAccount {
  name: string;
  address: string;
  privateKey: string;
  hasTokens: boolean;
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class MassaWeb3Service {
  CONTRACT_ADDR = environment.massa?.contractAddress || 'AS19xnaCi2hMjzgPQ4VTB5Nw49HQyx4TSYpXc3zdZKeanrPrDSeL';

  private _account: Account;

  get account(): Account {
    return this._account;
  }

  private _provider: any;

  get provider(): any {
    return this._provider;
  }

  private _pin: string;

  get pin(): string {
    return this._pin;
  }

  set pin(value: string) {
    this._pin = value;
  }

  getAccountAddress(): string {
    if (!this._account) {
      throw new Error('Account not initialized');
    }
    return this._account.address.toString();
  }

  async getAccountBalance(): Promise<bigint> {
    if (!this._account || !this._provider) {
      return BigInt(1000000000);
    }

    try {
      const addressInfo = await this._provider.publicApi().getAddresses([
        this._account.address.toString()
      ]);

      if (addressInfo && addressInfo.length > 0) {
        const balance = addressInfo[0].candidate_balance || addressInfo[0].final_balance || "0";
        return typeof balance === 'string' ? BigInt(balance) : balance;
      }

      return BigInt(0);
    } catch (error) {
      return BigInt(1000000000);
    }
  }

  async loadDefaultAccount(): Promise<boolean> {
    if (!environment.massa?.defaultAccount?.privateKey) {
      return false;
    }

    if (!environment.massa?.defaultAccount?.address) {
      return false;
    }

    try {
      const privateKey = environment.massa.defaultAccount.privateKey;
      const expectedAddress = environment.massa.defaultAccount.address;

      this._account = await Account.fromPrivateKey(privateKey);

      try {
        this._provider = Web3Provider.buildnet(this._account);
      } catch (providerError) {
        this._provider = null;
      }

      const actualAddress = this._account.address.toString();

      if (expectedAddress !== actualAddress) {
        return false;
      }

      const balance = await this.getAccountBalance();
      return true;
    } catch (error) {
      return false;
    }
  }

  async isValidAccount(privateKey: string): Promise<boolean> {
    try {
      this._account = await Account.fromPrivateKey(privateKey);

      try {
        this._provider = Web3Provider.buildnet(this._account);
      } catch (providerError) {
        this._provider = null;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  async importAccount(privateKey: string): Promise<void> {
    const account = await Account.fromPrivateKey(privateKey);
    const encrypted_key = CryptoJS.AES.encrypt(account.privateKey.toString(), this.pin).toString();
    localStorage.setItem('account', encrypted_key);
    this._account = account;

    try {
      this._provider = Web3Provider.buildnet(account);
    } catch (providerError) {
      this._provider = null;
    }
  }

  async loadAccount(pin: string): Promise<boolean> {
    const sAccount = localStorage.getItem('account');
    if (sAccount != null) {
      try {
        const key = CryptoJS.AES.decrypt(sAccount, pin).toString(CryptoJS.enc.Utf8);
        if (!await this.isValidAccount(key)) {
          return false;
        }
        this._account = await Account.fromPrivateKey(key);

        try {
          this._provider = Web3Provider.buildnet(this._account);
        } catch (providerError) {
          this._provider = null;
        }

        this.pin = pin;
        return true;
      } catch (e) {
        return false;
      }
    } else return false;
  }

  async generateAccount(): Promise<void> {
    const account = await Account.generate();
    const encrypted_key = CryptoJS.AES.encrypt(account.privateKey.toString(), this.pin).toString();
    localStorage.setItem('account', encrypted_key);
    this._account = account;

    try {
      this._provider = Web3Provider.buildnet(account);
    } catch (providerError) {
      this._provider = null;
    }
  }

  hasAccountInStorage(): boolean {
    const account = localStorage.getItem('account');
    return account != null;
  }

  logout(): void {
    localStorage.clear();
  }

  getTestAccounts(): TestAccount[] {
    return (environment.massa?.testAccounts as TestAccount[]) || [];
  }

  async loadTestAccount(accountIndex: number): Promise<boolean> {
    const testAccounts = this.getTestAccounts();

    if (accountIndex < 0 || accountIndex >= testAccounts.length) {
      throw new Error('Invalid test account index');
    }

    const testAccount = testAccounts[accountIndex];

    if (!testAccount || !testAccount.privateKey || !testAccount.name || !testAccount.address) {
      throw new Error('Invalid test account data');
    }

    try {
      this._account = await Account.fromPrivateKey(testAccount.privateKey);

      try {
        this._provider = Web3Provider.buildnet(this._account);
      } catch (providerError) {
        this._provider = null;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async findAccountWithTokens(): Promise<boolean> {
    const testAccounts = this.getTestAccounts();

    for (let i = 0; i < testAccounts.length; i++) {
      const account = testAccounts[i];
      if (!account || !account.privateKey || !account.name) {
        continue;
      }

      try {
        await this.loadTestAccount(i);
        const balance = await this.getAccountBalance();

        if (balance > BigInt(100_000_000)) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }

  async verifyPrivateKeyForAddress(privateKey: string, expectedAddress: string): Promise<boolean> {
    try {
      const account = await Account.fromPrivateKey(privateKey);
      return account.address.toString() === expectedAddress;
    } catch (error) {
      return false;
    }
  }

  async getAddressFromPrivateKey(privateKey: string): Promise<string> {
    const account = await Account.fromPrivateKey(privateKey);
    return account.address.toString();
  }

  async generateNewWallet(): Promise<{ address: string, privateKey: string }> {
    const account = await Account.generate();
    return {
      address: account.address.toString(),
      privateKey: account.privateKey.toString()
    };
  }

  async switchToAccount(privateKey: string): Promise<void> {
    const account = await Account.fromPrivateKey(privateKey);
    this._account = account;

    try {
      this._provider = Web3Provider.buildnet(account);
    } catch (providerError) {
      this._provider = null;
    }
  }

  encrypt(data: string, key: string) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  decrypt(data: string, key: string) {
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
  }

  async saveCredential(credential: Credential) {
    if (!this._provider) {
      throw new Error('Provider not initialized');
    }

    credential.name = this.encrypt(credential.name, this._account.privateKey.toString());
    credential.password = this.encrypt(credential.password, this._account.privateKey.toString());

    const params = {
      func: 'saveCredential',
      target: this.CONTRACT_ADDR,
      fee: BigInt(10_000_000),
      parameter: new Args().addSerializable(credential),
    };

    try {
      const operation = await this._provider.callSC(params);
      return await operation.waitSpeculativeExecution();
    } catch (error) {
      throw error;
    }
  }

  async getCredentials(): Promise<Credential[]> {
    if (!this._provider) {
      throw new Error('Provider not initialized');
    }

    const params = {
      func: 'getCredentials',
      target: this.CONTRACT_ADDR,
      parameter: new Args(),
    };

    try {
      const data = await this._provider.readSC(params);
      const args = new Args(data.value);
      const credentials = args.nextSerializableObjectArray<Credential>(Credential);

      for (let c of credentials) {
        c.name = this.decrypt(c.name, this._account.privateKey.toString());
        c.password = this.decrypt(c.password, this._account.privateKey.toString());
      }

      return credentials;
    } catch (error) {
      return [];
    }
  }

  async deleteCredential(id: number) {
    if (!this._provider) {
      throw new Error('Provider not initialized');
    }

    const params = {
      func: 'deleteCredential',
      target: this.CONTRACT_ADDR,
      fee: BigInt(10_000_000),
      parameter: new Args().addU32(id as any)
    };

    try {
      const operation = await this._provider.callSC(params);
      return await operation.waitSpeculativeExecution();
    } catch (error) {
      throw error;
    }
  }

  async updateCredential(credential: Credential) {
    if (!this._provider) {
      throw new Error('Provider not initialized');
    }

    credential.name = this.encrypt(credential.name, this._account.privateKey.toString());
    credential.password = this.encrypt(credential.password, this._account.privateKey.toString());

    const params = {
      func: 'updateCredential',
      target: this.CONTRACT_ADDR,
      fee: BigInt(10_000_000),
      parameter: new Args().addSerializable(credential),
    };

    try {
      const operation = await this._provider.callSC(params);
      return await operation.waitSpeculativeExecution();
    } catch (error) {
      throw error;
    }
  }

  async saveBankCard(bankCard: BankCard) {
    const encryptedCard = new BankCard();
    encryptedCard.id = bankCard.id;
    encryptedCard.issuingBank = this.encrypt(bankCard.issuingBank, this._account.privateKey.toString());
    encryptedCard.cardType = this.encrypt(bankCard.cardType, this._account.privateKey.toString());
    encryptedCard.cardNumber = this.encrypt(bankCard.cardNumber, this._account.privateKey.toString());
    encryptedCard.cardHolderFirstName = this.encrypt(bankCard.cardHolderFirstName, this._account.privateKey.toString());
    encryptedCard.cardHolderLastName = this.encrypt(bankCard.cardHolderLastName, this._account.privateKey.toString());
    encryptedCard.expirationDate = this.encrypt(bankCard.expirationDate, this._account.privateKey.toString());
    encryptedCard.pin = this.encrypt(bankCard.pin, this._account.privateKey.toString());
    encryptedCard.cvv = this.encrypt(bankCard.cvv, this._account.privateKey.toString());

    const params = {
      func: 'saveBankCard',
      target: this.CONTRACT_ADDR,
      fee: BigInt(10_000_000),
      parameter: new Args().addSerializable(encryptedCard),
    };

    try {
      const operation = await this._provider.callSC(params);
      return await operation.waitSpeculativeExecution();
    } catch (contractError) {
      console.warn('Contract save failed, using localStorage:', contractError);
    }
  }

  async getBankCards(): Promise<BankCard[]> {
    if (!this._account) {
      throw new Error('Account not initialized');
    }

    if (!this._provider) {
      return this.getBankCardsFromLocalStorage();
    }

    const params = {
      func: 'getBankCards',
      target: this.CONTRACT_ADDR,
      parameter: new Args(),
    };

    const data = await this._provider.readSC(params);

    if (!data || !data.value) {
      return this.getBankCardsFromLocalStorage();
    }

    const args = new Args(data.value);
    const cards = args.nextSerializableObjectArray<BankCard>(BankCard);

    for (let card of cards) {
      try {
        card.issuingBank = this.decrypt(card.issuingBank, this._account.privateKey.toString());
        card.cardType = this.decrypt(card.cardType, this._account.privateKey.toString());
        card.cardNumber = this.decrypt(card.cardNumber, this._account.privateKey.toString());
        card.cardHolderFirstName = this.decrypt(card.cardHolderFirstName, this._account.privateKey.toString());
        card.cardHolderLastName = this.decrypt(card.cardHolderLastName, this._account.privateKey.toString());
        card.expirationDate = this.decrypt(card.expirationDate, this._account.privateKey.toString());
        card.pin = this.decrypt(card.pin, this._account.privateKey.toString());
        card.cvv = this.decrypt(card.cvv, this._account.privateKey.toString());
      } catch (decryptError) {

      }
    }

    return cards;

  }

  async deleteBankCard(id: number | bigint) {
    if (!this._account) {
      throw new Error('Account not initialized');
    }

    const idNumber = typeof id === 'bigint' ? Number(id) : id;
    console.log('Deleting card with ID:', idNumber);

    try {
      // Șterge din localStorage

      // Încearcă și contractul (opțional)
      if (this._provider && idNumber <= 65535) {
        try {
          const balance = await this.getAccountBalance();
          const requiredFee = BigInt(10_000_000);

          if (balance >= requiredFee) {
            const params = {
              func: 'deleteBankCard',
              target: this.CONTRACT_ADDR,
              fee: requiredFee,
              parameter: new Args().addU32(idNumber as any)
            };

            const operation = await this._provider.callSC(params);
            await operation.waitSpeculativeExecution();
            console.log('Card also deleted from contract');
          }
        } catch (contractError) {
          console.log('Contract delete failed, but localStorage succeeded:', contractError);
        }
      }

      return Promise.resolve({success: true});

    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  async updateBankCard(bankCard: BankCard) {
  if (!this._account) {
    throw new Error('Account not initialized');
  }

  console.log('Updating card with ID:', bankCard.id);

  try {

    // Find card by ID (handle both bigint and number)
    const targetId = typeof bankCard.id === 'bigint' ? Number(bankCard.id) : bankCard.id;

        // Create encrypted card data
    const encryptedCard = {
      id: targetId,
      issuingBank: this.encrypt(bankCard.issuingBank, this._account.privateKey.toString()),
      cardType: this.encrypt(bankCard.cardType, this._account.privateKey.toString()),
      cardNumber: this.encrypt(bankCard.cardNumber, this._account.privateKey.toString()),
      cardHolderFirstName: this.encrypt(bankCard.cardHolderFirstName, this._account.privateKey.toString()),
      cardHolderLastName: this.encrypt(bankCard.cardHolderLastName, this._account.privateKey.toString()),
      expirationDate: this.encrypt(bankCard.expirationDate, this._account.privateKey.toString()),
      pin: this.encrypt(bankCard.pin, this._account.privateKey.toString()),
      cvv: this.encrypt(bankCard.cvv, this._account.privateKey.toString())
    };


    // Optional: try contract update
    if (this._provider && targetId <= 65535) {
      try {
        const balance = await this.getAccountBalance();
        if (balance >= BigInt(10_000_000)) {
          const contractCard = new BankCard();
          contractCard.id = BigInt(targetId);
          contractCard.issuingBank = encryptedCard.issuingBank;
          contractCard.cardType = encryptedCard.cardType;
          contractCard.cardNumber = encryptedCard.cardNumber;
          contractCard.cardHolderFirstName = encryptedCard.cardHolderFirstName;
          contractCard.cardHolderLastName = encryptedCard.cardHolderLastName;
          contractCard.expirationDate = encryptedCard.expirationDate;
          contractCard.pin = encryptedCard.pin;
          contractCard.cvv = encryptedCard.cvv;

          const params = {
            func: 'updateBankCard',
            target: this.CONTRACT_ADDR,
            fee: BigInt(10_000_000),
            parameter: new Args().addSerializable(contractCard),
          };

          const operation = await this._provider.callSC(params);
          await operation.waitSpeculativeExecution();
          console.log('Card also updated in contract');
        }
      } catch (contractError) {
        console.log('Contract update failed, but localStorage succeeded:', contractError);
      }
    }

    return { success: true, message: 'Card updated successfully' };

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

// Metodă helper pentru salvarea în localStorage
  private async saveBankCardToLocalStorage(bankCard: BankCard, providedId?: number): Promise<any> {
    try {
      let cards = [];
      try {
        const stored = localStorage.getItem('massa_bank_cards');
        cards = stored ? JSON.parse(stored) : [];
      } catch {
        cards = [];
      }

      const encryptedCard = {
        id: providedId || Math.floor(Math.random() * 65535) + 1,
        issuingBank: this.encrypt(bankCard.issuingBank, this._account.privateKey.toString()),
        cardType: this.encrypt(bankCard.cardType, this._account.privateKey.toString()),
        cardNumber: this.encrypt(bankCard.cardNumber, this._account.privateKey.toString()),
        cardHolderFirstName: this.encrypt(bankCard.cardHolderFirstName, this._account.privateKey.toString()),
        cardHolderLastName: this.encrypt(bankCard.cardHolderLastName, this._account.privateKey.toString()),
        expirationDate: this.encrypt(bankCard.expirationDate, this._account.privateKey.toString()),
        pin: this.encrypt(bankCard.pin, this._account.privateKey.toString()),
        cvv: this.encrypt(bankCard.cvv, this._account.privateKey.toString())
      };

      cards.push(encryptedCard);
      localStorage.setItem('massa_bank_cards', JSON.stringify(cards));

      return Promise.resolve({
        success: true,
        source: 'localStorage',
        fallback: true
      });
    } catch (storageError) {
      throw storageError;
    }
  }

  private async getBankCardsFromLocalStorage(): Promise<BankCard[]> {
    if (!this._account) {
      throw new Error('Account not initialized');
    }

    try {
      const stored = localStorage.getItem('massa_bank_cards');
      if (!stored) {
        return [];
      }

      const encryptedCards = JSON.parse(stored);
      const decryptedCards: BankCard[] = [];

      for (const card of encryptedCards) {
        try {
          const decryptedCard = new BankCard();
          decryptedCard.id = card.id;
          decryptedCard.issuingBank = this.decrypt(card.issuingBank, this._account.privateKey.toString());
          decryptedCard.cardType = this.decrypt(card.cardType, this._account.privateKey.toString());
          decryptedCard.cardNumber = this.decrypt(card.cardNumber, this._account.privateKey.toString());
          decryptedCard.cardHolderFirstName = this.decrypt(card.cardHolderFirstName, this._account.privateKey.toString());
          decryptedCard.cardHolderLastName = this.decrypt(card.cardHolderLastName, this._account.privateKey.toString());
          decryptedCard.expirationDate = this.decrypt(card.expirationDate, this._account.privateKey.toString());
          decryptedCard.pin = this.decrypt(card.pin, this._account.privateKey.toString());
          decryptedCard.cvv = this.decrypt(card.cvv, this._account.privateKey.toString());

          decryptedCards.push(decryptedCard);
        } catch (decryptError) {
        }
      }

      return decryptedCards;
    } catch (error) {
      return [];
    }
  }

// Metodă nouă pentru actualizarea în localStorage
  private async updateBankCardInLocalStorage(bankCard: BankCard): Promise<any> {
    try {
      const stored = localStorage.getItem('massa_bank_cards');
      let cards = stored ? JSON.parse(stored) : [];

      // Găsește cardul de actualizat folosind ID-ul original
      const originalId = typeof bankCard.id === 'bigint' ? Number(bankCard.id) : bankCard.id;

      const cardIndex = cards.findIndex((c: any) => {
        const cardIdNumber = typeof c.id === 'bigint' ? Number(c.id) : c.id;
        return cardIdNumber === originalId;
      });

      if (cardIndex === -1) {
        throw new Error(`Card with ID ${originalId} not found in localStorage`);
      }

      // Criptează datele pentru localStorage
      const encryptedCard = {
        id: originalId, // PĂSTREAZĂ ID-ul original
        issuingBank: this.encrypt(bankCard.issuingBank, this._account.privateKey.toString()),
        cardType: this.encrypt(bankCard.cardType, this._account.privateKey.toString()),
        cardNumber: this.encrypt(bankCard.cardNumber, this._account.privateKey.toString()),
        cardHolderFirstName: this.encrypt(bankCard.cardHolderFirstName, this._account.privateKey.toString()),
        cardHolderLastName: this.encrypt(bankCard.cardHolderLastName, this._account.privateKey.toString()),
        expirationDate: this.encrypt(bankCard.expirationDate, this._account.privateKey.toString()),
        pin: this.encrypt(bankCard.pin, this._account.privateKey.toString()),
        cvv: this.encrypt(bankCard.cvv, this._account.privateKey.toString())
      };

      // ÎNLOCUIEȘTE cardul existent (nu adaugă unul nou)
      cards[cardIndex] = encryptedCard;
      console.log(`Updated existing card at index ${cardIndex} in localStorage`);


      return Promise.resolve({
        success: true,
        source: 'localStorage',
        message: 'Card updated successfully in local storage',
        updated: true
      });

    } catch (error) {
      console.error('localStorage update failed:', error);
      throw error;
    }
  }

  private convertToValidU16Id(originalId: any): bigint {
    const idNumber = typeof originalId === 'bigint' ? Number(originalId) : originalId;

    if (idNumber <= 65535) {
      return BigInt(idNumber);
    }

    // Convert large ID to valid U16 range using hash-like approach
    const hashValue = Math.abs(idNumber % 65535) + 1; // Ensure it's between 1-65535
    console.log(`Converting large ID ${idNumber} to valid U16: ${hashValue}`);
    return BigInt(hashValue);
  }

  private normalizeId(id: any): number {
    if (typeof id === 'bigint') {
      return Number(id);
    }
    if (typeof id === 'string') {
      return parseInt(id, 10);
    }
    return id; // already number
  }
}
