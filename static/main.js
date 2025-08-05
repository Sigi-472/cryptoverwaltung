const currentPrices = {};
let eurToUsd = 1.10;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Globale Variablen !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const rows = document.querySelectorAll("table tbody tr");

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

async function fetchPrice(coin) {
  try {
    const response = await fetch(`/api/price?coin=${coin.toUpperCase()}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    if (data.price_eur !== undefined) {
      currentPrices[coin.toUpperCase()] = data.price_eur;
      updatePriceInDOM(coin.toUpperCase(), data.price_eur);
    } else {
      console.warn(`Keine Preisdaten für ${coin}`);
    }
  } catch (error) {
    console.error(`Fehler bei fetchPrice für ${coin}:`, error);
  }
}

fetchPrice("BTC");
fetchPrice("SOL");
fetchPrice("ETH");
fetchPrice("XRP");
fetchPrice("ADA");
fetchPrice("DOT");
fetchPrice("DOGE");
fetchPrice("MATIC");
fetchPrice("TRX");
fetchPrice("LTC");
fetchPrice("LINK");
fetchPrice("AVAX");
fetchPrice("UNI");
fetchPrice("ONDO");
fetchPrice("AAVE");
fetchPrice("XLM");
fetchPrice("FIL");
fetchPrice("ATOM");
fetchPrice("NEAR");
fetchPrice("SAND");
fetchPrice("APE");
fetchPrice("CHZ");
fetchPrice("MANA");
fetchPrice("XTZ");
fetchPrice("KSM");
fetchPrice("SUI");
fetchPrice("ALGO");
fetchPrice("SHIB");
fetchPrice("VET");
fetchPrice("ZRX");
fetchPrice("ZETACHAIN");
fetchPrice("DEGEN");
fetchPrice("ALEO");
fetchPrice("BCH");
fetchPrice("BNB");
fetchPrice("USDT");
fetchPrice("XMR");





setInterval(() => fetchPrice("BTC"), 10000);

rows.forEach((row) => {
  const coin = row.querySelector("td:first-child").textContent.trim();
  if (coin === "BTC") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["BTC"];
}
if (coin === "SOL") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["SOL"];
}
if (coin === "ETH") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ETH"];
}
if (coin === "XRP") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["XRP"];
}
if (coin === "ADA") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ADA"];
}
if (coin === "DOT") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["DOT"];
}
if (coin === "DOGE") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["DOGE"];
}
if (coin === "MATIC") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["MATIC"];
}
if (coin === "TRX") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["TRX"];
}
if (coin === "LTC") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["LTC"];
}
if (coin === "LINK") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["LINK"];
}
if (coin === "AVAX") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["AVAX"];
}
if (coin === "UNI") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["UNI"];
}
if (coin === "ONDO") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ONDO"];
}
if (coin === "AAVE") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["AAVE"];
}
if (coin === "XLM") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["XLM"];
}
if (coin === "FIL") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["FIL"];
}
if (coin === "ATOM") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ATOM"];
}
if (coin === "NEAR") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["NEAR"];
}
if (coin === "SAND") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["SAND"];
}
if (coin === "APE") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["APE"];
}
if (coin === "CHZ") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["CHZ"];
}
if (coin === "MANA") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["MANA"];
}
if (coin === "XTZ") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["XTZ"];
}
if (coin === "KSM") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["KSM"];
}
if (coin === "SUI") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["SUI"];
}
if (coin === "ALGO") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ALGO"];
}
if (coin === "SHIB") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["SHIB"];
}
if (coin === "VET") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["VET"];
}
if (coin === "ZRX") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ZRX"];
}
if (coin === "ZETACHAIN") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ZETACHAIN"];
}
if (coin === "DEGEN") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["DEGEN"];
}
if (coin === "ALEO") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["ALEO"];
}
if (coin === "BCH") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["BCH"];
}
if (coin === "BNB") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["BNB"];
}
if (coin === "USDT") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["USDT"];
}
if (coin === "XMR") {
  const kursEURZelle = row.querySelectorAll("td")[5];
  kursEURZelle.textContent = currentPrices["XMR"];
}

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('DOMContentLoaded', () => {
  fetchEurToUsdRate();
});




document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form_id");
  const sellForm = document.getElementById("sell_form_id");

  const buyBtn = document.getElementById("buy_btn");
  const sellBtn = document.getElementById("sell_btn");

  const cancelBtn = document.getElementById("cancelBtn");
  const cancelSellBtn = document.getElementById("cancelSellBtn");

  const saveBtn = document.getElementById("saveBtn");
  const saveSellBtn = document.getElementById("saveSellBtn");

  buyBtn.addEventListener("click", () => {
    form.style.display = "block";
    sellForm.style.display = "none";
  });

  sellBtn.addEventListener("click", () => {
    sellForm.style.display = "block";
    form.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    form.reset(); // Formular leeren
    form.style.display = "none"; // Formular verstecken
  });

  cancelSellBtn.addEventListener("click", () => {
    sellForm.reset();
    sellForm.style.display = "none";
  });

  saveBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const daten = {
      coin: document.getElementById("coinSelect").value,
      im_besitz: parseFloat(document.getElementById("amountInput").value),
      durchschnittseinkaufspreis: parseFloat(
        document.getElementById("priceInput").value
      ),
      kaufdatum: document.getElementById("buyDateInput").value,
    };

    try {
      const res = await fetch("/api/kauf-und-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(daten),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Response Text:", text);

      if (!res.ok) throw new Error(`Server Fehler: ${text}`);

      // Versuche JSON zu parsen (falls du das brauchst)
      try {
        const json = JSON.parse(text);
        console.log("Response JSON:", json);
      } catch {
        console.warn("Antwort kein JSON");
      }

      form.reset();
      form.style.display = "none";
      await updatePortfolio();
    } catch (error) {
      alert("❌ Fehler beim Kauf: " + error.message);
    }
  });
});

async function updatePrices() {
  const priceCells = document.querySelectorAll(".price-cell");
  const coins = [
    ...new Set(Array.from(priceCells).map((td) => td.dataset.coin)),
  ];

  // Falls du keine .price-cell hast, kannst du auch einfach alle Coins aus der Tabelle nehmen:
  // const rows = document.querySelectorAll("table tbody tr");
  // const coins = [...new Set(Array.from(rows).map(row => row.querySelector("td:first-child").textContent.trim().toUpperCase()))];

  for (const coin of coins) {
    try {
      const response = await fetch(`/api/price?coin=${coin}`);
      if (!response.ok) {
        console.error(
          `Fehler beim Laden des Preises für ${coin}: ${response.status}`
        );
        continue;
      }
      const data = await response.json();

      if (data.price_eur !== undefined) {
        updatePriceInDOM(coin, data.price_eur);
      } else {
        console.warn(`Keine Preisdaten für ${coin} erhalten`);
      }
    } catch (error) {
      console.error(`Fehler beim Abrufen des Preises für ${coin}:`, error);
    }
  }
}

function updatePriceInDOM(coin, price) {
  const priceElement = document.getElementById(`${coin.toLowerCase()}-price`);
  if (priceElement) {
    priceElement.textContent = price.toFixed(2) + " €";
  }

  const rows = document.querySelectorAll("#portfolioTable tbody tr");
  rows.forEach((row) => {
    const tds = row.querySelectorAll("td");
    if (tds.length < 7) {
      // Nicht genug Spalten, nichts machen
      return;
    }
    const rowCoin = tds[0].textContent.trim().toUpperCase();
    if (rowCoin === coin) {
      const durchschnittspreis = parseFloat(tds[2].textContent.replace(",", "."));
      tds[2].textContent = durchschnittspreis.toFixed(2) + " €";

      const imBesitz = parseFloat(tds[1].textContent.replace(",", "."));

      const aktuellerWert = price * imBesitz;
      tds[3].textContent = aktuellerWert.toFixed(2) + " €";

      const einkaufswert = imBesitz * durchschnittspreis;
      const gewinn = aktuellerWert - einkaufswert;
      tds[4].textContent = gewinn.toFixed(2) + " €";

      if (gewinn > 0) {
        tds[4].style.color = "green";
      } else if (gewinn < 0) {
        tds[4].style.color = "red";
      } else {
        tds[4].style.color = "black";
      }

      tds[5].textContent = price.toFixed(2) + " €";

      const kursUSD = price * eurToUsd;
      tds[6].textContent = kursUSD.toFixed(2) + " $";
    }
  });
}



async function postKauf(daten) {
  const res = await fetch("/api/kauf-und-portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(daten),
  });

  if (!res.ok) {
    // Versuche, Fehlermeldung als JSON zu lesen
    let errMsg = "Unbekannter Fehler";
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch {
      // Falls kein JSON zurückkommt, ignorieren
    }
    throw new Error(errMsg);
  }

  // Antwort als JSON lesen
  try {
    return await res.json();
  } catch {
    // Falls keine JSON-Antwort, einfach return
    return;
  }
}

// Käufe laden und anzeigen
async function updateKaeufe() {
  try {
    const res = await fetch('/api/kaeufe');
    if (!res.ok) throw new Error('Fehler beim Laden der Käufe');
    const kaeufe = await res.json();

    const tbody = document.querySelector('#kaeufeTable tbody');
    tbody.innerHTML = '';

    kaeufe.forEach(kauf => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${kauf.coin}</td>
        <td>${kauf.anzahl}</td>
        <td>${kauf.preis}</td>
        <td>${kauf.kaufdatum}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Käufe:', error);
  }
}

// Portfolio laden und anzeigen
async function updatePortfolio() {
  try {
    const res = await fetch('/api/portfolio-und-kaeufe');
    if (!res.ok) throw new Error('Fehler beim Laden des Portfolios');

    const json = await res.json();
    updatePortfolioTable(json.portfolio);  // ✅ Rufe die richtige Anzeige-Funktion auf

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Portfolios:', error);
  }
}






async function kaufeUndAktualisiere(data) {
  try {
    // Kauf speichern
    let res = await fetch('/api/kauf-und-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Fehler beim Speichern des Kaufs');

    let result = await res.json();
    console.log(result.message);

    // Dann Portfolio + Käufe laden
    res = await fetch('/api/portfolio-und-kaeufe');
    if (!res.ok) throw new Error('Fehler beim Laden von Portfolio und Käufen');

    const json = await res.json();

    // Portfolio Tabelle aktualisieren
    updatePortfolioTable(json.portfolio);

    // Käufe Tabelle aktualisieren
    updateKaeufe(json.kaeufe);

  } catch (error) {
    console.error('Fehler:', error);
  }
}

function updatePortfolioTable(portfolio) {
  const tbody = document.querySelector('#portfolioTable tbody');
  tbody.innerHTML = ''; // alles löschen
  portfolio.forEach(eintrag => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eintrag.coin}</td>
      <td>${eintrag.im_besitz}</td>
      <td>${eintrag.durchschnittseinkaufspreis.toFixed(2)} €</td>
      <td>${eintrag.aktueller_wert ?? '–'}</td>
      <td>${eintrag.gewinn_brutto ?? '–'}</td>
      <td class="price-cell" data-coin="${eintrag.coin}">${eintrag.kurs_eur ?? '–'}</td>
      <td>${eintrag.kurs_usd ?? '–'}</td>
      <td><a href="/delete/${eintrag.id}" onclick="return confirm('Wirklich löschen?')">Löschen</a></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateKaeufeTable(kaeufe) {
  const tbody = document.querySelector('#kaeufeTable tbody');
  tbody.innerHTML = '';
  kaeufe.forEach(kauf => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${kauf.coin}</td>
      <td>${kauf.anzahl}</td>
      <td>${kauf.preis}</td>
      <td>${kauf.kaufdatum}</td>
    `;
    tbody.appendChild(tr);
  });
}



async function fetchEurToUsdRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    const data = await res.json();
    console.log("🌐 Neue API-Daten:", data);

    if (data && data.rates && data.rates.USD) {
      eurToUsd = data.rates.USD;
      console.log('💱 EUR/USD-Kurs:', eurToUsd);
    } else {
      console.warn("⚠️ USD-Kurs nicht gefunden:", data);
    }
  } catch (error) {
    console.error('Fehler beim Laden des Wechselkurses:', error);
  }
}





setInterval(updatePrices, 10000);
updatePrices();
