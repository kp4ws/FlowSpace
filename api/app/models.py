from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from uuid import UUID

# Client Model
class ClientBase(SQLModel):
    name: str = Field(index=True)
    email: Optional[str] = Field(default=None, index=True)
    notes: Optional[str] = None

class Client(ClientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True) # Supabase User ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    invoices: List["Invoice"] = Relationship(back_populates="client")
    client_notes: List["Note"] = Relationship(back_populates="client")

class ClientCreate(ClientBase):
    pass

class ClientRead(ClientBase):
    id: int

class ClientUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

# Invoice Model
class InvoiceBase(SQLModel):
    client_id: int = Field(foreign_key="client.id")
    status: str = Field(default="DRAFT") # DRAFT, SENT, PAID
    amount: float = Field(default=0.0)
    due_date: Optional[datetime] = None

class Invoice(InvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    client: Optional[Client] = Relationship(back_populates="invoices")
    items: List["InvoiceItem"] = Relationship(back_populates="invoice")

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceRead(InvoiceBase):
    id: int

class InvoiceUpdate(SQLModel):
    status: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[datetime] = None

# Invoice Item Model
class InvoiceItemBase(SQLModel):
    invoice_id: int = Field(foreign_key="invoice.id")
    description: str
    quantity: int = 1
    price: float = 0.0

class InvoiceItem(InvoiceItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice: Optional[Invoice] = Relationship(back_populates="items")

# Note Model
class NoteBase(SQLModel):
    client_id: int = Field(foreign_key="client.id")
    content: str

class Note(NoteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    client: Optional[Client] = Relationship(back_populates="client_notes")

class NoteCreate(NoteBase):
    pass

class NoteRead(NoteBase):
    id: int

class NoteUpdate(SQLModel):
    content: Optional[str] = None

# Marketplace Models
class SharedWorkspace(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str
    description: Optional[str] = None
    layout_json: str # Store the entire template/layout as JSON string
    is_public: bool = Field(default=True)
    likes_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SharedWidget(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str
    description: Optional[str] = None
    config_json: str # Store widget configuration
    is_public: bool = Field(default=True)
    likes_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
