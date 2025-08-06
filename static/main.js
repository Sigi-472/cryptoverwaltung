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

fetch('/api/get_sigils')
  .then(response => response.json())
  .then(sigils => {
    sigils.forEach(sigil => {
      fetchPrice(sigil);
    });
  })
  .catch(error => {
    console.error('Fehler beim Abrufen der Sigils:', error);
  });


setInterval(() => fetchPrice("BTC"), 10000);

rows.forEach((row) => {
  const coin = row.querySelector("td:first-child").textContent.trim();

  const r = row.querySelectorAll("td");
  if (r.length >= 5) {
    const kursEURZelle = r[5];
    kursEURZelle.textContent = currentPrices[coin];
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

  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      if (form) form.style.display = "block";
      if (sellForm) sellForm.style.display = "none";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (form) {
        form.reset();
        form.style.display = "none";
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!form) return;

      const daten = {
        coin: document.getElementById("coinSelect").value,
        im_besitz: parseFloat(document.getElementById("amountInput").value),
        durchschnittseinkaufspreis: parseFloat(
          document.getElementById("priceInput").value
        ),
        kaufdatum: document.getElementById("buyDateInput").value,
        kommentar: document.getElementById("buyCommentInput").value,
      };

      try {
        const res = await fetch("/api/kauf-und-portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(daten),
        });

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);

        if (!res.ok) throw new Error(`Server Fehler: ${text}`);

        try {
          const json = JSON.parse(text);
          console.log("Response JSON:", json);
        } catch {
          console.warn("Antwort kein JSON");
        }

        form.reset();
        form.style.display = "none";
        await updatePortfolio?.();
      } catch (error) {
        alert("❌ Fehler beim Kauf: " + error.message);
      }
    });
  }

  if (sellBtn) {
    sellBtn.addEventListener("click", () => {
      if (sellForm) sellForm.style.display = "block";
      if (form) form.style.display = "none";
    });
  }

  if (cancelSellBtn) {
    cancelSellBtn.addEventListener("click", () => {
      if (sellForm) {
        sellForm.reset();
        sellForm.style.display = "none";
      }
    });
  }

  if (saveSellBtn) {
    saveSellBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!sellForm) return;

      const daten = {
        coin: document.getElementById("sellCoinInput").value,
        anzahl: parseFloat(document.getElementById("sellAmountInput").value),
        verkaufspreis: parseFloat(document.getElementById("sellPriceInput").value),
        verkaufsdatum: document.getElementById("sellDateInput").value,
        kommentar: document.getElementById("sellCommentInput").value,
      };

      try {
        const res = await fetch("/api/verkauf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(daten),
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response Text:", text);

        if (!res.ok) throw new Error(`Server Fehler: ${text}`);

        try {
          const json = JSON.parse(text);
          console.log("Response JSON:", json);
        } catch {
          console.warn("Antwort kein JSON");
        }

        sellForm.reset();
        sellForm.style.display = "none";
        await updatePortfolio?.();
      } catch (error) {
        alert("❌ Fehler beim Verkauf: " + error.message);
      }
    });
  }
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
      const kursUSD = price / eurToUsd;
      tds[5].textContent = kursUSD.toFixed(2) + " €";

      console.log("USD Kurs aktualisieren" + price);
      tds[6].textContent = price.toFixed(2) + " $";

      const durchschnittspreis = parseFloat(tds[2].textContent.replace(",", "."));
      tds[2].textContent = durchschnittspreis.toFixed(2) + " €";

      const imBesitz = parseFloat(tds[1].textContent.replace(",", "."));

      const aktuellerWert = kursUSD * imBesitz;
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



    }
  });
}

function colorize_kaeufe_table() {
  var trs = $("#kaeufeTable").find("tr");

  if (trs.length) {
    trs.each(function () {
      var tds = $(this).find("td");
      if (tds.length) {
        var anzahl = parseFloat($(tds[1]).text());

        if (anzahl > 0) {
          $(tds).css("color", "green");
        } else if (anzahl < 0) {
          $(tds).css("color", "red");
        } else if (isNaN(anzahl)) {
          //
        } else {
          $(tds).css("color", "black");
        }
      }
    });
  }
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
      <td>${eintrag.kommentar || '–'}</td> <!-- 💬 NEU: Kommentar -->
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

colorize_kaeufe_table();