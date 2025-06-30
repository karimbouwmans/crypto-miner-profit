# Changelog

Alle belangrijke wijzigingen in dit project worden gedocumenteerd in dit bestand.

Het formaat is gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.0.0/),
en dit project volgt [Semantic Versioning](https://semver.org/lang/nl/).

## [1.0.0] - 2024-06-30

### Toegevoegd
- **IP-adres configuratie**: Voeg IP-adressen toe aan mining rigs voor monitoring
- **IP-adres validatie**: Controleert of ingevoerde IP-adressen geldig zijn
- **Rig connectivity test**: Test verbinding met individuele rigs via IP-adres
- **Bulk rig testing**: Test alle actieve rigs tegelijk
- **Multi-rig management**: Voeg meerdere mining rigs toe en beheer ze individueel
- **Rig configuratie**: Elke rig heeft eigen hashrate, stroomverbruik, elektriciteitskosten en pool fees
- **Rig activatie**: Schakel rigs in/uit voor berekeningen
- **Totale capaciteit**: Overzicht van totale hashrate, stroomverbruik en dagelijkse kosten
- **Rig opslag**: Rigs worden automatisch opgeslagen en geladen
- **Basis functionaliteit**: SHA-256 mining winst calculator
- **Real-time data**: CoinMarketCap API integratie met fallback naar CoinGecko
- **Demo mode**: Realistische data zonder API key
- **Moderne UI**: Responsive design met gradient achtergronden
- **Hamburger menu**: Sidebar navigatie voor instellingen
- **Mining pool integratie**: Ondersteuning voor populaire pools (Antpool, F2Pool, Poolin, BTC.com, Slushpool, ViaBTC, Binance, OKEx, custom pools)
- **Real-time hashrate monitoring**: Automatische updates en synchronisatie
- **Georganiseerde instellingen**: Drie secties (API, POOL, RIG) met collapsible functionaliteit
- **Keyboard shortcuts**: Ctrl+1/2/3 voor secties, Ctrl+0/9 voor alle openen/sluiten
- **API status indicator**: Visuele feedback voor API connectiviteit
- **Pool status indicator**: Test functionaliteit voor mining pools
- **Uitgebreide features**: Kostenanalyse, mining geschiedenis, grafieken, data export
- **Desktop app voor SHA-256 mining winstberekening**: Desktop app voor SHA-256 mining winst berekeningen
- **Real-time data van CoinMarketCap API**: Real-time data integratie voor live prijzen
- **Fallback naar CoinGecko API (geen API key nodig)**: Automatische fallback naar CoinGecko API bij API fouten
- **Demo mode met realistische data**: Volledig werkende app zonder API key met realistische demo data
- **Multi-rig management systeem**: Voeg meerdere mining rigs toe en beheer ze individueel
- **Individuele rig configuratie en activatie**: Elke rig heeft eigen hashrate, stroomverbruik, elektriciteitskosten en pool fees
- **IP-adres veld voor rigs met validatie**: IP-adres veld voor rigs met validatie
- **Test functies voor individuele en bulk rig connectivity**: Test knop om API verbindingen te controleren
- **Kostenanalyse en mining geschiedenis**: Kostenanalyse en mining geschiedenis
- **Grafieken en data export functionaliteit**: Grafieken en data export functionaliteit
- **Moderne UI met hamburger menu en responsive design**: Moderne UI met hamburger menu en responsive design
- **Fullscreen instellingen overlay**: Fullscreen instellingen overlay
- **Twee-kolommen layout voor instellingen**: Twee-kolommen layout voor instellingen
- **Keyboard shortcuts (Ctrl+S, Ctrl+I, Ctrl+R)**: Keyboard shortcuts (Ctrl+S, Ctrl+I, Ctrl+R)
- **Mining pool integratie met populaire pools**: Mining pool integratie met populaire pools
- **Real-time hashrate monitoring**: Real-time hashrate monitoring
- **Loading indicator voor snellere app startup**: Loading indicator voor snellere app startup
- **Debug logs voor troubleshooting**: Debug logs voor troubleshooting
- **Rig Type en Algoritme Selectie**:
  - Bitaxe miner ondersteuning met specifieke API endpoints
  - **Nerdaxe miner ondersteuning** met BM1366 ASIC detectie
  - ASIC, GPU en Custom miner types
  - SHA-256, Scrypt, Ethash, Kawpow, RandomX algoritmes
  - Automatische API endpoint detectie per rig type
  - Bitaxe/Nerdaxe specifieke data parsing (hashrate, temperatuur, stroomverbruik, shares, fan RPM)
- **Real-time Rig Monitoring**:
  - Automatische status updates elke 30 seconden
  - Live hashing status detectie via API
  - Visuele status indicators (🟢 Hashing / 🔴 Idle)
  - Real-time hashrate updates van API data
  - Temperatuur en shares monitoring voor Bitaxe
  - Individuele monitoring toggle per rig
  - Automatische monitoring start bij app launch

### Verbeterd
- **App laadt nu sneller door demo data eerst te tonen**: App laadt nu sneller door demo data eerst te tonen
- **Robuuste error handling voor ontbrekende elementen**: Robuuste error handling voor ontbrekende elementen
- **Betere validatie van input velden**: Betere validatie van input velden
- **Verbeterde rig IP test functie met meerdere API endpoints**: Verbeterde rig IP test functie met meerdere API endpoints
  - HiveOS API (poort 8080)
  - T-Rex Miner API (poort 3333)
  - Verschillende endpoint formaten
  - Betere foutmeldingen en feedback
  - Samenvatting van online/offline rigs
- **Null checks toegevoegd aan alle DOM element functies**:
  - loadSettings() - voorkomt TypeError bij ontbrekende elementen
  - saveSettings() - veilige waarde ophaling met fallbacks
  - exportData() - robuuste data export
  - testApiConnection() - veilige API key ophaling
- **Rig Type Specifieke API Testing**:
  - Bitaxe gebruikt `/api/system/info` endpoint
  - Automatische endpoint detectie op basis van rig type
  - Bitaxe specifieke data weergave (temperatuur, stroomverbruik, shares)
  - Custom API endpoint ondersteuning
- **Enhanced UI voor Rig Monitoring**:
  - Status indicators met animaties
  - Real-time status tekst updates
  - Monitoring toggle knoppen
  - Pulse animaties voor actieve rigs
  - Responsive design voor status displays
- **Verbeterde Hashing Detectie**:
  - Minder strikte hashing detectie (alleen hashrate check)
  - Uitgebreide debug logging voor troubleshooting
  - Betere API data parsing voor verschillende formaten
  - Debug functie om monitoring status te controleren
  - Meer hashrate veld variaties ondersteund (hashrate_5s, hashrate_1m)
- **Input Velden Reparatie**:
  - Gerepareerde updateRigField functie voor alle veldtypes
  - Verbeterde event listeners voor input velden
  - Data-field attributen toegevoegd voor correcte koppeling
  - Betere validatie voor numerieke en tekstuele velden
  - Event propagation fixes voor stabiele input functionaliteit

### Technische details
- Electron desktop applicatie
- HTML5, CSS3, JavaScript
- CoinMarketCap API v3
- CoinGecko API fallback
- Mining pool API integratie
- Local storage voor instellingen
- Responsive grid layout
- Modern CSS met gradients en shadows
- **Electron Framework**: Cross-platform desktop applicatie
- **Modulaire Architectuur**: Gescheiden main en renderer processen
- **Error Handling**: Robuuste foutafhandeling voor API calls
- **Loading States**: Visuele feedback tijdens data laden
- **Responsive Design**: Werkt op verschillende schermformaten
- **Data Persistence**: Automatische opslag van instellingen en geschiedenis

## [1.0.0] - 2024-01-XX

### Toegevoegd
- **Basis Mining Calculator**: Desktop app voor SHA-256 mining winst berekeningen
- **Alle SHA-256 Coins**: Ondersteuning voor 20+ SHA-256 cryptocurrencies
- **Real-time Data**: CoinMarketCap API integratie voor live prijzen
- **Fallback API System**: Automatische fallback naar CoinGecko API bij API fouten
- **Demo Mode**: Volledig werkende app zonder API key met realistische demo data
- **API Status Indicator**: Real-time status van API verbindingen
- **API Test Functionaliteit**: Test knop om API verbindingen te controleren
- **Mining Pool Integratie**: Real-time data van populaire mining pools
- **Pool API Support**: Antpool, F2Pool, Poolin, BTC.com, Slushpool, ViaBTC, Binance, OKEx
- **Real-time Hashrate**: Automatische hashrate detectie van gekoppelde pools
- **Pool Status Monitoring**: Real-time monitoring van pool verbindingen
- **Custom Pool Support**: Ondersteuning voor custom pool APIs
- **Uitgebreide Berekeningen**: Dagelijkse, wekelijkse, maandelijkse en jaarlijkse winst
- **Kosten Analyse**: Elektriciteitskosten, pool fees, ROI berekeningen
- **Visuele Grafieken**: Profit en ROI charts met Chart.js
- **Mining Geschiedenis**: Automatische opslag van mining resultaten
- **Data Export**: JSON export functionaliteit
- **Instellingen Opslag**: Lokale configuratie opslag met electron-store
- **Moderne UI**: Gradient design met responsive layout
- **Break-even Analyse**: Berekening van break-even dagen
- **Network Hashrate Schattingen**: Vereenvoudigde schattingen voor alle coins
- **Block Reward Database**: Up-to-date block rewards voor alle coins
- **Block Time Database**: Nauwkeurige block times voor berekeningen
- **Profit calculator verplaatst naar instellingen als aparte sectie**: Profit calculator bevat nu winst displays en grafieken
- **Nieuwe "Profit Calculator" navigatie sectie in instellingen**: Profit calculator bevat nu winst displays en grafieken
- **Profit calculator bevat nu winst displays en grafieken**: Profit calculator bevat nu winst displays en grafieken
- **Keyboard shortcuts toegevoegd voor alle instellingen secties (Ctrl+1 t/m Ctrl+5)**: Keyboard shortcuts toegevoegd voor alle instellingen secties (Ctrl+1 t/m Ctrl+5)
- **Main content vereenvoudigd met focus op mining rigs beheer en resultaten**: Main content vereenvoudigd met focus op mining rigs beheer en resultaten

### Gewijzigd
- Verbeterde input veld functionaliteit met data-field attributen
- Uitgebreide rig IP test functie met meerdere endpoints
- Betere error handling en null checks
- Nerdaxe miner detectie en API parsing
- UpdateRigField functie gerepareerd voor correcte koppeling
- Main content layout aangepast voor betere focus op rigs beheer
- Results sectie vereenvoudigd
- Event listeners opgeschoond
- Export data functie aangepast (geen selectedCoins meer)

### Verwijderd
- Elektriciteitskosten en pool fee velden uit individuele mining rigs
- Deze worden nu globaal ingesteld in plaats van per rig
- Coin selector uit main content (dubbel met instellingen)
- SelectedCoins variabele en gerelateerde functies
- renderCoinGrid, updateSelectedCount, toggleCoinSelection functies
- Profit calculator uit main content

### Opgelost
- Input velden werkten niet meer - gerepareerd met betere event listeners
- TypeError issues met null checks
- Rig monitoring connectivity problemen
- GPU errors van Electron (niet-functioneel)

### Technische Features
- **Electron Framework**: Cross-platform desktop applicatie
- **Modulaire Architectuur**: Gescheiden main en renderer processen
- **Error Handling**: Robuuste foutafhandeling voor API calls
- **Loading States**: Visuele feedback tijdens data laden
- **Responsive Design**: Werkt op verschillende schermformaten
- **Data Persistence**: Automatische opslag van instellingen en geschiedenis

### Ondersteunde Coins
- Bitcoin (BTC)
- Bitcoin Cash (BCH)
- Bitcoin SV (BSV)
- Bitcoin Gold (BTG)
- DigiByte (DGB)
- Litecoin (LTC)
- Namecoin (NMC)
- Peercoin (PPC)
- Primecoin (XPM)
- Novacoin (NVC)
- Einsteinium (EMC2)
- Unobtanium (UNO)
- MazaCoin (MZC)
- Auroracoin (AUR)
- Devcoin (DVC)
- Freicoin (FRC)
- Ixcoin (IXC)
- Nxt (NXT)
- PotCoin (POT)
- TagCoin (TAG)

### Berekeningen
- Dagelijkse mining reward berekening
- Elektriciteitskosten berekening
- Pool fee berekening
- ROI percentage berekening
- Break-even analyse
- Netto winst berekening

### UI/UX Features
- Intuïtieve coin selectie interface
- Real-time profit displays
- Kleurgecodeerde winst/verlies indicatoren
- Interactieve grafieken
- Sorteerbare resultaten tabel
- Mining geschiedenis overzicht
- Export functionaliteit
- Instellingen beheer
- **Hamburger Menu**: Clean sidebar interface voor instellingen
- **Responsive Design**: Volledig werkend op desktop en mobile
- **Keyboard Shortcuts**: Escape toets sluit sidebar
- **Smooth Animations**: Vloeiende overgangen en hover effecten
- **Georganiseerde Instellingen**: API, POOL en RIG secties
- **Real-time Hashrate Monitoring**: Automatische hashrate updates elke 30 seconden
- **Automatische Hashrate Sync**: Pool data synchroniseert hashrate veld
- **Collapsible Secties**: Klikbare headers om secties in/uit te klappen
- **Keyboard Shortcuts**: Ctrl+1/2/3 voor secties, Ctrl+0/9 voor alle openen/sluiten
- **Smooth Animations**: Vloeiende overgangen bij in/uit klappen
- **Smart Default**: Alleen API sectie open bij startup

### Data Management
- Lokale opslag van instellingen
- Mining geschiedenis tracking
- JSON data export
- API key beveiliging
- Automatische data verversing

---

## Toekomstige Versies

### Gepland voor v1.1.0
- [ ] Real-time network hashrate data
- [ ] Meer mining algoritmes (Scrypt, Ethash, etc.)
- [ ] Hardware database integratie
- [ ] Mining pool vergelijking
- [ ] Notificaties voor winst dalingen
- [ ] Dark mode thema
- [ ] Meertalige ondersteuning

### Gepland voor v1.2.0
- [ ] Cloud mining integratie
- [ ] Portfolio tracking
- [ ] Tax reporting features
- [ ] Advanced analytics
- [ ] API rate limiting verbeteringen
- [ ] Offline mode

### Gepland voor v2.0.0
- [ ] Web versie
- [ ] Mobile app
- [ ] Social features
- [ ] Mining pool directe integratie
- [ ] Machine learning voorspellingen
- [ ] Blockchain data integratie

---

## Versie Conventies

- **MAJOR.MINOR.PATCH**
- **MAJOR**: Incompatibele API wijzigingen
- **MINOR**: Nieuwe functionaliteit (achterwaarts compatibel)
- **PATCH**: Bug fixes (achterwaarts compatibel)

## Bijdragen

Voor het toevoegen van wijzigingen aan deze changelog:
1. Volg het bestaande formaat
2. Gebruik Nederlandse beschrijvingen
3. Groepeer wijzigingen per type (Toegevoegd, Gewijzigd, Verwijderd, etc.)
4. Voeg datum toe in YYYY-MM-DD formaat 

### Bekende Issues
- Electron GPU errors in console (beïnvloedt functionaliteit niet)
- CORS beperkingen bij API calls naar externe rigs 

### Bronnen
- [Bitaxe API Documentatie](https://osmu.wiki/bitaxe/api/) - API endpoints en data formaten 

## [1.8.0] - 2024-12-19
### Toegevoegd
- Globale instellingen sectie in rig-panel voor elektriciteitskosten en pool fee
- Automatische update van rig summary wanneer elektriciteitskosten veranderen
- Pool fee wordt nu correct toegepast op dagelijkse beloningen
- Nieuwe kolom in resultaten tabel voor "Na Pool Fee" beloningen

### Gewijzigd
- Elektriciteitskosten en pool fee verwijderd uit individuele rig configuratie
- calculateProfit functie gebruikt nu globale elektriciteitskosten en pool fee
- updateRigSummary functie gebruikt globale elektriciteitskosten uit instellingen
- Event listeners toegevoegd voor globale instellingen wijzigingen

### Verwijderd
- Individuele elektriciteitskosten velden uit rig configuratie
- Individuele pool fee velden uit rig configuratie
- Gemiddelde pool fee berekening uit calculateProfit functie

## [1.7.0] - 2024-12-19

## [1.9.0] - 2024-12-19
### Toegevoegd
- Nieuwe "Coins Beheer" sectie in instellingen
- Handmatig toevoegen van custom coins met volledige configuratie
- Bewerken van bestaande coins (API en handmatige)
- Verwijderen van handmatig toegevoegde coins
- Visuele badges voor API coins vs handmatige coins
- Coin overzicht met totalen (API, handmatig, totaal)
- Modal formulieren voor toevoegen/bewerken van coins
- Automatische opslag van handmatige coins in localStorage

### Gewijzigd
- renderCoinGrid toont nu zowel API als handmatige coins
- Coin selectie werkt voor alle coin types
- Verbeterde UI voor coin cards met badges en acties
- CSS styling voor coins beheer en modal formulieren

### Functionaliteit
- **Handmatige coins**: Voeg custom coins toe met symbol, naam, prijs, market cap en 24h verandering
- **API coins**: Automatisch geladen via CoinMarketCap/CoinGecko
- **Bewerken**: Update prijzen en details van bestaande coins
- **Verwijderen**: Alleen handmatige coins kunnen worden verwijderd
- **Persistentie**: Handmatige coins worden opgeslagen en herladen

## [1.8.0] - 2024-12-19

## [2.0.0] - 2024-12-19
### Toegevoegd
- Mining coin selectie per rig in de instellingen
- Visuele badges voor rig type, algoritme en mining coin
- Specifieke profit berekeningen per coin op basis van toegewezen rigs
- Aantal rigs per coin wordt getoond in resultaten
- Default mining coin (BTC) voor nieuwe rigs
- Verbeterde rig status display met coin informatie

### Gewijzigd
- calculateProfit functie gebruikt nu specifieke hashrate per coin
- Rig cards tonen nu type, algoritme en mining coin badges
- Resultaten tabel toont hoeveel rigs op elke coin minen
- Profit berekeningen zijn accurater door coin-specifieke hashrate

### Functionaliteit
- **Per-rig coin selectie**: Elke rig kan een specifieke coin toewijzen
- **Accurate berekeningen**: Profit wordt berekend op basis van rigs die daadwerkelijk op die coin minen
- **Visuele feedback**: Duidelijke badges en indicators voor rig configuratie
- **Flexibiliteit**: Rigs zonder toegewezen coin gebruiken totale hashrate

## [1.9.0] - 2024-12-19 

## [2.1.0] - 2024-12-19
### Toegevoegd
- Pool informatie ophalen via API van mining rigs
- Pool URL, Port, User en Password velden in rig configuratie
- Automatische pool configuratie detectie voor Bitaxe/Nerdaxe
- Visuele pool badge in rig status display
- Pool informatie sectie met "Live" indicator
- Readonly velden voor API-opgehaalde pool data
- Placeholder waarden voor unmineable configuratie

### Gewijzigd
- checkRigStatus functie haalt nu pool informatie op uit API response
- Rig UI toont pool configuratie met live indicators
- Rig status badges tonen nu ook pool informatie
- Verbeterde logging van pool configuratie

### Functionaliteit
- **API Pool Detectie**: Automatisch ophalen van pool configuratie uit rig API
- **Live Indicators**: Groene achtergrond en "(live)" tekst voor API data
- **Handmatige Override**: Mogelijkheid om pool configuratie handmatig aan te passen
- **Visuele Feedback**: Pool badges en sectie headers voor duidelijke organisatie
- **Unmineable Support**: Placeholder waarden voor unmineable.com configuratie

## [2.0.0] - 2024-12-19 