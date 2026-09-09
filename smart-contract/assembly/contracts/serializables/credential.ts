import { Args, Result, Serializable } from '@massalabs/as-types';

export class Credential implements Serializable {
  constructor(
    public id: u16 = u16(0),
    public name: string = '',
    public password: string = '',
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.name)
      .add(this.password)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);

    this.id = args.nextU16().expect('Missing id');
    this.name = args.nextString().expect('Missing name');
    this.password = args.nextString().expect('Missing password');

    return new Result(args.offset);
  }
}
