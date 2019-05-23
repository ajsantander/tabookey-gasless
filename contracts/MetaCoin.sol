pragma solidity ^0.5.0;

import "./ConvertLib.sol";
import "./RelayRecipient.sol";
import "./IRelayHub.sol";
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
		if (balances[getSender()] < amount) {
      return false;
    }
		balances[getSender()] -= amount;
		balances[receiver] += amount;
		emit Transfer(getSender(), receiver, amount);
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
      // require(!minted[getSender()]);
      uint256 amount = 10000;
      // minted[getSender()] = true;
      balances[getSender()] += amount;
      emit Minted(getSender(), amount);
  }

  /* tabookey-gassless implementation */

  function acceptRelayedCall(
    address relay, 
    address from, 
    bytes memory encodedFunction, 
    uint gasPrice, 
    uint transactionFee, 
    bytes memory approval
  ) public view returns(uint) {

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

  function postRelayedCall(
    address relay, 
    address from, 
    bytes memory encodedFunction, 
    bool success, 
    uint usedGas, 
    uint transactionFee
  ) public {
      
  }

  function initHub(IRelayHub _hub_addr) public {
    initRelayHub(_hub_addr);
  }

  function withdraw_relay_funds(uint amount) public {
    IRelayHub hub = getRelayHub();
    hub.withdraw(amount);
  }

  function() external payable {}
}
