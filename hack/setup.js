const getAccounts = require('./accounts');
const constants = require('./constants');

const RelayHub = artifacts.require('./RelayHub.sol');
const MetaCoin = artifacts.require('./MetaCoin.sol');

const deployedContracts = {};

let relayHub;

async function setupRelayHub() {

  // Retrieve the RelayHub instance.
  console.log(`====== Setting up the RelayHub ======`);
  relayHub = await RelayHub.deployed();
  console.log(`RelayHub address: ${relayHub.address}`);
  // const gas_reserve = await relayHub.gas_reserve();
  // console.log(`hub`, gas_reserve.toString());
}

async function setupRelay() {

  // Set up a Relay.
  console.log(`====== Setting up a Relay ======`);
  console.log(`Relay address: ${accounts.relay}`);
  console.log(`Staking...`);
  const stake = web3.utils.toWei('1', 'ether');
  const unstake_delay = 0;
  await relayHub.stake(accounts.relay, unstake_delay, {
    ...constants.PARAMS, 
    from: accounts.relay_owner,
    value: stake
  });
  let relay_info = await relayHub.relays(accounts.relay);
  console.log(`  Staked: ${relay_info.stake}`);
  console.log(`  Relay state: ${relay_info.state}`);
  console.log(`Registering...`);
  const transaction_fee = 12;
  const url = 'metacoin.com';
  await relayHub.register_relay(transaction_fee, url, {
    ...constants.PARAMS,
    from: accounts.relay
  });
  relay_info = await relayHub.relays(accounts.relay);
  console.log(`  Relay state: ${relay_info.state}`);
}

let metaCoin;

async function setupRecipient() {

  // Set up the MetaCoin Recipient.
  console.log(`====== Setting up MetaCoin ======`);
  metaCoin = await MetaCoin.deployed();
  console.log(`MetaCoin address: ${metaCoin.address}`);
  console.log(`Connecting MetaCoin with the RelayHub...`);
  await metaCoin.init_hub(relayHub.address, {
    ...constants.PARAMS,
    from: accounts.recipient_owner
  });
  const metacoin_hub = await metaCoin.get_hub_addr();
  console.log(`  MetaCoin connected to hub at address: ${metacoin_hub}.`);
  console.log(`Incrementing MetaCoin's balance in the RelayHub...`);
  const deposit = web3.utils.toWei('0.1', 'ether');
  await relayHub.depositFor(metaCoin.address, {
    ...constants.PARAMS, 
    from: accounts.relay_owner,
    value: deposit
  });
  let relay_balance = await relayHub.balances(metaCoin.address);
  console.log(`  MetaCoin balance: ${relay_balance}`);
}

let accounts;

async function main() {
  accounts = await getAccounts(web3);
  await setupRelayHub();
  await setupRelay();
  await setupRecipient();
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
