// Demo data voor het testen van de app zonder CoinMarketCap API key
const DEMO_COIN_DATA = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 45000.00,
        marketCap: 850000000000,
        volume24h: 25000000000,
        change24h: 2.5
    },
    {
        symbol: 'BCH',
        name: 'Bitcoin Cash',
        price: 280.50,
        marketCap: 5500000000,
        volume24h: 180000000,
        change24h: -1.2
    },
    {
        symbol: 'BSV',
        name: 'Bitcoin SV',
        price: 95.75,
        marketCap: 1800000000,
        volume24h: 45000000,
        change24h: 0.8
    },
    {
        symbol: 'BTG',
        name: 'Bitcoin Gold',
        price: 35.20,
        marketCap: 600000000,
        volume24h: 12000000,
        change24h: -0.5
    },
    {
        symbol: 'DGB',
        name: 'DigiByte',
        price: 0.025,
        marketCap: 350000000,
        volume24h: 8000000,
        change24h: 3.2
    },
    {
        symbol: 'LTC',
        name: 'Litecoin',
        price: 120.80,
        marketCap: 8500000000,
        volume24h: 450000000,
        change24h: 1.8
    },
    {
        symbol: 'NMC',
        name: 'Namecoin',
        price: 0.85,
        marketCap: 12000000,
        volume24h: 50000,
        change24h: -2.1
    },
    {
        symbol: 'PPC',
        name: 'Peercoin',
        price: 0.45,
        marketCap: 18000000,
        volume24h: 25000,
        change24h: 0.3
    },
    {
        symbol: 'XPM',
        name: 'Primecoin',
        price: 0.12,
        marketCap: 6000000,
        volume24h: 15000,
        change24h: 1.5
    },
    {
        symbol: 'NVC',
        name: 'Novacoin',
        price: 0.08,
        marketCap: 4000000,
        volume24h: 8000,
        change24h: -0.8
    },
    {
        symbol: 'EMC2',
        name: 'Einsteinium',
        price: 0.015,
        marketCap: 2000000,
        volume24h: 3000,
        change24h: 2.1
    },
    {
        symbol: 'UNO',
        name: 'Unobtanium',
        price: 0.95,
        marketCap: 15000000,
        volume24h: 12000,
        change24h: -1.5
    },
    {
        symbol: 'MZC',
        name: 'MazaCoin',
        price: 0.005,
        marketCap: 800000,
        volume24h: 1000,
        change24h: 0.7
    },
    {
        symbol: 'AUR',
        name: 'Auroracoin',
        price: 0.18,
        marketCap: 2500000,
        volume24h: 5000,
        change24h: 1.2
    },
    {
        symbol: 'DVC',
        name: 'Devcoin',
        price: 0.002,
        marketCap: 300000,
        volume24h: 500,
        change24h: -0.3
    },
    {
        symbol: 'FRC',
        name: 'Freicoin',
        price: 0.008,
        marketCap: 1200000,
        volume24h: 2000,
        change24h: 0.9
    },
    {
        symbol: 'IXC',
        name: 'Ixcoin',
        price: 0.035,
        marketCap: 800000,
        volume24h: 1500,
        change24h: -0.6
    },
    {
        symbol: 'NXT',
        name: 'Nxt',
        price: 0.055,
        marketCap: 5500000,
        volume24h: 25000,
        change24h: 1.1
    },
    {
        symbol: 'POT',
        name: 'PotCoin',
        price: 0.025,
        marketCap: 3500000,
        volume24h: 8000,
        change24h: 2.3
    },
    {
        symbol: 'TAG',
        name: 'TagCoin',
        price: 0.012,
        marketCap: 1800000,
        volume24h: 3000,
        change24h: -0.4
    }
];

// Demo instellingen
const DEMO_SETTINGS = {
    hashrate: '100',
    powerConsumption: '1000',
    electricityCost: '0.25',
    poolFee: '1',
    coinmarketcapApi: 'demo-key'
};

// Export voor gebruik in renderer.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEMO_COIN_DATA, DEMO_SETTINGS };
} 