# 🚀 Crypto Miner Profit Calculator

Een desktop applicatie voor het berekenen van SHA-256 mining winst op basis van hashrate (GH/s) met real-time coin data van CoinMarketCap.

## ✨ Features

- **Alle SHA-256 Coins**: Bitcoin, Bitcoin Cash, Bitcoin SV, DigiByte, Litecoin en meer
- **Real-time Data**: Live prijzen via CoinMarketCap API
- **Uitgebreide Berekeningen**: Dagelijkse, wekelijkse, maandelijkse en jaarlijkse winst
- **Kosten Analyse**: Elektriciteitskosten, pool fees, ROI berekeningen
- **Visuele Grafieken**: Profit en ROI charts met Chart.js
- **Mining Geschiedenis**: Track je mining resultaten over tijd
- **Data Export**: Exporteer je mining data naar JSON
- **Instellingen Opslag**: Bewaar je configuratie lokaal

## 🛠️ Installatie

### Vereisten
- Node.js (versie 16 of hoger)
- npm of yarn
- CoinMarketCap API key

### Stappen

1. **Clone het project**
```bash
git clone <repository-url>
cd crypto-miner-profit
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Start de applicatie**
```bash
npm start
```

4. **Voor development mode**
```bash
npm run dev
```

## 🔑 API Setup

### Optie 1: CoinMarketCap API (Aanbevolen)
1. Ga naar [CoinMarketCap](https://coinmarketcap.com/api/)
2. Maak een gratis account
3. Verkrijg je API key
4. Voer de API key in de applicatie in

### Optie 2: CoinGecko API (Gratis Fallback)
- **Geen API key nodig!**
- Automatisch gebruikt als CoinMarketCap niet beschikbaar is
- Beperkte rate limits maar volledig gratis

### Optie 3: Demo Mode
- Laat het API key veld leeg
- Gebruikt realistische demo data
- Perfect voor het testen van de app

### API Status Indicator
De app toont real-time de status van je API verbinding:
- 🟢 **Groen**: CoinMarketCap API actief
- 🟡 **Geel**: CoinGecko API actief (fallback)
- 🔵 **Blauw**: Demo data actief
- 🔴 **Rood**: API fout, demo data gebruikt

## 📊 Gebruik

### 1. Instellingen Configureren
- **Hashrate**: Je mining hashrate in GH/s
- **Stroomverbruik**: Vermogen van je mining rig in Watt
- **Elektriciteitskosten**: Kosten per kWh in euro's
- **Pool Fee**: Percentage fee van je mining pool
- **API Key**: Je CoinMarketCap API key

### 2. Coins Selecteren
- Klik op de coins die je wilt analyseren
- Geselecteerde coins worden gemarkeerd
- Ververs coin data voor real-time prijzen

### 3. Winst Berekenen
- Klik op "Bereken Winst"
- Bekijk resultaten in de gedetailleerde tabel
- Analyseer grafieken voor visuele inzichten

### 4. Geschiedenis Bekijken
- Mining geschiedenis wordt automatisch opgeslagen
- Exporteer data voor verdere analyse
- Wis geschiedenis indien gewenst

## 🪙 Ondersteunde SHA-256 Coins

- **Bitcoin (BTC)** - De grootste cryptocurrency
- **Bitcoin Cash (BCH)** - Bitcoin fork met grotere blocks
- **Bitcoin SV (BSV)** - Bitcoin Satoshi Vision
- **Bitcoin Gold (BTG)** - Bitcoin met Equihash
- **DigiByte (DGB)** - Multi-algorithm cryptocurrency
- **Litecoin (LTC)** - Silver to Bitcoin's gold
- **Namecoin (NMC)** - Decentralized naming system
- **Peercoin (PPC)** - Proof-of-stake cryptocurrency
- **Primecoin (XPM)** - Prime number mining
- **Novacoin (NVC)** - Hybrid PoW/PoS
- **Einsteinium (EMC2)** - Scientific research funding
- **Unobtanium (UNO)** - Rare digital asset
- **MazaCoin (MZC)** - Native American cryptocurrency
- **Auroracoin (AUR)** - Icelandic cryptocurrency
- **Devcoin (DVC)** - Development funding
- **Freicoin (FRC)** - Demurrage currency
- **Ixcoin (IXC)** - Early Bitcoin fork
- **Nxt (NXT)** - Pure proof-of-stake
- **PotCoin (POT)** - Cannabis industry
- **TagCoin (TAG)** - Tag-based system

## 📈 Berekeningen

### Dagelijkse Winst
```
Dagelijkse Winst = (Dagelijkse Mining Reward × Coin Prijs) - Pool Fees - Elektriciteitskosten
```

### ROI Berekening
```
ROI = (Jaarlijkse Winst / Jaarlijkse Kosten) × 100
```

### Break-even Analyse
```
Break-even Dagen = Totale Kosten / Dagelijkse Winst
```

## 🏗️ Build voor Productie

```bash
npm run build
```

Dit creëert een uitvoerbare versie in de `dist` folder.

## 🔧 Technische Details

- **Framework**: Electron
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Data Storage**: electron-store
- **API**: CoinMarketCap Pro API
- **Styling**: Custom CSS met moderne gradient design

## 📝 Changelog

Zie [CHANGELOG.md](CHANGELOG.md) voor gedetailleerde wijzigingen.

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie de [LICENSE](LICENSE) file voor details.

## ⚠️ Disclaimer

Deze applicatie is voor educatieve doeleinden. Mining winst kan fluctueren en is afhankelijk van vele factoren zoals:
- Cryptocurrency prijzen
- Network difficulty
- Elektriciteitskosten
- Hardware efficiency
- Pool fees

Doe altijd je eigen onderzoek voordat je investeert in mining hardware.

## 🆘 Support

Voor vragen of problemen:
- Open een issue op GitHub
- Controleer de FAQ sectie
- Raadpleeg de documentatie

## 🔗 Mining Pool Integratie

### Ondersteunde Pools
De app ondersteunt real-time data van populaire mining pools:

- **Antpool** - Bitmain's mining pool
- **F2Pool** - Eén van de grootste pools
- **Poolin** - Multi-algorithm pool
- **BTC.com** - Bitcoin.com pool
- **Slushpool** - Eerste mining pool
- **ViaBTC** - Multi-coin pool
- **Binance Pool** - Exchange mining pool
- **OKEx Pool** - OKEx exchange pool
- **Custom Pool** - Eigen pool API

### Pool Configuratie
1. **Selecteer je pool** in de instellingen
2. **Voer je API key in** (verkrijgbaar via pool dashboard)
3. **Specificeer worker name** (optioneel)
4. **Test de verbinding** met de "Test Pool" knop
5. **Real-time data** wordt automatisch gebruikt voor berekeningen

### Voordelen van Pool Integratie
- **Accurate hashrate** - Real-time data in plaats van schattingen
- **Automatische updates** - Geen handmatige invoer nodig
- **Pool fee tracking** - Nauwkeurige kosten berekening
- **Worker monitoring** - Individuele worker prestaties
- **Historische data** - Pool-specifieke mining geschiedenis

### API Keys Verkrijgen
- **Antpool**: Dashboard → API Management
- **F2Pool**: Account → API Settings
- **Poolin**: User Center → API
- **BTC.com**: Pool Dashboard → API
- **Slushpool**: Account → API Access
- **ViaBTC**: User Center → API
- **Binance**: Pool Dashboard → API
- **OKEx**: Pool Settings → API

---

**Happy Mining! 🚀⛏️** 