const getAccounts = require('./accounts');
const privateKeys = require('./accounts').privateKeys;
const utils = require('./utils');
const constants = require('./constants');
const rlp = require('rlp');
const ethJsTx = require('ethereumjs-tx');

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
  let relay_info = await relayHub.relays(accounts.relay);

  // Retrieve the user's current nonce.
  const user_nonce = await relayHub.nonces(accounts.user_1);
  console.log(`Current user nonce: ${user_nonce}`);

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
    user_nonce, 
    relayHub.address, 
    accounts.relay
  );
  console.log(`user_msg_hashed: ${user_msg_hashed}`);
  const user_msg_signed = await utils.getTransactionSignature(web3, accounts.user_1, user_msg_hashed);
  console.log(`user_msg_signed: ${user_msg_signed}`);

  // Call can_relay.
  console.log(`====== Checking if transaction can be relayed ======`);
  const can_relay = await relayHub.can_relay(
    accounts.relay,
    accounts.user_1,
    metaCoin.address,
    encodedCall,
    relay_info.transaction_fee,
    constants.PARAMS.gasPrice,
    constants.PARAMS.gas,
    user_nonce,
    user_msg_signed
  );
  console.log(`Can relay transaction: ${can_relay}`);
  if(can_relay.toString() !== '0') {
    throw new Error('Cant relay!');
  }

  // Prepare the correct relay transaction (but don't send it).
  console.log(`====== Prepare good transaction ======`);
  const relay_private_key = privateKeys["relay"];
  console.log(`Private key:`, relay_private_key);
  const params = {
    ...constants.PARAMS,
    gas: 6000000,
    from: accounts.relay
  };
  const args_good = [
    accounts.user_1,
    metaCoin.address,
    encodedCall,
    parseInt(relay_info.transaction_fee.toString(), 10),
    constants.PARAMS.gasPrice,
    constants.PARAMS.gas,
    parseInt(user_nonce.toString(), 10),
    user_msg_signed
  ];
  const transaction_good = createRawRelayTransaction(args_good, params, relay_private_key);
  console.log(`transaction_good:`, transaction_good);

  // Prepare the incorrect relay transaction (but don't send it).
  console.log(`====== Prepare bad transaction ======`);
  const args_bad = [
    accounts.user_1,
    metaCoin.address,
    encodedCall,
    parseInt(relay_info.transaction_fee.toString(), 10),
    constants.PARAMS.gasPrice,
    constants.PARAMS.gas + 1,
    parseInt(user_nonce.toString(), 10),
    user_msg_signed
  ];
  const transaction_bad = createRawRelayTransaction(args_bad, params, relay_private_key);
  console.log(`transaction_bad:`, transaction_bad);

  // Snitch!
  console.log(`Penalizing Relay: ${accounts.relay}`);
  const tx = await relayHub.penalize_repeated_nonce(
    transaction_good.raw_transaction, transaction_good.signature,
    transaction_bad.raw_transaction, transaction_bad.signature,
    {
      from: accounts.user_3
    }
  );
  console.log(`Penalization tx:`, tx.logs[0].args);
  relay_info = await relayHub.relays(accounts.relay);
  console.log(`Relay state: ${relay_info.state}`);
  console.log(`Relay stake: ${relay_info.stake}`);

  // Examine ether balances.
  const initial_user_3_eth_balance = await web3.eth.getBalance(accounts.user_3);
  console.log(`initial_user_3_eth_balance:`, initial_user_3_eth_balance);

  // User 3 is now the owner of the penalized relay, which has been removed.
  // So, user 3 should now be able to claim the penalized stake.
  console.log(`====== Unstaking relay ======`);
  const can_unstake = await relayHub.can_unstake(accounts.relay);
  console.log(`Can unstake: ${can_unstake}`);
  await relayHub.unstake(accounts.relay, {
    ...constants.PARAMS,
    from: accounts.user_3
  });
  relay_info = await relayHub.relays(accounts.relay);
  console.log(`Relay stake: ${relay_info.stake}`);

  // Examine ether balances.
  const final_user_3_eth_balance = await web3.eth.getBalance(accounts.user_3);
  console.log(`final_user_3_eth_balance:`, final_user_3_eth_balance);
} 

function createRawRelayTransaction(args, params, privateKey) {
  utils.traceArgs(args);

  // Encode tx data.
  const data = relayHub.contract.methods.relay(...args).encodeABI();
  console.log(`data:`, data);

  // Prepare raw transaction.
  const tx_data = {
    ...params,
    data
  };
  const tx = new ethJsTx(tx_data);
  const tx_rlp_encoded = '0x' + rlp.encode(tx.raw.slice(0, 6)).toString('hex');
  console.log(`encoded tx:`, tx_rlp_encoded);

  // Sign transaction.
  const privateKey_noPrefix = utils.removeHexPrefix(privateKey);
  const privateKey_Buffer = Buffer.from(privateKey_noPrefix, 'hex');
  tx.sign(privateKey_Buffer);
  console.log(`signed tx:`, tx);
  const signature = utils.getSignatureFromSignedTransaction(tx);
  console.log(`signature:`, signature);

  return {
    raw_transaction: tx_rlp_encoded,
    signed_transaction: tx,
    signature
  };
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
