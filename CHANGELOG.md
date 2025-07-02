# Changelog

Alle belangrijke wijzigingen in dit project worden gedocumenteerd in dit bestand.

Het formaat is gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.0.0/),
en dit project volgt [Semantic Versioning](https://semver.org/lang/nl/).

## [2.1.0] - 2024-12-19

### Toegevoegd
- **Verbeterde Rig Toevoeging**: Nieuwe rigs vragen nu om naam en IP adres bij aanmaken
- **IP Adres Validatie**: Automatische validatie van IP adressen bij invoer
- **Uitgebreide Rig Bewerking**: Bewerk functie kan nu zowel naam als IP adres wijzigen
- **Gebruiksvriendelijke Prompts**: Duidelijke prompts met standaardwaarden voor eenvoudige invoer

### Gewijzigd
- **addNewRig() Functie**: Nu async functie die eerst naam en IP adres vraagt
- **editRig() Functie**: Uitgebreid om zowel naam als IP adres te bewerken
- **Rig Interface**: Bewerk knop heeft nu tooltip die aangeeft dat zowel naam als IP bewerkt kunnen worden

### Technische Details
- IP adres validatie met regex pattern voor geldige IPv4 adressen
- showPrompt() functie gebruikt voor gebruiksvriendelijke invoer
- Annuleren mogelijk bij elke stap van rig toevoeging/bewerking
- Standaard IP adres suggestie (192.168.1.100) voor eenvoudige invoer

## [2.0.0] - 2024-12-19

### Toegevoegd
- **Collapsible Rigs**: Rigs zijn nu standaard ingeklapt voor betere overzichtelijkheid
- **Expand/Collapse Functionaliteit**: Klik op rig header om velden uit/in te klappen
- **Visual Feedback**: Expand icon (▶️/🔽) toont status van rig expansie
- **Smooth Transitions**: Vloeiende animaties bij in/uitklappen van rigs
- **Hover Effects**: Visuele feedback bij hover over rig headers

### Gewijzigd
- **Rig Interface**: Rigs zijn nu compact en uitklapbaar voor betere gebruikerservaring
- **Rig Header**: Klikbare header met expand icon voor eenvoudige navigatie
- **Rig Fields**: Standaard verborgen, alleen zichtbaar bij uitklappen

### Technische Details
- `toggleRigExpansion()` functie voor in/uitklappen van rig velden
- CSS transitions en transforms voor smooth animaties
- Expand icon rotatie bij uitklappen
- Hover effects voor betere interactiviteit

## [1.9.0] - 2024-12-19

### Toegevoegd
- **Verwijder Optie voor Pool Configuraties**: "D" + nummer om configuraties te verwijderen
- **Bevestigingsdialoog bij Verwijderen**: Confirmation dialog voor veilige verwijdering
- **Directe Bewerk/Verwijder Opties**: Simpelere interface met directe acties
- **Per-Rig Configuratie Verwijdering**: Verwijder optie werkt zowel in algemene als per-rig lijsten

### Gewijzigd
- **Pool Configuratie Interface**: Vereenvoudigde interface met directe bewerk/verwijder opties
- **Configuratie Beheer Workflow**: Verbeterde workflow voor het beheren van pool instellingen

## [1.8.0] - 2024-12-19

### Toegevoegd
- **Pool Overzicht Sectie**: Nieuwe sectie in het Mining Pool paneel voor het tonen van pool data van alle actieve miners
- **Automatische Pool Data Opslag**: Data die we al ophalen van miners wordt nu automatisch opgeslagen in localStorage per rig
- **Pool Data Persistentie**: Data blijft behouden bij pool wissels - elke rig slaat data op per pool type
- **Multi-Pool Geschiedenis**: Toont data van alle pools die elke rig heeft gebruikt, gesorteerd op datum
- **Huidige vs Historische Data**: Duidelijk onderscheid tussen huidige pool data en historische data
- **Vereenvoudigd Pool Data Overzicht**: Toont alleen shares, geweigerde shares en stratum configuratie per miner
- **Stratum Informatie**: Toont stratum URL, poort en user van elke miner in het pool overzicht
- **Pool Wachtwoord Functionaliteit**: Handmatig wachtwoord invoeren met oogje om te tonen/verbergen (standaard verborgen)
- **Wachtwoord Persistentie**: Pool wachtwoord wordt automatisch opgeslagen en geladen
- **Pool Configuratie Beheer**: Opslaan, laden en beheren van pool configuraties met wachtwoord
- **Pool Configuratie Opslag**: Sla pool instellingen op met naam, API key, worker name, URL en wachtwoord
- **Pool Configuratie Laden**: Laad opgeslagen pool configuraties terug in de interface
- **Real-time Status Indicatoren**: Kleurgecodeerde status indicators (groen voor hashing, rood voor idle, grijs voor offline)
- **Timestamp Tracking**: Toont wanneer de laatste pool data is opgehaald per miner
- **Refresh Functionaliteit**: Knop om handmatig alle pool data opnieuw op te halen
- **Responsive Design**: Pool overzicht werkt goed op mobiele apparaten

### Gewijzigd
- **Vereenvoudigd Pool Overzicht**: Verwijderd hashrate, verwachte hashrate, efficiëntie, beste difficulty en difficulty sinds boot uit het pool overzicht
- **Focussed Data**: Pool overzicht toont nu alleen relevante pool-specifieke informatie (shares, stratum configuratie)
- **Geoptimaliseerde Opslag**: Minder data wordt opgeslagen in localStorage voor betere performance
- **Wachtwoord Beveiliging**: Pool configuraties kunnen nu beveiligd worden met een wachtwoord
- **Data Structuur**: Pool data wordt nu opgeslagen per rig + pool combinatie voor betere organisatie
- **Pool Configuratie Workflow**: Verbeterde workflow voor het beheren van pool instellingen

### Technische Details
- Nieuwe globale variabele `rigPoolData` voor het opslaan van pool data per rig + pool combinatie
- `saveRigPoolData()` en `loadRigPoolData()` functies voor persistentie met backward compatibility
- `updateRigPoolData()` functie voor het bijwerken van pool data (vereenvoudigd)
- `renderPoolOverview()` functie voor het tonen van het overzicht met multi-pool geschiedenis
- `refreshPoolOverview()` functie voor handmatige refresh
- `togglePassword()`, `savePoolPassword()`, `loadPoolPassword()` functies voor wachtwoord beheer
- `saveCurrentPoolConfig()`, `loadPoolConfigurations()`, `loadPoolConfig()`, `deletePoolConfig()` functies voor pool configuratie beheer
- `getPoolDisplayName()` helper functie voor pool naam weergave
- Aangepaste `checkRigStatus()` en `fetchAllRigStats()` functies om alleen relevante pool data op te slaan
- Aangepaste `fetchRigApiData()` functie om stratum informatie op te halen
- Nieuwe CSS styling voor pool overzicht, stratum informatie, wachtwoord functionaliteit, pool actions en multi-pool geschiedenis

### UI Verbeteringen
- Moderne kaart-gebaseerde layout voor pool data
- Multi-pool geschiedenis met huidige en historische secties
- Huidige pool data gemarkeerd met groene achtergrond en "Huidig" badge
- Historische pool data met grijze achtergrond en verminderde opacity
- Stratum informatie sectie met gekleurde labels (URL, poort, user)
- Wachtwoord input met oogje toggle (👁️/🙈) voor tonen/verbergen
- Pool configuratie actie knoppen (Opslaan, Bekijk Configuraties)
- Hover effecten en smooth transitions
- Duidelijke labels voor shares en stratum configuratie
- Empty state wanneer geen actieve miners zijn
- Loading state tijdens het ophalen van data

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

## [1.7.0] - 2024-12-19

### Toegevoegd
- **Multi-Rig Dashboard Grafiek**: Grafiek toont nu per hashing rig een eigen lijn met kleuren
- **Rig Legend**: Legend links van de grafiek met rig-namen en kleuren
- **Tijdsselectie**: Knoppen voor dag/week/maand/jaar met dynamische x-as labels
- **Lineair/Logaritmisch Toggle**: Schakelaar tussen lineaire en logaritmische schaal
- **Persistente Rig Data**: Hashrate geschiedenis wordt opgeslagen per rig in localStorage
- **Automatische Refresh**: Dashboard update automatisch elke 30 seconden
- **Handmatige Refresh**: Knop om dashboard handmatig te verversen

### Technische Details
- Nieuwe globale variabele `rigHashrateHistory` voor per-rig geschiedenis
- `saveRigHashrateHistory()` en `loadRigHashrateHistory()` functies
- `updateDashboardChartMulti()` functie voor multi-rig grafiek
- `updateDashboardLegend()` functie voor rig legend
- Chart.js time scale met dynamische displayFormats
- X-as labels: dag (per uur), week/maand (per dag), jaar (per week)

### UI Verbeveringen
- Moderne, lichte styling voor tijdsselectie knoppen
- Responsive legend layout
- Smooth animaties bij grafiek updates
- Duidelijke tooltips met datum/tijd informatie

## [1.6.0] - 2024-06-30

### Toegevoegd
- **Mining Rig Management**: Volledig systeem voor het beheren van mining rigs
- **Rig Types**: Ondersteuning voor Bitaxe, Nerdaxe, ASIC, GPU en Custom miners
- **Real-time Monitoring**: Automatische status monitoring van alle actieve rigs
- **Rig Configuratie**: IP-adres, API endpoint, naam, type en algoritme instellingen
- **Rig Status Tracking**: Hashing/idle status met real-time updates
- **Rig Testing**: Test functionaliteit voor individuele rigs en alle rigs tegelijk
- **Persistente Rig Data**: Rigs worden opgeslagen in localStorage
- **Modale popup voor gebruikersinvoer ter vervanging van prompt()
- **Nieuwe showPrompt() functie voor Electron-compatibele input dialogen
- **CSS styling voor prompt modale popup**

### Technische Details
- Nieuwe globale variabele `miningRigs` array
- `addNewRig()`, `deleteRig()`, `toggleRig()`, `editRig()` functies
- `startRigMonitoring()`, `stopRigMonitoring()`, `checkRigStatus()` functies
- `saveRigsToStorage()`, `loadRigsFromStorage()` functies
- `fetchRigApiData()` functie voor API calls naar miners
- `renderRigsList()` functie voor UI updates

### UI Verbeteringen
- Moderne rig kaarten met status indicators
- Collapsible rig configuratie velden
- Real-time status updates met kleurgecodeerde indicators
- Responsive design voor mobiele apparaten
- Smooth animaties en hover effecten

### Gewijzigd
- Alle prompt() calls vervangen door showPrompt() modale popup
- editRig() functie aangepast voor async/await
- saveCurrentPoolConfig() functie aangepast voor async/await
- loadPoolConfigurations() functie aangepast voor async/await
- loadPoolConfigForRig() functie aangepast voor async/await

### Opgelost
- prompt() error in Electron renderer context
- Wachtwoord velden niet meer bewerkbaar na foutmeldingen
- UI crashes na prompt() errors

## [1.5.0] - 2024-06-30

### Toegevoegd
- **Coins Beheer**: Volledig systeem voor het beheren van coins
- **Handmatige Coin Toevoeging**: Mogelijkheid om coins handmatig toe te voegen
- **Coin Bewerking**: Edit functionaliteit voor bestaande coins
- **Coin Verwijdering**: Delete functionaliteit voor coins
- **Persistente Coin Data**: Handmatige coins worden opgeslagen in localStorage
- **Coin Samenvatting**: Overzicht van beschikbare coins

### Technische Details
- Nieuwe globale variabele `manualCoins` array
- `showAddCoinForm()`, `closeAddCoinForm()`, `handleAddCoin()` functies
- `editCoin()`, `closeEditCoinForm()`, `handleEditCoin()` functies
- `deleteCoin()` functie
- `saveManualCoins()`, `loadManualCoins()` functies
- `renderCoinsList()` functie voor UI updates

### UI Verbeteringen
- Moderne coin kaarten met prijs en market cap informatie
- Modal dialogen voor coin toevoegen/bewerken
- Responsive grid layout voor coins
- Smooth animaties en hover effecten
- Duidelijke badges voor handmatige vs API coins

### Gewijzigd
- savePoolConfigForRig gebruikt nu pool-specifiek wachtwoord veld
- loadPoolConfigForRigFromSelection laadt wachtwoord in juiste pool veld
- Pool configuratie sectie bevat nu wachtwoord input per pool
- Verbeterde CSS styling voor pool configuratie sectie

### Opgelost
- Wachtwoord kon niet per pool worden toegevoegd
- Pool configuratie gebruikte algemeen wachtwoord veld

## [1.4.0] - 2024-06-30

### Toegevoegd
- Pool configuratie knoppen per pool onder stratum configuratie
- Individuele pool configuratie beheer per rig en pool type
- Nieuwe functies: savePoolConfigForRig, loadPoolConfigForRig, loadPoolConfigForRigFromSelection
- Kleine knoppen styling voor pool item acties
- Scheiding van pool configuratie per pool in plaats van algemene sectie

### Verwijderd
- Algemene pool configuratie acties sectie uit hoofdinterface
- Centrale pool configuratie beheer knoppen

### Gewijzigd
- Pool configuratie workflow nu per pool in plaats van algemeen
- Verbeterde UI layout met pool-specifieke configuratie opties
- Wachtwoord wordt nu per pool configuratie opgeslagen en geladen

## [1.3.0] - 2024-06-30

### Toegevoegd
- **Mining Pool Configuratie**: Volledig systeem voor pool instellingen
- **Pool Selectie**: Dropdown met populaire mining pools
- **API Key Management**: Veilige opslag van pool API keys
- **Worker Name Configuratie**: Instellingen voor worker namen
- **Custom Pool URL**: Mogelijkheid om custom pools toe te voegen
- **Pool Testing**: Test functionaliteit voor pool verbindingen
- **Pool Status Tracking**: Real-time status van pool verbindingen

### Technische Details
- `MiningPoolService` class voor pool API calls
- `testPoolConnection()` functie
- `handlePoolSelection()` functie
- Pool configuraties voor Antpool, F2Pool, Poolin, BTC.com, etc.
- Veilige API key opslag

### UI Verbeteringen
- Moderne pool configuratie interface
- Real-time status indicators
- Responsive form layout
- Duidelijke error handling
- Smooth animaties en transitions

## [1.2.0] - 2024-12-19

### Toegevoegd
- **Sidebar Navigation**: Volledig navigatiesysteem met hamburger menu
- **API Instellingen**: CoinMarketCap API key configuratie
- **API Status Tracking**: Real-time status van API verbindingen
- **Fallback naar CoinGecko**: Automatische fallback wanneer CoinMarketCap niet beschikbaar is
- **Responsive Design**: Volledig responsive layout voor alle apparaten
- **Modern UI**: Lichte, moderne styling met gradients en shadows

### Technische Details
- Hamburger menu functionaliteit
- Sidebar navigatie systeem
- API status monitoring
- CoinGecko fallback implementatie
- Responsive CSS met media queries

### UI Verbeteringen
- Moderne gradient backgrounds
- Smooth animaties en transitions
- Hover effecten en shadows
- Mobile-first responsive design
- Intuïtieve navigatie

## [1.1.0] - 2024-12-19

### Toegevoegd
- **Real-time Coin Data**: Live prijzen van CoinMarketCap en CoinGecko
- **Coin Selectie Grid**: Interactieve grid voor het selecteren van coins
- **Hashrate Input**: Gebruiksvriendelijke hashrate invoer
- **Power Consumption**: Stroomverbruik configuratie
- **Electricity Cost**: Elektriciteitskosten instellingen
- **Pool Fee**: Pool fee configuratie
- **Settings Persistence**: Instellingen worden opgeslagen in localStorage

### Technische Details
- CoinMarketCap API integratie
- CoinGecko API fallback
- Real-time data fetching
- Settings management systeem
- LocalStorage persistentie

### UI Verbeteringen
- Moderne coin selection grid
- Real-time data updates
- Responsive design
- Intuïtieve form layout

## [1.0.0] - 2024-12-19

### Toegevoegd
- **Basis SHA-256 Mining Profit Calculator**: Eerste versie van de applicatie
- **Electron Desktop App**: Cross-platform desktop applicatie
- **Hashrate Berekenen**: Basis hashrate input en berekeningen
- **Coin Prijzen**: Basis coin prijs integratie
- **Profit Berekening**: Dagelijkse winst berekeningen
- **Moderne UI**: Basis moderne interface

### Technische Details
- Electron framework setup
- Basis profit calculation logic
- Coin price integration
- Modern CSS styling
- Responsive design foundation 

## Versie 1.0.0
- Initiële versie van de crypto miner profit calculator
- Electron desktop app met SHA-256 mining winstberekening
- Multi-rig management systeem
- Real-time data van CoinMarketCap/CoinGecko
- Uitgebreide rig- en poolconfiguratie
- Modern dashboard met grafieken en tijdsselectie
- Coins beheer via instellingen
- Profit calculator in aparte sectie

## Versie 1.1.0
- Pool data opslag en beheer toegevoegd
- Wachtwoordbeheer per pool configuratie
- Configuratiebeheer met naam, API key, worker name, URL en wachtwoord
- Persistent opslag in localStorage met backward compatibility
- Helper functie voor leesbare pool namen
- Migratie van oude data naar nieuw formaat

## Versie 1.2.0
- UI layout verbeteringen
- Duidelijke scheiding van wachtwoord en configuratiebeheer secties
- Wachtwoordveld per pool onder stratum configuratie geplaatst
- Hoofd wachtwoordveld verwijderd
- Prompt() functie vervangen door modale popup met async/await
- Naam invoer via inputveld in plaats van prompt

## Versie 1.3.0
- CSS verbeteringen voor bewerkbare wachtwoordvelden
- Visuele feedback voor bewerkbare velden
- Testknoppen toegevoegd voor debugging
- Velden blijven bewerkbaar na refresh
- "Bewerk Huidige" knop toegevoegd voor directe bewerking
- Modale popup uitgebreid met bewerkoptie ("B" + nummer)

## Versie 1.4.0
- Verwijder optie toegevoegd aan pool configuratie beheer
- "D" + nummer om configuraties te verwijderen
- Bevestigingsdialoog bij verwijderen
- Zowel in algemene als per-rig configuratie lijsten
- Simpelere interface met directe bewerk/verwijder opties 