import { stringToBytes } from '@massalabs/as-types';

export const PW_INDEX_KEY = 'PW_{{address}}_INDEX';
export const PW_KEY = 'PW_{{address}}_DATA_{{index}}';
export const BANK_CARD_INDEX_KEY = 'BANK_CARD_{{address}}_INDEX';
export const BANK_CARD_KEY = 'BANK_CARD_{{address}}_DATA_{{index}}';

export function getPwIndexKey(address: string): StaticArray<u8> {
  return stringToBytes(PW_INDEX_KEY.replace('{{address}}', address));
}

export function getPwKey(address: string, index: u16): StaticArray<u8> {
  return stringToBytes(
    PW_KEY.replace('{{address}}', address).replace(
      '{{index}}',
      index.toString(),
    ),
  );
}

export function getPwKeyPrefix(address: string): string {
  return PW_KEY.replace('{{address}}', address).replace('{{index}}', '');
}

// Bank Card storage keys
export function getBankCardIndexKey(address: string): StaticArray<u8> {
  return stringToBytes(BANK_CARD_INDEX_KEY.replace('{{address}}', address));
}

export function getBankCardKey(address: string, index: u16): StaticArray<u8> {
  return stringToBytes(
    BANK_CARD_KEY.replace('{{address}}', address).replace(
      '{{index}}',
      index.toString(),
    ),
  );
}

export function getBankCardKeyPrefix(address: string): string {
  return BANK_CARD_KEY.replace('{{address}}', address).replace('{{index}}', '');
}
