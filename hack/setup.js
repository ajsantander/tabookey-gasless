const getAccounts = require('./accounts');
const constants = require('./constants');

const RelayHub = artifacts.require('./RelayHub.sol');
const MetaCoin = artifacts.require('./MetaCoin.sol');

const deployedContracts = {};

let accounts;

async function setupAccounts() {

  console.log(`====== Setting up accounts ======`);
  accounts = await getAccounts(web3);

  // Trace out account names, addresses and balances.
  const accountNames = Object.keys(accounts);
  const promises = accountNames.map(name => {
    const address = accounts[name];
    return web3.eth.getBalance(address);
  });
  const balances = await Promise.all(promises);
  for(let i = 0; i < accountNames.length; i++) {
    const name = accountNames[i];
    const address = accounts[name];
    const balance = web3.utils.fromWei(balances[i], 'ether');
    console.log(`${name}: ${address} [${balance} ether]`);
  }

  // Make sure User 1 has no ether.
  let user_1_balance = await web3.eth.getBalance(accounts.user_1);
  if(user_1_balance > 0) {
    console.log(`Depleting User 1's balance...`);
    console.log(`  Initial User 1 balance: ${user_1_balance}`);
    const price = await web3.eth.getGasPrice();
    const cost = 21000 * price;
    const value = user_1_balance - cost;
    console.log(`  Sending ${value}...`);
    await web3.eth.sendTransaction({
      from: accounts.user_1,
      to: accounts.user_6,
      gas: 21000,
      gasPrice: price,
      value
    });
    user_1_balance = await web3.eth.getBalance(accounts.user_1);
    console.log(`  Resulting User 1 balance: ${user_1_balance}`);
  }
}

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
  const hub = await metaCoin.get_hub_addr();
  console.log(`Recipient's hub: ${hub}`);
  if(hub === "0x0000000000000000000000000000000000000000") {
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
  else {
    console.log(`Recipient already connected with RelayHub.`);
  }
}

async function main() {
  await setupAccounts();
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
