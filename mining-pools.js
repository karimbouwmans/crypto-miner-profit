const axios = require('axios');

// Mining Pool API configuraties
const POOL_CONFIGS = {
    antpool: {
        name: 'Antpool',
        baseUrl: 'https://antpool.com/api/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashRate'
        },
        authType: 'apiKey'
    },
    f2pool: {
        name: 'F2Pool',
        baseUrl: 'https://api.f2pool.com/v2',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    poolin: {
        name: 'Poolin',
        baseUrl: 'https://api.poolin.com/api/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    'btc.com': {
        name: 'BTC.com',
        baseUrl: 'https://pool.api.btc.com/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    slushpool: {
        name: 'Slushpool',
        baseUrl: 'https://slushpool.com/api/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    viabtc: {
        name: 'ViaBTC',
        baseUrl: 'https://api.viabtc.com/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    binance: {
        name: 'Binance Pool',
        baseUrl: 'https://pool.binance.com/api/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    },
    okex: {
        name: 'OKEx Pool',
        baseUrl: 'https://www.okex.com/api/v1',
        endpoints: {
            account: '/account',
            worker: '/worker',
            hashRate: '/hashrate'
        },
        authType: 'apiKey'
    }
};

class MiningPoolService {
    constructor() {
        this.currentPool = null;
        this.poolData = null;
    }

    // Test pool verbinding
    async testPoolConnection(poolType, apiKey, workerName, customUrl = null) {
        try {
            const config = POOL_CONFIGS[poolType];
            if (!config && poolType !== 'custom') {
                throw new Error('Onbekende pool type');
            }

            let baseUrl = customUrl || config.baseUrl;
            let endpoint = config?.endpoints?.account || '/account';

            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            return {
                success: true,
                data: response.data,
                poolName: config?.name || 'Custom Pool'
            };
        } catch (error) {
            console.error('Pool connection error:', error);
            return {
                success: false,
                error: error.message,
                poolName: POOL_CONFIGS[poolType]?.name || 'Custom Pool'
            };
        }
    }

    // Haal pool data op
    async fetchPoolData(poolType, apiKey, workerName, customUrl = null) {
        try {
            const config = POOL_CONFIGS[poolType];
            if (!config && poolType !== 'custom') {
                throw new Error('Onbekende pool type');
            }

            let baseUrl = customUrl || config.baseUrl;
            
            // Haal verschillende data op
            const [accountData, workerData, hashRateData] = await Promise.all([
                this.fetchAccountData(baseUrl, apiKey, config),
                this.fetchWorkerData(baseUrl, apiKey, workerName, config),
                this.fetchHashRateData(baseUrl, apiKey, config)
            ]);

            this.poolData = {
                account: accountData,
                worker: workerData,
                hashRate: hashRateData,
                timestamp: Date.now()
            };

            return this.poolData;
        } catch (error) {
            console.error('Error fetching pool data:', error);
            throw error;
        }
    }

    async fetchAccountData(baseUrl, apiKey, config) {
        try {
            const endpoint = config?.endpoints?.account || '/account';
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching account data:', error);
            return null;
        }
    }

    async fetchWorkerData(baseUrl, apiKey, workerName, config) {
        try {
            const endpoint = config?.endpoints?.worker || '/worker';
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: { worker: workerName },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching worker data:', error);
            return null;
        }
    }

    async fetchHashRateData(baseUrl, apiKey, config) {
        try {
            const endpoint = config?.endpoints?.hashRate || '/hashrate';
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching hash rate data:', error);
            return null;
        }
    }

    // Bereken real-time winst met pool data
    calculateRealTimeProfit(poolData, coinPrice, electricityCost, poolFee) {
        if (!poolData || !poolData.hashRate) {
            return null;
        }

        try {
            // Haal hashrate uit pool data (in H/s)
            const hashrate = this.extractHashRate(poolData.hashRate);
            const dailyReward = this.calculateDailyReward(hashrate, coinPrice);
            const dailyCost = this.calculateDailyCost(electricityCost, hashrate);
            const poolFeeAmount = dailyReward * (poolFee / 100);
            
            const dailyProfit = dailyReward - dailyCost - poolFeeAmount;
            
            return {
                hashrate: hashrate,
                dailyReward: dailyReward,
                dailyCost: dailyCost,
                poolFee: poolFeeAmount,
                dailyProfit: dailyProfit,
                hourlyProfit: dailyProfit / 24,
                weeklyProfit: dailyProfit * 7,
                monthlyProfit: dailyProfit * 30,
                yearlyProfit: dailyProfit * 365
            };
        } catch (error) {
            console.error('Error calculating real-time profit:', error);
            return null;
        }
    }

    extractHashRate(hashRateData) {
        // Verschillende pools hebben verschillende data formaten
        // Dit is een vereenvoudigde extractie
        if (typeof hashRateData === 'number') {
            return hashRateData;
        }
        
        if (hashRateData && hashRateData.hashrate) {
            return hashRateData.hashrate;
        }
        
        if (hashRateData && hashRateData.data && hashRateData.data.hashrate) {
            return hashRateData.data.hashrate;
        }
        
        // Default fallback
        return 0;
    }

    calculateDailyReward(hashrate, coinPrice) {
        // Vereenvoudigde berekening - in realiteit zou dit complexer zijn
        const estimatedNetworkHashrate = 500 * 1e18; // 500 EH/s voor Bitcoin
        const blockReward = 6.25; // Bitcoin block reward
        const blocksPerDay = 144; // 6 blocks per uur * 24
        
        const dailyReward = (hashrate / estimatedNetworkHashrate) * blockReward * blocksPerDay;
        return dailyReward * coinPrice;
    }

    calculateDailyCost(electricityCost, hashrate) {
        // Schatting: 1 TH/s = ~1000W
        const powerConsumption = (hashrate / 1e12) * 1000; // Watt
        const dailyCost = (powerConsumption / 1000) * electricityCost * 24;
        return dailyCost;
    }

    // Get pool configuraties voor UI
    getPoolConfigs() {
        return POOL_CONFIGS;
    }

    // Get beschikbare pools
    getAvailablePools() {
        return Object.keys(POOL_CONFIGS).map(key => ({
            value: key,
            name: POOL_CONFIGS[key].name
        }));
    }
}

module.exports = MiningPoolService; 