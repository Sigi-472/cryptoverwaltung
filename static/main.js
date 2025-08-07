var currentPrices = {};
var eurToUsd = 1.10;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Globale Variablen !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

var rows = document.querySelectorAll("table tbody tr");

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

async function saveBtnClick (event) {
	event.preventDefault();

  const form = event.target.parentElement;
  
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
		await kaufeUndAktualisiere(daten);  // Hier wird die Käufe + Portfolio Tabelle aktualisiert
		await updatePortfolio(); // Portfolio Tabelle aktualisieren
		await updateKaeufe();    // *** Käufe Tabelle aktualisieren ***

		form.reset();
		form.style.display = "none";
	} catch (error) {
		alert("❌ Fehler beim Kauf: " + error.message);
	}
}



$(function () {
  const form = document.getElementById("form_id");
  const sellForm = document.getElementById("sell_form_id");

  const buyBtn = document.getElementById("buy_btn");
  const sellBtn = document.getElementById("sell_btn");

  const cancelBtn = document.getElementById("cancelBtn");
  const cancelSellBtn = document.getElementById("cancelSellBtn");

  const saveBtn = document.getElementById("saveBtn");
  const saveSellBtn = document.getElementById("saveSellBtn");

  if (buyBtn) {
    buyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (form) form.style.display = "block";
      if (sellForm) sellForm.style.display = "none";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (form) {
        form.reset();
        form.style.display = "none";
      }
    });
  }

  if (sellBtn) {
    sellBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (sellForm) sellForm.style.display = "block";
      if (form) form.style.display = "none";
    });
  }

  if (cancelSellBtn) {
    cancelSellBtn.addEventListener("click", (e) => {
      e.preventDefault();
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

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);

        if (!res.ok) throw new Error(`Server Fehler: ${text}`);

        try {
          const json = JSON.parse(text);
          console.log("Response JSON:", json);

          if (json.differenz !== undefined) {
            alert(`Verkauf gespeichert! Gewinn/Verlust: ${json.differenz.toFixed(2)} €`);
          }
        } catch {
          console.warn("Antwort kein JSON");
        }

        sellForm.reset();
        sellForm.style.display = "none";

        await updatePortfolio(); // Nur Portfolio Tabelle aktualisieren, Käufe nicht
        await updateKaeufe();    // *** Käufe Tabelle aktualisieren ***

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
async function fetchDurchschnittspreis(coin) {
  const response = await fetch(`/api/durchschnittspreis/${coin}`);
  if (!response.ok) throw new Error('Fehler beim Laden des Durchschnittspreises');
  const data = await response.json();
  return data.durchschnittspreis;
}

async function updatePriceInDOM(coin, price) {
  try {
    const durchschnittspreis = await fetchDurchschnittspreis(coin);

    const priceElement = document.getElementById(`${coin.toLowerCase()}-price`);
    if (priceElement) {
      priceElement.textContent = price.toFixed(2) + " €";
    }

    const rows = document.querySelectorAll("#portfolioTable tbody tr");
    rows.forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length < 7) return;
      
      const rowCoin = tds[0].textContent.trim().toUpperCase();
      if (rowCoin === coin) {
        const kursUSD = price / eurToUsd;
        tds[5].textContent = kursUSD.toFixed(2) + " €";
        tds[6].textContent = price.toFixed(2) + " $";

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
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Preises:', error);
  }
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

// Käufe laden und anzeigen
async function updateKaeufe() {
  try {
    const res = await fetch('/api/portfolio-und-kaeufe');
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Fehler beim Laden der Käufe, Status: ${res.status}, Antwort: ${text}`);
    }
    const data = await res.json();
    const kaeufe = data.kaeufe;

    if($("#kaeufeTable").length == 0) {
      console.warn("#kaeufeTabelle nicht gefunden")
      return;
    }

    const tbody = document.querySelector('#kaeufeTable tbody');
    tbody.innerHTML = '';

    kaeufe.forEach(kauf => {
      const differenzText = (typeof kauf.differenz === 'number') 
        ? kauf.differenz.toFixed(2) + ' €' 
        : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${kauf.coin}</td>
        <td>${kauf.anzahl}</td>
        <td>${kauf.preis.toFixed(2)} €</td>
        <td>${kauf.kaufdatum}</td>
        <td>${differenzText}</td>
        <td>${kauf.kommentar || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    // Farben nach dem Befüllen setzen
    colorize_kaeufe_table();

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
    updateKaeufeTable(json.kaeufe)

  } catch (error) {
    console.error('Fehler:', error);
  }
}
function updatePortfolioTable(portfolio) {
  const tbody = document.querySelector('#portfolioTable tbody');
  if (!tbody) {
    console.warn('Kein #portfolioTable tbody gefunden, updatePortfolioTable wird abgebrochen');
    return;
  }
  tbody.innerHTML = ''; // alles löschen
  portfolio.forEach(eintrag => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${eintrag.coin}</td>
      <td>${eintrag.im_besitz}</td>
      <td>${Number.isFinite(eintrag.durchschnittseinkaufspreis) ? eintrag.durchschnittseinkaufspreis.toFixed(2) + ' €' : '–'}</td>
      <td>${Number.isFinite(eintrag.aktueller_wert) ? eintrag.aktueller_wert.toFixed(2) + ' €' : '–'}</td>
      <td>${Number.isFinite(eintrag.gewinn_brutto) ? eintrag.gewinn_brutto.toFixed(2) + ' €' : '–'}</td>
      <td class="price-cell" data-coin="${eintrag.coin}">${Number.isFinite(eintrag.kurs_eur) ? eintrag.kurs_eur.toFixed(2) + ' €' : '–'}</td>
      <td>${Number.isFinite(eintrag.kurs_usd) ? eintrag.kurs_usd.toFixed(2) + ' $' : '–'}</td>
    `;

    // Farbe für Gewinn/Verlust setzen
    if (Number.isFinite(eintrag.gewinn_brutto)) {
      if (eintrag.gewinn_brutto > 0) {
        tr.cells[4].style.color = "green";
      } else if (eintrag.gewinn_brutto < 0) {
        tr.cells[4].style.color = "red";
      } else {
        tr.cells[4].style.color = "black";
      }
    }

    tbody.appendChild(tr);
  });
}


function updateKaeufeTable(kaeufe) {
  console.log('updateKaeufeTable wurde aufgerufen', kaeufe);
  const tbody = document.querySelector('#kaeufeTable tbody');
  if (!tbody) {
    console.warn('Kein #kaeufeTable tbody gefunden, updateKaeufeTable wird abgebrochen');
    return;
  }
  tbody.innerHTML = '';
  kaeufe.forEach(kauf => {
    const differenzText = typeof kauf.differenz === 'number' ? kauf.differenz.toFixed(2) + ' €' : '–';
    tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${kauf.coin}</td>
      <td>${kauf.anzahl}</td>
      <td>${kauf.preis.toFixed(2)} €</td>
      <td>${kauf.kaufdatum}</td>
      <td>${differenzText}</td>
      <td>${kauf.kommentar || '–'}</td>
    `;
    tbody.appendChild(tr);
  });

  console.log('Vor dem Aufruf von colorize_kaeufe_table');
  colorize_kaeufe_table();
  console.log('Nach dem Aufruf von colorize_kaeufe_table');
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

$(document).ready(function () {
  colorize_kaeufe_table();
});
