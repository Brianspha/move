// SPDX-License-Identifier: MIT License
pragma solidity >=0.8.0;
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
contract CookieClickerToken is ERC20Upgradeable, PausableUpgradeable, OwnableUpgradeable,zContract {
//==============================================Modifiers============================================//

//==============================================Modifiers============================================//
 modifier onlySystem() {
        require(
            msg.sender == address(systemContract),
            "Only system contract can call this function"
        );
        _;
    }
    //==============================================Variables============================================//

    uint256 public chainID;
    SystemContract public systemContract;
    //==============================================Functions============================================//

    function initialize(
        string memory symbol,
        string memory name
        uint256 chainID_,
        address systemContractAddress
    ) public virtual initializer {
        __ERC20_init(name, symbol);
        __Ownable_init();
        __Pausable_init();
        systemContract = SystemContract(systemContractAddress);
        chainID = chainID_;
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(owner(), amount);
    }

    function transfer(
        address to,
        uint256 amount
    ) public virtual override whenNotPaused returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override whenNotPaused returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public virtual override whenNotPaused returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) public virtual override whenNotPaused returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unPause() public onlyOwner {
        _unpause();
    }

    function mint(
        address to,
        uint256 amount
    ) public virtual whenNotPaused onlyOwner {
        _mint(to, amount);
    }
}
