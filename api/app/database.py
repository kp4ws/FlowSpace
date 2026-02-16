from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os
from dotenv import load_dotenv, find_dotenv

# Search for the .env file in parent directories (monorepo support)
load_dotenv(find_dotenv())

# Use SQLite for local development if DATABASE_URL is not set or empty
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./local.db"
elif DATABASE_URL.startswith("postgresql://"):
    # SQLAlchemy requires postgresql+psycopg2:// for Postgres
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# If using SQLite, we need connect_args to allow multiple threads
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

from models import Client, Invoice, Note, InvoiceItem, SharedWorkspace, SharedWidget

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def seed_data():
    with Session(engine) as session:
        # Check if we already have clients
        if session.query(Client).first():
            return

        mock_user_id = "mock-user-123"

        # Create Mock Clients
        client1 = Client(name="Acme Corp", email="contact@acme.com", user_id=mock_user_id, notes="Big client")
        client2 = Client(name="Global Industries", email="info@global.com", user_id=mock_user_id)
        
        session.add(client1)
        session.add(client2)
        session.commit()
        session.refresh(client1)
        session.refresh(client2)

        # Create Mock Invoices
        invoice1 = Invoice(client_id=client1.id, user_id=mock_user_id, status="SENT", amount=1500.0)
        invoice2 = Invoice(client_id=client2.id, user_id=mock_user_id, status="PAID", amount=850.0)
        
        session.add(invoice1)
        session.add(invoice2)
        session.commit()
        session.refresh(invoice1)

        # Create Mock Invoice Items
        item1 = InvoiceItem(invoice_id=invoice1.id, description="Web Development", quantity=1, price=1500.0)
        session.add(item1)

        # Create Mock Notes
        note1 = Note(client_id=client1.id, user_id=mock_user_id, content="Met with them today, they want a new website.")
        session.add(note1)

        session.commit()
