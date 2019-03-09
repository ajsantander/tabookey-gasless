const getAccounts = require('./accounts');
const utils = require('./utils');
const constants = require('./constants');
const BN = require('bn.js');

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

  // Check current balances.
  console.log(`====== Examining balances ======`);
  let recipient_balance = web3.utils.toBN(await relayHub.balances(metaCoin.address));
  console.log(`Recipient balance: ${recipient_balance}`);
  const extraction = recipient_balance.toString();
  // const extraction = recipient_balance.sub(new BN(100000)).toString();
  console.log(`Will extract: ${extraction}`);

  // Extract recipient balance.
  console.log(`====== Extracting recipient balance ======`);
  await metaCoin.withdraw_relay_funds(extraction, {
    ...constants.PARAMS,
    gas: 6000000,
    from: accounts.recipient_owner
  });

  // Check current balances.
  console.log(`====== Examining balances ======`);
  recipient_balance = await relayHub.balances(metaCoin.address);
  console.log(`Recipient balance: ${recipient_balance}`);
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
