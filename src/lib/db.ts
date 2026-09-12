import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.TURSO_DB_URL || "file:data/skeen-eggs.db";

let _db: Client | null = null;

function getDb(): Client {
  if (!_db) {
    if (DB_PATH.startsWith("file:")) {
      mkdirSync(dirname(DB_PATH.slice("file:".length)), { recursive: true });
    }
    _db = createClient({
      url: DB_PATH,
      ...(process.env.TURSO_DB_TOKEN ? { authToken: process.env.TURSO_DB_TOKEN } : {}),
    });
  }
  return _db;
}

export const db = getDb();

export function toPlain<T>(rows: T[]): T[] {
  return rows.map((row) => JSON.parse(JSON.stringify(row))) as T[];
}

export function toPlainOne<T>(row: T | undefined): T | undefined {
  if (!row) return undefined;
  return JSON.parse(JSON.stringify(row)) as T;
}

export async function initSchema() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'eggs',
      unit TEXT NOT NULL DEFAULT 'dozen',
      price REAL NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      active INTEGER NOT NULL DEFAULT 1,
      notes TEXT DEFAULT '',
      image TEXT DEFAULT '',
      frequent INTEGER NOT NULL DEFAULT 0,
      quick_pull INTEGER NOT NULL DEFAULT 0,
      case_size REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      balance REAL NOT NULL DEFAULT 0,
      receipt_width TEXT NOT NULL DEFAULT 'standard',
      fuel_charge REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      invoice_type TEXT NOT NULL DEFAULT 'sale',
      status TEXT NOT NULL DEFAULT 'paid',
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      amount_paid REAL NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      invoice_number TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'general',
      date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);

  try {
    await db.execute("ALTER TABLE customers ADD COLUMN receipt_width TEXT NOT NULL DEFAULT 'standard'");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE customers ADD COLUMN fuel_charge REAL NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE products ADD COLUMN frequent INTEGER NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE products ADD COLUMN quick_pull INTEGER NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE products ADD COLUMN case_size REAL NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN invoice_number TEXT DEFAULT ''");
  } catch {
    // column already exists
  }
  try {
    await db.execute("ALTER TABLE invoice_items ADD COLUMN created_at TEXT DEFAULT ''");
  } catch {
    // column already exists
  }
  try {
    await db.execute("UPDATE invoices SET invoice_number = 'INV-' || printf('%05d', id) WHERE invoice_number IS NULL OR invoice_number = ''");
  } catch {
    // ignore
  }
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  low_stock_threshold: number;
  active: number;
  notes: string;
  image: string;
  quick_pull: number;
  case_size: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  balance: number;
  receipt_width: string;
  fuel_charge: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  customer_id: number | null;
  invoice_type: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  notes: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  created_at: string;
}

export interface InvoiceWithItems extends Invoice {
  customer_name?: string;
  items: (InvoiceItem & { product_name?: string; unit?: string })[];
}

export interface ProductWithStock extends Product {
  is_low: boolean;
}

export interface Category {
  id: number;
  value: string;
  label: string;
  sort_order: number;
  created_at: string;
}
