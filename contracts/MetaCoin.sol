pragma solidity ^0.5.0;

import "./ConvertLib.sol";
import "./RelayRecipient.sol";
import "./RelayHubApi.sol";
import "./GsnUtils.sol";
import "@0x/contracts-utils/contracts/src/LibBytes.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin is RelayRecipient {
  mapping (address => uint) balances;

  event Minted(address _to, uint256 _amount);
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

  address public owner;

	constructor() public {
    owner = msg.sender;
		balances[tx.origin] = 10000;
	}

	function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
		if (balances[get_sender()] < amount) {
      return false;
    }
		balances[get_sender()] -= amount;
		balances[receiver] += amount;
		emit Transfer(get_sender(), receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) public view returns(uint) {
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}

	mapping (address=>bool) minted;

  /**
   * mint some coins for this caller.
   * (in a real-life application, minting is protected for admin, or by other mechanism.
   * but for our sample, any user can mint some coins - but just once..
   */
  function mint() public {
      // require(!minted[get_sender()]);
      uint256 amount = 10000;
      // minted[get_sender()] = true;
      balances[get_sender()] += amount;
      emit Minted(get_sender(), amount);
  }

  /* tabookey-gassless implementation */

  function accept_relayed_call(
    address relay, 
    address from, 
    bytes memory encoded_function, 
    uint gas_price, 
    uint transaction_fee, 
    bytes memory approval
  ) public view returns(uint32) {

    // Require off-chain approval data.
    // (First 65 bytes contain user signature, the next part should contain the
    // Metacoin owner signature).
    if(approval.length == 65) return 1;

    bytes memory ownerSig = LibBytes.slice(approval, 65, 130);
    bytes memory message = abi.encodePacked(
      "\x19Ethereum Signed Message:\n32", 
      keccak256(abi.encodePacked("I approve", from))
    );
    bool signed = GsnUtils.checkSig(
      owner,
      keccak256(message),
      ownerSig
    );
    if(!signed) return 4;

    return 0;
  }

  function post_relayed_call(
    address relay, 
    address from, 
    bytes memory encoded_function, 
    bool success, 
    uint used_gas, 
    uint transaction_fee
  ) public {
      
  }

  function init_hub(RelayHubApi _hub_addr) public {
    init_relay_hub(_hub_addr);
  }

  function withdraw_relay_funds(uint amount) public {
    RelayHubApi hub = get_relay_hub();
    hub.withdraw(amount);
  }

  function() external payable {}
}
