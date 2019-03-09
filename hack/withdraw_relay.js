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

  // Check current balances.
  console.log(`====== Examining balances ======`);
  let relay_owner_balance = await relayHub.balances(accounts.relay_owner);
  console.log(`Relay owner balance: ${relay_owner_balance}`);

  // Extract owner balance.
  console.log(`====== Extracting owner balance ======`);
  await relayHub.withdraw(relay_owner_balance, {
    ...constants.PARAMS,
    from: accounts.relay_owner
  });

  // Check current balances.
  console.log(`====== Examining balances ======`);
  relay_owner_balance = await relayHub.balances(accounts.relay_owner);
  console.log(`Relay owner balance: ${relay_owner_balance}`);
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
