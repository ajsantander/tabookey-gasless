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
  let relay_balance = await relayHub.balances(metaCoin.address);
  console.log(`Relay balance: ${relay_balance}`);

  // Extract owner balance.
  console.log(`====== Funding relay ======`);
  const deposit = web3.utils.toWei('0.1', 'ether');
  await relayHub.depositFor(metaCoin.address, {
    ...constants.PARAMS,
    value: deposit,
    from: accounts.relay_owner
  });

  // Check current balances.
  console.log(`====== Examining balances ======`);
  relay_balance = await relayHub.balances(metaCoin.address);
  console.log(`Relay balance: ${relay_balance}`);
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
