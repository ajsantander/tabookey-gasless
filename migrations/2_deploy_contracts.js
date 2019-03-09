var RLPReader = artifacts.require("./RLPReader.sol");
var RelayHub = artifacts.require("./RelayHub.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");

module.exports = function(deployer) {

  // Deploy RelayHub.
	deployer.deploy(RLPReader);
	deployer.link(RLPReader, RelayHub);
  deployer.deploy(RelayHub);

  // Deploy MetaCoin.
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
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
