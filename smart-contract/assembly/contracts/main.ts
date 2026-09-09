import {Context, generateEvent, setBytecode, Storage,} from '@massalabs/massa-as-sdk';
import {onlyOwner, setOwner,} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import {Args, bytesToU16, stringToBytes, u16ToBytes,} from '@massalabs/as-types';
import {getBankCardIndexKey, getBankCardKey, getBankCardKeyPrefix, getPwIndexKey, getPwKey, getPwKeyPrefix} from './utils/storage-keys';
import {Credential} from './serializables/credential';
import {BankCard} from './serializables/bankcard';

export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());
  setOwner(new Args().add(Context.caller().toString()).serialize());
  generateEvent('SC successfully deployed');
}

export function adminUpgradeSmartContract(newBytecode: StaticArray<u8>): void {
  onlyOwner();
  setBytecode(newBytecode);
  generateEvent('Contract successfully updated');
}

export function saveCredential(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const iCredential = args
    .nextSerializable<Credential>()
    .expect('Missing credentials');

  const pwIndexKey = getPwIndexKey(Context.caller().toString());
  let index: u16 = u16(0);
  if (!Storage.has(pwIndexKey)) {
    index = u16(1);
    Storage.set(pwIndexKey, u16ToBytes(index));
  } else {
    const id = Storage.get(pwIndexKey);
    index = bytesToU16(id) + 1;
    Storage.set(pwIndexKey, u16ToBytes(index));
  }

  const credential = new Credential(
    index,
    iCredential.name,
    iCredential.password,
  );
  const pwKey = getPwKey(Context.caller().toString(), index);

  Storage.set(pwKey, credential.serialize());

  generateEvent(
    `New password saved successfully for user ${Context.caller().toString()}`,
  );
}

export function getCredentials(_: StaticArray<u8>): StaticArray<u8> {
  const pwKeyPrefix = getPwKeyPrefix(Context.caller().toString());

  const keys: Array<StaticArray<u8>> = Storage.getKeys(
    stringToBytes(pwKeyPrefix),
  );

  let credentials: Credential[] = [];

  for (let i: u32 = 0; i < u32(keys.length); i++) {
    const credential = new Args(Storage.get(keys[i]))
      .nextSerializable<Credential>()
      .unwrap();
    credentials.push(credential);
    generateEvent(`${credential.name} -- ${credential.password}`);
  }

  return new Args()
    .addSerializableObjectArray<Credential>(credentials)
    .serialize();
}

export function deleteCredential(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const id = args.nextU16().expect('Missing id');

  const pwKey = getPwKey(Context.caller().toString(), id);
  Storage.del(pwKey);

  generateEvent(
    `Password ${id} successfully deleted for user ${Context.caller().toString()}`,
  );
}

export function updateCredential(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const iCredential = args
    .nextSerializable<Credential>()
    .expect('Missing credentials');

  const pwKey = getPwKey(Context.caller().toString(), iCredential.id);
  
  if (!Storage.has(pwKey)) {
    throw new Error(`Credential with id ${iCredential.id} does not exist`);
  }

  const credential = new Credential(
    iCredential.id,
    iCredential.name,
    iCredential.password
  );

  Storage.set(pwKey, credential.serialize());

  generateEvent(
    `Credential ${credential.id} successfully updated for user ${Context.caller().toString()}`
  );
}

// Bank Card functions


export function saveBankCard(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const iBankCard = args
    .nextSerializable<BankCard>()
    .expect('Missing bank card data');

  const indexKey = getBankCardIndexKey(Context.caller().toString());
  let index: u16 = u16(0);
  if (!Storage.has(indexKey)) {
    index = u16(1);
    Storage.set(indexKey, u16ToBytes(index));
  } else {
    const id = Storage.get(indexKey);
    index = bytesToU16(id) + 1;
    Storage.set(indexKey, u16ToBytes(index));
  }

  const bankcard = new BankCard(
    index,
    iBankCard.issuingBank,
    iBankCard.cardType,
    iBankCard.cardNumber,
    iBankCard.cardHolderFirstName,
    iBankCard.cardHolderLastName,
    iBankCard.expirationDate,
    iBankCard.pin,
    iBankCard.cvv
  );
  
  const cardKey = getBankCardKey(Context.caller().toString(), index);
  Storage.set(cardKey, bankcard.serialize());

  generateEvent(
    `New bank card saved successfully for user ${Context.caller().toString()}`
  );
}

export function getBankCards(_: StaticArray<u8>): StaticArray<u8> {
  const keyPrefix = getBankCardKeyPrefix(Context.caller().toString());
  const keys: Array<StaticArray<u8>> = Storage.getKeys(
    stringToBytes(keyPrefix)
  );

  let cards: BankCard[] = [];

  for (let i: u32 = 0; i < u32(keys.length); i++) {
    const card = new Args(Storage.get(keys[i]))
      .nextSerializable<BankCard>()
      .unwrap();
    cards.push(card);
  }

  return new Args()
    .addSerializableObjectArray<BankCard>(cards)
    .serialize();
}

export function deleteBankCard(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const id = args.nextU16().expect('Missing id');

  const cardKey = getBankCardKey(Context.caller().toString(), id);
  Storage.del(cardKey);

  generateEvent(
    `Bank card ${id} successfully deleted for user ${Context.caller().toString()}`
  );
}

export function updateBankCard(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const iCard = args
    .nextSerializable<BankCard>()
    .expect('Missing bank card data');

  const cardKey = getBankCardKey(Context.caller().toString(), iCard.id);
  
  if (!Storage.has(cardKey)) {
    throw new Error(`Bank card with id ${iCard.id} does not exist`);
  }

  const bankcard = new BankCard(
    iCard.id,
    iCard.issuingBank,
    iCard.cardType,
    iCard.cardNumber,
    iCard.cardHolderFirstName,
    iCard.cardHolderLastName,
    iCard.expirationDate,
    iCard.pin,
    iCard.cvv
  );

  Storage.set(cardKey, bankcard.serialize());

  generateEvent(
    `Bank card ${bankcard.id} successfully updated for user ${Context.caller().toString()}`
  );
}
