const getAccounts = require('./accounts');
const utils = require('./utils');
const constants = require('./constants');

const RelayHub = artifacts.require('./RelayHub.sol');
const MetaCoin = artifacts.require('./MetaCoin.sol');

let accounts;
let relayHub;
let metaCoin;

async function main() {

  // Retrieve accounts.
  accounts = await getAccounts(web3);

  // Retrieve deployed contracts.
  relayHub = await RelayHub.deployed();
  metaCoin = await MetaCoin.deployed();

  // Retrieve relay info.
  const relay_info = await relayHub.relays(accounts.relay);

  // Produce a signed message with the intent of calling the mint() function.
  console.log(`====== Creating User's signed message ======`);
  const encodedCall = metaCoin.contract.methods.mint().encodeABI();
  // const relay_prefix = Buffer.from('rlx:').toString('hex');
  // console.log(`  relay_prefix: ${relay_prefix}`);
  const user_msg_hashed = utils.getTransactionHash(
    web3,
    accounts.user_1, 
    metaCoin.address, 
    encodedCall, 
    relay_info.transaction_fee, 
    constants.PARAMS.gasPrice, 
    constants.PARAMS.gas, 
    0, 
    relayHub.address, 
    accounts.relay
  );
  console.log(`user_msg_hashed: ${user_msg_hashed}`);
  const user_msg_signed = await utils.getTransactionSignature(web3, accounts.user_1, user_msg_hashed);
  console.log(`user_msg_signed: ${user_msg_signed}`);
}

// Required by `truffle exec`.
module.exports = function(callback) {
  main()
    .then(() => callback())
    .catch(err => { 
      console.log(`Error:`, err);
      callback(err) 
    });
};
