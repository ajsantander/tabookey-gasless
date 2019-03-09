var RLPReader = artifacts.require("./RLPReader.sol");
var RelayHub = artifacts.require("./RelayHub.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");

module.exports = async function(deployer, network, accounts) {
  accounts = accounts.map(web3.utils.toChecksumAddress);
  
  // Deploy RelayHub.
  deployer.deploy(RLPReader, {from: accounts[0]});
  deployer.link(RLPReader, RelayHub);
  deployer.deploy(RelayHub, {from: accounts[0]});

  // Deploy MetaCoin.
  deployer.deploy(ConvertLib, {from: accounts[1]});
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin, {from: accounts[1]});
};

// var RelayHub = artifacts.require("./RelayHub.sol");
// var RelayRecipient = artifacts.require("./RelayRecipient.sol");
// var SampleRecipient = artifacts.require("./SampleRecipient.sol");
// var RLPReader = artifacts.require("./RLPReader.sol");

// module.exports = function(deployer) {
// 	deployer.deploy(RLPReader);
// 	deployer.link(RLPReader, RelayHub);
// 	deployer.deploy(RelayHub).then(function() {
// 		return deployer.deploy(SampleRecipient, RelayHub.address);
// 	});
// 	deployer.link(RelayHub, RelayRecipient);
// 	deployer.link(RelayHub, SampleRecipient);
// };
