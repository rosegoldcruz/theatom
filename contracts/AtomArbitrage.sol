// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// AAVE V3 Flash Loan Interface
interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

interface IPool {
    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IFlashLoanSimpleReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

// Uniswap V2 Interface
interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

contract AtomArbitrage is IFlashLoanSimpleReceiver, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // AAVE V3 Pool Addresses Provider (Mainnet)
    IPoolAddressesProvider public constant ADDRESSES_PROVIDER =
        IPoolAddressesProvider(0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e);

    // Uniswap V2 Router
    IUniswapV2Router public constant UNISWAP_ROUTER =
        IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    // SushiSwap Router (same interface as Uniswap V2)
    IUniswapV2Router public constant SUSHISWAP_ROUTER =
        IUniswapV2Router(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    struct ArbitrageParams {
        address tokenA;
        address tokenB;
        uint256 amountIn;
        address[] pathBuy;
        address[] pathSell;
        address routerBuy;
        address routerSell;
        uint256 minProfit;
    }

    event ArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountIn,
        uint256 profit,
        address indexed executor
    );

    event FlashLoanExecuted(
        address indexed asset,
        uint256 amount,
        uint256 premium,
        bool success
    );

    constructor() Ownable(msg.sender) {}

    receive() external payable {}

    /**
     * @dev Execute arbitrage using AAVE flash loan
     * @param asset The asset to flash loan
     * @param amount The amount to flash loan
     * @param params Encoded arbitrage parameters
     */
    function executeArbitrage(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external onlyOwner nonReentrant {
        IPool pool = IPool(ADDRESSES_PROVIDER.getPool());
        pool.flashLoanSimple(address(this), asset, amount, params, 0);
    }

    /**
     * @dev AAVE flash loan callback
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == ADDRESSES_PROVIDER.getPool(), "Invalid caller");
        require(initiator == address(this), "Invalid initiator");

        // Decode arbitrage parameters
        ArbitrageParams memory arbParams = abi.decode(params, (ArbitrageParams));

        bool success = _performArbitrage(asset, amount, arbParams);

        // Repay flash loan
        uint256 totalDebt = amount + premium;
        IERC20(asset).safeTransfer(msg.sender, totalDebt);

        emit FlashLoanExecuted(asset, amount, premium, success);

        return true;
    }

    /**
     * @dev Internal function to perform arbitrage
     */
    function _performArbitrage(
        address asset,
        uint256 amount,
        ArbitrageParams memory params
    ) internal returns (bool) {
        // Step 1: Buy on first exchange
        IERC20(asset).forceApprove(params.routerBuy, amount);

        IUniswapV2Router routerBuy = IUniswapV2Router(params.routerBuy);
        uint256[] memory amountsBuy = routerBuy.swapExactTokensForTokens(
            amount,
            0, // Accept any amount of tokens out
            params.pathBuy,
            address(this),
            block.timestamp + 300
        );

        uint256 tokensBought = amountsBuy[amountsBuy.length - 1];

        // Step 2: Sell on second exchange
        address tokenToSell = params.pathBuy[params.pathBuy.length - 1];
        IERC20(tokenToSell).forceApprove(params.routerSell, tokensBought);

        IUniswapV2Router routerSell = IUniswapV2Router(params.routerSell);
        uint256[] memory amountsSell = routerSell.swapExactTokensForTokens(
            tokensBought,
            0, // Accept any amount of tokens out
            params.pathSell,
            address(this),
            block.timestamp + 300
        );

        uint256 finalAmount = amountsSell[amountsSell.length - 1];
        uint256 profit = finalAmount > amount ? finalAmount - amount : 0;

        require(profit >= params.minProfit, "Insufficient profit");

        emit ArbitrageExecuted(
            params.tokenA,
            params.tokenB,
            amount,
            profit,
            owner()
        );

        return true;
    }

    /**
     * @dev Calculate potential profit for arbitrage opportunity
     */
    function calculateProfit(
        address, /* tokenA */
        address, /* tokenB */
        uint256 amountIn,
        address[] calldata pathBuy,
        address[] calldata pathSell,
        address routerBuy,
        address routerSell
    ) external view returns (uint256 profit, bool profitable) {
        try IUniswapV2Router(routerBuy).getAmountsOut(amountIn, pathBuy) returns (uint256[] memory amountsBuy) {
            uint256 tokensBought = amountsBuy[amountsBuy.length - 1];

            try IUniswapV2Router(routerSell).getAmountsOut(tokensBought, pathSell) returns (uint256[] memory amountsSell) {
                uint256 finalAmount = amountsSell[amountsSell.length - 1];

                if (finalAmount > amountIn) {
                    profit = finalAmount - amountIn;
                    profitable = true;
                } else {
                    profit = 0;
                    profitable = false;
                }
            } catch {
                profit = 0;
                profitable = false;
            }
        } catch {
            profit = 0;
            profitable = false;
        }
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20(token).safeTransfer(owner(), IERC20(token).balanceOf(address(this)));
        }
    }

    /**
     * @dev Withdraw ETH
     */
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Withdraw ERC20 tokens
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}