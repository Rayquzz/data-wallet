import 'dotenv/config';
import { Account, Args, bytesToStr, Web3Provider } from '@massalabs/massa-web3';
import { Credential } from './serializables/credential';

const CONTRACT_ADDR =
  process.env.CONTRACT_ADDR != undefined ? process.env.CONTRACT_ADDR : '';
const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

// test save new credential
// const credential = new Credential('2', '2');
// const params = {
//   func: 'saveCredential',
//   target: CONTRACT_ADDR,
//   fee: BigInt(10_000_000),
//   parameter: new Args().addSerializable(credential),
// };
//
// const operation = await provider.callSC(params);
// console.log(operation.id)
// await operation.waitSpeculativeExecution();

// test to read all credentials
const params2 = {
  func: 'getCredentials',
  target: CONTRACT_ADDR,
  parameter: new Args(),
};
provider.readSC(params2).then((result2) => {
  const data = result2.value;
  const args = new Args(data);
  const credentials = args.nextSerializableObjectArray<Credential>(Credential);

  for (const c of credentials) {
    console.log(c);
  }
});

// test to delete credential
// const params = {
//   func: 'deleteCredential',
//   target: CONTRACT_ADDR,
//   fee: BigInt(10_000_000),
//   parameter: new Args().addU16(U16.fromNumber(1)),
// };
//
// provider.callSC(params).then((value) => {
//   console.log(value);
// });
//
// provider.getStorageKeys(CONTRACT_ADDR).then(value => {
//   for (const key of value) {
//     console.log(bytesToStr(key));
//   }
// });
