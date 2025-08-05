import subprocess
import sys

# Funktion zum automatischen Installieren eines Moduls
def install_if_missing(package):
    try:
        __import__(package)
    except ImportError:
        print(f"Modul '{package}' nicht gefunden. Versuche, es zu installieren...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Benötigte Pakete prüfen/installieren
install_if_missing('flask')
install_if_missing('requests')
install_if_missing('sqlalchemy')
install_if_missing('flask-cors')

sigils = [
    'BTC',
    'SOL',
    'ETH',
    'XRP',
    'ADA',
    'DOT',
    'DOGE',
    'MATIC',
    'TRX',
    'LTC',
    'LINK',
    'AVAX',
    'UNI',
    'ONDO',
    'AAVE',
    'XLM',
    'FIL',
    'ATOM',
    'NEAR',
    'SAND',
    'APE',
    'CHZ',
    'MANA',
    'XTZ',
    'KSM',
    'SUI',
    'ALGO',
    'SHIB',
    'VET',
    'ZRX',
    'ZETACHAIN',
    'DEGEN',
    'ALEO',
    'ZETACHAIN',
    'BCH',
    'BNB',
    'USDT',
    'XMR'
]

# Jetzt die importierten Module verwenden
from flask import Flask, request, jsonify, render_template, redirect, url_for
import requests
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, Float, String, Date
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Cross-Origin-Freigabe

Base = declarative_base()
engine = create_engine('sqlite:///krypto_portfolio.db', echo=False)
Session = sessionmaker(bind=engine)

# === MODELL-KLASSEN ===

class PortfolioEintrag(Base):
    __tablename__ = 'portfolio'
    id = Column(Integer, primary_key=True)
    coin = Column(String, nullable=False)
    im_besitz = Column(Float, nullable=False)
    durchschnittseinkaufspreis = Column(Float, nullable=False)
    aktueller_wert = Column(Float)
    gewinn_brutto = Column(Float)
    kurs_eur = Column(Float)
    kurs_usd = Column(Float)

class KaufEintrag(Base):
    __tablename__ = 'kaeufe'
    id = Column(Integer, primary_key=True)
    coin = Column(String, nullable=False)
    anzahl = Column(Float, nullable=False)
    preis = Column(Float, nullable=False)
    kaufdatum = Column(Date, nullable=False)

# === HILFSFUNKTIONEN ===

def erstelle_datenbank(pfad='sqlite:///krypto_portfolio.db'):
    engine = create_engine(pfad, echo=False)
    Base.metadata.create_all(engine)
    print("Datenbank und Tabellen wurden erstellt.")

# === ROUTEN ===

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Mein_Portfolio')
def mein_portfolio():
    session = Session()
    eintraege = session.query(PortfolioEintrag).all()
    session.close()
    return render_template('Mein_Portfolio.html', eintraege=eintraege)

@app.route('/Transaktionen')
def transaktionen():
    session = Session()
    kaeufe = session.query(KaufEintrag).all()
    session.close()
    
    return render_template('Transaktionen.html', kaeufe=kaeufe)

@app.route('/delete/<int:id>')
def delete_entry(id):
    session = Session()
    eintrag = session.query(PortfolioEintrag).get(id)
    if eintrag:
        session.delete(eintrag)
        session.commit()
    session.close()
    return redirect(url_for('mein_portfolio'))

@app.route("/api/get_sigils")
def get_sigils():
    return jsonify(sigils)

@app.route('/api/update_price', methods=['POST'])
def update_price():
    data = request.json
    coin = data.get('coin')
    kurs_eur = data.get('kurs_eur')
    if not coin or kurs_eur is None:
        return jsonify({'error': 'Fehlende Daten'}), 400

    session = Session()
    eintraege = session.query(PortfolioEintrag).filter_by(coin=coin).all()
    for eintrag in eintraege:
        eintrag.kurs_eur = kurs_eur
    session.commit()
    session.close()
    return jsonify({'status': 'ok'})

@app.route('/api/portfolio', methods=['POST'])
def add_portfolio():
    data = request.get_json()
    print("📥 Portfolio POST erhalten:", data)
    if not data:
        return jsonify({'error': 'Keine Daten empfangen'}), 400

    session = Session()
    try:
        coin = data['coin']
        neu_im_besitz = data['im_besitz']
        neu_preis = data['durchschnittseinkaufspreis']

        eintrag = session.query(PortfolioEintrag).filter_by(coin=coin).first()

        if eintrag:
            gesamt_anzahl = eintrag.im_besitz + neu_im_besitz
            neuer_durchschnitt = (
                (eintrag.durchschnittseinkaufspreis * eintrag.im_besitz) +
                (neu_preis * neu_im_besitz)
            ) / gesamt_anzahl if gesamt_anzahl != 0 else 0

            eintrag.im_besitz = gesamt_anzahl
            eintrag.durchschnittseinkaufspreis = neuer_durchschnitt
        else:
            eintrag = PortfolioEintrag(
                coin=coin,
                im_besitz=neu_im_besitz,
                durchschnittseinkaufspreis=neu_preis
            )
            session.add(eintrag)

        session.commit()
        return jsonify({'message': 'Gespeichert'}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/price')
def api_price():
    coin = request.args.get('coin')
    if not coin:
        return jsonify({'error': 'Kein Coin angegeben'}), 400

    coin = coin.upper()
    api_urls = {}

    for coin_sigil in sigils:
        api_urls[coin_sigil] = f'https://api.coinbase.com/v2/prices/{coin_sigil}-EUR/spot'

    if coin not in api_urls:
        return jsonify({'error': f'Preis für {coin} nicht verfügbar'}), 404

    try:
        response = requests.get(api_urls[coin])
        data = response.json()
        price = float(data['data']['amount'])

        session = Session()
        eintraege = session.query(PortfolioEintrag).filter_by(coin=coin).all()
        for eintrag in eintraege:
            eintrag.kurs_eur = price
            eintrag.aktueller_wert = price * eintrag.im_besitz
            eintrag.gewinn_brutto = eintrag.aktueller_wert - (eintrag.im_besitz * eintrag.durchschnittseinkaufspreis)
        session.commit()
        session.close()

        return jsonify({'price_eur': price})

    except Exception as e:
        print(f"Fehler beim Abruf/Aktualisieren des Preises für {coin}: {e}")
        return jsonify({'error': 'Fehler beim Abruf oder Datenbankupdate'}), 500








@app.route('/api/kauf-und-portfolio', methods=['POST'])
def kauf_und_portfolio():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Keine Daten empfangen'}), 400

    session = Session()
    try:
        coin = data['coin'].upper()
        anzahl = float(data['im_besitz'])
        preis = float(data['durchschnittseinkaufspreis'])
        kaufdatum = datetime.strptime(data['kaufdatum'], '%Y-%m-%d').date()

        # Kauf in Tabelle 'kaeufe' speichern
        kauf = KaufEintrag(
            coin=coin,
            anzahl=anzahl,
            preis=preis,
            kaufdatum=kaufdatum
        )
        session.add(kauf)

        # Portfolio aktualisieren oder neuen Eintrag anlegen
        eintrag = session.query(PortfolioEintrag).filter_by(coin=coin).first()
        if eintrag:
            gesamt_anzahl = eintrag.im_besitz + anzahl
            neuer_durchschnitt = (
                (eintrag.durchschnittseinkaufspreis * eintrag.im_besitz) + (preis * anzahl)
            ) / gesamt_anzahl if gesamt_anzahl != 0 else 0

            eintrag.im_besitz = gesamt_anzahl
            eintrag.durchschnittseinkaufspreis = neuer_durchschnitt
        else:
            eintrag = PortfolioEintrag(
                coin=coin,
                im_besitz=anzahl,
                durchschnittseinkaufspreis=preis
            )
            session.add(eintrag)

        session.commit()
        return jsonify({'message': 'Kauf und Portfolio erfolgreich gespeichert'}), 200

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()

    

@app.route('/api/portfolio-und-kaeufe', methods=['GET'])
def get_portfolio_und_kaeufe():
    session = Session()
    try:
        kaeufe = session.query(KaufEintrag).all()
        portfolio = session.query(PortfolioEintrag).all()

        # Daten in dicts umwandeln (für JSON)
        kaeufe_data = [
            {
                'coin': k.coin,
                'anzahl': k.anzahl,
                'preis': k.preis,
                'kaufdatum': k.kaufdatum.strftime('%Y-%m-%d')
            } for k in kaeufe
        ]
        portfolio_data = [
            {
                'coin': p.coin,
                'im_besitz': p.im_besitz,
                'durchschnittseinkaufspreis': p.durchschnittseinkaufspreis,
                'aktueller_wert': p.aktueller_wert,   # Falls berechnet
                'gewinn_brutto': p.gewinn_brutto,     # Falls berechnet
                'kurs_eur': p.kurs_eur,
                'kurs_usd': p.kurs_usd,
                'id': p.id
            } for p in portfolio
        ]
        return jsonify({'kaeufe': kaeufe_data, 'portfolio': portfolio_data})
    finally:
        session.close()





@app.route('/api/verkauf', methods=['POST'])
def add_verkauf():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Keine Daten empfangen'}), 400
    try:
        coin = data['coin']
        anzahl = float(data['anzahl'])
        verkaufsdatum_str = data['verkaufsdatum']

        from datetime import datetime
        verkaufsdatum = datetime.strptime(verkaufsdatum_str, '%Y-%m-%d').date()

        session = Session()

        # Verkauf als negativer Eintrag in kaeufe speichern (kaufdatum = verkaufsdatum)
        verkauf_eintrag = KaufEintrag(
            coin=coin,
            anzahl=-anzahl,  # Verkauf: negative Menge
            preis=0,  # Preis kann 0 oder optional angegeben werden
            kaufdatum=verkaufsdatum
        )
        session.add(verkauf_eintrag)

        # Portfolio anpassen
        portfolio_eintrag = session.query(PortfolioEintrag).filter_by(coin=coin).first()
        if not portfolio_eintrag:
            session.rollback()
            session.close()
            return jsonify({'error': 'Coin nicht im Portfolio'}), 400

        if portfolio_eintrag.im_besitz < anzahl:
            session.rollback()
            session.close()
            return jsonify({'error': 'Nicht genügend Coins zum Verkauf'}), 400

        portfolio_eintrag.im_besitz -= anzahl
        # Wenn im_besitz 0, kann man ggf. auch durchschnittspreis auf 0 setzen oder Eintrag löschen

        session.commit()
        session.close()
        return jsonify({'message': 'Verkauf gespeichert'}), 200
    except Exception as e:
        session.rollback()
        session.close()
        return jsonify({'error': str(e)}), 500







# === START DER APP ===
if __name__ == '__main__':
    erstelle_datenbank()  # 💥 Hier passiert der entscheidende Schritt!
    app.run(debug=True)