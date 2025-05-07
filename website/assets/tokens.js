// Token list for DikiSwap
// Network-specific token lists
const networkTokens = {
  // Ethereum Mainnet (0x1)
  '0x1': [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18,
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
    },
    {
      symbol: 'AAVE',
      name: 'Aave',
      logo: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      decimals: 18,
    },
    {
      symbol: 'COMP',
      name: 'Compound',
      logo: 'https://assets.coingecko.com/coins/images/10775/small/COMP.png',
      address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      decimals: 18,
    },
    {
      symbol: 'SUSHI',
      name: 'SushiSwap',
      logo: 'https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png',
      address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
      decimals: 18,
    },
    {
      symbol: 'SNX',
      name: 'Synthetix',
      logo: 'https://assets.coingecko.com/coins/images/3406/small/SNX.png',
      address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
      decimals: 18,
    },
    {
      symbol: 'CRV',
      name: 'Curve DAO Token',
      logo: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
      address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      decimals: 18,
    },
  ],

  // Polygon (0x89)
  '0x89': [
    {
      symbol: 'MATIC',
      name: 'Polygon',
      logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
    },
    {
      symbol: 'AAVE',
      name: 'Aave',
      logo: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
      address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
      decimals: 18,
    },
  ],

  // Optimism (0xa)
  '0xa': [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
    },
    {
      symbol: 'OP',
      name: 'Optimism',
      logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
    },
  ],

  // Arbitrum (0xa4b1)
  '0xa4b1': [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
    },
  ],
};

// Default to Ethereum Mainnet tokens
const defaultTokenList = networkTokens['0x1'];

// Initialize with default tokens
let tokenList = [...defaultTokenList];

// Function to get token logo URL with fallback
function getTokenLogoUrl(symbol) {
  // First try CoinGecko
  return `https://assets.coingecko.com/coins/images/1/${symbol.toLowerCase()}.png`;
}

// Function to handle image loading errors
function handleTokenImageError(img, symbol) {
  // Try different sources in order
  const fallbackSources = [
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${symbol}/logo.png`,
    `https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_${symbol.toLowerCase()}.svg`,
    `https://tokens.1inch.io/0x${symbol}.png`,
    `https://etherscan.io/token/images/${symbol.toLowerCase()}.png`,
    // Default fallback for any token
    `https://ui-avatars.com/api/?name=${symbol}&background=0D8ABC&color=fff&rounded=true&bold=true`,
  ];

  // Try the next source
  if (!img.dataset.fallbackIndex) {
    img.dataset.fallbackIndex = 0;
  } else {
    img.dataset.fallbackIndex = parseInt(img.dataset.fallbackIndex) + 1;
  }

  const index = parseInt(img.dataset.fallbackIndex);
  if (index < fallbackSources.length) {
    img.src = fallbackSources[index];
  } else {
    // If all sources fail, use a generated avatar
    img.src = `https://ui-avatars.com/api/?name=${symbol}&background=00c853&color=fff&rounded=true&bold=true`;
    // Remove the error handler to prevent infinite loop
    img.onerror = null;
  }
}

// Get current network's token list
function getNetworkTokenList(chainId) {
  // Default to Ethereum if chainId is not supported
  return networkTokens[chainId] || networkTokens['0x1'];
}

// Function to fetch tokens from MetaMask
async function fetchMetaMaskTokens() {
  if (!window.ethereum) {
    console.log('MetaMask not installed');
    return tokenList;
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.log('No accounts connected');
      return tokenList;
    }

    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);

    // Get network-specific token list
    const networkSpecificTokens = getNetworkTokenList(chainId);

    // Update global tokenList
    tokenList = [...networkSpecificTokens];

    // For real MetaMask integration, we would fetch tokens from MetaMask here
    // But for this demo, we'll use our predefined list and just return it

    return tokenList;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return tokenList;
  }
}

// Try to fetch tokens when the script loads
document.addEventListener('DOMContentLoaded', () => {
  // We'll call this function after MetaMask is connected
  // fetchMetaMaskTokens().then(tokens => {
  //     console.log("Tokens loaded:", tokens.length);
  // });
});
