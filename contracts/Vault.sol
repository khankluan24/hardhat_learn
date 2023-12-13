// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract Vault is Ownable, AccessControl {
    IERC20 private token;
    uint256 public maxWithdrawAmount;
    bool public withdrawEnable;
    bytes32 public constant WITHDRANER_ROLE = keccak256("WITHDRAWER_ROLE");

    constructor(address initialOwner) Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setWithdrawEnable(bool _isEnable) public onlyOwner {
        withdrawEnable = _isEnable;
    }

    function setToken(IERC20 _token) public onlyOwner {
        token = _token;
    }

    function setMaxWithdrawAmount(uint256 _maxWithdrawAmount) public onlyOwner {
        maxWithdrawAmount = _maxWithdrawAmount;
    }

    function withDraw(uint256 _amount, address _to) external onlyWithDrawer {
        require(withdrawEnable, "Withdraw is not available");
        require(_amount <= maxWithdrawAmount, "Exceed maximum amount");
        token.transfer(_to, _amount);
    }

    function deposit(uint256 _amount) external {
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insuficcent account balance"
        );

        SafeERC20.safeTransferFrom(token, msg.sender, address(this), _amount);
    }

    modifier onlyWithDrawer() {
        require(
            owner() == _msgSender() || hasRole(WITHDRANER_ROLE, _msgSender()),
            "Caller is not a withdrawer"
        );
        _;
    }
}
