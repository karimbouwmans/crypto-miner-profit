const { ipcRenderer } = require('electron');
const axios = require('axios');
const MiningPoolService = require('./mining-pools.js');

// Import demo data
const { DEMO_COIN_DATA, DEMO_SETTINGS } = require('./demo-data.js');

// Globale variabelen
let selectedCoins = [];
let coinData = [];
let charts = {};
let miningPoolService = new MiningPoolService();
let poolData = null;
let hashrateHistory = [];
let rigHashrateHistory = {};

// Pool data opslag per rig
let rigPoolData = {};

// Real-time hashrate monitoring
let hashrateUpdateInterval = null;
let rigMonitoringIntervals = {};

// Mining Rigs Management
let miningRigs = [];
let activeRigId = null;

// Coins Management
let manualCoins = []; // Handmatig toegevoegde coins

// Beschikbare rig types en algoritmes
const RIG_TYPES = [
    { id: 'bitaxe', name: 'Bitaxe', algorithm: 'SHA-256', apiEndpoint: '/api/system/info' },
    { id: 'nerdaxe', name: 'Nerdaxe', algorithm: 'SHA-256', apiEndpoint: '/api/system/info' },
    { id: 'asic', name: 'ASIC Miner', algorithm: 'SHA-256', apiEndpoint: '/api/v1/summary' },
    { id: 'gpu', name: 'GPU Rig', algorithm: 'SHA-256', apiEndpoint: '/api/v1/summary' },
    { id: 'custom', name: 'Custom Miner', algorithm: 'SHA-256', apiEndpoint: '/api/v1/summary' }
];

const ALGORITHMS = [
    { id: 'sha256', name: 'SHA-256', coins: ['BTC', 'BCH', 'BSV', 'BTG'] },
    { id: 'scrypt', name: 'Scrypt', coins: ['LTC', 'DOGE'] },
    { id: 'ethash', name: 'Ethash', coins: ['ETH', 'ETC'] },
    { id: 'kawpow', name: 'Kawpow', coins: ['RVN'] },
    { id: 'randomx', name: 'RandomX', coins: ['XMR'] }
];

// SHA-256 Coins database
const SHA256_COINS = [
    { symbol: 'BTC', name: 'Bitcoin', algorithm: 'SHA-256' },
    { symbol: 'BCH', name: 'Bitcoin Cash', algorithm: 'SHA-256' },
    { symbol: 'BSV', name: 'Bitcoin SV', algorithm: 'SHA-256' },
    { symbol: 'BTG', name: 'Bitcoin Gold', algorithm: 'SHA-256' },
    { symbol: 'DGB', name: 'DigiByte', algorithm: 'SHA-256' },
    { symbol: 'LTC', name: 'Litecoin', algorithm: 'SHA-256' },
    { symbol: 'NMC', name: 'Namecoin', algorithm: 'SHA-256' },
    { symbol: 'PPC', name: 'Peercoin', algorithm: 'SHA-256' },
    { symbol: 'XPM', name: 'Primecoin', algorithm: 'SHA-256' },
    { symbol: 'NVC', name: 'Novacoin', algorithm: 'SHA-256' },
    { symbol: 'EMC2', name: 'Einsteinium', algorithm: 'SHA-256' },
    { symbol: 'UNO', name: 'Unobtanium', algorithm: 'SHA-256' },
    { symbol: 'MZC', name: 'MazaCoin', algorithm: 'SHA-256' },
    { symbol: 'AUR', name: 'Auroracoin', algorithm: 'SHA-256' },
    { symbol: 'DVC', name: 'Devcoin', algorithm: 'SHA-256' },
    { symbol: 'FRC', name: 'Freicoin', algorithm: 'SHA-256' },
    { symbol: 'IXC', name: 'Ixcoin', algorithm: 'SHA-256' },
    { symbol: 'NXT', name: 'Nxt', algorithm: 'SHA-256' },
    { symbol: 'POT', name: 'PotCoin', algorithm: 'SHA-256' },
    { symbol: 'TAG', name: 'TagCoin', algorithm: 'SHA-256' }
];

// DOM elementen
const elements = {
    hashrate: document.getElementById('hashrate'),
    powerConsumption: document.getElementById('power-consumption'),
    electricityCost: document.getElementById('electricity-cost'),
    poolFee: document.getElementById('pool-fee'),
    coinmarketcapApi: document.getElementById('coinmarketcap-api'),
    saveSettings: document.getElementById('save-settings'),
    loadSettings: document.getElementById('load-settings'),
    coinGrid: document.getElementById('coin-grid'),
    refreshCoins: document.getElementById('refresh-coins'),
    calculateProfit: document.getElementById('calculate-profit'),
    dailyProfit: document.getElementById('daily-profit'),
    weeklyProfit: document.getElementById('weekly-profit'),
    monthlyProfit: document.getElementById('monthly-profit'),
    yearlyProfit: document.getElementById('yearly-profit'),
    resultsBody: document.getElementById('results-body'),
    historyBody: document.getElementById('history-body'),
    exportData: document.getElementById('export-data'),
    clearHistory: document.getElementById('clear-history'),
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.getElementById('status-text'),
    // Pool configuratie elementen
    miningPool: document.getElementById('mining-pool'),
    poolConfig: document.getElementById('pool-config'),
    poolApiKey: document.getElementById('pool-api-key'),
    poolWorker: document.getElementById('pool-worker'),
    poolUrl: document.getElementById('pool-url'),
    poolStatusIndicator: document.getElementById('pool-status-indicator'),
    poolStatusText: document.getElementById('pool-status-text'),
    testPool: document.getElementById('test-pool'),
    refreshDashboardBtn: document.getElementById('refresh-dashboard-btn'),
    poolPassword: document.getElementById('pool-password'),
    passwordToggle: document.getElementById('password-toggle')
};

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startDashboardUpdater();
    setupChartRangeButtons();
    loadHashrateHistory();
    setupChartScaleToggle();
    setupDashboardRefreshButton();
    loadRigHashrateHistory();
    loadRigPoolData(); // Laad pool data
    renderPoolOverview(); // Render initieel overzicht
});

function initializeApp() {
    // Laad instellingen en geschiedenis direct
    loadSettings();
    loadMiningHistory();
    loadRigsFromStorage(); // Laad mining rigs
    loadManualCoins(); // Laad handmatige coins
    
    // Start automatische monitoring voor actieve rigs na 5 seconden
    setTimeout(() => {
        startAllRigMonitoring();
    }, 5000);
    
    // NIET direct renderCoinGrid() of updateApiStatus() hier
    // Eerst event listeners zetten in setupEventListeners()
    // Daarna pas UI renderen
}

function setupEventListeners() {
    // Alleen event listeners toevoegen voor bestaande elementen
    if (elements.saveSettings) {
        elements.saveSettings.addEventListener('click', saveSettings);
    }
    if (elements.loadSettings) {
        elements.loadSettings.addEventListener('click', loadSettings);
    }
    if (elements.calculateProfit) {
        elements.calculateProfit.addEventListener('click', calculateProfit);
    }
    if (elements.exportData) {
        elements.exportData.addEventListener('click', exportData);
    }
    if (elements.clearHistory) {
        elements.clearHistory.addEventListener('click', clearHistory);
    }
    
    // API key change handler
    if (elements.coinmarketcapApi) {
        elements.coinmarketcapApi.addEventListener('input', handleApiKeyChange);
    }
    
    // Test API knop
    const testApiBtn = document.getElementById('test-api');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', testApiConnection);
    }
    
    // Pool configuratie
    if (elements.miningPool) {
        elements.miningPool.addEventListener('change', handlePoolSelection);
    }
    
    if (elements.testPool) {
        elements.testPool.addEventListener('click', testPoolConnection);
    }
    
    // Hamburger menu functionaliteit
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');
    const mainContainer = document.querySelector('.main-container');
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            mainContainer.classList.add('sidebar-open');
        });
    }
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebarMenu);
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebarMenu();
        }
    });
    // Navigatie functionaliteit
    const navSections = document.querySelectorAll('.nav-section');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    navSections.forEach(section => {
        section.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            navSections.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            settingsPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(targetSection + '-panel').classList.add('active');
        });
    });
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            switch(e.key) {
                case '1': e.preventDefault(); switchToSection('api'); break;
                case '2': e.preventDefault(); switchToSection('pool'); break;
                case '3': e.preventDefault(); switchToSection('rig'); break;
                case '4': e.preventDefault(); switchToSection('coins'); break;
                case '5': e.preventDefault(); switchToSection('profit'); break;
            }
        }
    });
    function switchToSection(sectionName) {
        navSections.forEach(nav => nav.classList.remove('active'));
        settingsPanels.forEach(panel => panel.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        document.getElementById(sectionName + '-panel').classList.add('active');
    }
    // Nu pas UI renderen
    coinData = DEMO_COIN_DATA;
    renderCoinsList(); // Update coins lijst in instellingen
    hideLoading();
    updateApiStatus('demo', 'Demo data actief');
    // Check of er een API key is en laad dan real-time data
    const apiKey = elements.coinmarketcapApi ? elements.coinmarketcapApi.value : '';
    if (apiKey && apiKey.trim() && apiKey !== 'demo-key') {
        setTimeout(() => {
            loadCoinData();
        }, 1000);
    }
    // Initialiseer charts op de achtergrond
    setTimeout(() => {
        initializeCharts();
    }, 1000);
    
    // Globale instellingen
    if (elements.electricityCost) {
        elements.electricityCost.addEventListener('change', () => {
            updateRigSummary(); // Update rig summary wanneer elektriciteitskosten veranderen
        });
    }
    
    if (elements.poolFee) {
        elements.poolFee.addEventListener('change', () => {
            // Update berekeningen wanneer pool fee verandert
            // Profit calculator wordt nu in instellingen beheerd
        });
    }
    
    // Wachtwoord functionaliteit
    if (elements.poolPassword) {
        elements.poolPassword.addEventListener('input', savePoolPassword);
    }
    if (elements.passwordToggle) {
        elements.passwordToggle.addEventListener('click', togglePassword);
    }
}

function closeSidebarMenu() {
    console.log('Closing sidebar menu...');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const mainContainer = document.querySelector('.main-container');
    
    console.log('Sidebar element in close function:', sidebar);
    console.log('Overlay element in close function:', overlay);
    console.log('Main container element in close function:', mainContainer);
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    mainContainer.classList.remove('sidebar-open');
}

function handlePoolSelection() {
    const selectedPool = elements.miningPool.value;
    const poolConfig = elements.poolConfig;
    const testPoolBtn = elements.testPool;
    
    if (selectedPool && selectedPool !== '') {
        poolConfig.style.display = 'block';
        testPoolBtn.style.display = 'block';
        
        // Toon custom URL veld alleen voor custom pools
        const poolUrlField = elements.poolUrl.parentElement;
        if (selectedPool === 'custom') {
            poolUrlField.style.display = 'block';
        } else {
            poolUrlField.style.display = 'none';
        }
    } else {
        poolConfig.style.display = 'none';
        testPoolBtn.style.display = 'none';
        
        // Stop monitoring als pool wordt uitgeschakeld
        stopHashrateMonitoring();
        poolData = null;
        updatePoolStatus('error', 'Geen pool gekoppeld');
    }
}

async function testPoolConnection() {
    const poolType = elements.miningPool.value;
    const apiKey = elements.poolApiKey.value;
    const workerName = elements.poolWorker.value;
    const customUrl = elements.poolUrl.value;
    
    if (!poolType || !apiKey) {
        alert('Selecteer een pool en voer een API key in!');
        return;
    }
    
    updatePoolStatus('loading', 'Testen van pool verbinding...');
    
    try {
        const result = await miningPoolService.testPoolConnection(poolType, apiKey, workerName, customUrl);
        
        if (result.success) {
            updatePoolStatus('connected', `${result.poolName} verbonden!`);
            
            // Haal pool data op voor real-time berekeningen
            poolData = await miningPoolService.fetchPoolData(poolType, apiKey, workerName, customUrl);
            
            // Update hashrate automatisch als pool data beschikbaar is
            if (poolData && poolData.hashRate) {
                try {
                    const realHashrate = miningPoolService.extractHashRate(poolData.hashRate);
                    if (realHashrate > 0) {
                        const hashrateInGHs = realHashrate / 1e9;
                        elements.hashrate.value = hashrateInGHs.toFixed(2);
                        console.log(`Hashrate automatisch bijgewerkt naar ${hashrateInGHs.toFixed(2)} GH/s`);
                        
                        // Start real-time monitoring
                        startHashrateMonitoring();
                    }
                } catch (error) {
                    console.error('Error updating hashrate from pool data:', error);
                }
            }
            
            setTimeout(() => {
                updatePoolStatus('connected', `${result.poolName} actief`);
            }, 2000);
        } else {
            updatePoolStatus('error', `Fout: ${result.error}`);
            setTimeout(() => {
                updatePoolStatus('error', 'Pool verbinding gefaald');
            }, 2000);
        }
    } catch (error) {
        console.error('Pool test error:', error);
        updatePoolStatus('error', 'Pool test gefaald');
    }
}

function updatePoolStatus(status, message) {
    const indicator = elements.poolStatusIndicator;
    const text = elements.poolStatusText;
    
    // Reset classes
    indicator.className = 'status-indicator';
    
    switch (status) {
        case 'loading':
            indicator.textContent = '⏳';
            break;
        case 'connected':
            indicator.textContent = '🟢';
            indicator.classList.add('connected');
            break;
        case 'error':
            indicator.textContent = '🔴';
            indicator.classList.add('error');
            break;
        default:
            indicator.textContent = '⚪';
    }
    
    text.textContent = message;
}

async function loadCoinData() {
    const apiKey = elements.coinmarketcapApi ? elements.coinmarketcapApi.value : '';
    
    // Toon loading state
    showLoading('Laden van coin data...');
    updateApiStatus('loading', 'Testen van API...');
    
    try {
        // Gebruik demo data als standaard voor snelle laadtijd
        coinData = DEMO_COIN_DATA;
        renderCoinsList(); // Update coins lijst in instellingen
        hideLoading();
        updateApiStatus('demo', 'Demo data actief');
        
        // Probeer real-time data alleen als er een API key is
        if (apiKey && apiKey.trim() && apiKey !== 'demo-key') {
            setTimeout(async () => {
                try {
                    const symbols = SHA256_COINS.map(coin => coin.symbol).join(',');
                    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`, {
                        params: {
                            symbol: symbols,
                            convert: 'EUR'
                        },
                        headers: {
                            'X-CMC_PRO_API_KEY': apiKey
                        },
                        timeout: 5000 // 5 seconden timeout
                    });

                    coinData = Object.values(response.data.data).map(coin => ({
                        symbol: coin.symbol,
                        name: coin.name,
                        price: coin.quote.EUR.price,
                        marketCap: coin.quote.EUR.market_cap,
                        volume24h: coin.quote.EUR.volume_24h,
                        change24h: coin.quote.EUR.percent_change_24h
                    }));
                    
                    renderCoinsList(); // Update coins lijst in instellingen
                    updateApiStatus('connected', 'CoinMarketCap API actief');
                    console.log('Real-time data geladen');
                } catch (cmcError) {
                    console.log('CoinMarketCap API gefaald, probeer CoinGecko...');
                    updateApiStatus('fallback', 'CoinGecko API wordt gebruikt...');
                    
                    try {
                        await loadCoinGeckoData();
                        renderCoinsList(); // Update coins lijst in instellingen
                        updateApiStatus('fallback', 'CoinGecko API actief');
                    } catch (geckoError) {
                        console.error('Alle APIs gefaald, blijf bij demo data');
                        updateApiStatus('error', 'Demo data (API fout)');
                    }
                }
            }, 100); // Start na 100ms voor snelle initiële laadtijd
        } else {
            // Geen API key - blijf bij demo data
            updateApiStatus('demo', 'Demo data (geen API key)');
        }
        
    } catch (error) {
        console.error('Error loading coin data:', error);
        coinData = DEMO_COIN_DATA;
        renderCoinsList(); // Update coins lijst in instellingen
        hideLoading();
        updateApiStatus('error', 'Demo data (API fout)');
    }
}

async function loadCoinGeckoData() {
    try {
        // CoinGecko API - gratis, geen API key nodig
        const coinIds = getCoinGeckoIds();
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
            params: {
                ids: coinIds.join(','),
                vs_currencies: 'eur',
                include_24hr_change: true,
                include_market_cap: true,
                include_24hr_vol: true
            },
            timeout: 5000 // 5 seconden timeout
        });

        coinData = SHA256_COINS.map(coin => {
            const coinId = getCoinGeckoId(coin.symbol);
            const data = response.data[coinId];
            
            if (data) {
                return {
                    symbol: coin.symbol,
                    name: coin.name,
                    price: data.eur || 0,
                    marketCap: data.eur_market_cap || 0,
                    volume24h: data.eur_24h_vol || 0,
                    change24h: data.eur_24h_change || 0
                };
            } else {
                // Fallback naar demo data voor deze coin
                const demoCoin = DEMO_COIN_DATA.find(dc => dc.symbol === coin.symbol);
                return demoCoin || {
                    symbol: coin.symbol,
                    name: coin.name,
                    price: 0,
                    marketCap: 0,
                    volume24h: 0,
                    change24h: 0
                };
            }
        });
        
        console.log('CoinGecko data geladen');
    } catch (error) {
        console.error('Error loading CoinGecko data:', error);
        throw error;
    }
}

function getCoinGeckoIds() {
    return SHA256_COINS.map(coin => getCoinGeckoId(coin.symbol)).filter(id => id);
}

function getCoinGeckoId(symbol) {
    const coinMap = {
        'BTC': 'bitcoin',
        'BCH': 'bitcoin-cash',
        'BSV': 'bitcoin-sv',
        'BTG': 'bitcoin-gold',
        'DGB': 'digibyte',
        'LTC': 'litecoin',
        'NMC': 'namecoin',
        'PPC': 'peercoin',
        'XPM': 'primecoin',
        'NVC': 'novacoin',
        'EMC2': 'einsteinium',
        'UNO': 'unobtanium',
        'MZC': 'mazacoin',
        'AUR': 'auroracoin',
        'DVC': 'devcoin',
        'FRC': 'freicoin',
        'IXC': 'ixcoin',
        'NXT': 'nxt',
        'POT': 'potcoin',
        'TAG': 'tagcoin'
    };
    return coinMap[symbol] || null;
}

function renderCoinGrid() {
    if (!elements.coinGrid) return;
    
    elements.coinGrid.innerHTML = '';
    
    // Combineer API coins en handmatige coins
    const allCoins = [...coinData, ...manualCoins];
    
    allCoins.forEach(coin => {
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.innerHTML = `
            <div class="coin-header">
                <h3>${coin.symbol}</h3>
                <span class="coin-name">${coin.name}</span>
                ${coin._manual ? '<span class="manual-badge">Handmatig</span>' : ''}
            </div>
            <div class="coin-price">€${coin.price.toFixed(4)}</div>
            <div class="coin-change ${coin.change24h >= 0 ? 'positive' : 'negative'}">
                ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
            </div>
        `;
        
        card.addEventListener('click', () => toggleCoinSelection(coin, card));
        elements.coinGrid.appendChild(card);
    });
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
        selectedCount.textContent = `${selectedCoins.length} coins geselecteerd`;
    }
}

function toggleCoinSelection(coin, card) {
    const index = selectedCoins.findIndex(c => c.symbol === coin.symbol);
    
    if (index === -1) {
        selectedCoins.push(coin);
        card.classList.add('selected');
    } else {
        selectedCoins.splice(index, 1);
        card.classList.remove('selected');
    }
    
    updateSelectedCount();
}

// Mining Rigs Management
async function addNewRig() {
    // Vraag eerst om de rig naam
    const rigName = await showPrompt('Nieuwe Rig Toevoegen', 'Voer een naam in voor de nieuwe rig:', `Rig ${miningRigs.length + 1}`);
    if (!rigName || !rigName.trim()) {
        return; // Gebruiker heeft geannuleerd
    }
    
    // Vraag om het IP adres
    const ipAddress = await showPrompt('Nieuwe Rig Toevoegen', 'Voer het IP adres in van de rig:', '192.168.1.100');
    if (!ipAddress || !ipAddress.trim()) {
        return; // Gebruiker heeft geannuleerd
    }
    
    // Valideer IP adres
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress.trim())) {
        alert('Voer een geldig IP-adres in (bijv. 192.168.1.100)');
        return;
    }
    
    const newRig = {
        id: Date.now().toString(),
        name: rigName.trim(),
        hashrate: 100,
        powerConsumption: 1000,
        isActive: true,
        ipAddress: ipAddress.trim(),
        rigType: 'nerdaxe', // Default naar Nerdaxe
        algorithm: 'sha256', // Default naar SHA-256
        customApiEndpoint: '/api/system/info', // Default Nerdaxe endpoint
        miningCoin: 'BTC', // Default naar Bitcoin
        // Pool informatie (wordt opgehaald via API)
        poolUrl: '',
        poolPort: '',
        poolUser: ''
    };
    
    miningRigs.push(newRig);
    saveRigsToStorage();
    renderRigsList();
    setActiveRig(newRig.id);
}

function deleteRig(rigId) {
    if (confirm('Weet je zeker dat je deze rig wilt verwijderen?')) {
        miningRigs = miningRigs.filter(rig => rig.id !== rigId);
        
        if (activeRigId === rigId) {
            activeRigId = miningRigs.length > 0 ? miningRigs[0].id : null;
        }
        
        renderRigsList();
        updateRigSummary();
        saveRigsToStorage();
    }
}

function toggleRig(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (rig) {
        rig.isActive = !rig.isActive;
        renderRigsList();
        updateRigSummary();
        saveRigsToStorage();
    }
}

async function editRig(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (rig) {
        // Vraag om nieuwe naam
        const newName = await showPrompt('Rig Bewerken', 'Nieuwe naam voor de rig:', rig.name);
        if (!newName || !newName.trim()) {
            return; // Gebruiker heeft geannuleerd
        }
        
        // Vraag om nieuw IP adres
        const newIpAddress = await showPrompt('Rig Bewerken', 'Nieuw IP adres voor de rig:', rig.ipAddress || '192.168.1.100');
        if (!newIpAddress || !newIpAddress.trim()) {
            return; // Gebruiker heeft geannuleerd
        }
        
        // Valideer IP adres
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(newIpAddress.trim())) {
            alert('Voer een geldig IP-adres in (bijv. 192.168.1.100)');
            return;
        }
        
        // Update rig gegevens
        rig.name = newName.trim();
        rig.ipAddress = newIpAddress.trim();
        renderRigsList();
        saveRigsToStorage();
    }
}

function renderRigsList() {
    const rigsList = document.getElementById('rigs-list');
    if (!rigsList) return;
    
    rigsList.innerHTML = '';
    
    if (miningRigs.length === 0) {
        rigsList.innerHTML = `
            <div class="rig-card" style="text-align: center; color: #718096;">
                <p>Geen mining rigs toegevoegd</p>
                <p>Klik op "Nieuwe Rig" om je eerste rig toe te voegen</p>
            </div>
        `;
        return;
    }
    
    miningRigs.forEach(rig => {
        const rigType = RIG_TYPES.find(rt => rt.id === rig.rigType) || RIG_TYPES[0];
        const algorithm = ALGORITHMS.find(alg => alg.id === rig.algorithm) || ALGORITHMS[0];
        
        const rigCard = document.createElement('div');
        rigCard.className = `rig-card ${rig.id === activeRigId ? 'active' : ''}`;
        rigCard.setAttribute('data-rig-id', rig.id);
        
        // Status indicator
        const isHashing = rig.isHashing || false;
        const statusMessage = rig.statusMessage || 'Status onbekend';
        
        rigCard.innerHTML = `
            <div class="rig-header" onclick="toggleRigExpansion('${rig.id}')">
                <div class="rig-info">
                    <div class="rig-name">${rig.name}</div>
                    <div class="rig-details">
                        <span class="rig-type">${rigType.name}</span>
                        <span class="rig-algorithm">${algorithm.name}</span>
                        ${rig.miningCoin ? `<span class="rig-coin">🪙 ${rig.miningCoin}</span>` : ''}
                        ${rig.poolUrl ? `<span class="rig-pool">🏊 ${rig.poolUrl.split('.')[0]}</span>` : ''}
                    </div>
                </div>
                <div class="rig-status">
                    <div class="rig-status-indicator ${isHashing ? 'hashing' : 'idle'}">
                        ${isHashing ? '🟢' : '🔴'}
                    </div>
                    <div class="rig-status-text">${statusMessage}</div>
                </div>
                <div class="rig-actions" onclick="event.stopPropagation()">
                    <button class="btn-toggle ${isHashing ? 'hashing' : 'idle'}" onclick="toggleRig('${rig.id}')">
                        ${isHashing ? '🟢 Hashing' : '🔴 Idle'}
                    </button>
                    <button class="btn-test" onclick="testRigIP('${rig.id}')" title="Test IP verbinding">🌐</button>
                    <button class="btn-monitor" onclick="toggleRigMonitoring('${rig.id}')" title="Toggle monitoring">
                        ${rigMonitoringIntervals[rig.id] ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn-edit" onclick="editRig('${rig.id}')" title="Bewerk naam en IP adres">✏️</button>
                    <button class="btn-delete" onclick="deleteRig('${rig.id}')">🗑️</button>
                </div>
                <div class="rig-expand-icon">▶️</div>
            </div>
            <div class="rig-fields">
                <div class="rig-field">
                    <label>Rig Type:</label>
                    <select data-field="rigType" onchange="updateRigField('${rig.id}', 'rigType', this.value)" onclick="event.stopPropagation()">
                        ${RIG_TYPES.map(rt => `<option value="${rt.id}" ${rig.rigType === rt.id ? 'selected' : ''}>${rt.name}</option>`).join('')}
                    </select>
                    <small>Type mining rig</small>
                </div>
                <div class="rig-field">
                    <label>Algoritme:</label>
                    <select data-field="algorithm" onchange="updateRigField('${rig.id}', 'algorithm', this.value)" onclick="event.stopPropagation()">
                        ${ALGORITHMS.map(alg => `<option value="${alg.id}" ${rig.algorithm === alg.id ? 'selected' : ''}>${alg.name}</option>`).join('')}
                    </select>
                    <small>Mining algoritme</small>
                </div>
                <div class="rig-field">
                    <label>Hashrate (GH/s):</label>
                    <input type="number" data-field="hashrate" value="${rig.hashrate}" step="0.1" 
                           onchange="updateRigField('${rig.id}', 'hashrate', this.value)"
                           onclick="event.stopPropagation()" ${rig._hashrateFromApi ? 'readonly style=\'background:#eaffea;font-weight:bold\'' : ''}>
                    <small>Mining rig hashrate${rig._hashrateFromApi ? ' <span style=\'color:green;font-weight:bold\'>(live)</span>' : ''}</small>
                </div>
                <div class="rig-field">
                    <label>Stroomverbruik (W):</label>
                    <input type="number" data-field="powerConsumption" value="${rig.powerConsumption}" 
                           onchange="updateRigField('${rig.id}', 'powerConsumption', this.value)"
                           onclick="event.stopPropagation()" ${rig._powerFromApi ? 'readonly style=\'background:#eaffea;font-weight:bold\'' : ''}>
                    <small>Totale stroomverbruik${rig._powerFromApi ? ' <span style=\'color:green;font-weight:bold\'>(live)</span>' : ''}</small>
                </div>
                <div class="rig-field">
                    <label>IP Adres:</label>
                    <input type="text" data-field="ipAddress" value="${rig.ipAddress}" 
                           onchange="updateRigField('${rig.id}', 'ipAddress', this.value)"
                           onclick="event.stopPropagation()"
                           placeholder="192.168.1.100">
                    <small>IP adres van de mining rig</small>
                </div>
                <div class="rig-field">
                    <label>API Endpoint:</label>
                    <input type="text" data-field="customApiEndpoint" value="${rig.customApiEndpoint || rigType.apiEndpoint}" 
                           onchange="updateRigField('${rig.id}', 'customApiEndpoint', this.value)"
                           onclick="event.stopPropagation()"
                           placeholder="${rigType.apiEndpoint}">
                    <small>API endpoint voor rig monitoring</small>
                </div>
                <div class="rig-field">
                    <label>Mining Coin:</label>
                    <select data-field="miningCoin" onchange="updateRigField('${rig.id}', 'miningCoin', this.value)" onclick="event.stopPropagation()">
                        <option value="">-- Selecteer Coin --</option>
                        ${getAvailableCoins().map(coin => `<option value="${coin.symbol}" ${rig.miningCoin === coin.symbol ? 'selected' : ''}>${coin.symbol} - ${coin.name}</option>`).join('')}
                    </select>
                    <small>Coin waarop deze rig minet</small>
                </div>
                
                <!-- Pool Informatie Sectie -->
                <div class="rig-section-header">
                    <h5>🏊 Pool Informatie</h5>
                    ${rig._poolFromApi ? '<span class="api-badge">Live</span>' : ''}
                </div>
                
                <div class="rig-field">
                    <label>Pool URL:</label>
                    <input type="text" data-field="poolUrl" value="${rig.poolUrl}" 
                           onchange="updateRigField('${rig.id}', 'poolUrl', this.value)"
                           onclick="event.stopPropagation()"
                           placeholder="sha256.unmineable.com"
                           ${rig._poolFromApi ? 'readonly style=\'background:#eaffea;font-weight:bold\'' : ''}>
                    <small>Pool server URL${rig._poolFromApi ? ' <span style=\'color:green;font-weight:bold\'>(live)</span>' : ''}</small>
                </div>
                
                <div class="rig-field">
                    <label>Pool Port:</label>
                    <input type="text" data-field="poolPort" value="${rig.poolPort}" 
                           onchange="updateRigField('${rig.id}', 'poolPort', this.value)"
                           onclick="event.stopPropagation()"
                           placeholder="5555"
                           ${rig._poolFromApi ? 'readonly style=\'background:#eaffea;font-weight:bold\'' : ''}>
                    <small>Pool server port${rig._poolFromApi ? ' <span style=\'color:green;font-weight:bold\'>(live)</span>' : ''}</small>
                </div>
                
                <div class="rig-field">
                    <label>Pool User:</label>
                    <input type="text" data-field="poolUser" value="${rig.poolUser}" 
                           onchange="updateRigField('${rig.id}', 'poolUser', this.value)"
                           onclick="event.stopPropagation()"
                           placeholder="LTC:ltc1q4kn483yr3g969dkyecsj94k2d4cnlc3s6gt4a5.nerd04"
                           ${rig._poolFromApi ? 'readonly style=\'background:#eaffea;font-weight:bold\'' : ''}>
                    <small>Pool username/worker${rig._poolFromApi ? ' <span style=\'color:green;font-weight:bold\'>(live)</span>' : ''}</small>
                </div>
                <div class="rig-field">
                    <label>Naam:</label>
                    <input type="text" data-field="name" value="${rig.name}" onchange="updateRigField('${rig.id}', 'name', this.value)" onclick="event.stopPropagation()">
                    <small>Unieke naam voor deze rig</small>
                </div>
                <div class="rig-field">
                    <label>Kleur:</label>
                    <input type="color" data-field="color" value="${rig.color || '#63b3ed'}" onchange="updateRigField('${rig.id}', 'color', this.value)" onclick="event.stopPropagation()">
                    <small>Kies een kleur voor de grafiek</small>
                </div>
            </div>
        `;
        
        // Voeg event listeners toe voor input velden
        const inputs = rigCard.querySelectorAll('input, select');
        inputs.forEach(input => {
            // Voorkom event bubbling voor alle input events
            ['click', 'focus', 'blur', 'input', 'change', 'keydown', 'keyup'].forEach(eventType => {
                input.addEventListener(eventType, (e) => {
                    e.stopPropagation();
                });
            });
            
            // Specifieke handler voor change events
            input.addEventListener('change', (e) => {
                e.stopPropagation();
                const field = e.target.getAttribute('data-field') || e.target.name;
                const value = e.target.value;
                if (field && value !== undefined) {
                    updateRigField(rig.id, field, value);
                }
            });
        });
        
        rigCard.addEventListener('click', (e) => {
            if (!e.target.closest('.rig-actions') && !e.target.closest('input') && !e.target.closest('select')) {
                setActiveRig(rig.id);
            }
        });
        
        rigsList.appendChild(rigCard);
    });
}

function updateRigField(rigId, field, value) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (rig) {
        // Validatie per veld
        switch(field) {
            case 'rigType':
                rig.rigType = value;
                // Update API endpoint als het een bekend type is
                const rigType = RIG_TYPES.find(rt => rt.id === value);
                if (rigType && !rig.customApiEndpoint) {
                    rig.customApiEndpoint = rigType.apiEndpoint;
                }
                break;
            case 'algorithm':
                rig.algorithm = value;
                break;
            case 'customApiEndpoint':
                rig.customApiEndpoint = value.trim();
                break;
            case 'miningCoin':
                rig.miningCoin = value;
                break;
            case 'poolUrl':
                rig.poolUrl = value.trim();
                break;
            case 'poolPort':
                rig.poolPort = value.trim();
                break;
            case 'poolUser':
                rig.poolUser = value.trim();
                break;
            case 'hashrate':
                const hashrateValue = parseFloat(value);
                if (hashrateValue >= 0) {
                    rig.hashrate = hashrateValue;
                } else {
                    alert('Hashrate moet een positief getal zijn');
                    return;
                }
                break;
            case 'powerConsumption':
                const powerValue = parseFloat(value);
                if (powerValue >= 0) {
                    rig.powerConsumption = powerValue;
                } else {
                    alert('Stroomverbruik moet een positief getal zijn');
                    return;
                }
                break;
            case 'ipAddress':
                // Eenvoudige IP-adres validatie
                const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (value.trim() === '' || ipRegex.test(value.trim())) {
                    rig.ipAddress = value.trim();
                } else {
                    alert('Voer een geldig IP-adres in (bijv. 192.168.1.100)');
                    return;
                }
                break;
            default:
                // Voor andere velden, probeer als nummer, anders als string
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    rig[field] = numValue;
                } else {
                    rig[field] = value;
                }
        }
        
        // Update UI
        updateRigSummary();
        saveRigsToStorage();
        
        // Toon feedback
        console.log(`${rig.name} ${field} bijgewerkt naar: ${rig[field]}`);
    }
}

function setActiveRig(rigId) {
    activeRigId = rigId;
    renderRigsList();
}

function updateRigSummary() {
    const activeRigs = miningRigs.filter(rig => rig.isActive);
    
    const totalHashrate = activeRigs.reduce((sum, rig) => sum + rig.hashrate, 0);
    const totalPower = activeRigs.reduce((sum, rig) => sum + rig.powerConsumption, 0);
    
    // Gebruik globale elektriciteitskosten uit de hoofdinstellingen
    const globalElectricityCost = elements.electricityCost ? parseFloat(elements.electricityCost.value) || 0.25 : 0.25;
    const dailyCost = (totalPower / 1000) * globalElectricityCost * 24;
    
    // Update summary elementen
    const totalHashrateEl = document.getElementById('total-hashrate');
    const totalPowerEl = document.getElementById('total-power');
    const dailyCostEl = document.getElementById('daily-cost');
    
    if (totalHashrateEl) totalHashrateEl.textContent = `${totalHashrate.toFixed(1)} GH/s`;
    if (totalPowerEl) totalPowerEl.textContent = `${totalPower} W`;
    if (dailyCostEl) dailyCostEl.textContent = `€${dailyCost.toFixed(2)}`;
}

function saveRigsToStorage() {
    localStorage.setItem('miningRigs', JSON.stringify(miningRigs));
    localStorage.setItem('activeRigId', activeRigId);
}

function loadRigsFromStorage() {
    const savedRigs = localStorage.getItem('miningRigs');
    const savedActiveRigId = localStorage.getItem('activeRigId');
    
    if (savedRigs) {
        miningRigs = JSON.parse(savedRigs);
        activeRigId = savedActiveRigId;
    } else {
        // Maak een standaard rig als er geen zijn
        addNewRig();
    }
    
    renderRigsList();
    updateRigSummary();
}

// Update calculateProfit functie om meerdere rigs te gebruiken
async function calculateProfit() {
    const allCoins = getAvailableCoins();
    if (allCoins.length === 0) {
        alert('Geen coins beschikbaar! Voeg eerst coins toe via de instellingen.');
        return;
    }
    
    const activeRigs = miningRigs.filter(rig => rig.isActive);
    if (activeRigs.length === 0) {
        alert('Voeg minimaal één actieve mining rig toe!');
        return;
    }
    
    const results = [];
    let bestDailyProfit = 0;
    let bestCoin = null;
    let totalDailyCost = 0;
    
    // Gebruik globale elektriciteitskosten
    const globalElectricityCost = elements.electricityCost ? parseFloat(elements.electricityCost.value) || 0.25 : 0.25;
    
    // Bereken totale kosten van alle actieve rigs met globale elektriciteitskosten
    activeRigs.forEach(rig => {
        const dailyCost = (rig.powerConsumption / 1000) * globalElectricityCost * 24;
        totalDailyCost += dailyCost;
    });
    
    // Bereken totale hashrate
    const totalHashrate = activeRigs.reduce((sum, rig) => sum + rig.hashrate, 0);
    
    // Gebruik globale pool fee
    const globalPoolFee = elements.poolFee ? parseFloat(elements.poolFee.value) || 1.0 : 1.0;
    
    // Groepeer rigs per coin voor specifieke berekeningen
    const rigsByCoin = {};
    activeRigs.forEach(rig => {
        const coin = rig.miningCoin || 'BTC'; // Default naar BTC als geen coin is geselecteerd
        if (!rigsByCoin[coin]) {
            rigsByCoin[coin] = [];
        }
        rigsByCoin[coin].push(rig);
    });
    
    for (const coin of allCoins) {
        const networkHashrate = getEstimatedNetworkHashrate(coin.symbol);
        
        // Bereken hashrate voor deze specifieke coin
        const coinRigs = rigsByCoin[coin.symbol] || [];
        const coinHashrate = coinRigs.reduce((sum, rig) => sum + rig.hashrate, 0);
        
        // Als geen rigs op deze coin minen, gebruik totale hashrate
        const effectiveHashrate = coinHashrate > 0 ? coinHashrate : totalHashrate;
        
        const dailyReward = calculateDailyReward(effectiveHashrate, networkHashrate, coin.symbol);
        
        // Pas pool fee toe op de dagelijkse beloning
        const dailyRewardAfterPoolFee = dailyReward * (1 - globalPoolFee / 100);
        const dailyRevenue = dailyRewardAfterPoolFee * coin.price;
        const dailyProfit = dailyRevenue - totalDailyCost;
        const profitMargin = (dailyProfit / dailyRevenue) * 100;
        
        results.push({
            coin: coin,
            hashrate: effectiveHashrate,
            dailyReward: dailyReward,
            dailyRewardAfterPoolFee: dailyRewardAfterPoolFee,
            dailyRevenue: dailyRevenue,
            dailyCost: totalDailyCost,
            dailyProfit: dailyProfit,
            profitMargin: profitMargin,
            poolFee: globalPoolFee,
            rigsCount: coinRigs.length
        });
        
        if (dailyProfit > bestDailyProfit) {
            bestDailyProfit = dailyProfit;
            bestCoin = coin;
        }
    }
    
    // Sorteer op winstgevendheid
    results.sort((a, b) => b.dailyProfit - a.dailyProfit);
    
    displayResults(results);
    updateProfitDisplays(bestDailyProfit);
    
    // Sla mining data op
    const poolInfo = activeRigs.length > 0 ? `${activeRigs.length} rigs actief` : 'Geen rigs';
    await saveMiningData(totalHashrate, bestCoin, bestDailyProfit, totalDailyCost, poolInfo);
    
    // Update charts
    updateCharts(results);
}

function getEstimatedNetworkHashrate(symbol) {
    // Vereenvoudigde schattingen van network hashrate
    const hashrates = {
        'BTC': 500 * 1e18, // 500 EH/s
        'BCH': 2 * 1e18,   // 2 EH/s
        'BSV': 1 * 1e18,   // 1 EH/s
        'BTG': 3 * 1e15,   // 3 PH/s
        'DGB': 1 * 1e15,   // 1 PH/s
        'LTC': 800 * 1e12, // 800 TH/s
        'NMC': 100 * 1e12, // 100 TH/s
        'PPC': 50 * 1e12,  // 50 TH/s
        'XPM': 10 * 1e12,  // 10 TH/s
        'NVC': 5 * 1e12,   // 5 TH/s
        'EMC2': 2 * 1e12,  // 2 TH/s
        'UNO': 1 * 1e12,   // 1 TH/s
        'MZC': 500 * 1e9,  // 500 GH/s
        'AUR': 200 * 1e9,  // 200 GH/s
        'DVC': 100 * 1e9,  // 100 GH/s
        'FRC': 50 * 1e9,   // 50 GH/s
        'IXC': 25 * 1e9,   // 25 GH/s
        'NXT': 10 * 1e9,   // 10 GH/s
        'POT': 5 * 1e9,    // 5 GH/s
        'TAG': 2 * 1e9     // 2 GH/s
    };
    
    return hashrates[symbol] || 1e12; // Default 1 TH/s
}

function calculateDailyReward(hashrate, networkHashrate, symbol) {
    // Vereenvoudigde berekening
    const blockReward = getBlockReward(symbol);
    const blockTime = getBlockTime(symbol);
    const blocksPerDay = 86400 / blockTime;
    const dailyReward = (hashrate / networkHashrate) * blockReward * blocksPerDay;
    
    return dailyReward;
}

function getBlockReward(symbol) {
    const rewards = {
        'BTC': 6.25,
        'BCH': 6.25,
        'BSV': 6.25,
        'BTG': 6.25,
        'DGB': 800,
        'LTC': 12.5,
        'NMC': 50,
        'PPC': 1,
        'XPM': 1,
        'NVC': 1,
        'EMC2': 1,
        'UNO': 1,
        'MZC': 1,
        'AUR': 1,
        'DVC': 1,
        'FRC': 1,
        'IXC': 1,
        'NXT': 1,
        'POT': 1,
        'TAG': 1
    };
    
    return rewards[symbol] || 1;
}

function getBlockTime(symbol) {
    const times = {
        'BTC': 600,    // 10 minuten
        'BCH': 600,    // 10 minuten
        'BSV': 600,    // 10 minuten
        'BTG': 600,    // 10 minuten
        'DGB': 15,     // 15 seconden
        'LTC': 150,    // 2.5 minuten
        'NMC': 600,    // 10 minuten
        'PPC': 600,    // 10 minuten
        'XPM': 60,     // 1 minuut
        'NVC': 300,    // 5 minuten
        'EMC2': 60,    // 1 minuut
        'UNO': 300,    // 5 minuten
        'MZC': 150,    // 2.5 minuten
        'AUR': 300,    // 5 minuten
        'DVC': 600,    // 10 minuten
        'FRC': 600,    // 10 minuten
        'IXC': 600,    // 10 minuten
        'NXT': 60,     // 1 minuut
        'POT': 60,     // 1 minuut
        'TAG': 60      // 1 minuut
    };
    
    return times[symbol] || 600;
}

function displayResults(results) {
    if (!elements.resultsBody) return;
    
    elements.resultsBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${result.coin.symbol}</strong><br>
                <small>${result.coin.name}</small>
                ${result.rigsCount > 0 ? `<br><small style="color: #ff9800;">🪙 ${result.rigsCount} rig(s) minen deze coin</small>` : ''}
            </td>
            <td>€${result.coin.price.toFixed(4)}</td>
            <td>${formatHashrate(result.hashrate)}</td>
            <td>${result.dailyReward.toFixed(6)} ${result.coin.symbol}</td>
            <td>${result.dailyRewardAfterPoolFee.toFixed(6)} ${result.coin.symbol}<br>
                <small>(na ${result.poolFee}% pool fee)</small></td>
            <td>€${result.dailyRevenue.toFixed(2)}</td>
            <td>€${result.dailyCost.toFixed(2)}</td>
            <td class="${result.dailyProfit >= 0 ? 'positive' : 'negative'}">
                €${result.dailyProfit.toFixed(2)}
            </td>
            <td class="${result.profitMargin >= 0 ? 'positive' : 'negative'}">
                ${result.profitMargin >= 0 ? '+' : ''}${result.profitMargin.toFixed(1)}%
            </td>
        `;
        elements.resultsBody.appendChild(row);
    });
}

function updateProfitDisplays(dailyProfit) {
    elements.dailyProfit.textContent = `€${dailyProfit.toFixed(2)}`;
    elements.weeklyProfit.textContent = `€${(dailyProfit * 7).toFixed(2)}`;
    elements.monthlyProfit.textContent = `€${(dailyProfit * 30).toFixed(2)}`;
    elements.yearlyProfit.textContent = `€${(dailyProfit * 365).toFixed(2)}`;
    
    // Update kleuren
    const profitElements = [elements.dailyProfit, elements.weeklyProfit, elements.monthlyProfit, elements.yearlyProfit];
    profitElements.forEach(el => {
        el.className = dailyProfit >= 0 ? 'profit-display positive' : 'profit-display negative';
    });
}

function formatHashrate(hashrate) {
    if (hashrate >= 1e18) return `${(hashrate / 1e18).toFixed(2)} EH/s`;
    if (hashrate >= 1e15) return `${(hashrate / 1e15).toFixed(2)} PH/s`;
    if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
    if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`;
    if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`;
    return `${(hashrate / 1e3).toFixed(2)} KH/s`;
}

function initializeCharts() {
    const profitCanvas = document.getElementById('profit-chart');
    const roiCanvas = document.getElementById('roi-chart');
    
    // Check of de canvas elementen bestaan
    if (!profitCanvas || !roiCanvas) {
        console.warn('Chart canvas elementen niet gevonden, charts worden niet geïnitialiseerd');
        return;
    }
    
    const profitCtx = profitCanvas.getContext('2d');
    const roiCtx = roiCanvas.getContext('2d');
    
    if (!profitCtx || !roiCtx) {
        console.warn('Kan geen 2D context krijgen voor charts');
        return;
    }

    charts.profit = new Chart(profitCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Dagelijkse Winst (€)',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    charts.roi = new Chart(roiCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#38a169', '#3182ce', '#d69e2e', '#e53e3e', '#805ad5',
                    '#dd6b20', '#319795', '#2d3748', '#4a5568', '#718096'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateCharts(results) {
    // Check of charts bestaan
    if (!charts.profit || !charts.roi) {
        console.warn('Charts zijn niet geïnitialiseerd');
        return;
    }
    
    // Update profit chart
    charts.profit.data.labels = results.map(r => r.symbol);
    charts.profit.data.datasets[0].data = results.map(r => r.dailyProfit);
    charts.profit.update();

    // Update ROI chart
    charts.roi.data.labels = results.map(r => `${r.symbol} (${r.roi.toFixed(1)}%)`);
    charts.roi.data.datasets[0].data = results.map(r => Math.abs(r.roi));
    charts.roi.update();
}

async function saveSettings() {
    const settings = {
        hashrate: elements.hashrate ? elements.hashrate.value : DEMO_SETTINGS.hashrate,
        powerConsumption: elements.powerConsumption ? elements.powerConsumption.value : DEMO_SETTINGS.powerConsumption,
        electricityCost: elements.electricityCost ? elements.electricityCost.value : DEMO_SETTINGS.electricityCost,
        coinmarketcapApi: elements.coinmarketcapApi ? elements.coinmarketcapApi.value : '',
        // Pool configuratie
        miningPool: elements.miningPool ? elements.miningPool.value : '',
        poolApiKey: elements.poolApiKey ? elements.poolApiKey.value : '',
        poolWorker: elements.poolWorker ? elements.poolWorker.value : '',
        poolUrl: elements.poolUrl ? elements.poolUrl.value : ''
    };
    
    await ipcRenderer.invoke('save-settings', settings);
    alert('Instellingen opgeslagen!');
}

async function loadSettings() {
    const settings = await ipcRenderer.invoke('load-settings');
    
    // Basis instellingen met null checks
    if (elements.hashrate) {
        if (settings.hashrate) elements.hashrate.value = settings.hashrate;
        else elements.hashrate.value = DEMO_SETTINGS.hashrate;
    }
    
    if (elements.powerConsumption) {
        if (settings.powerConsumption) elements.powerConsumption.value = settings.powerConsumption;
        else elements.powerConsumption.value = DEMO_SETTINGS.powerConsumption;
    }
    
    if (elements.electricityCost) {
        if (settings.electricityCost) elements.electricityCost.value = settings.electricityCost;
        else elements.electricityCost.value = DEMO_SETTINGS.electricityCost;
    }
    
    if (elements.coinmarketcapApi && settings.coinmarketcapApi !== undefined) {
        elements.coinmarketcapApi.value = settings.coinmarketcapApi;
    }
    
    // Pool configuratie
    if (elements.miningPool && settings.miningPool) {
        elements.miningPool.value = settings.miningPool;
        handlePoolSelection(); // Trigger pool configuratie display
    }
    
    if (elements.poolApiKey && settings.poolApiKey) {
        elements.poolApiKey.value = settings.poolApiKey;
    }
    if (elements.poolWorker && settings.poolWorker) {
        elements.poolWorker.value = settings.poolWorker;
    }
    if (elements.poolUrl && settings.poolUrl) {
        elements.poolUrl.value = settings.poolUrl;
    }
}

async function saveMiningData(hashrate, bestCoin, dailyProfit, electricityCost, poolInfo) {
    const data = {
        hashrate: hashrate,
        bestCoin: bestCoin.symbol,
        dailyProfit: dailyProfit,
        electricityCost: electricityCost,
        netProfit: dailyProfit - electricityCost,
        poolData: poolInfo
    };
    
    await ipcRenderer.invoke('save-mining-data', data);
    loadMiningHistory();
}

async function loadMiningHistory() {
    const history = await ipcRenderer.invoke('load-mining-data');
    if (!elements.historyBody) return;
    elements.historyBody.innerHTML = '';
    history.forEach(entry => {
        const row = document.createElement('tr');
        const profit = (typeof entry.dailyProfit === 'number' && !isNaN(entry.dailyProfit)) ? entry.dailyProfit.toFixed(2) : '-';
        const electricity = (typeof entry.electricityCost === 'number' && !isNaN(entry.electricityCost)) ? '€' + entry.electricityCost.toFixed(2) : '-';
        row.innerHTML = `
            <td>${entry.date || '-'}</td>
            <td>${entry.coin || '-'}</td>
            <td>${entry.hashrate || '-'}</td>
            <td>€${profit}</td>
            <td>${electricity}</td>
            <td>${entry.poolInfo || '-'}</td>
        `;
        elements.historyBody.appendChild(row);
    });
}

function exportData() {
    const data = {
        settings: {
            hashrate: elements.hashrate ? elements.hashrate.value : DEMO_SETTINGS.hashrate,
            powerConsumption: elements.powerConsumption ? elements.powerConsumption.value : DEMO_SETTINGS.powerConsumption,
            electricityCost: elements.electricityCost ? elements.electricityCost.value : DEMO_SETTINGS.electricityCost
        },
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mining-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function clearHistory() {
    if (confirm('Weet je zeker dat je de mining geschiedenis wilt wissen?')) {
        await ipcRenderer.invoke('save-mining-data', []);
        loadMiningHistory();
    }
}

function showLoading(message) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingIndicator && loadingText) {
        loadingText.textContent = message || 'Laden...';
        loadingIndicator.style.display = 'block';
    }
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function updateApiStatus(status, message) {
    const indicator = document.getElementById('status-indicator');
    const text = document.getElementById('status-text');
    if (!indicator || !text) return;
    indicator.className = 'status-indicator';
    switch (status) {
        case 'connected':
            indicator.textContent = '🟢';
            indicator.classList.add('connected');
            break;
        case 'fallback':
            indicator.textContent = '🟡';
            indicator.classList.add('fallback');
            break;
        case 'error':
            indicator.textContent = '🔴';
            indicator.classList.add('error');
            break;
        case 'demo':
            indicator.textContent = '🔵';
            indicator.classList.add('demo');
            break;
        default:
            indicator.textContent = '⚪';
    }
    text.textContent = message;
}

async function testApiConnection() {
    const apiKey = elements.coinmarketcapApi ? elements.coinmarketcapApi.value : '';
    
    if (!apiKey || apiKey === 'demo-key') {
        updateApiStatus('demo', 'Demo mode - geen API key nodig');
        return;
    }
    
    updateApiStatus('loading', 'Testen van CoinMarketCap API...');
    
    try {
        // Test CoinMarketCap API
        const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`, {
            params: {
                symbol: 'BTC',
                convert: 'EUR'
            },
            headers: {
                'X-CMC_PRO_API_KEY': apiKey
            },
            timeout: 5000
        });
        
        updateApiStatus('connected', 'CoinMarketCap API werkt!');
        setTimeout(() => {
            updateApiStatus('connected', 'CoinMarketCap API actief');
        }, 2000);
        
    } catch (error) {
        console.log('CoinMarketCap API test gefaald, test CoinGecko...');
        updateApiStatus('fallback', 'Testen van CoinGecko API...');
        
        try {
            // Test CoinGecko API
            await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: 'bitcoin',
                    vs_currencies: 'eur'
                },
                timeout: 5000
            });
            
            updateApiStatus('fallback', 'CoinGecko API werkt!');
            setTimeout(() => {
                updateApiStatus('fallback', 'CoinGecko API actief');
            }, 2000);
            
        } catch (geckoError) {
            updateApiStatus('error', 'Beide APIs gefaald');
            setTimeout(() => {
                updateApiStatus('error', 'Demo data (API fout)');
            }, 2000);
        }
    }
}

// Real-time hashrate monitoring
function startHashrateMonitoring() {
    if (hashrateUpdateInterval) {
        clearInterval(hashrateUpdateInterval);
    }
    
    hashrateUpdateInterval = setInterval(async () => {
        if (poolData && elements.miningPool.value) {
            try {
                const poolType = elements.miningPool.value;
                const apiKey = elements.poolApiKey.value;
                const workerName = elements.poolWorker.value;
                const customUrl = elements.poolUrl.value;
                
                // Haal nieuwe pool data op
                poolData = await miningPoolService.fetchPoolData(poolType, apiKey, workerName, customUrl);
                
                // Update hashrate als beschikbaar
                if (poolData && poolData.hashRate) {
                    const realHashrate = miningPoolService.extractHashRate(poolData.hashRate);
                    if (realHashrate > 0) {
                        const hashrateInGHs = realHashrate / 1e9;
                        elements.hashrate.value = hashrateInGHs.toFixed(2);
                    }
                }
            } catch (error) {
                console.error('Error updating hashrate:', error);
            }
        }
    }, 30000); // Update elke 30 seconden
}

function stopHashrateMonitoring() {
    if (hashrateUpdateInterval) {
        clearInterval(hashrateUpdateInterval);
        hashrateUpdateInterval = null;
    }
}

// Collapsible secties functionaliteit
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
    
    if (section.classList.contains('collapsed')) {
        // Open sectie
        section.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        // Sluit sectie
        section.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

// Initialiseer secties (alleen API sectie open bij start)
function initializeSections() {
    // Sluit alle secties behalve API
    const sections = ['pool-section', 'rig-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
        if (section && toggle) {
            section.classList.add('collapsed');
            toggle.classList.add('collapsed');
        }
    });
}

// Open alle secties
function expandAllSections() {
    const sections = ['api-section', 'pool-section', 'rig-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
        if (section && toggle) {
            section.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
        }
    });
}

// Sluit alle secties
function collapseAllSections() {
    const sections = ['api-section', 'pool-section', 'rig-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
        if (section && toggle) {
            section.classList.add('collapsed');
            toggle.classList.add('collapsed');
        }
    });
}

// Keyboard shortcuts voor secties
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                toggleSection('api-section');
                break;
            case '2':
                e.preventDefault();
                toggleSection('pool-section');
                break;
            case '3':
                e.preventDefault();
                toggleSection('rig-section');
                break;
            case '0':
                e.preventDefault();
                expandAllSections();
                break;
            case '9':
                e.preventDefault();
                collapseAllSections();
                break;
        }
    }
});

// API key change handler
function handleApiKeyChange() {
    const apiKey = elements.coinmarketcapApi ? elements.coinmarketcapApi.value : '';
    
    if (apiKey && apiKey.trim() && apiKey !== 'demo-key') {
        // API key toegevoegd - laad real-time data
        updateApiStatus('loading', 'API key gedetecteerd, laden van real-time data...');
        loadCoinData();
    } else {
        // API key verwijderd - schakel terug naar demo data
        updateApiStatus('demo', 'Demo data (geen API key)');
        coinData = DEMO_COIN_DATA;
        renderCoinGrid();
    }
}

// Test IP-adres van een rig
async function testRigIP(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig || !rig.ipAddress) {
        alert('Geen IP-adres ingesteld voor deze rig');
        return;
    }
    
    const ip = rig.ipAddress.trim();
    if (!ip) {
        alert('IP-adres is leeg');
        return;
    }
    
    // Verschillende API endpoints om te proberen
    const endpoints = [
        { url: `http://${ip}:8080/api/v1/summary`, name: 'HiveOS API' },
        { url: `http://${ip}:3333/api/v1/summary`, name: 'T-Rex Miner API' },
        { url: `http://${ip}:3333/summary`, name: 'T-Rex Miner (oud)' },
        { url: `http://${ip}:3333`, name: 'T-Rex Miner Web' },
        { url: `http://${ip}:8080`, name: 'HiveOS Web' },
        { url: `http://${ip}:80`, name: 'HTTP Web' },
        { url: `http://${ip}:443`, name: 'HTTPS Web' }
    ];
    
    let foundEndpoint = null;
    let errorMessage = '';
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testen van ${endpoint.name} op ${endpoint.url}`);
            const response = await fetch(endpoint.url, {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                foundEndpoint = endpoint;
                break;
            } else {
                errorMessage += `${endpoint.name}: HTTP ${response.status}\n`;
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                // CORS of netwerk fout - probeer volgende endpoint
                continue;
            }
            errorMessage += `${endpoint.name}: ${error.message}\n`;
        }
    }
    
    if (foundEndpoint) {
        try {
            const data = await fetch(foundEndpoint.url).then(r => r.json());
            const hashrate = data.hashrate || data.hash_rate || data.hashRate || 'Onbekend';
            alert(`✅ Rig ${rig.name} (${ip}) is bereikbaar!\n\nEndpoint: ${foundEndpoint.name}\nHashrate: ${hashrate}`);
        } catch (parseError) {
            alert(`✅ Rig ${rig.name} (${ip}) is bereikbaar!\n\nEndpoint: ${foundEndpoint.name}\n(JSON parsing gefaald)`);
        }
    } else {
        // Probeer een simpele ping test
        try {
            const pingResponse = await fetch(`http://${ip}`, {
                method: 'HEAD',
                timeout: 2000
            });
            alert(`⚠️ Rig ${rig.name} (${ip}) is bereikbaar maar geen bekende mining API gevonden.\n\nProbeer handmatig:\n- http://${ip}:3333\n- http://${ip}:8080\n\nFouten:\n${errorMessage}`);
        } catch (pingError) {
            alert(`❌ Rig ${rig.name} (${ip}) is niet bereikbaar.\n\nControleer:\n- IP-adres is correct\n- Rig is aan en verbonden\n- Firewall instellingen\n\nFouten:\n${errorMessage}`);
        }
    }
}

// Test alle actieve rigs
async function testAllRigs() {
    const activeRigs = miningRigs.filter(rig => rig.isActive && rig.ipAddress && rig.ipAddress.trim());
    
    if (activeRigs.length === 0) {
        alert('Geen actieve rigs met IP-adres gevonden');
        return;
    }
    
    let results = [];
    let onlineCount = 0;
    
    for (const rig of activeRigs) {
        const ip = rig.ipAddress.trim();
        let status = '❌ Offline';
        
        // Probeer verschillende endpoints
        const endpoints = [
            `http://${ip}:8080/api/v1/summary`,
            `http://${ip}:3333/api/v1/summary`,
            `http://${ip}:3333/summary`,
            `http://${ip}:3333`,
            `http://${ip}:8080`
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    timeout: 2000
                });
                
                if (response.ok) {
                    status = '✅ Online';
                    onlineCount++;
                    break;
                }
            } catch (error) {
                // Probeer volgende endpoint
                continue;
            }
        }
        
        results.push(`${status} ${rig.name} (${ip})`);
    }
    
    const summary = `Rig Status Test:\n\n${results.join('\n')}\n\n📊 Samenvatting: ${onlineCount}/${activeRigs.length} rigs online`;
    alert(summary);
}

// Toggle monitoring voor een rig
function toggleRigMonitoring(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig) return;
    
    if (rigMonitoringIntervals[rigId]) {
        // Stop monitoring
        stopRigMonitoring(rigId);
        console.log(`Monitoring gestopt voor ${rig.name}`);
    } else {
        // Start monitoring
        startRigMonitoring(rigId);
        console.log(`Monitoring gestart voor ${rig.name}`);
    }
    
    // Update UI
    renderRigsList();
}

// Start monitoring voor een specifieke rig
async function startRigMonitoring(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig || !rig.ipAddress || !rig.isActive) return;
    
    // Stop bestaande monitoring als die er is
    if (rigMonitoringIntervals[rigId]) {
        clearInterval(rigMonitoringIntervals[rigId]);
    }
    
    // Start nieuwe monitoring elke 30 seconden
    rigMonitoringIntervals[rigId] = setInterval(async () => {
        await checkRigStatus(rigId);
    }, 30000); // 30 seconden
    
    // Direct eerste check
    await checkRigStatus(rigId);
}

// Stop monitoring voor een specifieke rig
function stopRigMonitoring(rigId) {
    if (rigMonitoringIntervals[rigId]) {
        clearInterval(rigMonitoringIntervals[rigId]);
        delete rigMonitoringIntervals[rigId];
    }
}

// Check status van een rig via API
async function checkRigStatus(rigId) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig || !rig.ipAddress || !rig.isActive) {
        console.log(`Rig ${rigId} niet actief of geen IP-adres`);
        return;
    }
    
    const ip = rig.ipAddress.trim();
    if (!ip) {
        console.log(`Rig ${rigId} heeft geen geldig IP-adres`);
        return;
    }
    
    console.log(`🔍 Checking status voor ${rig.name} (${ip}) - Type: ${rig.rigType}`);
    
    try {
        // Bepaal API endpoint op basis van rig type
        let apiUrl = '';
        
        if (rig.rigType === 'bitaxe' || rig.rigType === 'nerdaxe') {
            apiUrl = `http://${ip}/api/system/info`;
            console.log(`📡 Bitaxe/Nerdaxe endpoint: ${apiUrl}`);
        } else if (rig.customApiEndpoint && rig.customApiEndpoint.trim()) {
            apiUrl = rig.customApiEndpoint.startsWith('http') 
                ? rig.customApiEndpoint 
                : `http://${ip}${rig.customApiEndpoint.startsWith('/') ? '' : '/'}${rig.customApiEndpoint}`;
            console.log(`📡 Custom endpoint: ${apiUrl}`);
        } else {
            // Probeer standaard endpoints
            const endpoints = [
                `http://${ip}:8080/api/v1/summary`,
                `http://${ip}:3333/api/v1/summary`,
                `http://${ip}:3333/summary`
            ];
            
            console.log(`📡 Testing standaard endpoints voor ${rig.name}`);
            for (const endpoint of endpoints) {
                try {
                    console.log(`  Testing: ${endpoint}`);
                    const response = await fetch(endpoint, { timeout: 5000 });
                    if (response.ok) {
                        apiUrl = endpoint;
                        console.log(`✅ Found working endpoint: ${apiUrl}`);
                        break;
                    } else {
                        console.log(`❌ Endpoint failed: ${endpoint} - HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`❌ Endpoint error: ${endpoint} - ${e.message}`);
                    continue;
                }
            }
        }
        
        if (!apiUrl) {
            console.log(`❌ Geen werkende API endpoint gevonden voor ${rig.name}`);
            updateRigStatus(rigId, false, 'Geen API endpoint gevonden');
            return;
        }
        
        console.log(`📡 Fetching data from: ${apiUrl}`);
        const response = await fetch(apiUrl, { timeout: 5000 });
        if (!response.ok) {
            console.log(`❌ API response error: HTTP ${response.status}`);
            updateRigStatus(rigId, false, `HTTP ${response.status}`);
            return;
        }
        
        const data = await response.json();
        console.log(`📊 API data voor ${rig.name}:`, data);
        
        // Check of rig daadwerkelijk hashing
        let isHashing = false;
        let hashrate = 0;
        let statusMessage = '';
        
        if (rig.rigType === 'bitaxe' || rig.rigType === 'nerdaxe') {
            // Bitaxe/Nerdaxe specifieke checks
            hashrate = data.hashRate || data.hashrate || 0;
            rig.hashrate = hashrate > 0 ? hashrate : rig.hashrate;
            rig._hashrateFromApi = hashrate > 0;
            const sharesAccepted = data.sharesAccepted || 0;
            const sharesRejected = data.sharesRejected || 0;
            const temp = data.temp || 0;
            const power = data.power || 0;
            const fanrpm = data.fanrpm || 0;
            const uptime = data.uptimeSeconds || 0;
            
            // Sla het stroomverbruik op in het rig object
            rig.powerConsumption = power > 0 ? power : rig.powerConsumption;
            rig._powerFromApi = power > 0;
            
            // Haal pool informatie op uit API response
            if (data.stratumURL || data.poolUrl || data.pool || data.stratum) {
                rig.poolUrl = data.stratumURL || data.poolUrl || data.pool?.url || data.stratum?.url || '';
                rig.poolPort = data.stratumPort || data.poolPort || data.pool?.port || data.stratum?.port || '';
                rig.poolUser = data.stratumUser || data.poolUser || data.pool?.user || data.stratum?.user || '';
                rig._poolFromApi = true;
            }
            
            console.log(`🔍 Bitaxe/Nerdaxe data: hashrate=${hashrate}, shares=${sharesAccepted}/${sharesRejected}, temp=${temp}, power=${power}W, fan=${fanrpm}RPM`);
            console.log(`🏊 Pool info: ${rig.poolUrl}:${rig.poolPort} (${rig.poolUser})`);
            
            // Minder strikte hashing detectie - alleen hashrate check
            isHashing = hashrate > 0;
            statusMessage = `Hashrate: ${hashrate.toFixed(2)} GH/s | Temp: ${temp}°C | Power: ${power.toFixed(1)}W | Shares: ${sharesAccepted}/${sharesRejected}`;
        } else {
            // Algemene mining checks
            hashrate = data.hashrate || data.hash_rate || data.hashRate || data.hashrate_5s || data.hashrate_1m || 0;
            const shares = data.shares || data.accepted_shares || data.shares_accepted || 0;
            const rejected = data.rejected_shares || data.shares_rejected || 0;
            
            console.log(`🔍 General mining data: hashrate=${hashrate}, shares=${shares}/${rejected}`);
            
            // Minder strikte hashing detectie - alleen hashrate check
            isHashing = hashrate > 0;
            statusMessage = `Hashrate: ${hashrate.toFixed(2)} GH/s | Shares: ${shares}/${rejected}`;
        }
        
        console.log(`🎯 Hashing status voor ${rig.name}: ${isHashing ? '🟢 HASHING' : '🔴 IDLE'} (hashrate: ${hashrate})`);
        
        // Update rig status
        updateRigStatus(rigId, isHashing, statusMessage);
        
        // Sla pool data op voor het overzicht
        if (isHashing && data) {
            const poolData = {
                shares: data.sharesAccepted || data.shares || data.accepted_shares || 0,
                rejected: data.sharesRejected || data.rejected_shares || 0,
                // Stratum informatie
                stratumUrl: data.stratumURL || data.poolUrl || data.pool?.url || data.stratum?.url || '',
                stratumPort: data.stratumPort || data.poolPort || data.pool?.port || data.stratum?.port || '',
                stratumUser: data.stratumUser || data.poolUser || data.pool?.user || data.stratum?.user || ''
            };
            updateRigPoolData(rigId, poolData);
        }
        
        // Update hashrate in rig data als die significant verschilt
        if (isHashing && Math.abs(hashrate - rig.hashrate) > 1) {
            console.log(`📈 Updating hashrate voor ${rig.name}: ${rig.hashrate} → ${hashrate}`);
            rig.hashrate = hashrate;
            saveRigsToStorage();
            updateRigSummary();
        }
        
    } catch (error) {
        console.log(`❌ Rig monitoring error voor ${rig.name}:`, error.message);
        updateRigStatus(rigId, false, `API fout: ${error.message}`);
    }
}

// Update rig status in UI
function updateRigStatus(rigId, isHashing, statusMessage) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig) return;
    
    // Update rig data
    rig.isHashing = isHashing;
    rig.lastStatusCheck = new Date().toISOString();
    rig.statusMessage = statusMessage;
    
    // Update UI
    const rigCard = document.querySelector(`[data-rig-id="${rigId}"]`);
    if (rigCard) {
        const statusIndicator = rigCard.querySelector('.rig-status-indicator');
        const statusText = rigCard.querySelector('.rig-status-text');
        const toggleButton = rigCard.querySelector('.btn-toggle');
        
        if (statusIndicator) {
            statusIndicator.textContent = isHashing ? '🟢' : '🔴';
            statusIndicator.className = `rig-status-indicator ${isHashing ? 'hashing' : 'idle'}`;
        }
        
        if (statusText) {
            statusText.textContent = statusMessage;
        }
        
        if (toggleButton) {
            toggleButton.textContent = isHashing ? '🟢 Hashing' : '🔴 Idle';
            toggleButton.className = `btn-toggle ${isHashing ? 'hashing' : 'idle'}`;
        }
    }
    
    // Update summary
    updateRigSummary();
}

// Start monitoring voor alle actieve rigs
function startAllRigMonitoring() {
    miningRigs.forEach(rig => {
        if (rig.isActive && rig.ipAddress && rig.ipAddress.trim()) {
            startRigMonitoring(rig.id);
        }
    });
}

// Stop monitoring voor alle rigs
function stopAllRigMonitoring() {
    Object.keys(rigMonitoringIntervals).forEach(rigId => {
        stopRigMonitoring(rigId);
    });
}

// Debug functie om monitoring status te controleren
function debugRigMonitoring() {
    console.log('🔍 === RIG MONITORING DEBUG ===');
    console.log('Actieve monitoring intervals:', Object.keys(rigMonitoringIntervals));
    console.log('Totaal aantal rigs:', miningRigs.length);
    
    miningRigs.forEach(rig => {
        const isMonitoring = rigMonitoringIntervals[rig.id] ? '✅' : '❌';
        const isActive = rig.isActive ? '✅' : '❌';
        const hasIP = rig.ipAddress && rig.ipAddress.trim() ? '✅' : '❌';
        const isHashing = rig.isHashing ? '🟢' : '🔴';
        
        console.log(`${rig.name}:`);
        console.log(`  - Actief: ${isActive} ${rig.isActive}`);
        console.log(`  - IP-adres: ${hasIP} ${rig.ipAddress || 'Geen IP'}`);
        console.log(`  - Monitoring: ${isMonitoring} ${rigMonitoringIntervals[rig.id] ? 'Actief' : 'Inactief'}`);
        console.log(`  - Hashing: ${isHashing} ${rig.isHashing ? 'Ja' : 'Nee'}`);
        console.log(`  - Status: ${rig.statusMessage || 'Geen status'}`);
        console.log(`  - Type: ${rig.rigType}`);
        console.log(`  - API Endpoint: ${rig.customApiEndpoint || 'Standaard'}`);
    });
    
    console.log('=== EINDE DEBUG ===');
}

// Detecteer rig type op basis van API response
function detectRigType(data) {
    // Detecteer rig type op basis van API response
    if (data.hashRate !== undefined && data.power !== undefined) {
        return 'bitaxe'; // Bitaxe/Nerdaxe hebben deze velden
    }
    if (data.hashrate !== undefined && data.shares !== undefined) {
        return 'asic'; // ASIC miners hebben meestal deze velden
    }
    return 'custom'; // Default naar custom
}

// Coins Management Functions
function renderCoinsList() {
    const coinsList = document.getElementById('coins-list');
    if (!coinsList) return;
    
    coinsList.innerHTML = '';
    
    // Combineer API coins en handmatige coins
    const allCoins = [...coinData, ...manualCoins];
    
    allCoins.forEach(coin => {
        const coinCard = document.createElement('div');
        coinCard.className = 'coin-card';
        coinCard.innerHTML = `
            <div class="coin-info">
                <div class="coin-header">
                    <h5>${coin.symbol}</h5>
                    <span class="coin-name">${coin.name}</span>
                    ${coin._manual ? '<span class="manual-badge">Handmatig</span>' : '<span class="api-badge">API</span>'}
                </div>
                <div class="coin-details">
                    <div class="coin-price">€${coin.price.toFixed(4)}</div>
                    <div class="coin-market-cap">€${formatNumber(coin.marketCap)}</div>
                    <div class="coin-change ${coin.change24h >= 0 ? 'positive' : 'negative'}">
                        ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
                    </div>
                </div>
            </div>
            <div class="coin-actions">
                <button class="btn-edit" onclick="editCoin('${coin.symbol}')" title="Bewerken">✏️</button>
                ${coin._manual ? `<button class="btn-delete" onclick="deleteCoin('${coin.symbol}')" title="Verwijderen">🗑️</button>` : ''}
            </div>
        `;
        coinsList.appendChild(coinCard);
    });
    
    updateCoinSummary();
}

function updateCoinSummary() {
    const totalCoins = document.getElementById('total-coins');
    const apiCoins = document.getElementById('api-coins');
    const manualCoins = document.getElementById('manual-coins');
    
    if (totalCoins) totalCoins.textContent = coinData.length + manualCoins.length;
    if (apiCoins) apiCoins.textContent = coinData.length;
    if (manualCoins) manualCoins.textContent = manualCoins.length;
}

function showAddCoinForm() {
    const form = `
        <div class="modal-overlay" id="add-coin-modal">
            <div class="modal-content">
                <h3>➕ Nieuwe Coin Toevoegen</h3>
                <form id="add-coin-form">
                    <div class="form-group">
                        <label for="coin-symbol">Symbol:</label>
                        <input type="text" id="coin-symbol" required placeholder="BTC">
                    </div>
                    <div class="form-group">
                        <label for="coin-name">Naam:</label>
                        <input type="text" id="coin-name" required placeholder="Bitcoin">
                    </div>
                    <div class="form-group">
                        <label for="coin-price">Prijs (€):</label>
                        <input type="number" id="coin-price" step="0.0001" required placeholder="45000.00">
                    </div>
                    <div class="form-group">
                        <label for="coin-market-cap">Market Cap (€):</label>
                        <input type="number" id="coin-market-cap" placeholder="850000000000">
                    </div>
                    <div class="form-group">
                        <label for="coin-change">24h Verandering (%):</label>
                        <input type="number" id="coin-change" step="0.01" placeholder="2.5">
                    </div>
                    <div class="form-actions">
                        <button type="button" onclick="closeAddCoinForm()" class="btn-secondary">Annuleren</button>
                        <button type="submit" class="btn-primary">Toevoegen</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', form);
    
    // Event listener voor form submission
    document.getElementById('add-coin-form').addEventListener('submit', handleAddCoin);
}

function closeAddCoinForm() {
    const modal = document.getElementById('add-coin-modal');
    if (modal) {
        modal.remove();
    }
}

function handleAddCoin(event) {
    event.preventDefault();
    
    const symbol = document.getElementById('coin-symbol').value.toUpperCase();
    const name = document.getElementById('coin-name').value;
    const price = parseFloat(document.getElementById('coin-price').value);
    const marketCap = parseFloat(document.getElementById('coin-market-cap').value) || 0;
    const change24h = parseFloat(document.getElementById('coin-change').value) || 0;
    
    // Check of coin al bestaat
    if (coinData.find(c => c.symbol === symbol) || manualCoins.find(c => c.symbol === symbol)) {
        alert('Deze coin bestaat al!');
        return;
    }
    
    const newCoin = {
        symbol: symbol,
        name: name,
        price: price,
        marketCap: marketCap,
        volume24h: 0,
        change24h: change24h,
        _manual: true // Markeer als handmatig toegevoegd
    };
    
    manualCoins.push(newCoin);
    saveManualCoins();
    renderCoinsList();
    closeAddCoinForm();
    
    console.log(`Handmatige coin toegevoegd: ${symbol}`);
}

function editCoin(symbol) {
    const coin = [...coinData, ...manualCoins].find(c => c.symbol === symbol);
    if (!coin) return;
    
    const form = `
        <div class="modal-overlay" id="edit-coin-modal">
            <div class="modal-content">
                <h3>✏️ Coin Bewerken: ${coin.symbol}</h3>
                <form id="edit-coin-form">
                    <div class="form-group">
                        <label for="edit-coin-name">Naam:</label>
                        <input type="text" id="edit-coin-name" value="${coin.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-coin-price">Prijs (€):</label>
                        <input type="number" id="edit-coin-price" step="0.0001" value="${coin.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-coin-market-cap">Market Cap (€):</label>
                        <input type="number" id="edit-coin-market-cap" value="${coin.marketCap}">
                    </div>
                    <div class="form-group">
                        <label for="edit-coin-change">24h Verandering (%):</label>
                        <input type="number" id="edit-coin-change" step="0.01" value="${coin.change24h}">
                    </div>
                    <div class="form-actions">
                        <button type="button" onclick="closeEditCoinForm()" class="btn-secondary">Annuleren</button>
                        <button type="submit" class="btn-primary">Opslaan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', form);
    
    // Event listener voor form submission
    document.getElementById('edit-coin-form').addEventListener('submit', (e) => handleEditCoin(e, symbol));
}

function closeEditCoinForm() {
    const modal = document.getElementById('edit-coin-modal');
    if (modal) {
        modal.remove();
    }
}

function handleEditCoin(event, symbol) {
    event.preventDefault();
    
    const name = document.getElementById('edit-coin-name').value;
    const price = parseFloat(document.getElementById('edit-coin-price').value);
    const marketCap = parseFloat(document.getElementById('edit-coin-market-cap').value) || 0;
    const change24h = parseFloat(document.getElementById('edit-coin-change').value) || 0;
    
    // Update coin in de juiste array
    let coin = coinData.find(c => c.symbol === symbol);
    if (coin) {
        // API coin - update alleen prijs en market cap
        coin.price = price;
        coin.marketCap = marketCap;
        coin.change24h = change24h;
    } else {
        coin = manualCoins.find(c => c.symbol === symbol);
        if (coin) {
            // Handmatige coin - update alles
            coin.name = name;
            coin.price = price;
            coin.marketCap = marketCap;
            coin.change24h = change24h;
            saveManualCoins();
        }
    }
    
    renderCoinsList();
    closeEditCoinForm();
    
    console.log(`Coin bijgewerkt: ${symbol}`);
}

function deleteCoin(symbol) {
    if (!confirm(`Weet je zeker dat je ${symbol} wilt verwijderen?`)) {
        return;
    }
    
    const index = manualCoins.findIndex(c => c.symbol === symbol);
    if (index !== -1) {
        manualCoins.splice(index, 1);
        saveManualCoins();
        renderCoinsList();
        console.log(`Handmatige coin verwijderd: ${symbol}`);
    }
}

function refreshCoinData() {
    loadCoinData().then(() => {
        renderCoinsList();
        console.log('Coin data vernieuwd');
    });
}

function saveManualCoins() {
    localStorage.setItem('manualCoins', JSON.stringify(manualCoins));
}

function loadManualCoins() {
    const saved = localStorage.getItem('manualCoins');
    if (saved) {
        manualCoins = JSON.parse(saved);
    }
}

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}

function getAvailableCoins() {
    // Combineer API coins en handmatige coins
    return [...coinData, ...manualCoins];
}

// Dashboard data ophalen en updaten
let dashboardInterval = null;

async function fetchAllRigStats() {
    let rigsToShow = miningRigs.filter(rig => rig.isActive && rig.isHashing);
    console.log('[DEBUG] rigsToShow:', rigsToShow);
    let totalHashrate = 0;
    let expectedHashrate = 0;
    let totalShares = 0;
    let totalRejected = 0;
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    let bestDifficulty = 0;
    let diffSinceBoot = 0;

    const now = Date.now();
    for (const rig of rigsToShow) {
        try {
            const data = await fetchRigApiData(rig);
            console.log(`[DEBUG] Data voor rig ${rig.name}:`, data);
            if (!rigHashrateHistory[rig.id]) rigHashrateHistory[rig.id] = [];
            // Voeg ALTIJD een nieuw punt toe, ongeacht waarde
            rigHashrateHistory[rig.id].push({ t: now, v: data.hashrate || 0 });
            while (rigHashrateHistory[rig.id].length && now - rigHashrateHistory[rig.id][0].t > MAX_HISTORY_MS) {
                rigHashrateHistory[rig.id].shift();
            }
            
            // Sla pool data op voor het overzicht
            if (data && data.hashrate !== undefined) {
                const poolData = {
                    shares: data.shares || 0,
                    rejected: data.rejected || 0,
                    // Stratum informatie
                    stratumUrl: data.stratumUrl || data.stratum_url || '',
                    stratumPort: data.stratumPort || data.stratum_port || '',
                    stratumUser: data.stratumUser || data.stratum_user || ''
                };
                updateRigPoolData(rig.id, poolData);
            }
            
            if (data.hashrate) totalHashrate += data.hashrate;
            if (data.expectedHashrate) expectedHashrate += data.expectedHashrate;
            if (data.shares) totalShares += data.shares;
            if (data.rejected) totalRejected += data.rejected;
            if (data.efficiency) { totalEfficiency += data.efficiency; efficiencyCount++; }
            if (data.bestDifficulty && data.bestDifficulty > bestDifficulty) bestDifficulty = data.bestDifficulty;
            if (data.diffSinceBoot) diffSinceBoot += data.diffSinceBoot;
        } catch (e) {
            console.warn('Rig API error:', rig.name, e);
        }
    }
    console.log('[DEBUG] rigHashrateHistory:', JSON.parse(JSON.stringify(rigHashrateHistory)));

    const avgEfficiency = efficiencyCount > 0 ? (totalEfficiency / efficiencyCount) : 0;

    updateDashboardCards({
        hashrate: totalHashrate,
        expectedHashrate,
        shares: totalShares,
        rejected: totalRejected,
        efficiency: avgEfficiency,
        bestDifficulty,
        diffSinceBoot
    });

    updateDashboardChartMulti(rigsToShow);
    updateDashboardLegend(rigsToShow);
}

async function fetchRigApiData(rig) {
    // Simpele fetcher, pas aan per rig type/api
    // Verwacht: { hashrate, expectedHashrate, shares, rejected, efficiency, bestDifficulty, diffSinceBoot }
    // Voorbeeld voor Nerdaxe/Bitaxe/ASIC
    const url = `http://${rig.ipAddress}${rig.customApiEndpoint || '/api/system/info'}`;
    const res = await fetch(url, { timeout: 3000 });
    const json = await res.json();
    // Mapping afhankelijk van rig type
    if (rig.rigType === 'nerdaxe' || rig.rigType === 'bitaxe') {
        return {
            hashrate: json.hashRate || 0,
            expectedHashrate: json.expectedHashrate || 0, // als beschikbaar
            shares: json.sharesAccepted || 0,
            rejected: json.sharesRejected || 0,
            efficiency: json.power ? (json.power / (json.hashRate || 1)) : 0,
            bestDifficulty: parseFloat((json.bestDiff||'').replace(/[^\d.]/g, '')) || 0,
            diffSinceBoot: parseFloat((json.bestSessionDiff||'').replace(/[^\d.]/g, '')) || 0,
            // Stratum informatie
            stratumUrl: json.stratumURL || json.poolUrl || json.pool?.url || json.stratum?.url || '',
            stratumPort: json.stratumPort || json.poolPort || json.pool?.port || json.stratum?.port || '',
            stratumUser: json.stratumUser || json.poolUser || json.pool?.user || json.stratum?.user || ''
        };
    } else if (rig.rigType === 'asic' || rig.rigType === 'gpu') {
        // ASIC/GPU API mapping
        return {
            hashrate: json.hashrate || json.hash_rate || 0,
            expectedHashrate: json.expected_hashrate || json.expected_hash_rate || 0,
            shares: json.shares || 0,
            rejected: json.rejected || 0,
            efficiency: json.efficiency || 0,
            bestDifficulty: json.best_difficulty || 0,
            diffSinceBoot: json.difficulty_since_boot || 0,
            // Stratum informatie
            stratumUrl: json.stratum_url || json.pool_url || json.pool?.url || json.stratum?.url || '',
            stratumPort: json.stratum_port || json.pool_port || json.pool?.port || json.stratum?.port || '',
            stratumUser: json.stratum_user || json.pool_user || json.pool?.user || json.stratum?.user || ''
        };
    }
    // Fallback
    return { hashrate: 0 };
}

function updateDashboardCards({ hashrate, expectedHashrate, shares, rejected, efficiency, bestDifficulty, diffSinceBoot }) {
    const $hashrate = document.getElementById('stat-hashrate');
    const $expected = document.getElementById('stat-hashrate-expected');
    const $shares = document.getElementById('stat-shares');
    const $rejected = document.getElementById('stat-shares-rejected');
    const $eff = document.getElementById('stat-efficiency');
    const $bestDiff = document.getElementById('stat-best-diff');
    const $diffBoot = document.getElementById('stat-diff-boot');
    if ($hashrate) $hashrate.innerHTML = `${hashrate.toFixed(2)} <span class='unit'>Gh/s</span>`;
    if ($expected) $expected.textContent = `${expectedHashrate.toFixed(0)} Gh/s expected`;
    if ($shares) $shares.textContent = shares;
    if ($rejected) $rejected.textContent = `${rejected} rejected`;
    if ($eff) $eff.innerHTML = `${efficiency.toFixed(2)} <span class='unit'>J/Th</span>`;
    if ($bestDiff) $bestDiff.innerHTML = `${formatNumber(bestDifficulty)} <span class='unit'>all-time best</span>`;
    if ($diffBoot) $diffBoot.textContent = `${formatNumber(diffSinceBoot)} since system boot`;
}

// Hashrate history maximaal 1 jaar bewaren
const MAX_HISTORY_MS = 365 * 24 * 60 * 60 * 1000; // 1 jaar in ms
let chartRange = 'day'; // default

function filterHashrateHistory(range) {
    const now = Date.now();
    let ms = 24 * 60 * 60 * 1000; // dag
    if (range === 'week') ms = 7 * ms;
    if (range === 'month') ms = 31 * 24 * 60 * 60 * 1000;
    if (range === 'year') ms = MAX_HISTORY_MS;
    return hashrateHistory.filter(p => now - p.t <= ms);
}

const HASHRATE_HISTORY_KEY = 'dashboard_hashrate_history_v1';

function saveHashrateHistory() {
    try {
        localStorage.setItem(HASHRATE_HISTORY_KEY, JSON.stringify(hashrateHistory));
    } catch (e) {
        console.warn('Kan hashrate history niet opslaan:', e);
    }
}

function loadHashrateHistory() {
    try {
        const raw = localStorage.getItem(HASHRATE_HISTORY_KEY);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
                // Filter op max 1 jaar oude data
                const now = Date.now();
                hashrateHistory = arr.filter(p => now - p.t <= MAX_HISTORY_MS);
            }
        }
    } catch (e) {
        console.warn('Kan hashrate history niet laden:', e);
    }
}

// Overschrijf updateDashboardChart om altijd op te slaan
function updateDashboardChart(hashrate) {
    const now = Date.now();
    hashrateHistory.push({ t: now, v: hashrate });
    while (hashrateHistory.length && now - hashrateHistory[0].t > MAX_HISTORY_MS) {
        hashrateHistory.shift();
    }
    saveHashrateHistory();
    const filtered = filterHashrateHistory(chartRange);
    let points = filtered;
    if (filtered.length > 200) {
        const step = Math.ceil(filtered.length / 200);
        points = filtered.filter((_, i) => i % step === 0);
    }
    if (window.hashrateChart) {
        window.hashrateChart.data.labels = points.map(p => new Date(p.t).toLocaleTimeString());
        window.hashrateChart.data.datasets[0].data = points.map(p => p.v);
        window.hashrateChart.update();
    }
}

// Chart range knoppen
function setupChartRangeButtons() {
    const btns = document.querySelectorAll('.chart-range-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chartRange = btn.getAttribute('data-range');
            // Update x-as displayFormats en unit
            if (window.hashrateChart) {
                window.hashrateChart.options.scales.x.time.displayFormats = getXAxisDisplayFormat();
                window.hashrateChart.options.scales.x.time.tooltipFormat = getTooltipFormat();
                window.hashrateChart.options.scales.x.time.unit = getTimeUnit();
                window.hashrateChart.update();
            }
            // Force update chart met actuele rigs
            const rigsToShow = miningRigs.filter(rig => rig.isActive && rig.isHashing);
            updateDashboardChartMulti(rigsToShow);
        });
    });
    // Zet default actief
    if (btns.length) btns[0].classList.add('active');
}

let chartScale = 'linear';

function setupChartScaleToggle() {
    const btn = document.getElementById('toggle-scale-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        chartScale = chartScale === 'linear' ? 'logarithmic' : 'linear';
        btn.textContent = chartScale === 'linear' ? 'Logaritmisch' : 'Lineair';
        if (window.hashrateChart) {
            window.hashrateChart.options.scales.y.type = chartScale;
            window.hashrateChart.options.scales.y.min = chartScale === 'logarithmic' ? 1 : undefined;
            window.hashrateChart.update();
        }
    });
    btn.textContent = 'Logaritmisch';
}

function getXAxisDisplayFormat() {
    if (chartRange === 'week' || chartRange === 'month') {
        return { day: 'dd-MM', hour: 'HH:mm', minute: 'HH:mm', second: 'HH:mm' };
    }
    if (chartRange === 'year') {
        return { week: "'Week' ww", day: 'dd-MM', hour: 'HH:mm' };
    }
    // default: uren
    return { hour: 'HH:mm' };
}

function getTimeUnit() {
    if (chartRange === 'day') return 'hour';
    if (chartRange === 'week' || chartRange === 'month') return 'day';
    if (chartRange === 'year') return 'week';
    return undefined;
}

function getTooltipFormat() {
    if (chartRange === 'week' || chartRange === 'month') return 'dd-MM';
    if (chartRange === 'year') return "'Week' ww";
    return 'HH:mm';
}

function setupDashboardChart() {
    const ctx = document.getElementById('hashrate-history-chart').getContext('2d');
    window.hashrateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // timestamps (ms)
            datasets: []
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const t = context[0].parsed.x;
                            if (chartRange === 'week' || chartRange === 'month') {
                                return new Date(t).toLocaleDateString();
                            }
                            if (chartRange === 'year') {
                                // Weeknummer tonen
                                const d = new Date(t);
                                const onejan = new Date(d.getFullYear(),0,1);
                                const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
                                return `Week ${week} (${d.getFullYear()})`;
                            }
                            return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: getTimeUnit(),
                        tooltipFormat: getTooltipFormat(),
                        displayFormats: getXAxisDisplayFormat()
                    },
                    ticks: {
                        color: '#a0aec0',
                        autoSkip: chartRange !== 'day' ? true : false,
                        maxRotation: 0,
                        minRotation: 0,
                        stepSize: chartRange === 'day' ? 1 : undefined
                    },
                    grid: { color: '#2d3748' }
                },
                y: {
                    type: chartScale,
                    beginAtZero: true,
                    min: undefined,
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#2d3748' }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function startDashboardUpdater() {
    if (dashboardInterval) clearInterval(dashboardInterval);
    setupDashboardChart();
    fetchAllRigStats();
    dashboardInterval = setInterval(fetchAllRigStats, 15000); // elke 15s
}

function updateDashboardChartMulti(rigs) {
    // Bepaal tijdsrange
    const now = Date.now();
    let ms = 24 * 60 * 60 * 1000;
    if (chartRange === 'week') ms = 7 * ms;
    if (chartRange === 'month') ms = 31 * 24 * 60 * 60 * 1000;
    if (chartRange === 'year') ms = MAX_HISTORY_MS;
    // Verzamel alle tijdstippen
    let allTimestamps = new Set();
    rigs.forEach(rig => {
        (rigHashrateHistory[rig.id] || []).forEach(p => {
            if (now - p.t <= ms) allTimestamps.add(p.t);
        });
    });
    let sortedTimestamps = Array.from(allTimestamps).sort((a,b) => a-b);
    console.log('[DEBUG] sortedTimestamps:', sortedTimestamps);
    // Downsamplen
    if (sortedTimestamps.length > 200) {
        const step = Math.ceil(sortedTimestamps.length / 200);
        sortedTimestamps = sortedTimestamps.filter((_,i) => i%step===0);
    }
    // Maak datasets als array van {x, y}
    const datasets = rigs.map(rig => {
        const color = rig.color || '#63b3ed';
        const data = sortedTimestamps.map(t => {
            const point = (rigHashrateHistory[rig.id]||[]).find(p => p.t === t);
            return { x: t, y: point ? point.v : null };
        });
        console.log(`[DEBUG] Dataset voor rig ${rig.name}:`, data);
        return {
            label: rig.name || 'Rig',
            data,
            borderColor: color,
            backgroundColor: color+'22',
            tension: 0.25,
            pointRadius: 0,
            fill: false
        };
    });
    console.log('[DEBUG] Chart datasets:', datasets);
    if (window.hashrateChart) {
        window.hashrateChart.data.labels = []; // leeg bij time scale
        window.hashrateChart.data.datasets = datasets;
        window.hashrateChart.update();
    }
    saveRigHashrateHistory();
}

function updateDashboardLegend(rigs) {
    const legend = document.getElementById('dashboard-legend');
    if (!legend) return;
    legend.innerHTML = '';
    rigs.forEach(rig => {
        const color = rig.color || '#63b3ed';
        const div = document.createElement('div');
        div.className = 'dashboard-legend-item';
        div.innerHTML = `<span class='dashboard-legend-color' style='background:${color}'></span>${rig.name || 'Rig'} `;
        legend.appendChild(div);
    });
}

function setupDashboardRefreshButton() {
    const btn = document.getElementById('refresh-dashboard-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        fetchAllRigStats();
    });
}

const RIG_HASHRATE_HISTORY_KEY = 'dashboard_rig_hashrate_history_v1';

function saveRigHashrateHistory() {
    try {
        localStorage.setItem(RIG_HASHRATE_HISTORY_KEY, JSON.stringify(rigHashrateHistory));
    } catch (e) {
        console.warn('Kan rigHashrateHistory niet opslaan:', e);
    }
}

function loadRigHashrateHistory() {
    try {
        const raw = localStorage.getItem(RIG_HASHRATE_HISTORY_KEY);
        if (raw) {
            const obj = JSON.parse(raw);
            if (typeof obj === 'object' && obj !== null) {
                // Filter op max 1 jaar oude data per rig
                const now = Date.now();
                for (const rigId in obj) {
                    obj[rigId] = (obj[rigId] || []).filter(p => now - p.t <= MAX_HISTORY_MS);
                }
                rigHashrateHistory = obj;
            }
        }
    } catch (e) {
        console.warn('Kan rigHashrateHistory niet laden:', e);
    }
}

// Pool data opslag en overzicht functies
const RIG_POOL_DATA_KEY = 'rig_pool_data_v1';

function saveRigPoolData() {
    try {
        localStorage.setItem(RIG_POOL_DATA_KEY, JSON.stringify(rigPoolData));
    } catch (e) {
        console.warn('Kan rig pool data niet opslaan:', e);
    }
}

function loadRigPoolData() {
    try {
        const raw = localStorage.getItem(RIG_POOL_DATA_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (typeof data === 'object') {
                // Migreer oude data naar nieuwe formaat
                const migratedData = {};
                for (const key in data) {
                    const item = data[key];
                    if (item.rigId && item.poolType) {
                        // Nieuwe formaat, behoud zoals het is
                        migratedData[key] = item;
                    } else if (item.rigId) {
                        // Oud formaat, migreer naar nieuwe key
                        const newKey = `${item.rigId}_unknown`;
                        migratedData[newKey] = {
                            ...item,
                            poolType: 'unknown'
                        };
                    }
                }
                rigPoolData = migratedData;
            }
        }
    } catch (e) {
        console.warn('Kan rig pool data niet laden:', e);
    }
}

function updateRigPoolData(rigId, poolData) {
    if (!rigId || !poolData) return;
    
    // Haal huidige pool type op
    const poolSelect = document.getElementById('pool-select');
    const currentPoolType = poolSelect ? poolSelect.value : 'unknown';
    
    // Maak unieke key voor rig + pool combinatie
    const poolKey = `${rigId}_${currentPoolType}`;
    
    rigPoolData[poolKey] = {
        ...poolData,
        timestamp: Date.now(),
        rigId: rigId,
        poolType: currentPoolType
    };
    
    saveRigPoolData();
    renderPoolOverview();
}

function renderPoolOverview() {
    const container = document.getElementById('pool-overview-list');
    if (!container) return;
    
    const activeRigs = miningRigs.filter(rig => rig.isActive);
    
    if (activeRigs.length === 0) {
        container.innerHTML = `
            <div class="pool-overview-empty">
                <div class="pool-overview-empty-icon">⛏️</div>
                <h5>Geen actieve miners</h5>
                <p>Voeg mining rigs toe en activeer ze om pool data te zien</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    activeRigs.forEach(rig => {
        const statusClass = rig.isHashing ? 'hashing' : 'idle';
        const statusText = rig.isHashing ? 'Hashing' : 'Idle';
        
        // Zoek alle pool data voor deze rig
        const rigPoolDataKeys = Object.keys(rigPoolData).filter(key => key.startsWith(rig.id + '_'));
        const rigPoolDataList = rigPoolDataKeys.map(key => rigPoolData[key]).sort((a, b) => b.timestamp - a.timestamp);
        
        html += `
            <div class="pool-overview-item">
                <div class="pool-overview-item-header">
                    <div class="pool-overview-item-title">
                        <span class="pool-overview-item-name">${rig.name || `Rig ${rig.id}`}</span>
                        <span class="pool-overview-item-type">${rig.rigType || 'Custom'}</span>
                    </div>
                    <div class="pool-overview-item-status">
                        <span class="pool-overview-status-indicator ${statusClass}"></span>
                        <span class="pool-overview-status-text">${statusText}</span>
                    </div>
                </div>
                <div class="pool-overview-item-data">
        `;
        
        if (rigPoolDataList.length > 0) {
            // Toon data van alle pools voor deze rig
            rigPoolDataList.forEach((poolData, index) => {
                const poolName = getPoolDisplayName(poolData.poolType);
                const isLatest = index === 0;
                
                html += `
                    <div class="pool-data-section ${isLatest ? 'latest' : 'historical'}">
                        <div class="pool-data-header">
                            <span class="pool-name">${poolName}</span>
                            ${isLatest ? '<span class="current-badge">Huidig</span>' : ''}
                        </div>
                `;
                
                // Shares
                if (poolData.shares !== undefined) {
                    html += `
                        <div class="pool-overview-data-item">
                            <span class="pool-overview-data-label">Shares</span>
                            <span class="pool-overview-data-value">${poolData.shares}</span>
                        </div>
                    `;
                }
                
                // Rejected shares
                if (poolData.rejected !== undefined) {
                    html += `
                        <div class="pool-overview-data-item">
                            <span class="pool-overview-data-label">Geweigerd</span>
                            <span class="pool-overview-data-value">${poolData.rejected}</span>
                        </div>
                    `;
                }
                
                // Stratum informatie
                if (poolData.stratumUrl || poolData.stratumPort || poolData.stratumUser) {
                    html += `
                        <div class="pool-overview-data-item" style="grid-column: 1 / -1;">
                            <span class="pool-overview-data-label">Stratum Configuratie</span>
                            <div class="stratum-info">
                                ${poolData.stratumUrl ? `<div class="stratum-url">URL: ${poolData.stratumUrl}</div>` : ''}
                                ${poolData.stratumPort ? `<div class="stratum-port">Poort: ${poolData.stratumPort}</div>` : ''}
                                ${poolData.stratumUser ? `<div class="stratum-user">User: ${poolData.stratumUser}</div>` : ''}
                            </div>
                        </div>
                    `;
                }
                
                // Pool configuratie acties per pool
                html += `
                    <div class="pool-overview-data-item" style="grid-column: 1 / -1;">
                        <span class="pool-overview-data-label">Pool Configuratie</span>
                        <div class="pool-config-section">
                            <div class="pool-config-name-input">
                                <label for="pool-config-name-${rig.id}-${poolData.poolType}">Naam configuratie:</label>
                                <input type="text" id="pool-config-name-${rig.id}-${poolData.poolType}" placeholder="Bijv. Mijn Antpool Config">
                            </div>
                            <div class="pool-password-input">
                                <label for="pool-password-${rig.id}-${poolData.poolType}">Wachtwoord voor ${poolName}:</label>
                                <div class="password-input-container">
                                    <input type="password" id="pool-password-${rig.id}-${poolData.poolType}" placeholder="Voer wachtwoord in voor deze pool">
                                    <button type="button" class="password-toggle" onclick="togglePoolPassword('${rig.id}', '${poolData.poolType}')">
                                        <span class="password-icon">👁️</span>
                                    </button>
                                </div>
                            </div>
                            <div class="pool-item-actions">
                                <button class="btn-primary btn-small" onclick="savePoolConfigForRig('${rig.id}', '${poolData.poolType}')">💾 Opslaan Configuratie</button>
                                <button class="btn-secondary btn-small" onclick="loadPoolConfigForRig('${rig.id}', '${poolData.poolType}')">📋 Bekijk Configuraties</button>
                                <button class="btn-secondary btn-small" onclick="editCurrentPoolConfig('${rig.id}', '${poolData.poolType}')" style="background: #ffa726; color: white;">✏️ Bewerk Huidige</button>
                                <button class="btn-secondary btn-small" onclick="testPasswordField('${rig.id}', '${poolData.poolType}')" style="background: #ff6b6b; color: white;">🧪 Test Wachtwoord</button>
                                <button class="btn-secondary btn-small" onclick="testEventListeners('${rig.id}', '${poolData.poolType}')" style="background: #4ecdc4; color: white;">🎯 Test Events</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Timestamp
                if (poolData.timestamp) {
                    const date = new Date(poolData.timestamp);
                    html += `
                        <div class="pool-overview-item-timestamp">
                            Laatste update: ${date.toLocaleString('nl-NL')}
                        </div>
                    `;
                }
                
                html += `</div>`;
            });
        } else {
            html += `
                <div class="pool-overview-data-item" style="grid-column: 1 / -1;">
                    <span class="pool-overview-data-label">Status</span>
                    <span class="pool-overview-data-value">Geen pool data beschikbaar</span>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Maak alle wachtwoordvelden permanent bewerkbaar
    setTimeout(() => {
        makePasswordFieldsEditable();
    }, 100);
}

// Functie om alle wachtwoordvelden permanent bewerkbaar te maken
function makePasswordFieldsEditable() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        // Force enable
        input.disabled = false;
        input.readOnly = false;
        
        // CSS fixes
        input.style.pointerEvents = 'auto';
        input.style.userSelect = 'auto';
        input.style.position = 'relative';
        input.style.zIndex = '1';
        
        // Event listeners om focus te behouden
        input.addEventListener('focus', (e) => {
            input.style.borderColor = '#667eea';
            input.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
        });
        
        input.addEventListener('blur', (e) => {
            input.style.borderColor = '#ddd';
            input.style.boxShadow = 'none';
        });
        
        // Voorkom dat andere elementen focus stelen
        input.addEventListener('click', (e) => {
            e.stopPropagation();
            input.focus();
        });
    });
}

function refreshPoolOverview() {
    // Haal data op van alle actieve rigs
    const activeRigs = miningRigs.filter(rig => rig.isActive);
    
    if (activeRigs.length === 0) {
        renderPoolOverview();
        return;
    }
    
    // Toon loading state
    const container = document.getElementById('pool-overview-list');
    if (container) {
        container.innerHTML = `
            <div class="pool-overview-empty">
                <div class="pool-overview-empty-icon">⏳</div>
                <h5>Pool data ophalen...</h5>
                <p>Bezig met het ophalen van de laatste data van alle miners</p>
            </div>
        `;
    }
    
    // Haal data op van alle rigs
    Promise.all(activeRigs.map(async (rig) => {
        try {
            const data = await fetchRigApiData(rig);
            if (data && data.hashrate !== undefined) {
                updateRigPoolData(rig.id, data);
            }
        } catch (error) {
            console.warn(`Kan geen data ophalen van rig ${rig.name || rig.id}:`, error);
        }
    })).finally(() => {
        renderPoolOverview();
        // Maak wachtwoordvelden bewerkbaar na refresh
        setTimeout(() => {
            makePasswordFieldsEditable();
        }, 200);
    });
}

// Wachtwoord functionaliteit
function togglePassword() {
    const passwordInput = document.getElementById('pool-password');
    const toggleButton = document.getElementById('password-toggle');
    const passwordIcon = toggleButton.querySelector('.password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.add('showing');
        passwordIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('showing');
        passwordIcon.textContent = '👁️';
    }
}

function savePoolPassword() {
    const passwordInput = document.getElementById('pool-password');
    if (passwordInput) {
        try {
            localStorage.setItem('pool_password', passwordInput.value);
        } catch (e) {
            console.warn('Kan pool wachtwoord niet opslaan:', e);
        }
    }
}

function loadPoolPassword() {
    const passwordInput = document.getElementById('pool-password');
    if (passwordInput) {
        try {
            const savedPassword = localStorage.getItem('pool_password');
            if (savedPassword) {
                passwordInput.value = savedPassword;
            }
        } catch (e) {
            console.warn('Kan pool wachtwoord niet laden:', e);
        }
    }
}

function getPoolDisplayName(poolType) {
    const poolNames = {
        'antpool': 'Antpool',
        'f2pool': 'F2Pool',
        'poolin': 'Poolin',
        'btccom': 'BTC.com',
        'slushpool': 'Slushpool',
        'viabtc': 'ViaBTC',
        'binance': 'Binance Pool',
        'okex': 'OKEx Pool',
        'custom': 'Custom Pool',
        'unknown': 'Onbekende Pool'
    };
    return poolNames[poolType] || poolType;
}

// Pool configuratie beheer
const POOL_CONFIGS_KEY = 'saved_pool_configurations_v1';

async function saveCurrentPoolConfig() {
    const poolSelect = document.getElementById('pool-select');
    const poolApiKey = document.getElementById('pool-api-key');
    const workerName = document.getElementById('worker-name');
    const poolUrl = document.getElementById('pool-url');
    const poolPassword = document.getElementById('pool-password');
    
    if (!poolSelect || !poolSelect.value) {
        alert('Selecteer eerst een pool type');
        return;
    }
    
    const configName = await showPrompt('Pool Configuratie Opslaan', 'Geef deze pool configuratie een naam:');
    if (!configName) return;
    
    const config = {
        id: Date.now().toString(),
        name: configName,
        poolType: poolSelect.value,
        apiKey: poolApiKey ? poolApiKey.value : '',
        workerName: workerName ? workerName.value : '',
        poolUrl: poolUrl ? poolUrl.value : '',
        password: poolPassword ? poolPassword.value : '',
        timestamp: Date.now()
    };
    
    try {
        const existingConfigs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        existingConfigs.push(config);
        localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(existingConfigs));
        
        alert(`Pool configuratie "${configName}" opgeslagen!`);
    } catch (e) {
        console.error('Kan pool configuratie niet opslaan:', e);
        alert('Fout bij opslaan van pool configuratie');
    }
}

async function loadPoolConfigurations() {
    try {
        const configs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        
        if (configs.length === 0) {
            alert('Geen opgeslagen pool configuraties gevonden');
            return;
        }
        
        let configList = 'Opgeslagen Pool Configuraties:\n\n';
        configs.forEach((config, index) => {
            const date = new Date(config.timestamp).toLocaleString('nl-NL');
            configList += `${index + 1}. ${config.name} (${getPoolDisplayName(config.poolType)})\n`;
            configList += `   Rig: ${config.rigName}\n`;
            configList += `   Opgeslagen: ${date}\n\n`;
        });
        
        configList += '\nVoer het nummer in om te laden, "B" + nummer om te bewerken, "D" + nummer om te verwijderen:';
        
        const choice = await showPrompt('Pool Configuratie Beheer', configList, '');
        if (!choice) return;
        
        if (choice.toLowerCase().startsWith('b')) {
            // Bewerk modus
            const configIndex = parseInt(choice.substring(1)) - 1;
            if (configIndex >= 0 && configIndex < configs.length) {
                await editPoolConfig(configs[configIndex]);
            } else {
                alert('Ongeldige keuze');
            }
        } else if (choice.toLowerCase().startsWith('d')) {
            // Verwijder modus
            const configIndex = parseInt(choice.substring(1)) - 1;
            if (configIndex >= 0 && configIndex < configs.length) {
                if (confirm(`Weet je zeker dat je "${configs[configIndex].name}" wilt verwijderen?`)) {
                    deletePoolConfig(configs[configIndex].id);
                }
            } else {
                alert('Ongeldige keuze');
            }
        } else {
            // Laad modus
            const configIndex = parseInt(choice) - 1;
            if (configIndex >= 0 && configIndex < configs.length) {
                loadPoolConfig(configs[configIndex]);
            } else {
                alert('Ongeldige keuze');
            }
        }
    } catch (e) {
        console.error('Kan pool configuraties niet laden:', e);
        alert('Fout bij laden van pool configuraties');
    }
}

function loadPoolConfig(config) {
    const poolSelect = document.getElementById('pool-select');
    const poolApiKey = document.getElementById('pool-api-key');
    const workerName = document.getElementById('worker-name');
    const poolUrl = document.getElementById('pool-url');
    const poolPassword = document.getElementById('pool-password');
    
    if (poolSelect) poolSelect.value = config.poolType;
    if (poolApiKey) poolApiKey.value = config.apiKey;
    if (workerName) workerName.value = config.workerName;
    if (poolUrl) poolUrl.value = config.poolUrl;
    if (poolPassword) poolPassword.value = config.password;
    
    // Trigger pool selection change
    if (poolSelect) {
        const event = new Event('change');
        poolSelect.dispatchEvent(event);
    }
    
    alert(`Pool configuratie "${config.name}" geladen!`);
}

function deletePoolConfig(configId) {
    try {
        const configs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        const filteredConfigs = configs.filter(config => config.id !== configId);
        localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(filteredConfigs));
        alert('Pool configuratie verwijderd!');
    } catch (e) {
        console.error('Kan pool configuratie niet verwijderen:', e);
        alert('Fout bij verwijderen van pool configuratie');
    }
}

// Pool configuratie beheer per rig
function savePoolConfigForRig(rigId, poolType) {
    const poolPasswordInput = document.getElementById(`pool-password-${rigId}-${poolType}`);
    const password = poolPasswordInput ? poolPasswordInput.value : '';
    const nameInput = document.getElementById(`pool-config-name-${rigId}-${poolType}`);
    const configName = nameInput ? nameInput.value.trim() : '';
    
    if (!password) {
        alert('Voer eerst een wachtwoord in voor deze pool configuratie');
        return;
    }
    if (!configName) {
        alert('Voer een naam in voor deze pool configuratie');
        return;
    }
    
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig) {
        alert('Rig niet gevonden');
        return;
    }
    
    const config = {
        id: Date.now().toString(),
        name: configName,
        rigId: rigId,
        rigName: rig.name,
        poolType: poolType,
        password: password,
        timestamp: Date.now()
    };
    
    try {
        const existingConfigs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        existingConfigs.push(config);
        localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(existingConfigs));
        
        alert(`Pool configuratie "${configName}" opgeslagen voor ${rig.name}!`);
    } catch (e) {
        console.error('Kan pool configuratie niet opslaan:', e);
        alert('Fout bij opslaan van pool configuratie');
    }
}

async function loadPoolConfigForRig(rigId, poolType) {
    try {
        const configs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        const rigConfigs = configs.filter(config => config.rigId === rigId && config.poolType === poolType);
        
        if (rigConfigs.length === 0) {
            alert('Geen opgeslagen configuraties gevonden voor deze rig en pool');
            return;
        }
        
        let configList = `Opgeslagen Configuraties voor ${rigConfigs[0].rigName}:\n\n`;
        rigConfigs.forEach((config, index) => {
            const date = new Date(config.timestamp).toLocaleString('nl-NL');
            configList += `${index + 1}. ${config.name}\n`;
            configList += `   Pool: ${getPoolDisplayName(config.poolType)}\n`;
            configList += `   Opgeslagen: ${date}\n\n`;
        });
        
        configList += '\nVoer het nummer in om te laden, "B" + nummer om te bewerken, of Enter om te annuleren:';
        
        const choice = await showPrompt('Pool Configuratie Beheer', configList, '');
        if (!choice) return;
        
        if (choice.toLowerCase().startsWith('b')) {
            // Bewerk modus
            const configIndex = parseInt(choice.substring(1)) - 1;
            if (configIndex >= 0 && configIndex < rigConfigs.length) {
                await editPoolConfig(rigConfigs[configIndex]);
            } else {
                alert('Ongeldige keuze');
            }
        } else {
            // Laad modus
            const configIndex = parseInt(choice) - 1;
            if (configIndex >= 0 && configIndex < rigConfigs.length) {
                loadPoolConfigForRigFromSelection(rigConfigs[configIndex]);
            } else {
                alert('Ongeldige keuze');
            }
        }
    } catch (e) {
        console.error('Kan pool configuraties niet laden:', e);
        alert('Fout bij laden van pool configuraties');
    }
}

function loadPoolConfigForRigFromSelection(config) {
    const poolPasswordInput = document.getElementById(`pool-password-${config.rigId}-${config.poolType}`);
    if (poolPasswordInput) {
        poolPasswordInput.value = config.password;
    }
    const nameInput = document.getElementById(`pool-config-name-${config.rigId}-${config.poolType}`);
    if (nameInput) {
        nameInput.value = config.name;
    }
    
    alert(`Pool configuratie "${config.name}" geladen voor ${config.rigName}!`);
}

function togglePoolPassword(rigId, poolType) {
    const passwordInput = document.getElementById(`pool-password-${rigId}-${poolType}`);
    const toggleButton = passwordInput.nextElementSibling;
    const passwordIcon = toggleButton.querySelector('.password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.add('showing');
        passwordIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('showing');
        passwordIcon.textContent = '👁️';
    }
}

// Debug functie om wachtwoordvelden te controleren
function debugPasswordFields() {
    console.log('=== Debug Password Fields ===');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    console.log(`Gevonden password inputs: ${passwordInputs.length}`);
    
    passwordInputs.forEach((input, index) => {
        console.log(`Input ${index + 1}:`, {
            id: input.id,
            value: input.value,
            disabled: input.disabled,
            readonly: input.readOnly,
            style: input.style.cssText,
            parentElement: input.parentElement.className
        });
    });
    
    // Test of we kunnen typen
    if (passwordInputs.length > 0) {
        const testInput = passwordInputs[0];
        console.log('Test input:', testInput.id);
        testInput.focus();
        console.log('Input focused, probeer nu te typen...');
    }
}

// Test functie om wachtwoordveld direct bewerkbaar te maken
function testPasswordField(rigId, poolType) {
    const passwordInput = document.getElementById(`pool-password-${rigId}-${poolType}`);
    if (passwordInput) {
        console.log('Testing password field:', passwordInput.id);
        console.log('Current state:', {
            disabled: passwordInput.disabled,
            readonly: passwordInput.readOnly,
            value: passwordInput.value,
            style: passwordInput.style.cssText
        });
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(passwordInput);
        console.log('Computed styles:', {
            pointerEvents: computedStyle.pointerEvents,
            userSelect: computedStyle.userSelect,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex,
            display: computedStyle.display,
            visibility: computedStyle.visibility
        });
        
        // Check parent elements for blocking styles
        let parent = passwordInput.parentElement;
        let depth = 0;
        while (parent && depth < 5) {
            const parentStyle = window.getComputedStyle(parent);
            console.log(`Parent ${depth}:`, {
                tagName: parent.tagName,
                className: parent.className,
                pointerEvents: parentStyle.pointerEvents,
                userSelect: parentStyle.userSelect,
                position: parentStyle.position,
                zIndex: parentStyle.zIndex
            });
            parent = parent.parentElement;
            depth++;
        }
        
        // Force enable
        passwordInput.disabled = false;
        passwordInput.readOnly = false;
        passwordInput.style.pointerEvents = 'auto';
        passwordInput.style.userSelect = 'auto';
        passwordInput.style.position = 'relative';
        passwordInput.style.zIndex = '9999';
        
        // Focus en test
        passwordInput.focus();
        passwordInput.value = 'test123';
        console.log('Password field should now be editable. Try typing...');
        
        // Add event listeners to debug
        passwordInput.addEventListener('click', (e) => {
            console.log('Password field clicked!', e);
        });
        passwordInput.addEventListener('focus', (e) => {
            console.log('Password field focused!', e);
        });
        passwordInput.addEventListener('input', (e) => {
            console.log('Password field input!', e.target.value);
        });
    } else {
        console.log('Password field not found!');
    }
}

// Test functie om event listeners te controleren
function testEventListeners(rigId, poolType) {
    const passwordInput = document.getElementById(`pool-password-${rigId}-${poolType}`);
    if (passwordInput) {
        console.log('=== Event Listener Test ===');
        
        // Test basic input
        passwordInput.value = '';
        passwordInput.focus();
        
        // Simulate typing
        const testEvent = new Event('input', { bubbles: true });
        passwordInput.dispatchEvent(testEvent);
        
        // Try to set value directly
        passwordInput.value = 'direct_test';
        console.log('Direct value set:', passwordInput.value);
        
        // Test if we can type
        passwordInput.addEventListener('keydown', (e) => {
            console.log('Keydown event:', e.key, e.target.value);
        });
        
        console.log('Try typing now and check console for keydown events...');
    }
}

// Vervang prompt() met modale popup
function showPrompt(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('prompt-modal');
        const titleEl = document.getElementById('prompt-title');
        const messageEl = document.getElementById('prompt-message');
        const input = document.getElementById('prompt-input');
        const okBtn = document.getElementById('prompt-ok');
        const cancelBtn = document.getElementById('prompt-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        input.value = defaultValue;
        
        modal.style.display = 'flex';
        input.focus();
        
        const handleOk = () => {
            const value = input.value.trim();
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            input.removeEventListener('keypress', handleKeypress);
            resolve(value);
        };
        
        const handleCancel = () => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            input.removeEventListener('keypress', handleKeypress);
            resolve(null);
        };
        
        const handleKeypress = (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        input.addEventListener('keypress', handleKeypress);
    });
}

// Functie om de huidige pool configuratie te bewerken
function editCurrentPoolConfig(rigId, poolType) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig) {
        alert('Rig niet gevonden');
        return;
    }
    
    // Haal huidige waarden op uit de velden
    const nameInput = document.getElementById(`pool-config-name-${rigId}-${poolType}`);
    const passwordInput = document.getElementById(`pool-password-${rigId}-${poolType}`);
    
    const currentName = nameInput ? nameInput.value.trim() : '';
    const currentPassword = passwordInput ? passwordInput.value : '';
    
    if (!currentName) {
        alert('Voer eerst een naam in voor de configuratie');
        return;
    }
    
    if (!currentPassword) {
        alert('Voer eerst een wachtwoord in voor de configuratie');
        return;
    }
    
    // Zoek bestaande configuratie met dezelfde naam
    try {
        const configs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        const existingConfig = configs.find(config => 
            config.rigId === rigId && 
            config.poolType === poolType && 
            config.name === currentName
        );
        
        if (existingConfig) {
            // Update bestaande configuratie
            existingConfig.password = currentPassword;
            existingConfig.timestamp = Date.now();
            
            localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(configs));
            alert(`Pool configuratie "${currentName}" bijgewerkt voor ${rig.name}!`);
        } else {
            // Maak nieuwe configuratie
            const newConfig = {
                id: Date.now().toString(),
                name: currentName,
                rigId: rigId,
                rigName: rig.name,
                poolType: poolType,
                password: currentPassword,
                timestamp: Date.now()
            };
            
            configs.push(newConfig);
            localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(configs));
            alert(`Nieuwe pool configuratie "${currentName}" opgeslagen voor ${rig.name}!`);
        }
    } catch (e) {
        console.error('Kan pool configuratie niet bewerken:', e);
        alert('Fout bij bewerken van pool configuratie');
    }
}

// Functie om bestaande pool configuratie te bewerken
async function editPoolConfig(config) {
    const newName = await showPrompt('Pool Configuratie Bewerken', `Bewerk naam voor "${config.name}":`, config.name);
    if (!newName) return;
    
    const newPassword = await showPrompt('Pool Configuratie Bewerken', `Bewerk wachtwoord voor "${newName}":`, config.password);
    if (!newPassword) return;
    
    try {
        const configs = JSON.parse(localStorage.getItem(POOL_CONFIGS_KEY) || '[]');
        const configIndex = configs.findIndex(c => c.id === config.id);
        
        if (configIndex !== -1) {
            configs[configIndex].name = newName;
            configs[configIndex].password = newPassword;
            configs[configIndex].timestamp = Date.now();
            
            localStorage.setItem(POOL_CONFIGS_KEY, JSON.stringify(configs));
            alert(`Pool configuratie "${newName}" bijgewerkt!`);
        } else {
            alert('Configuratie niet gevonden');
        }
    } catch (e) {
        console.error('Kan pool configuratie niet bewerken:', e);
        alert('Fout bij bewerken van pool configuratie');
    }
}

function toggleRigExpansion(rigId) {
    const rigCard = document.querySelector(`[data-rig-id="${rigId}"]`);
    if (!rigCard) return;
    
    const expandIcon = rigCard.querySelector('.rig-expand-icon');
    const isExpanded = rigCard.classList.toggle('expanded');
    
    if (expandIcon) {
        expandIcon.textContent = isExpanded ? '🔽' : '▶️';
    }
}

function updateRigField(rigId, field, value) {
    const rig = miningRigs.find(r => r.id === rigId);
    if (rig) {
        // Validatie per veld
        switch(field) {
            case 'rigType':
                rig.rigType = value;
                // Update API endpoint als het een bekend type is
                const rigType = RIG_TYPES.find(rt => rt.id === value);
                if (rigType && !rig.customApiEndpoint) {
                    rig.customApiEndpoint = rigType.apiEndpoint;
                }
                break;
            case 'algorithm':
                rig.algorithm = value;
                break;
            case 'customApiEndpoint':
                rig.customApiEndpoint = value.trim();
                break;
            case 'miningCoin':
                rig.miningCoin = value;
                break;
            case 'poolUrl':
                rig.poolUrl = value.trim();
                break;
            case 'poolPort':
                rig.poolPort = value.trim();
                break;
            case 'poolUser':
                rig.poolUser = value.trim();
                break;
            case 'hashrate':
                const hashrateValue = parseFloat(value);
                if (hashrateValue >= 0) {
                    rig.hashrate = hashrateValue;
                } else {
                    alert('Hashrate moet een positief getal zijn');
                    return;
                }
                break;
            case 'powerConsumption':
                const powerValue = parseFloat(value);
                if (powerValue >= 0) {
                    rig.powerConsumption = powerValue;
                } else {
                    alert('Stroomverbruik moet een positief getal zijn');
                    return;
                }
                break;
            case 'ipAddress':
                // Eenvoudige IP-adres validatie
                const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (value.trim() === '' || ipRegex.test(value.trim())) {
                    rig.ipAddress = value.trim();
                } else {
                    alert('Voer een geldig IP-adres in (bijv. 192.168.1.100)');
                    return;
                }
                break;
            default:
                // Voor andere velden, probeer als nummer, anders als string
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    rig[field] = numValue;
                } else {
                    rig[field] = value;
                }
        }
        
        // Update UI
        updateRigSummary();
        saveRigsToStorage();
        
        // Toon feedback
        console.log(`${rig.name} ${field} bijgewerkt naar: ${rig[field]}`);
    }
}