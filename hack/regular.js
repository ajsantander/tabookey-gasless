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

  console.log(`====== Examining balances ======`);
  let user_2_balance = await metaCoin.getBalance(accounts.user_2);
  console.log(`User 2 initial balance: ${user_2_balance}`);

  console.log(`====== Perform a regular mint call ======`);
  console.log(`Minting META for: ${accounts.user_2}`);
  const tx = await metaCoin.mint({
    ...constants.PARAMS,
    from: accounts.user_2
  });
  console.log(`tx:`, tx);
  const log = tx.logs[0];
  console.log(`log:`, log.event, log.args);

  console.log(`====== Examining balances ======`);
  user_2_balance = await metaCoin.getBalance(accounts.user_2);
  console.log(`User 2 final balance: ${user_2_balance}`);
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
