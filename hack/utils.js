const ethUtils = require('ethereumjs-util');

function getTransactionHash(web3, from, to, tx, txfee, gas_price, gas_limit, nonce, relay_hub_address, relay_address) {
  console.log(`getTransactionHash from: ${from}, to: ${to}, tx: ${tx}, txfee: ${txfee}, gas_price: ${gas_price}, gas_limit: ${gas_limit}, nonce: ${nonce}, relay_hub_address: ${relay_hub_address}, relay_address: ${relay_address}`);

  let txhstr = bytesToHex_noPrefix(web3, tx)
  let dataToHash =
    Buffer.from('rlx:').toString("hex") +
    removeHexPrefix(from)
    + removeHexPrefix(to)
    + txhstr
    + toUint256_noPrefix(parseInt(txfee))
    + toUint256_noPrefix(parseInt(gas_price))
    + toUint256_noPrefix(parseInt(gas_limit))
    + toUint256_noPrefix(parseInt(nonce))
    + removeHexPrefix(relay_hub_address)
    + removeHexPrefix(relay_address)
  console.log(`user_msg: ${dataToHash}`);
  return web3.utils.sha3('0x' + dataToHash);
}

function bytesToHex_noPrefix(web3, bytes) {
  let hex = removeHexPrefix(web3.utils.toHex(bytes))
  if (hex.length % 2 != 0) {
    hex = "0" + hex;
  }
  return hex;
}
function toUint256_noPrefix(int) {
  return removeHexPrefix(ethUtils.bufferToHex(ethUtils.setLengthLeft(int, 32)));
}

function removeHexPrefix(hex) {
  return hex.replace(/^0x/, '');
}

async function getTransactionSignature(web3, account, hash) {
  const sig = await web3.eth.sign(hash, account)
  let signature = ethUtils.fromRpcSig(sig);
  return web3.utils.toHex(signature.v) + removeHexPrefix(web3.utils.bytesToHex(signature.r)) + removeHexPrefix(web3.utils.bytesToHex(signature.s));
}

module.exports = {
  getTransactionHash,
  bytesToHex_noPrefix,
  toUint256_noPrefix,
  removeHexPrefix,
  getTransactionSignature
}
