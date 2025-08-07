from sqlalchemy import create_engine, Column, Integer, Float, String, Date, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.orm import declarative_base, sessionmaker
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user, login_manager

Base = declarative_base()
engine = create_engine('sqlite:///krypto_portfolio.db', echo=False)
Session = sessionmaker(bind=engine)

# === MODELL-KLASSEN ===

class User(UserMixin, Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    username = Column(String(150), unique=True)
    password = Column(String(180))
    role = Column(String(50))
    is_active = Column(Boolean, default=False)

    user_roles = Table(
        'user_roles', Base.metadata,
        Column('user_id', Integer, ForeignKey('user.id')),
        Column('role_id', Integer, ForeignKey('role.id'))
    )

    roles = relationship(
        "Role",
        secondary=user_roles,
        back_populates="users"
    )

class Role(Base):
    __tablename__ = 'role'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)

    users = relationship(
        "User",
        secondary=User.user_roles,  # oder: 'user_roles' falls global definiert
        back_populates="roles"
    )
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
    differenz = Column(Float, nullable=True) 
    kommentar = Column(String, nullable=True) 
    rest_anzahl = Column(Float, nullable=True)  # Neue Spalte hier