// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const networkSelector = document.getElementById('network-selector');
const networkModal = document.getElementById('network-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const networkItems = document.querySelectorAll('.network-item');
const ethAmountInput = document.getElementById('eth-amount');
const dikiAmountSpan = document.getElementById('diki-amount');
const bonusAmountSpan = document.getElementById('bonus-amount');
const buyTokenBtn = document.getElementById('buy-token-btn');
const maxButton = document.querySelector('.max-button');

// Global variables
let currentAccount = null;
let currentChain = null;
let isConnected = false;
let ethBalance = 0;

// Constants
const DIKI_PRICE = 0.0001; // ETH per DIKI
const CURRENT_BONUS = 30; // Current bonus percentage
const MIN_PURCHASE = 0.1; // Minimum ETH purchase
const MAX_PURCHASE = 10; // Maximum ETH purchase

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

  // Initialize countdown timer
  startCountdown();
  
  // Initialize allocation chart
  initAllocationChart();
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

// Handle account changes
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected their account
    isConnected = false;
    currentAccount = null;
    connectWalletBtn.textContent = 'Connect';
    buyTokenBtn.textContent = 'Connect Wallet';
    buyTokenBtn.disabled = true;
    ethBalance = 0;
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    isConnected = true;
    
    // Update UI
    const shortAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
    connectWalletBtn.textContent = shortAddress;
    buyTokenBtn.textContent = 'Buy DikiToken';
    buyTokenBtn.disabled = false;
    
    // Get current chain
    getCurrentChain();
    
    // Get ETH balance
    await getEthBalance();
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
function handleChainChanged(chainId) {
  currentChain = chainId;
  
  // Update network display
  updateNetworkDisplay(chainId);
  
  console.log('Chain changed to:', chainId);
}

// Update network display based on chain ID
function updateNetworkDisplay(chainId) {
  const networkName = getNetworkName(chainId);
  const networkNameElement = networkSelector.querySelector('.network-name');
  
  if (networkNameElement) {
    networkNameElement.textContent = networkName;
  }
  
  // Update network items in modal
  networkItems.forEach(item => {
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
    '0x5': 'Goerli'
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
    console.error('Error switching network:', error);
  }
}

// Handle disconnect
function handleDisconnect() {
  isConnected = false;
  currentAccount = null;
  connectWalletBtn.textContent = 'Connect';
  buyTokenBtn.textContent = 'Connect Wallet';
  buyTokenBtn.disabled = true;
}

// Get ETH balance
async function getEthBalance() {
  if (!currentAccount) return;
  
  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [currentAccount, 'latest'],
    });
    
    // Convert from wei to ETH
    ethBalance = parseInt(balance, 16) / 1e18;
    console.log('ETH Balance:', ethBalance);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    ethBalance = 0;
  }
}

// Calculate DIKI amount based on ETH input
function calculateDikiAmount() {
  const ethAmount = parseFloat(ethAmountInput.value) || 0;
  const dikiAmount = ethAmount / DIKI_PRICE;
  const bonusAmount = dikiAmount * (CURRENT_BONUS / 100);
  
  dikiAmountSpan.textContent = dikiAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  bonusAmountSpan.textContent = bonusAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Buy DikiToken
async function buyDikiToken() {
  if (!isConnected) {
    connectWallet();
    return;
  }
  
  const ethAmount = parseFloat(ethAmountInput.value) || 0;
  
  // Validate input
  if (ethAmount < MIN_PURCHASE) {
    alert(`Minimum purchase amount is ${MIN_PURCHASE} ETH`);
    return;
  }
  
  if (ethAmount > MAX_PURCHASE) {
    alert(`Maximum purchase amount is ${MAX_PURCHASE} ETH`);
    return;
  }
  
  if (ethAmount > ethBalance) {
    alert('Insufficient ETH balance');
    return;
  }
  
  // In a real application, you would call a smart contract here
  alert(`Thank you for your purchase! Your transaction is being processed.`);
  
  // For demo purposes, we'll just show a success message
  buyTokenBtn.textContent = 'Processing...';
  setTimeout(() => {
    buyTokenBtn.textContent = 'Buy DikiToken';
    alert('Transaction successful! DikiTokens will be sent to your wallet after the presale ends.');
  }, 2000);
}

// Start countdown timer
function startCountdown() {
  // Set the end date (15 days from now for demo)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 15);
  
  function updateCountdown() {
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
      // Countdown ended
      document.getElementById('days').textContent = '0';
      document.getElementById('hours').textContent = '0';
      document.getElementById('minutes').textContent = '0';
      document.getElementById('seconds').textContent = '0';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
  }
  
  // Update countdown every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Initialize allocation chart
function initAllocationChart() {
  const canvas = document.getElementById('allocation-chart');
  if (!canvas || !canvas.getContext) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  
  // Allocation data
  const allocations = [
    { name: 'Presale', percentage: 20, color: 'rgba(0, 200, 83, 0.8)' },
    { name: 'Liquidity', percentage: 30, color: 'rgba(105, 240, 174, 0.8)' },
    { name: 'Team', percentage: 15, color: 'rgba(0, 178, 72, 0.8)' },
    { name: 'Marketing', percentage: 10, color: 'rgba(185, 246, 202, 0.8)' },
    { name: 'Development', percentage: 15, color: 'rgba(27, 94, 32, 0.8)' },
    { name: 'Reserve', percentage: 10, color: 'rgba(46, 125, 50, 0.8)' }
  ];
  
  // Draw pie chart
  let startAngle = 0;
  allocations.forEach(allocation => {
    const sliceAngle = (allocation.percentage / 100) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    
    ctx.fillStyle = allocation.color;
    ctx.fill();
    
    startAngle += sliceAngle;
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  init();
  
  // Connect wallet button
  connectWalletBtn.addEventListener('click', connectWallet);
  
  // Buy token button
  buyTokenBtn.addEventListener('click', buyDikiToken);
  
  // ETH amount input
  ethAmountInput.addEventListener('input', calculateDikiAmount);
  
  // Max button
  maxButton.addEventListener('click', () => {
    if (ethBalance > 0) {
      const maxAmount = Math.min(ethBalance, MAX_PURCHASE);
      ethAmountInput.value = maxAmount.toFixed(4);
      calculateDikiAmount();
    }
  });
  
  // Network selector
  networkSelector.addEventListener('click', () => {
    networkModal.style.display = 'flex';
  });
  
  // Close modals
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      networkModal.style.display = 'none';
    });
  });
  
  // Network selection
  networkItems.forEach(item => {
    item.addEventListener('click', () => {
      const chainId = item.getAttribute('data-chain-id');
      switchNetwork(chainId);
      networkModal.style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === networkModal) {
      networkModal.style.display = 'none';
    }
  });
});
