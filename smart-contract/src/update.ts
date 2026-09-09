import 'dotenv/config';
import { Account, Web3Provider } from '@massalabs/massa-web3';
import { getScByteCode } from './utils';
import { fromString } from '@massalabs/massa-web3/dist/cmd/basicElements/mas';

const CONTRACT_ADDR =
  process.env.CONTRACT_ADDR != undefined ? process.env.CONTRACT_ADDR : '';

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

console.log('Updating contract...');

const byteCode = getScByteCode('build', 'main.wasm');

const params = {
  func: 'adminUpgradeSmartContract',
  target: CONTRACT_ADDR,
  fee: fromString('0.01'),
  parameter: byteCode,
};

provider
  .callSC(params)
  .then((value) => console.log(`Operation id ${value.id}`));
