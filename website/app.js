// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const swapButton = document.getElementById('swap-button');
const sellTokenSelector = document.getElementById('sell-token');
const buyTokenSelector = document.getElementById('buy-token');
const tokenModal = document.getElementById('token-modal');
const networkModal = document.getElementById('network-modal');
const networkSelector = document.getElementById('network-selector');
const closeModalBtns = document.querySelectorAll('.close-modal');
const tokenItems = document.querySelectorAll('.token-item');
const networkItems = document.querySelectorAll('.network-item');
const sellAmountInput = document.getElementById('sell-amount');
const buyAmountInput = document.getElementById('buy-amount');
const priceChart = document.getElementById('price-chart');

// Global variables
let currentAccount = null;
let currentChain = null;
let isConnected = false;
let activeSelector = null; // To track which token selector was clicked
let chart = null; // For price chart
let selectedPair = 'ETH/USDC'; // Default trading pair

// Helper functions for number formatting
function getSignificantDecimals(num) {
  // Get number of significant decimals needed
  if (num === 0) return 0;
  const absNum = Math.abs(num);
  if (absNum >= 1) return 2; // For numbers >= 1, show 2 decimals

  // For small numbers, find first significant digit
  const numStr = absNum.toString();
  const decimalIndex = numStr.indexOf('.');
  if (decimalIndex === -1) return 0;

  let significantIndex = decimalIndex + 1;
  while (significantIndex < numStr.length && numStr[significantIndex] === '0') {
    significantIndex++;
  }

  // Return number of decimals needed to show at least 2 significant digits
  return Math.min(8, significantIndex - decimalIndex + 1);
}

function addCommasToNumber(numStr) {
  // Add commas to number string (e.g., 1234.56 -> 1,234.56)
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Check if MetaMask is installed
const isMetaMaskInstalled = () => {
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
};

// Initialize the app
async function init() {
  if (isMetaMaskInstalled()) {
    // Check if already connected
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);

        // Fetch tokens from MetaMask
        await loadTokensFromMetaMask();
      }
    } catch (error) {
      console.error('Error checking accounts:', error);
    }

    // Setup event listeners for MetaMask
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
  } else {
    connectWalletBtn.textContent = 'Install MetaMask';
    connectWalletBtn.addEventListener('click', () => {
      window.open('https://metamask.io/download.html', '_blank');
    });
  }

  // Initialize token list with default tokens
  populateTokenList();
}

// Connect to MetaMask
async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    alert('Please install MetaMask to use this feature!');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    handleAccountsChanged(accounts);

    // Load tokens from MetaMask after successful connection
    await loadTokensFromMetaMask();
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    if (error.code === 4001) {
      // User rejected the request
      alert('Please connect to MetaMask to use this feature.');
    } else {
      alert('Error connecting to MetaMask. Please try again.');
    }
  }
}

// Load tokens from MetaMask
async function loadTokensFromMetaMask() {
  try {
    // Try to fetch tokens from MetaMask
    const tokens = await fetchMetaMaskTokens();

    // Populate token list with fetched tokens
    populateTokenList(tokens);

    return tokens;
  } catch (error) {
    console.error('Error loading tokens from MetaMask:', error);
    // Fall back to default tokens
    populateTokenList();
  }
}

// Global variable to store token balances
let tokenBalancesCache = {};

// Populate token list in the modal
async function populateTokenList(tokens = defaultTokenList) {
  const tokenListElement = document.querySelector('.token-list');
  if (!tokenListElement) return;

  // Show loading indicator
  const loadingElement = document.getElementById('token-list-loading');
  if (loadingElement) {
    loadingElement.style.display = 'flex';
  }

  // Clear existing tokens except loading indicator
  Array.from(tokenListElement.children).forEach((child) => {
    if (child.id !== 'token-list-loading') {
      child.remove();
    }
  });

  // Get token balances if connected
  if (isConnected && currentAccount) {
    tokenBalancesCache = await getTokenBalances();
  }

  // Add tokens to the list with a slight delay to show loading animation
  setTimeout(() => {
    // Hide loading indicator
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }

    // Add tokens to the list
    tokens.forEach((token) => {
      const tokenItem = document.createElement('div');
      tokenItem.className = 'token-item';
      tokenItem.setAttribute('data-symbol', token.symbol);
      tokenItem.setAttribute('data-address', token.address);

      // Left side with token info
      const tokenItemLeft = document.createElement('div');
      tokenItemLeft.className = 'token-item-left';

      const img = document.createElement('img');
      img.src = token.logo;
      img.alt = token.symbol;
      // Add error handling for images
      img.onerror = function () {
        handleTokenImageError(this, token.symbol);
      };

      const tokenInfo = document.createElement('div');
      tokenInfo.className = 'token-info';

      const symbolSpan = document.createElement('span');
      symbolSpan.className = 'token-symbol';
      symbolSpan.textContent = token.symbol;

      // Add network badge if we're on a specific network
      if (currentChain && currentChain !== '0x1') {
        const networkName = getNetworkName(currentChain).toLowerCase();
        const networkBadge = document.createElement('span');
        networkBadge.className = `network-badge ${networkName}`;
        networkBadge.textContent = networkName.charAt(0).toUpperCase() + networkName.slice(1);
        symbolSpan.appendChild(networkBadge);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'token-name';
      nameSpan.textContent = token.name;

      tokenInfo.appendChild(symbolSpan);
      tokenInfo.appendChild(nameSpan);

      tokenItemLeft.appendChild(img);
      tokenItemLeft.appendChild(tokenInfo);

      // Right side with balance
      const tokenBalance = document.createElement('div');
      tokenBalance.className = 'token-balance';

      // Get balance from cache or show placeholder
      if (isConnected && tokenBalancesCache[token.symbol] !== undefined) {
        const balance = tokenBalancesCache[token.symbol];

        // Format balance based on token type and amount
        let formattedBalance;

        if (balance === 0) {
          formattedBalance = '0';
          tokenBalance.classList.add('zero-balance');
        } else if (token.symbol === 'WBTC' || token.decimals === 8) {
          // For BTC-like tokens, show more decimals for small amounts
          formattedBalance = balance < 0.001 ? balance.toFixed(8) : balance.toFixed(Math.min(6, getSignificantDecimals(balance)));
        } else if (token.symbol === 'USDC' || token.symbol === 'USDT' || token.symbol === 'DAI' || token.decimals === 6) {
          // For stablecoins, show 2 decimals for larger amounts, more for smaller amounts
          formattedBalance = balance >= 1 ? balance.toFixed(2) : balance.toFixed(Math.min(6, getSignificantDecimals(balance)));
        } else {
          // For other tokens (ETH, etc.), show 4 decimals for larger amounts, more for smaller amounts
          formattedBalance = balance >= 1 ? balance.toFixed(4) : balance.toFixed(Math.min(6, getSignificantDecimals(balance)));
        }

        // Add commas for thousands
        formattedBalance = addCommasToNumber(formattedBalance);
        tokenBalance.textContent = formattedBalance;
      } else {
        tokenBalance.textContent = isConnected ? '0' : '-';
        tokenBalance.classList.add('zero-balance');
      }

      // Add all elements to token item
      tokenItem.appendChild(tokenItemLeft);
      tokenItem.appendChild(tokenBalance);

      // Add click event
      tokenItem.addEventListener('click', () => {
        selectToken(token.symbol, img.src, tokenBalancesCache[token.symbol]);
      });

      tokenListElement.appendChild(tokenItem);
    });

    // Add event listeners to common base tokens
    const commonBaseTokens = document.querySelectorAll('.common-base-token');
    commonBaseTokens.forEach((baseToken) => {
      baseToken.addEventListener('click', () => {
        const symbol = baseToken.getAttribute('data-symbol');
        const img = baseToken.querySelector('img');
        if (symbol && img) {
          selectToken(symbol, img.src, tokenBalancesCache[symbol]);
        }
      });
    });

    // Sort tokens by balance (if connected)
    if (isConnected) {
      sortTokensByBalance(tokenListElement);
    }
  }, 500); // 500ms delay to show loading animation
}

// Sort tokens by balance (highest first)
function sortTokensByBalance(tokenListElement) {
  const tokenItems = Array.from(tokenListElement.querySelectorAll('.token-item'));

  // Sort tokens by balance
  tokenItems.sort((a, b) => {
    const aBalance = parseFloat(a.querySelector('.token-balance').textContent) || 0;
    const bBalance = parseFloat(b.querySelector('.token-balance').textContent) || 0;
    return bBalance - aBalance; // Descending order
  });

  // Reappend in sorted order
  tokenItems.forEach((item) => {
    tokenListElement.appendChild(item);
  });
}

// Handle account changes
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected their account
    isConnected = false;
    currentAccount = null;
    connectWalletBtn.textContent = 'Connect';
    swapButton.textContent = 'Connect Wallet';
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    isConnected = true;

    // Update UI
    const shortAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
    connectWalletBtn.textContent = shortAddress;
    swapButton.textContent = 'Swap';

    // Get current chain
    await getCurrentChain();

    // Get ETH balance
    await getEthBalance();

    // Get token balances
    await getTokenBalances();
  }
}

// Get ETH balance
async function getEthBalance() {
  if (!currentAccount) return 0;

  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [currentAccount, 'latest'],
    });

    // Convert from wei to ETH
    const ethBalance = parseInt(balance, 16) / 1e18;
    console.log('ETH Balance:', ethBalance);
    return ethBalance;
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    return 0;
  }
}

// ERC20 Token ABI (minimal for balanceOf)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

// Get native token balance (ETH, MATIC, etc.)
async function getNativeBalance() {
  if (!currentAccount) return 0;

  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [currentAccount, 'latest'],
    });

    // Convert from wei to ETH
    const nativeBalance = parseInt(balance, 16) / 1e18;
    return nativeBalance;
  } catch (error) {
    console.error('Error getting native balance:', error);
    return 0;
  }
}

// Get token balance using contract call
async function getTokenBalance(tokenAddress, decimals) {
  if (!currentAccount || !window.ethereum || !tokenAddress || tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return 0;
  }

  try {
    // Call balanceOf method on the token contract
    const data =
      '0x70a08231' + // balanceOf method signature
      '000000000000000000000000' + // padding
      currentAccount.slice(2); // remove 0x prefix

    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: data,
        },
        'latest',
      ],
    });

    // Convert result from hex to decimal and adjust for decimals
    const balance = parseInt(result, 16) / Math.pow(10, decimals);
    return balance;
  } catch (error) {
    console.error(`Error getting balance for token ${tokenAddress}:`, error);
    return 0;
  }
}

// Get token balances for the current network
async function getTokenBalances() {
  if (!currentAccount || !window.ethereum) return {};

  const tokenBalances = {};
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const networkTokenList = getNetworkTokenList(chainId);

  try {
    // Get native token (ETH, MATIC, etc.)
    const nativeToken = networkTokenList.find((token) => token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');

    if (nativeToken) {
      const nativeBalance = await getNativeBalance();
      tokenBalances[nativeToken.symbol] = nativeBalance;
    }

    // Get ERC20 token balances
    for (const token of networkTokenList) {
      // Skip native token as we already got it
      if (token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') continue;

      try {
        // Get real balance from blockchain
        const balance = await getTokenBalance(token.address, token.decimals);

        // Store balance with proper formatting based on token type
        tokenBalances[token.symbol] = balance;
      } catch (error) {
        console.error(`Error getting balance for ${token.symbol}:`, error);
        tokenBalances[token.symbol] = 0;
      }
    }

    console.log('Token balances for network', chainId, ':', tokenBalances);
    return tokenBalances;
  } catch (error) {
    console.error('Error getting token balances:', error);
    return tokenBalances;
  }
}

// Get current chain information
async function getCurrentChain() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    handleChainChanged(chainId);
  } catch (error) {
    console.error('Error getting chain ID:', error);
  }
}

// Handle chain changes
async function handleChainChanged(chainId) {
  currentChain = chainId;

  // Update network display
  updateNetworkDisplay(chainId);

  console.log('Chain changed to:', chainId);

  // If connected, reload tokens and balances for the new network
  if (isConnected && currentAccount) {
    // Clear token balances cache
    tokenBalancesCache = {};

    // Reload tokens for the new network
    await loadTokensFromMetaMask();

    // Get token balances for the new network
    await getTokenBalances();

    // Update UI if token modal is open
    const tokenListElement = document.querySelector('.token-list');
    if (tokenListElement && tokenModal.style.display === 'flex') {
      populateTokenList();
    }
  }
}

// Update network display based on chain ID
function updateNetworkDisplay(chainId) {
  const networkName = getNetworkName(chainId);
  const networkNameElement = networkSelector.querySelector('.network-name');

  if (networkNameElement) {
    networkNameElement.textContent = networkName;
  }

  // Update network items in modal
  networkItems.forEach((item) => {
    const itemChainId = item.getAttribute('data-chain-id');
    const statusElement = item.querySelector('.network-status');

    if (itemChainId === chainId) {
      if (!statusElement) {
        const status = document.createElement('span');
        status.className = 'network-status';
        status.textContent = 'Connected';
        item.querySelector('.network-info').appendChild(status);
      }
    } else if (statusElement) {
      statusElement.remove();
    }
  });
}

// Get network name from chain ID
function getNetworkName(chainId) {
  const networks = {
    '0x1': 'Ethereum',
    '0x89': 'Polygon',
    '0xa': 'Optimism',
    '0xa4b1': 'Arbitrum',
    '0xaa36a7': 'Sepolia',
    '0x5': 'Goerli',
  };

  return networks[chainId] || 'Unknown Network';
}

// Switch network
async function switchNetwork(chainId) {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await addNetwork(chainId);
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    }
    console.error('Error switching network:', error);
  }
}

// Add network to MetaMask
async function addNetwork(chainId) {
  const networks = {
    '0x89': {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/'],
    },
    '0xa': {
      chainId: '0xa',
      chainName: 'Optimism',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.optimism.io'],
      blockExplorerUrls: ['https://optimistic.etherscan.io/'],
    },
    '0xa4b1': {
      chainId: '0xa4b1',
      chainName: 'Arbitrum One',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io/'],
    },
  };

  if (!networks[chainId]) return;

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [networks[chainId]],
  });
}

// Handle disconnect
function handleDisconnect() {
  isConnected = false;
  currentAccount = null;
  connectWalletBtn.textContent = 'Connect';
  swapButton.textContent = 'Connect Wallet';
}

// Open token selection modal
function openTokenModal(selector) {
  activeSelector = selector;
  tokenModal.style.display = 'flex';
}

// Close token selection modal
function closeTokenModal() {
  tokenModal.style.display = 'none';
}

// Select token
function selectToken(symbol, imgSrc, balance) {
  if (activeSelector) {
    // Clear previous content
    activeSelector.innerHTML = '';

    // Create image element
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = symbol;

    // Create span for symbol
    const span = document.createElement('span');
    span.textContent = symbol;
    span.setAttribute('data-symbol', symbol);

    // Store balance as data attribute if available
    if (balance !== undefined) {
      span.setAttribute('data-balance', balance);
    }

    // Create icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-chevron-down';

    // Append elements
    activeSelector.appendChild(img);
    activeSelector.appendChild(span);
    activeSelector.appendChild(icon);

    // Update swap button if both tokens are selected
    updateSwapButton();

    // Update input fields with max balance if it's the sell token
    if (activeSelector === sellTokenSelector && balance !== undefined) {
      updateMaxSellAmount(symbol, balance);
    }

    // Close modal
    closeTokenModal();
  }
}

// Update max sell amount based on selected token balance
function updateMaxSellAmount(symbol, balance) {
  // Only update if we have a valid balance
  if (balance !== undefined && balance > 0) {
    // Add max button if it doesn't exist
    let maxButton = document.querySelector('.max-button');
    if (!maxButton) {
      const inputContainer = sellAmountInput.parentElement;
      if (inputContainer) {
        maxButton = document.createElement('button');
        maxButton.className = 'max-button';
        maxButton.textContent = 'MAX';
        maxButton.addEventListener('click', () => {
          // Set input to max balance (with some buffer for gas if it's ETH)
          setPercentageOfBalance(100);
        });

        inputContainer.appendChild(maxButton);
      }
    }

    // Update placeholder to show available balance
    sellAmountInput.placeholder = `0 (Max: ${balance.toFixed(4)})`;

    // Store the current balance in a data attribute for percentage buttons
    sellAmountInput.setAttribute('data-max-balance', balance);

    // Update percentage buttons to use this balance
    setupPercentageButtons();
  }
}

// Set up percentage buttons
function setupPercentageButtons() {
  const percentageButtons = document.querySelectorAll('.percentage-button');

  percentageButtons.forEach((button) => {
    // Remove existing event listeners by cloning and replacing
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Add new event listener
    newButton.addEventListener('click', () => {
      // Remove active class from all buttons
      percentageButtons.forEach((btn) => btn.classList.remove('active'));

      // Add active class to clicked button
      newButton.classList.add('active');

      // Get percentage value
      const percentage = parseInt(newButton.getAttribute('data-percentage'));

      // Set input value to percentage of balance
      setPercentageOfBalance(percentage);
    });
  });
}

// Set input value to percentage of balance
function setPercentageOfBalance(percentage) {
  const balance = parseFloat(sellAmountInput.getAttribute('data-max-balance') || '0');

  if (balance > 0) {
    let amount;
    const symbol = sellTokenSelector.querySelector('span').getAttribute('data-symbol');

    if (percentage === 100) {
      // For 100% (Max), leave some ETH for gas if the token is ETH
      if (symbol === 'ETH') {
        // Leave some ETH for gas
        const maxEth = Math.max(0, balance - 0.01);
        amount = maxEth > 0 ? maxEth : 0;
      } else {
        amount = balance;
      }
    } else {
      // For other percentages, calculate exact percentage
      amount = (balance * percentage) / 100;
    }

    // Format amount based on token type
    let formattedAmount;
    if (symbol === 'ETH' || symbol === 'MATIC') {
      formattedAmount = amount.toFixed(4);
    } else if (symbol === 'WBTC') {
      formattedAmount = amount.toFixed(8);
    } else if (symbol === 'USDC' || symbol === 'USDT' || symbol === 'DAI') {
      formattedAmount = amount.toFixed(2);
    } else {
      formattedAmount = amount.toFixed(4);
    }

    // Set input value
    sellAmountInput.value = formattedAmount;

    // Trigger input event to update buy amount
    const event = new Event('input', { bubbles: true });
    sellAmountInput.dispatchEvent(event);
  }
}

// Update swap button based on connection and token selection
function updateSwapButton() {
  if (!isConnected) {
    swapButton.textContent = 'Connect Wallet';
    return;
  }

  const sellToken = sellTokenSelector.querySelector('span').textContent;
  const buyToken = buyTokenSelector.querySelector('span').textContent;

  if (sellToken && buyToken && buyToken !== 'Select token') {
    swapButton.textContent = 'Swap';
  } else {
    swapButton.textContent = 'Select tokens';
  }
}

// Perform swap (simplified for demo)
function performSwap() {
  if (!isConnected) {
    connectWallet();
    return;
  }

  const sellTokenElement = sellTokenSelector.querySelector('span');
  const buyTokenElement = buyTokenSelector.querySelector('span');

  const sellToken = sellTokenElement.textContent;
  const buyToken = buyTokenElement.textContent;

  if (buyToken === 'Select token') {
    alert('Please select tokens to swap');
    return;
  }

  const sellAmount = parseFloat(sellAmountInput.value);
  if (!sellAmount || sellAmount <= 0) {
    alert('Please enter a valid amount to swap');
    return;
  }

  // Check if user has enough balance
  const sellTokenBalance = parseFloat(sellTokenElement.getAttribute('data-balance') || '0');
  if (sellAmount > sellTokenBalance) {
    alert(`Insufficient ${sellToken} balance. You have ${sellTokenBalance.toFixed(4)} ${sellToken} available.`);
    return;
  }

  // Show loading state
  const originalButtonText = swapButton.textContent;
  swapButton.textContent = 'Swapping...';
  swapButton.disabled = true;

  // In a real DEX, you would call smart contract functions here
  setTimeout(() => {
    // Calculate buy amount
    const buyAmount = (sellAmount * getExchangeRate(sellToken, buyToken)).toFixed(6);
    buyAmountInput.value = buyAmount;

    // Update balances in cache
    if (tokenBalancesCache[sellToken]) {
      tokenBalancesCache[sellToken] -= sellAmount;
      sellTokenElement.setAttribute('data-balance', tokenBalancesCache[sellToken]);
    }

    if (tokenBalancesCache[buyToken]) {
      tokenBalancesCache[buyToken] = parseFloat(tokenBalancesCache[buyToken]) + parseFloat(buyAmount);
      buyTokenElement.setAttribute('data-balance', tokenBalancesCache[buyToken]);
    }

    // Reset UI
    swapButton.textContent = originalButtonText;
    swapButton.disabled = false;

    // Show success message
    alert(`Swap successful! You swapped ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken}`);

    // Add to transaction history
    addTransaction('Swap', `${sellAmount} ${sellToken}`, `${sellToken} → ${buyToken}`);

    // Clear input fields
    sellAmountInput.value = '';
    buyAmountInput.value = '';

    // Update placeholder to show new balance
    if (tokenBalancesCache[sellToken]) {
      sellAmountInput.placeholder = `0 (Max: ${tokenBalancesCache[sellToken].toFixed(4)})`;
    }
  }, 1500); // Simulate transaction delay
}

// Get mock exchange rate (for demo purposes)
function getExchangeRate(fromToken, toToken) {
  const rates = {
    ETH: {
      USDC: 1800,
      USDT: 1800,
    },
    USDC: {
      ETH: 0.00055,
      USDT: 1,
    },
    USDT: {
      ETH: 0.00055,
      USDC: 1,
    },
  };

  return rates[fromToken]?.[toToken] || 1;
}

// Open network selection modal
function openNetworkModal() {
  networkModal.style.display = 'flex';
}

// Close network selection modal
function closeNetworkModal() {
  networkModal.style.display = 'none';
}

// Initialize price chart
function initChart() {
  if (!priceChart) return;

  try {
    // Create chart instance if PriceChart class is available
    if (typeof PriceChart !== 'undefined') {
      chart = new PriceChart('price-chart', {
        lineColor: '#00c853',
        fillColor: 'rgba(0, 200, 83, 0.1)',
        gridColor: 'rgba(105, 240, 174, 0.1)',
        textColor: 'rgba(165, 214, 167, 0.8)',
        showGrid: true,
        showLabels: true,
      });

      // Set initial data
      updateChartData();
    } else {
      console.log('PriceChart class not available, chart will not be initialized');
    }
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

// Update chart data based on selected pair
function updateChartData() {
  if (!chart) return;

  // In a real app, you would fetch data from an API
  // For demo, we'll use the mock data generator
  chart.updateData(chart.generateMockData(30));
}

// Add transaction to history
function addTransaction(type, amount, pair, status = 'completed') {
  const historyTableBody = document.getElementById('history-table-body');
  if (!historyTableBody) return;

  // Create row with animation
  const row = document.createElement('div');
  row.className = 'history-row new-transaction';

  // Type column
  const typeCol = document.createElement('div');
  typeCol.className = 'history-col';
  const typeSpan = document.createElement('span');
  typeSpan.className = `transaction-type ${type.toLowerCase()}`;
  typeSpan.textContent = type;
  typeCol.appendChild(typeSpan);

  // Amount column
  const amountCol = document.createElement('div');
  amountCol.className = 'history-col';
  amountCol.textContent = amount;

  // Pair column
  const pairCol = document.createElement('div');
  pairCol.className = 'history-col';
  pairCol.textContent = pair;

  // Time column
  const timeCol = document.createElement('div');
  timeCol.className = 'history-col';
  timeCol.textContent = 'Just now';

  // Status column
  const statusCol = document.createElement('div');
  statusCol.className = 'history-col';
  const statusSpan = document.createElement('span');
  statusSpan.className = `transaction-status ${status}`;
  statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  statusCol.appendChild(statusSpan);

  // Append all columns to row
  row.appendChild(typeCol);
  row.appendChild(amountCol);
  row.appendChild(pairCol);
  row.appendChild(timeCol);
  row.appendChild(statusCol);

  // Add to top of history
  historyTableBody.insertBefore(row, historyTableBody.firstChild);

  // Save transaction to localStorage
  saveTransaction({
    type,
    amount,
    pair,
    status,
    time: new Date().toISOString(),
  });

  // Remove animation class after animation completes
  setTimeout(() => {
    row.classList.remove('new-transaction');
  }, 1000);
}

// Save transaction to localStorage
function saveTransaction(transaction) {
  try {
    // Get existing transactions
    const transactions = JSON.parse(localStorage.getItem('dikiswap_transactions') || '[]');

    // Add new transaction
    transactions.unshift(transaction);

    // Keep only the last 20 transactions
    if (transactions.length > 20) {
      transactions.length = 20;
    }

    // Save back to localStorage
    localStorage.setItem('dikiswap_transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
}

// Load transactions from localStorage
function loadTransactions() {
  try {
    const transactions = JSON.parse(localStorage.getItem('dikiswap_transactions') || '[]');
    const historyTableBody = document.getElementById('history-table-body');

    if (!historyTableBody || transactions.length === 0) return;

    // Clear existing transactions
    historyTableBody.innerHTML = '';

    // Add transactions to history
    transactions.forEach((transaction) => {
      // Format time
      const transactionTime = new Date(transaction.time);
      const now = new Date();
      const diffMs = now - transactionTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeText;
      if (diffDays > 0) {
        timeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeText = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      } else {
        timeText = 'Just now';
      }

      // Add transaction to UI
      addTransactionToUI(transaction.type, transaction.amount, transaction.pair, timeText, transaction.status);
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

// Add transaction to UI without saving to localStorage
function addTransactionToUI(type, amount, pair, timeText, status) {
  const historyTableBody = document.getElementById('history-table-body');
  if (!historyTableBody) return;

  const row = document.createElement('div');
  row.className = 'history-row';

  // Type column
  const typeCol = document.createElement('div');
  typeCol.className = 'history-col';
  const typeSpan = document.createElement('span');
  typeSpan.className = `transaction-type ${type.toLowerCase()}`;
  typeSpan.textContent = type;
  typeCol.appendChild(typeSpan);

  // Amount column
  const amountCol = document.createElement('div');
  amountCol.className = 'history-col';
  amountCol.textContent = amount;

  // Pair column
  const pairCol = document.createElement('div');
  pairCol.className = 'history-col';
  pairCol.textContent = pair;

  // Time column
  const timeCol = document.createElement('div');
  timeCol.className = 'history-col';
  timeCol.textContent = timeText;

  // Status column
  const statusCol = document.createElement('div');
  statusCol.className = 'history-col';
  const statusSpan = document.createElement('span');
  statusSpan.className = `transaction-status ${status}`;
  statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  statusCol.appendChild(statusSpan);

  // Append all columns to row
  row.appendChild(typeCol);
  row.appendChild(amountCol);
  row.appendChild(pairCol);
  row.appendChild(timeCol);
  row.appendChild(statusCol);

  // Add to history
  historyTableBody.appendChild(row);
}

// Handle presale banner close
function handleBannerClose() {
  const banner = document.querySelector('.presale-banner');
  const closeBtn = document.querySelector('.close-banner');

  if (banner && closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.style.animation = 'slideOut 0.5s ease-out forwards';

      // Add slideOut animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-50px);
            opacity: 0;
            display: none;
          }
        }
      `;
      document.head.appendChild(style);

      // Remove banner after animation
      setTimeout(() => {
        banner.style.display = 'none';
      }, 500);

      // Save in localStorage to remember user closed it
      localStorage.setItem('presaleBannerClosed', 'true');
    });
  }

  // Check if banner was previously closed
  if (localStorage.getItem('presaleBannerClosed') === 'true' && banner) {
    banner.style.display = 'none';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  init();

  // Initialize chart
  initChart();

  // Load transactions from localStorage
  loadTransactions();

  // Handle presale banner
  handleBannerClose();

  // Setup percentage buttons
  setupPercentageButtons();

  // Connect wallet button
  connectWalletBtn.addEventListener('click', connectWallet);

  // Swap button
  swapButton.addEventListener('click', () => {
    performSwap();

    // Add transaction to history for demo
    if (isConnected) {
      const sellToken = sellTokenSelector.querySelector('span').textContent;
      const buyToken = buyTokenSelector.querySelector('span').textContent;
      const sellAmount = sellAmountInput.value;

      if (sellAmount && parseFloat(sellAmount) > 0 && buyToken !== 'Select token') {
        addTransaction('Swap', `${sellAmount} ${sellToken}`, `${sellToken} → ${buyToken}`);
      }
    }
  });

  // Token selectors
  sellTokenSelector.addEventListener('click', () => openTokenModal(sellTokenSelector));
  buyTokenSelector.addEventListener('click', () => openTokenModal(buyTokenSelector));

  // Network selector
  networkSelector.addEventListener('click', openNetworkModal);

  // Close modals
  closeModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tokenModal.style.display = 'none';
      networkModal.style.display = 'none';
    });
  });

  // Token search functionality
  const tokenSearchInput = document.querySelector('.token-search input');
  if (tokenSearchInput) {
    tokenSearchInput.addEventListener('input', (e) => {
      const searchValue = e.target.value.toLowerCase();
      const tokenItems = document.querySelectorAll('.token-item');

      tokenItems.forEach((item) => {
        const symbol = item.getAttribute('data-symbol').toLowerCase();
        const name = item.querySelector('.token-name').textContent.toLowerCase();
        const address = item.getAttribute('data-address').toLowerCase();

        // Show/hide based on search
        if (symbol.includes(searchValue) || name.includes(searchValue) || address.includes(searchValue)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Network selection
  networkItems.forEach((item) => {
    item.addEventListener('click', () => {
      const chainId = item.getAttribute('data-chain-id');
      switchNetwork(chainId);
      closeNetworkModal();
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === tokenModal) {
      closeTokenModal();
    }
    if (event.target === networkModal) {
      closeNetworkModal();
    }
  });

  // Input change events for simulating exchange
  sellAmountInput.addEventListener('input', () => {
    const sellToken = sellTokenSelector.querySelector('span').textContent;
    const buyToken = buyTokenSelector.querySelector('span').textContent;

    if (buyToken !== 'Select token') {
      const sellAmount = sellAmountInput.value;
      if (sellAmount && parseFloat(sellAmount) > 0) {
        buyAmountInput.value = (parseFloat(sellAmount) * getExchangeRate(sellToken, buyToken)).toFixed(6);
      } else {
        buyAmountInput.value = '';
      }
    }
  });

  // Chart timeframe buttons
  const timeframeBtns = document.querySelectorAll('.timeframe-btn');
  timeframeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      timeframeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateChartData();
    });
  });

  // Pool buttons
  const poolButtons = document.querySelectorAll('.pool-button');
  poolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!isConnected) {
        connectWallet();
      } else {
        const poolCard = btn.closest('.pool-card');
        const poolName = poolCard.querySelector('.pool-name').textContent;
        alert(`Adding liquidity to ${poolName} pool`);

        // Add transaction to history for demo
        addTransaction('Add Liquidity', `0.5 ETH`, poolName);
      }
    });
  });

  // History filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // In a real app, you would filter the transactions here
    });
  });
});
