import subprocess
import sys
import re
from sqlalchemy import asc

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
install_if_missing('flask-login')

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
]

# Jetzt die importierten Module verwenden
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, send_from_directory
import requests
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, Float, String, Date, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user, login_manager
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from sqlalchemy.orm.exc import NoResultFound, DetachedInstanceError
from db_defs import *
from startseite_blueprint import neue_startseite

app = Flask(__name__)
CORS(app)  # Cross-Origin-Freigabe

app.register_blueprint(neue_startseite)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Weiterleitung zur Login-Seite, wenn nicht eingeloggt

app.config['SECRET_KEY'] = "SKLJDASKDLFHNSDKJFL;:HWNEJKRWJERF"

login_manager.login_view = 'login'
login_manager.login_message = "Bitte melde dich an, um fortzufahren."

# === HILFSFUNKTIONEN ===

def erstelle_datenbank(pfad='sqlite:///krypto_portfolio.db'):
    engine = create_engine(pfad, echo=False)
    Base.metadata.create_all(engine)
    print("Datenbank und Tabellen wurden erstellt.")

# === ROUTEN ===

@app.context_processor
def inject_data():
    session = Session()

    is_authenticated = current_user.is_authenticated
    is_admin = False
    user = None

    if is_authenticated:
        try:
            # User nochmal frisch aus DB laden mit Rollen eager
            user = session.query(User).options(
                joinedload(User.roles)
            ).filter(User.id == current_user.id).one_or_none()

            if user is not None:
                is_admin = any(role.name == 'admin' for role in user.roles)
            else:
                print(f"User mit ID {current_user.id} nicht in DB gefunden")
        except DetachedInstanceError:
            print("DetachedInstanceError: current_user is not bound to session")
        except Exception as e:
            print(f"Unbekannter Fehler beim Laden des Users: {e}")

    session.close()

    return dict(
        is_authenticated=is_authenticated,
        is_admin=is_admin,
        user=user
    )

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.png')

@app.route('/')
@login_required
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
        api_urls[coin_sigil] = f'https://api.coinbase.com/v2/prices/{coin_sigil}-USD/spot'

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
        kommentar = data.get('kommentar')  # ✅ Kommentar optional auslesen

        # Kauf in Tabelle 'kaeufe' speichern
        kauf = KaufEintrag(
            coin=coin,
            anzahl=anzahl,
            preis=preis,
            kaufdatum=kaufdatum,
            kommentar=kommentar,  # ✅ Kommentar speichern
            rest_anzahl=anzahl,  # <-- hier ergänzen!
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
                'kaufdatum': k.kaufdatum.strftime('%Y-%m-%d'),
                'differenz': getattr(k, 'differenz', None),     # <-- hinzufügen
                'kommentar': getattr(k, 'kommentar', '')        # <-- hinzufügen
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
    session = Session()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Keine Daten empfangen'}), 400

    try:
        coin = data['coin']
        anzahl = float(data['anzahl'])
        verkaufspreis = float(data['verkaufspreis'])
        verkaufsdatum_str = data['verkaufsdatum']
        kommentar = data.get("kommentar", "")
        rest_anzahl = anzahl

        from datetime import datetime
        verkaufsdatum = datetime.strptime(verkaufsdatum_str, '%Y-%m-%d').date()

        # Portfolio prüfen
        portfolio_eintrag = session.query(PortfolioEintrag).filter_by(coin=coin).first()
        if not portfolio_eintrag:
            return jsonify({'error': 'Coin nicht im Portfolio'}), 400

        if portfolio_eintrag.im_besitz < anzahl:
            return jsonify({'error': 'Nicht genügend Coins zum Verkauf'}), 400

        # Kaufeinträge (FIFO) laden
        offene_kaeufe = session.query(KaufEintrag).filter(
            KaufEintrag.coin == coin,
            KaufEintrag.rest_anzahl > 0
        ).order_by(KaufEintrag.kaufdatum.asc(), KaufEintrag.id.asc()).all()

        rest_anzahl = anzahl
        einkaufskosten = 0.0

        for kauf in offene_kaeufe:
            if rest_anzahl <= 0:
                break

            verwendete_anzahl = min(kauf.rest_anzahl, rest_anzahl)

            # Einkaufskosten berechnen
            einkaufskosten += verwendete_anzahl * kauf.preis

            # Kaufeintrag aktualisieren
            kauf.rest_anzahl -= verwendete_anzahl
            rest_anzahl -= verwendete_anzahl

        if rest_anzahl > 0:
            session.rollback()
            return jsonify({'error': 'Nicht genügend Käufe vorhanden für Verkauf'}), 400

        gesamter_verkaufspreis = anzahl * verkaufspreis
        differenz = gesamter_verkaufspreis - einkaufskosten

        # Verkauf speichern
        verkauf_eintrag = KaufEintrag(
            coin=coin,
            anzahl=-anzahl,
            preis=verkaufspreis,
            kaufdatum=verkaufsdatum,
            differenz=differenz,
            kommentar=kommentar
        )
        session.add(verkauf_eintrag)

        # Portfolio aktualisieren
        portfolio_eintrag.im_besitz -= anzahl
        if portfolio_eintrag.im_besitz <= 0:
            session.delete(portfolio_eintrag)

        session.commit()
        return jsonify({'message': 'Verkauf gespeichert', 'differenz': differenz}), 200

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()

def is_admin_user(session=None) -> bool:
    if session is None:
        session = Session()

    if not current_user.is_authenticated:
        session.close()
        return False

    try:
        user = session.query(User).options(joinedload(User.roles)).filter_by(id=current_user.id).one_or_none()
        if user is None:
            print(f"is_admin_user: user {current_user.id} not found")
            session.close()
            return False

        roles = [role.name for role in user.roles]
        session.close()
        return 'admin' in roles
    except Exception as e:
        print(f"is_admin_user: error: {e}")
        session.close()
        return False

def is_admin_user(session=None) -> bool:
    if session is None:
        session = Session()

    if not current_user.is_authenticated:
        session.close()
        return False

    try:
        user = session.query(User).options(joinedload(User.roles)).filter_by(id=current_user.id).one_or_none()
        if user is None:
            print(f"is_admin_user: user {current_user.id} not found")
            session.close()
            return False

        roles = [role.name for role in user.roles]
        session.close()
        return 'admin' in roles
    except Exception as e:
        print(f"is_admin_user: error: {e}")
        session.close()
        return False

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            print("admin_required: User is not authenticated")
            return render_template("admin_required.html"), 403

        session = Session()
        try:
            if not is_admin_user(session):
                print("admin_required: User is not admin")
                return render_template("admin_required.html"), 403
        except Exception as e:
            print(f"admin_required: got an error: {e}")
            return render_template("admin_required.html"), 403
        finally:
            session.close()

        return f(*args, **kwargs)
    return decorated_function





#///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Registrieren //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
@login_manager.user_loader
def load_user(user_id):
    session = Session()
    ret = session.get(User, int(user_id))
    session.close()
    return ret

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))  # Benutzer ist schon eingeloggt → sofort weiterleiten

    session = Session()
    try:
        if request.method == 'POST':
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            user = session.query(User).filter_by(username=username).first()

            if user:
                if not user.is_active:
                    flash('Benutzer ist noch nicht aktiviert.')
                elif check_password_hash(user.password, password):
                    login_user(user)
                    return redirect(url_for('index'))
                else:
                    flash('Falsches Passwort.')
            else:
                flash('Benutzer nicht gefunden.')
    finally:
        session.close()

    return render_template('login.html')

def is_password_complex(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):  # Großbuchstabe
        return False
    if not re.search(r'[a-z]', password):  # Kleinbuchstabe
        return False
    if not re.search(r'[0-9]', password):  # Ziffer
        return False
    if not re.search(r'[^\w\s]', password):  # Sonderzeichen
        return False
    return True

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))  # Bereits angemeldet → weiterleiten

    session = Session()
    try:
        if request.method == 'POST':
            username = request.form.get('username', '')
            password = request.form.get('password', '')

            # Passwort-Komplexitätsprüfung
            if not is_password_complex(password):
                return render_template(
                    'register.html',
                    error='Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben, Zahlen und mindestens ein Sonderzeichen beinhalten.'
                )

            # Prüfen, ob Benutzername bereits existiert
            existing_user = session.query(User).filter_by(username=username).first()
            if existing_user:
                return render_template('register.html', error='Username already taken.')

            # Passwort hashen
            hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')

            # Prüfen, ob dies der erste Benutzer ist
            user_count = session.query(User).count()
            if user_count == 0:
                # Admin-Rolle holen oder erstellen
                try:
                    admin_role = session.query(Role).filter_by(name='admin').one()
                except NoResultFound:
                    admin_role = Role(name='admin')
                    session.add(admin_role)
                    session.commit()

                # Erster Benutzer: aktiv und admin
                new_user = User(
                    username=username,
                    password=hashed_pw,
                    is_active=True,
                    role='admin'
                )
                new_user.roles.append(admin_role)
            else:
                # Weitere Benutzer: nicht aktiv
                new_user = User(
                    username=username,
                    password=hashed_pw,
                    is_active=False
                )

            session.add(new_user)
            session.commit()
            return redirect(url_for('login'))
    finally:
        session.close()

    return render_template('register.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

def is_valid_email(email):
    return bool(EMAIL_REGEX.match(email.strip()))

def column_label(table, col):
    return COLUMN_LABELS.get(f"{table}.{col}", col.replace("_id", "").replace("_", " ").capitalize())
	

@app.route('/admin', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_panel():
    session = Session()

    if request.method == 'POST' and 'new_username' in request.form:
        username = request.form['new_username']
        password = request.form['new_password']
        role_id = request.form.get('new_role')

        if session.query(User).filter_by(username=username).first():
            flash('Benutzername existiert bereits.')
        else:
            hashed = generate_password_hash(password)
            user = User(username=username, password=hashed, is_active=False)  # NEU: standardmäßig inaktiv
            if role_id:
                role = session.query(Role).get(int(role_id))
                if role:
                    user.roles.append(role)
            session.add(user)
            session.commit()
            flash('Benutzer hinzugefügt.')

        session.close()
        return redirect(url_for('admin_panel'))

    # WICHTIG: Rollen eager-laden, um DetachedInstanceError zu vermeiden
    users = session.query(User).options(joinedload(User.roles)).all()
    roles = session.query(Role).all()

    session.close()
    return render_template('admin_panel.html', users=users, roles=roles)

@app.route('/admin/delete/<int:user_id>')
@login_required
@admin_required
def delete_user(user_id):
    session = Session()
    user = session.query(User).get(user_id)

    if not user:
        flash("Benutzer nicht gefunden.")
    else:
        session.delete(user)
        session.commit()
        flash("Benutzer gelöscht.")

    session.close()

    return redirect(url_for('admin_panel'))

@app.route('/admin/update/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def update_user(user_id):
    session = Session()

    user = session.query(User).get(user_id)
    if not user:
        flash("Benutzer nicht gefunden.")
        session.close()
        return redirect(url_for('admin_panel'))

    # Aktivieren (falls angefragt und noch nicht aktiv)
    if 'activate_user' in request.form and not user.is_active:
        user.is_active = True
        flash(f"Benutzer {user.username} wurde aktiviert.")

    # Benutzername ändern
    new_username = request.form.get('username')
    if new_username and new_username != user.username:
        if session.query(User).filter(User.username == new_username, User.id != user.id).first():
            flash("Benutzername existiert bereits.")
            session.close()
            return redirect(url_for('admin_panel'))
        user.username = new_username

    # Passwort ändern
    new_password = request.form.get('new_password')
    if new_password:
        user.password = generate_password_hash(new_password)

    # Rolle ändern
    new_role_id = request.form.get('role_id')
    user.roles.clear()
    if new_role_id:
        role = session.query(Role).get(int(new_role_id))
        if role:
            user.roles.append(role)

    # ✅ Readonly setzen
    user.readonly = 'readonly' in request.form

    session.commit()
    session.close()
    return redirect(url_for('admin_panel'))

@app.route('/admin/activate/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def activate_user(user_id):
    session = Session()
    user = session.query(User).get(user_id)

    if not user:
        session.close()
        return jsonify(success=False, error="Benutzer nicht gefunden"), 404

    if user.is_active:
        session.close()
        return jsonify(success=False, error="Benutzer ist bereits aktiviert"), 400

    user.is_active = True
    session.commit()
    session.close()

    return jsonify(success=True)






# === START DER APP ===
if __name__ == '__main__':
    erstelle_datenbank()  # 💥 Hier passiert der entscheidende Schritt!
    app.run(debug=True)