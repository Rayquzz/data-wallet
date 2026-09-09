import { Args, Serializable } from '@massalabs/massa-web3';

export class Credential implements Serializable<Credential> {
  public id = 0n;

  constructor(public name: string = '', public password: string = '') {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU16(this.id)
      .addString(this.name)
      .addString(this.password)
      .serialize();

    return new Uint8Array(args);
  }

  deserialize(data: Uint8Array, offset: number) {
    const args = new Args(data, offset);

    this.id = args.nextU16();
    this.name = args.nextString();
    this.password = args.nextString();

    return { instance: this, offset: args.getOffset() };
  }
}
