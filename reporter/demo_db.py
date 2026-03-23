"""
Creates and seeds a demo SQLite database mimicking SAP B1 schema.
"""
import sqlite3
import random
from datetime import date, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / "demo_sap_b1.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    if DB_PATH.exists():
        return
    conn = get_db()
    c = conn.cursor()

    # --- OSLP Sales Employees ---
    c.execute("""CREATE TABLE IF NOT EXISTS OSLP (
        SlpCode INTEGER PRIMARY KEY,
        SlpName TEXT,
        Active TEXT DEFAULT 'Y'
    )""")

    # --- OCRD Business Partners ---
    c.execute("""CREATE TABLE IF NOT EXISTS OCRD (
        CardCode TEXT PRIMARY KEY,
        CardName TEXT,
        CardType TEXT,
        GroupCode INTEGER,
        Phone1 TEXT,
        City TEXT,
        Country TEXT DEFAULT 'CZ',
        Balance REAL DEFAULT 0,
        CreditLine REAL DEFAULT 0,
        SlpCode INTEGER
    )""")

    # --- OITM Items ---
    c.execute("""CREATE TABLE IF NOT EXISTS OITM (
        ItemCode TEXT PRIMARY KEY,
        ItemName TEXT,
        ItmsGrpCod INTEGER,
        OnHand REAL DEFAULT 0,
        IsCommited REAL DEFAULT 0,
        OnOrder REAL DEFAULT 0,
        VatGourpSa TEXT DEFAULT 'DPH21'
    )""")

    # --- OWHS Warehouses ---
    c.execute("""CREATE TABLE IF NOT EXISTS OWHS (
        WhsCode TEXT PRIMARY KEY,
        WhsName TEXT,
        City TEXT
    )""")

    # --- ORDR Sales Orders ---
    c.execute("""CREATE TABLE IF NOT EXISTS ORDR (
        DocEntry INTEGER PRIMARY KEY AUTOINCREMENT,
        DocNum INTEGER,
        CardCode TEXT,
        CardName TEXT,
        DocDate TEXT,
        DocDueDate TEXT,
        DocTotal REAL,
        DocTotalSy REAL,
        DocCur TEXT DEFAULT 'CZK',
        DocStatus TEXT DEFAULT 'O',
        Confirmed TEXT DEFAULT 'Y',
        SlpCode INTEGER
    )""")

    # --- RDR1 Sales Order Lines ---
    c.execute("""CREATE TABLE IF NOT EXISTS RDR1 (
        DocEntry INTEGER,
        LineNum INTEGER,
        ItemCode TEXT,
        Dscription TEXT,
        Quantity REAL,
        Price REAL,
        LineTotal REAL,
        WhsCode TEXT DEFAULT '01',
        PRIMARY KEY (DocEntry, LineNum)
    )""")

    # --- OINV Invoices ---
    c.execute("""CREATE TABLE IF NOT EXISTS OINV (
        DocEntry INTEGER PRIMARY KEY AUTOINCREMENT,
        DocNum INTEGER,
        CardCode TEXT,
        CardName TEXT,
        DocDate TEXT,
        DocDueDate TEXT,
        DocTotal REAL,
        VatSum REAL,
        DocStatus TEXT DEFAULT 'O',
        DocCur TEXT DEFAULT 'CZK',
        SlpCode INTEGER
    )""")

    # --- INV1 Invoice Lines ---
    c.execute("""CREATE TABLE IF NOT EXISTS INV1 (
        DocEntry INTEGER,
        LineNum INTEGER,
        ItemCode TEXT,
        Dscription TEXT,
        Quantity REAL,
        Price REAL,
        LineTotal REAL,
        TaxCode TEXT DEFAULT 'DPH21',
        PRIMARY KEY (DocEntry, LineNum)
    )""")

    # --- OPCH Purchase Invoices ---
    c.execute("""CREATE TABLE IF NOT EXISTS OPCH (
        DocEntry INTEGER PRIMARY KEY AUTOINCREMENT,
        DocNum INTEGER,
        CardCode TEXT,
        CardName TEXT,
        DocDate TEXT,
        DocDueDate TEXT,
        DocTotal REAL,
        DocStatus TEXT DEFAULT 'O'
    )""")

    # --- OACT Chart of Accounts ---
    c.execute("""CREATE TABLE IF NOT EXISTS OACT (
        AcctCode TEXT PRIMARY KEY,
        AcctName TEXT,
        CurrTotal REAL DEFAULT 0,
        SysTotal REAL DEFAULT 0
    )""")

    # ============ SEED DATA ============
    random.seed(42)

    # Sales employees
    employees = [
        (1, "Jan Novák"),
        (2, "Petra Svobodová"),
        (3, "Martin Dvořák"),
        (4, "Lucie Horáková"),
    ]
    c.executemany("INSERT OR IGNORE INTO OSLP VALUES (?,?,?)",
                  [(e[0], e[1], 'Y') for e in employees])

    # Warehouses
    c.executemany("INSERT OR IGNORE INTO OWHS VALUES (?,?,?)", [
        ("01", "Hlavní sklad Praha", "Praha"),
        ("02", "Sklad Brno", "Brno"),
        ("03", "Sklad Ostrava", "Ostrava"),
    ])

    # Items
    items = [
        ("IT001", "Notebook Lenovo ThinkPad", 1, 45, 5, 10),
        ("IT002", "Monitor Dell 27\"", 1, 32, 8, 0),
        ("IT003", "Klávesnice Logitech MX Keys", 1, 120, 10, 20),
        ("IT004", "Myš Logitech MX Master", 1, 95, 12, 15),
        ("IT005", "Dock USB-C HP", 1, 28, 4, 8),
        ("SW001", "Microsoft Office 365 Business", 2, 500, 50, 100),
        ("SW002", "AutoCAD License", 2, 15, 2, 5),
        ("SW003", "Adobe Creative Cloud", 2, 80, 10, 20),
        ("SV001", "IT podpora - 1 hodina", 3, 9999, 0, 0),
        ("SV002", "Implementace SAP B1", 3, 9999, 0, 0),
        ("SV003", "Školení uživatelů", 3, 9999, 0, 0),
        ("PR001", "Tiskárna HP LaserJet", 4, 18, 2, 4),
        ("PR002", "Toner HP originál", 4, 200, 30, 50),
        ("NET001", "Switch Cisco 24-port", 5, 8, 1, 2),
        ("NET002", "Router Cisco ASA", 5, 5, 0, 2),
    ]
    for it in items:
        c.execute("INSERT OR IGNORE INTO OITM VALUES (?,?,?,?,?,?,?)",
                  (it[0], it[1], it[2], it[3], it[4], it[5], 'DPH21'))

    # Business Partners - Customers
    customers = [
        ("C001", "Alfa s.r.o.", "C", "Praha", 1),
        ("C002", "Beta Technologies a.s.", "C", "Brno", 2),
        ("C003", "Gama Group s.r.o.", "C", "Ostrava", 1),
        ("C004", "Delta Systems s.r.o.", "C", "Praha", 3),
        ("C005", "Epsilon Holding a.s.", "C", "Plzeň", 2),
        ("C006", "Zeta Trade s.r.o.", "C", "Praha", 4),
        ("C007", "Eta Solutions a.s.", "C", "Liberec", 1),
        ("C008", "Theta Corp s.r.o.", "C", "Brno", 3),
        ("C009", "Iota Services s.r.o.", "C", "Praha", 2),
        ("C010", "Kappa Industries a.s.", "C", "Olomouc", 4),
    ]
    # Suppliers
    suppliers = [
        ("S001", "TechDistrib s.r.o.", "S", "Praha", None),
        ("S002", "SoftwareHub a.s.", "S", "Brno", None),
        ("S003", "HardwareNet s.r.o.", "S", "Praha", None),
    ]
    for bp in customers + suppliers:
        balance = round(random.uniform(-500000, 500000), 2)
        credit = round(random.uniform(100000, 2000000), 2)
        c.execute("""INSERT OR IGNORE INTO OCRD
            (CardCode,CardName,CardType,GroupCode,Phone1,City,Country,Balance,CreditLine,SlpCode)
            VALUES (?,?,?,1,?,?,?,?,?,?)""",
                  (bp[0], bp[1], bp[2], "723" + bp[0][1:], bp[3], "CZ",
                   balance, credit, bp[4]))

    # Chart of Accounts
    accounts = [
        ("211100", "Pokladna CZK", 0),
        ("221100", "Bankovní účet CZK", 0),
        ("311100", "Pohledávky z obchodního styku", 0),
        ("321100", "Závazky z obchodního styku", 0),
        ("601100", "Tržby za zboží", 0),
        ("504100", "Prodané zboží", 0),
    ]
    for acc in accounts:
        balance = round(random.uniform(-5000000, 5000000), 2)
        c.execute("INSERT OR IGNORE INTO OACT VALUES (?,?,?,?)",
                  (acc[0], acc[1], balance, balance))

    # Generate Sales Orders + Invoices
    today = date.today()
    inv_entry = 1
    ord_entry = 1

    for i in range(1, 51):  # 50 orders
        cust = random.choice(customers)
        slp = random.randint(1, 4)
        doc_date = today - timedelta(days=random.randint(0, 365))
        due_date = doc_date + timedelta(days=30)
        status = random.choice(['O', 'O', 'C'])  # 2:1 open:closed
        num_lines = random.randint(1, 4)
        total = 0.0
        lines = []
        for ln in range(num_lines):
            item = random.choice(items)
            qty = round(random.uniform(1, 20), 0)
            price = round(random.uniform(500, 50000), 2)
            line_total = qty * price
            total += line_total
            lines.append((ord_entry, ln, item[0], item[1], qty, price, line_total))

        c.execute("""INSERT INTO ORDR
            (DocEntry,DocNum,CardCode,CardName,DocDate,DocDueDate,DocTotal,DocTotalSy,DocCur,DocStatus,Confirmed,SlpCode)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                  (ord_entry, i, cust[0], cust[1],
                   doc_date.isoformat(), due_date.isoformat(),
                   round(total, 2), round(total, 2), 'CZK', status, 'Y', slp))
        c.executemany("INSERT INTO RDR1 VALUES (?,?,?,?,?,?,?,?)",
                      [(l[0], l[1], l[2], l[3], l[4], l[5], l[6], '01') for l in lines])

        # ~70% of orders have an invoice
        if random.random() < 0.7:
            vat = round(total * 0.21, 2)
            inv_status = 'C' if status == 'C' else random.choice(['O', 'C'])
            c.execute("""INSERT INTO OINV
                (DocEntry,DocNum,CardCode,CardName,DocDate,DocDueDate,DocTotal,VatSum,DocStatus,DocCur,SlpCode)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                      (inv_entry, inv_entry, cust[0], cust[1],
                       doc_date.isoformat(), due_date.isoformat(),
                       round(total + vat, 2), vat, inv_status, 'CZK', slp))
            c.executemany("INSERT INTO INV1 VALUES (?,?,?,?,?,?,?,?)",
                          [(inv_entry, l[1], l[2], l[3], l[4], l[5], l[6], 'DPH21')
                           for l in lines])
            inv_entry += 1

        ord_entry += 1

    # Purchase Invoices
    for i in range(1, 21):
        supp = random.choice(suppliers)
        doc_date = today - timedelta(days=random.randint(0, 180))
        due_date = doc_date + timedelta(days=14)
        total = round(random.uniform(5000, 500000), 2)
        status = random.choice(['O', 'C'])
        c.execute("""INSERT INTO OPCH
            (DocNum,CardCode,CardName,DocDate,DocDueDate,DocTotal,DocStatus)
            VALUES (?,?,?,?,?,?,?)""",
                  (i, supp[0], supp[1], doc_date.isoformat(),
                   due_date.isoformat(), total, status))

    conn.commit()
    conn.close()
    print(f"Demo DB created at {DB_PATH}")


if __name__ == "__main__":
    DB_PATH.unlink(missing_ok=True)
    init_db()
    print("Done.")
