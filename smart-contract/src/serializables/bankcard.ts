import { Args, Serializable } from '@massalabs/massa-web3';

export class BankCard implements Serializable<BankCard> {
    public id = 0n;

    constructor(
                public issuingBank: string = '',
                public cardType: string = '',
                public cardNumber: string = '',
                public cardHolderFirstName: string = '',
                public cardHolderLastName: string = '',
                public expirationDate: string = '',
                public pin: string = '',
                public cvv: string = ''
    ) {}

    serialize(): Uint8Array {
        const args = new Args()
                        .addU16(this.id)
                        .addString(this.issuingBank)
                        .addString(this.cardType)
                        .addString(this.cardNumber)
                        .addString(this.cardHolderFirstName)
                        .addString(this.cardHolderLastName)
                        .addString(this.expirationDate)
                        .addString(this.cvv)
                        .addString(this.pin)
                        .serialize();

        return new Uint8Array(args);
    }

    deserialize(data: Uint8Array, offset: number) {
        const args = new Args(data, offset);

        this.id = args.nextU16();
        this.issuingBank = args.nextString();
        this.cardType = args.nextString();
        this.cardNumber = args.nextString();
        this.cardHolderFirstName = args.nextString();
        this.cardHolderLastName = args.nextString();
        this.expirationDate = args.nextString();
        this.pin = args.nextString();
        this.cvv = args.nextString();

        return { instance: this, offset: args.getOffset() };
    }
}
