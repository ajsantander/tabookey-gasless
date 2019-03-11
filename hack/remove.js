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

  console.log(`====== Removing relay ======`);
  await relayHub.remove_relay_by_owner(accounts.relay, {
    ...constants.PARAMS,
    from: accounts.relay_owner
  });
  let relay_info = await relayHub.relays(accounts.relay);
  console.log(`Relay state: ${relay_info.state}`);
  console.log(`Relay stake: ${relay_info.stake}`);

  console.log(`====== Unstaking relay ======`);
  const can_unstake = await relayHub.can_unstake(accounts.relay);
  console.log(`Can unstake: ${can_unstake}`);
  await relayHub.unstake(accounts.relay, {
    ...constants.PARAMS,
    from: accounts.relay_owner
  });
  relay_info = await relayHub.relays(accounts.relay);
  console.log(`Relay stake: ${relay_info.stake}`);
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
