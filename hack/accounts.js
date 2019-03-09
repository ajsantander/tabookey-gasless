module.exports = async function(web3) {
  const accounts = await web3.eth.getAccounts();
  return {
    relay_hub_owner: accounts[0], //0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1
    recipient_owner: accounts[1], //0xffcf8fdee72ac11b5c542428b35eef5769c409f0
    relay_owner    : accounts[2], //0x22d491bde2303f2f43325b2108d26f1eaba1e32b
    relay          : accounts[3], //0xe11ba2b4d45eaed5996cd0823791e0c93114882d
    user_1         : accounts[4], //0xd03ea8624c8c5987235048901fb614fdca89b117
    user_2         : accounts[5], //0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc
    user_3         : accounts[6], //0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9
    user_4         : accounts[7], //0x28a8746e75304c0780e011bed21c72cd78cd535e
    user_5         : accounts[8], //0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e
    user_6         : accounts[9]  //0x1df62f291b2e969fb0849d99d9ce41e2f137006e
  }
}
