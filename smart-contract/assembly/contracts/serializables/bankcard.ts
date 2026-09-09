import { Args, Result, Serializable } from '@massalabs/as-types';

export class BankCard implements Serializable {
    constructor(
        public id: u16 = u16(0),
        public issuingBank: string = '',
        public cardType: string = '',
        public cardNumber: string = '',
        public cardHolderFirstName: string = '',
        public cardHolderLastName: string = '', 
        public expirationDate: string = '',
        public pin: string = '',
        public cvv: string = '',
    ) {}

    serialize(): StaticArray<u8> {
        return new Args()
            .add(this.id)
            .add(this.issuingBank)
            .add(this.cardType)
            .add(this.cardNumber)
            .add(this.cardHolderFirstName)
            .add(this.cardHolderLastName)
            .add(this.expirationDate)
            .add(this.pin)
            .add(this.cvv)
            .serialize();
    }

    deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
        const args = new Args(data, offset);

        this.id = args.nextU16().expect('Missing id');
        this.issuingBank = args.nextString().expect('Missing issuing bank');
        this.cardType = args.nextString().expect('Missing card type');
        this.cardNumber = args.nextString().expect('Missing card number');
        this.cardHolderFirstName = args.nextString().expect('Missing card holder first name');
        this.cardHolderLastName = args.nextString().expect('Missing card holder last name');
        this.expirationDate = args.nextString().expect('Missing expiration date');
        this.pin = args.nextString().expect('Missing pin');
        this.cvv = args.nextString().expect('Missing cvv');

        return new Result(args.offset);
    }
}