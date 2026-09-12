import { db, toPlain, toPlainOne, type Product, type Customer, type Invoice, type InvoiceItem, type Expense, type InvoiceWithItems, type Category } from "./db";
import type { InValue } from "@libsql/client";
import { DEFAULT_RECEIPT_OPTIONS, type ReceiptOptions } from "./constants";

// ──── Products ────

export async function getAllProducts(): Promise<Product[]> {
  const result = await db.execute("SELECT * FROM products WHERE active = 1 ORDER BY category, name");
  return result.rows as unknown as Product[];
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const result = await db.execute({ sql: "SELECT * FROM products WHERE id = ?", args: [id] });
  return result.rows[0] as unknown as Product | undefined;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const result = await db.execute("SELECT * FROM products WHERE active = 1 AND stock <= low_stock_threshold ORDER BY stock, name");
  return result.rows as unknown as Product[];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = `%${query}%`;
  const result = await db.execute({ sql: "SELECT * FROM products WHERE active = 1 AND (name LIKE ? OR category LIKE ? OR notes LIKE ?) ORDER BY name LIMIT 50", args: [q, q, q] });
  return result.rows as unknown as Product[];
}

export async function createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">): Promise<number> {
  const result = await db.execute({
    sql: `INSERT INTO products (name, category, unit, price, cost, stock, low_stock_threshold, active, notes, image, quick_pull, case_size)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.name, data.category, data.unit, data.price, data.cost, data.stock, data.low_stock_threshold, data.active, data.notes, data.image, data.quick_pull, data.case_size ?? 0],
  });
  return Number(result.lastInsertRowid);
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<void> {
  const fields: string[] = [];
  const args: InValue[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    args.push(value);
  }
  fields.push("updated_at = datetime('now')");
  args.push(id);
  await db.execute({ sql: `UPDATE products SET ${fields.join(", ")} WHERE id = ?`, args });
}

export async function adjustStock(id: number, delta: number): Promise<void> {
  await db.execute({ sql: "UPDATE products SET stock = MAX(0, stock + ?), updated_at = datetime('now') WHERE id = ?", args: [delta, id] });
}

export async function deleteProduct(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}

export async function getQuickPullProducts(): Promise<Product[]> {
  const rows = await db.execute({ sql: "SELECT * FROM products WHERE quick_pull = 1 AND active = 1 ORDER BY category, name" });
  return rows.rows as unknown as Product[];
}

// ──── Categories ────

export async function getAllCategories(): Promise<Category[]> {
  const result = await db.execute("SELECT * FROM categories ORDER BY sort_order, label");
  return toPlain(result.rows as unknown as Category[]);
}

export async function createCategory(value: string, label: string): Promise<number> {
  const result = await db.execute({
    sql: "INSERT INTO categories (value, label) VALUES (?, ?)",
    args: [value, label],
  });
  return Number(result.lastInsertRowid);
}

export async function deleteCategory(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [id] });
}

export async function countProductsByCategory(): Promise<{ category: string; count: number }[]> {
  const result = await db.execute("SELECT category, COUNT(*) as count FROM products GROUP BY category");
  return result.rows as unknown as { category: string; count: number }[];
}

// ──── Customers ────

export async function getAllCustomers(): Promise<Customer[]> {
  const result = await db.execute("SELECT * FROM customers ORDER BY name");
  return result.rows as unknown as Customer[];
}

export async function getCustomerById(id: number): Promise<Customer | undefined> {
  const result = await db.execute({ sql: "SELECT * FROM customers WHERE id = ?", args: [id] });
  return result.rows[0] as unknown as Customer | undefined;
}

export async function getCustomersWithBalance(): Promise<Customer[]> {
  const result = await db.execute("SELECT * FROM customers WHERE balance > 0 ORDER BY balance DESC");
  return result.rows as unknown as Customer[];
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const q = `%${query}%`;
  const result = await db.execute({ sql: "SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name LIMIT 50", args: [q, q] });
  return result.rows as unknown as Customer[];
}

export async function createCustomer(data: Omit<Customer, "id" | "created_at" | "updated_at" | "balance">): Promise<number> {
  const result = await db.execute({
    sql: "INSERT INTO customers (name, phone, email, address, notes, receipt_width, fuel_charge) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [data.name, data.phone, data.email, data.address, data.notes, data.receipt_width ?? "standard", data.fuel_charge ?? 0],
  });
  return Number(result.lastInsertRowid);
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<void> {
  const fields: string[] = [];
  const args: InValue[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    args.push(value);
  }
  fields.push("updated_at = datetime('now')");
  args.push(id);
  await db.execute({ sql: `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`, args });
}

export async function adjustBalance(customerId: number, delta: number): Promise<void> {
  await db.execute({ sql: "UPDATE customers SET balance = MAX(0, balance + ?), updated_at = datetime('now') WHERE id = ?", args: [delta, customerId] });
}

export async function deleteCustomer(id: number): Promise<void> {
  await db.execute({ sql: "UPDATE invoices SET customer_id = NULL WHERE customer_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM customers WHERE id = ?", args: [id] });
}

// ──── Invoices ────

export async function getAllInvoices(): Promise<Invoice[]> {
  const result = await db.execute(`
    SELECT i.*, c.name as customer_name FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.created_at DESC
  `);
  return result.rows as unknown as Invoice[];
}

export async function getInvoiceById(id: number): Promise<InvoiceWithItems | undefined> {
  const invResult = await db.execute({
    sql: `SELECT i.*, c.name as customer_name FROM invoices i
          LEFT JOIN customers c ON i.customer_id = c.id
          WHERE i.id = ?`,
    args: [id],
  });
  const invoice = invResult.rows[0] as unknown as InvoiceWithItems | undefined;
  if (!invoice) return undefined;
  const itemsResult = await db.execute({
    sql: `SELECT ii.*, p.name as product_name, p.unit FROM invoice_items ii
          JOIN products p ON ii.product_id = p.id
          WHERE ii.invoice_id = ?`,
    args: [id],
  });
  invoice.items = itemsResult.rows as unknown as InvoiceWithItems["items"];
  return invoice;
}

export async function getOpenInvoices(): Promise<(Invoice & { customer_name: string })[]> {
  const result = await db.execute(`
    SELECT i.*, c.name as customer_name FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    WHERE i.invoice_type = 'tab' AND i.status != 'paid'
    ORDER BY i.created_at DESC
  `);
  return result.rows as unknown as (Invoice & { customer_name: string })[];
}

export async function getTodaySales(): Promise<{ total: number; count: number; cash: number; card: number }> {
  const result = await db.execute(`
    SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count,
            COALESCE(SUM(CASE WHEN notes LIKE '%card%' OR notes LIKE '%Card%' OR notes LIKE '%Apple Pay%' OR notes LIKE '%CashApp%' OR notes LIKE '%ACH%' OR notes LIKE '%Check%' THEN total ELSE 0 END), 0) as card,
           COALESCE(SUM(CASE WHEN notes LIKE '%card%' OR notes LIKE '%Card%' OR notes LIKE '%Apple Pay%' OR notes LIKE '%CashApp%' OR notes LIKE '%ACH%' OR notes LIKE '%Check%' THEN 0 ELSE total END), 0) as cash
    FROM invoices WHERE date(created_at) = date('now') AND status = 'paid'
  `);
  const row = result.rows[0] as Record<string, number>;
  return { total: Number(row.total), count: Number(row.count), cash: Number(row.cash), card: Number(row.card) };
}

export async function getUnpaidTotal(): Promise<number> {
  const result = await db.execute("SELECT COALESCE(SUM(total - amount_paid), 0) as owed FROM invoices WHERE status != 'paid'");
  const row = result.rows[0] as Record<string, number>;
  return Number(row.owed);
}

export async function createInvoice(data: {
  customer_id?: number;
  invoice_type: string;
  status: string;
  total: number;
  amount_paid: number;
  notes: string;
  items: { product_id: number; quantity: number; unit_price: number; total: number }[];
}): Promise<number> {
  const subtotal = data.items.reduce((s, i) => s + i.total, 0);
  const result = await db.execute({
    sql: `INSERT INTO invoices (customer_id, invoice_type, status, subtotal, total, amount_paid, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [data.customer_id ?? null, data.invoice_type, data.status, subtotal, data.total, data.amount_paid, data.notes],
  });
  const invoiceId = Number(result.lastInsertRowid);
  await db.execute({
    sql: "UPDATE invoices SET invoice_number = 'INV-' || printf('%05d', ?) WHERE id = ?",
    args: [invoiceId, invoiceId],
  });
  for (const item of data.items) {
    await db.execute({
      sql: "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
      args: [invoiceId, item.product_id, item.quantity, item.unit_price, item.total],
    });
    await db.execute({ sql: "UPDATE products SET stock = MAX(0, stock - ?), updated_at = datetime('now') WHERE id = ?", args: [item.quantity, item.product_id] });
  }
  if (data.customer_id && data.invoice_type === "tab") {
    await db.execute({ sql: "UPDATE customers SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?", args: [data.total - data.amount_paid, data.customer_id] });
  }
  return invoiceId;
}

export async function addItemsToInvoice(
  invoiceId: number,
  items: { product_id: number; quantity: number; unit_price: number; total: number }[]
): Promise<void> {
  const invResult = await db.execute({ sql: "SELECT * FROM invoices WHERE id = ?", args: [invoiceId] });
  const invoice = invResult.rows[0] as unknown as Invoice | undefined;
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "paid") throw new Error("Cannot add items to a paid invoice");

  const addedTotal = items.reduce((s, i) => s + i.total, 0);
  for (const item of items) {
    await db.execute({
      sql: "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
      args: [invoiceId, item.product_id, item.quantity, item.unit_price, item.total],
    });
    await db.execute({ sql: "UPDATE products SET stock = MAX(0, stock - ?), updated_at = datetime('now') WHERE id = ?", args: [item.quantity, item.product_id] });
  }
  await db.execute({
    sql: "UPDATE invoices SET subtotal = subtotal + ?, total = total + ?, updated_at = datetime('now') WHERE id = ?",
    args: [addedTotal, addedTotal, invoiceId],
  });
  if (invoice.customer_id) {
    await db.execute({ sql: "UPDATE customers SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?", args: [addedTotal, invoice.customer_id] });
  }
}

export async function settleInvoice(id: number, amountPaid: number, paymentMethod?: string): Promise<void> {
  const result = await db.execute({ sql: "SELECT * FROM invoices WHERE id = ?", args: [id] });
  const invoice = result.rows[0] as unknown as Invoice | undefined;
  if (!invoice) return;
  const newAmountPaid = invoice.amount_paid + amountPaid;
  const newStatus = newAmountPaid >= invoice.total ? "paid" : "partial";
  let notes = invoice.notes || "";
  if (paymentMethod) {
    const label = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
    const paymentNote = `Paid via ${label}`;
    notes = notes ? `${paymentNote} | ${notes}` : paymentNote;
  }
  await db.execute({ sql: "UPDATE invoices SET amount_paid = ?, status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?", args: [newAmountPaid, newStatus, notes, id] });
  if (invoice.customer_id) {
    const paidDelta = -amountPaid;
    await db.execute({ sql: "UPDATE customers SET balance = MAX(0, balance + ?), updated_at = datetime('now') WHERE id = ?", args: [paidDelta, invoice.customer_id] });
  }
}

export async function deleteInvoice(id: number): Promise<void> {
  const itemsResult = await db.execute({ sql: "SELECT * FROM invoice_items WHERE invoice_id = ?", args: [id] });
  const items = itemsResult.rows as unknown as InvoiceItem[];
  for (const item of items) {
    await db.execute({ sql: "UPDATE products SET stock = stock + ?, updated_at = datetime('now') WHERE id = ?", args: [item.quantity, item.product_id] });
  }
  const invResult = await db.execute({ sql: "SELECT * FROM invoices WHERE id = ?", args: [id] });
  const invoice = invResult.rows[0] as unknown as Invoice | undefined;
  if (invoice?.customer_id && invoice.status !== "paid") {
    const balanceDelta = invoice.total - invoice.amount_paid;
    await db.execute({ sql: "UPDATE customers SET balance = MAX(0, balance - ?), updated_at = datetime('now') WHERE id = ?", args: [balanceDelta, invoice.customer_id] });
  }
  await db.execute({ sql: "DELETE FROM invoice_items WHERE invoice_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM invoices WHERE id = ?", args: [id] });
}

// ──── Expenses ────

export async function getAllExpenses(): Promise<Expense[]> {
  const result = await db.execute("SELECT * FROM expenses ORDER BY date DESC");
  return result.rows as unknown as Expense[];
}

export async function getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
  const result = await db.execute({ sql: "SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC", args: [startDate, endDate] });
  return result.rows as unknown as Expense[];
}

export async function getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
  const result = await db.execute("SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC");
  return result.rows as unknown as { category: string; total: number }[];
}

export async function createExpense(data: Omit<Expense, "id" | "created_at">): Promise<number> {
  const result = await db.execute({
    sql: "INSERT INTO expenses (description, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)",
    args: [data.description, data.amount, data.category, data.date, data.notes],
  });
  return Number(result.lastInsertRowid);
}

export async function updateExpense(id: number, data: Partial<Expense>): Promise<void> {
  const fields: string[] = [];
  const args: InValue[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    args.push(value);
  }
  args.push(id);
  await db.execute({ sql: `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`, args });
}

export async function deleteExpense(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM expenses WHERE id = ?", args: [id] });
}

// ──── Accounting ────

export async function getSalesByDateRange(startDate: string, endDate: string): Promise<{ date: string; total: number; count: number }[]> {
  const result = await db.execute({
    sql: `SELECT date(created_at) as date, SUM(total) as total, COUNT(*) as count
          FROM invoices WHERE date(created_at) BETWEEN ? AND ? AND status = 'paid'
          GROUP BY date(created_at) ORDER BY date DESC`,
    args: [startDate, endDate],
  });
  return result.rows as unknown as { date: string; total: number; count: number }[];
}

export async function getIncomeVsExpenses(startDate: string, endDate: string): Promise<{ period: string; income: number; expenses: number; profit: number }[]> {
  const salesResult = await db.execute({
    sql: `SELECT date(created_at) as period, SUM(total) as income
          FROM invoices WHERE date(created_at) BETWEEN ? AND ? AND status = 'paid'
          GROUP BY date(created_at)`,
    args: [startDate, endDate],
  });
  const expensesResult = await db.execute({
    sql: `SELECT date as period, SUM(amount) as expenses
          FROM expenses WHERE date BETWEEN ? AND ?
          GROUP BY date`,
    args: [startDate, endDate],
  });
  const sales = salesResult.rows as unknown as { period: string; income: number }[];
  const expenses = expensesResult.rows as unknown as { period: string; expenses: number }[];
  const map = new Map<string, { income: number; expenses: number }>();
  for (const s of sales) map.set(s.period, { income: Number(s.income), expenses: 0 });
  for (const e of expenses) {
    const existing = map.get(e.period) || { income: 0, expenses: 0 };
    existing.expenses = Number(e.expenses);
    map.set(e.period, existing);
  }
  return Array.from(map.entries())
    .map(([period, data]) => ({ period, ...data, profit: data.income - data.expenses }))
    .sort((a, b) => b.period.localeCompare(a.period));
}

export async function getTotalSales(startDate: string, endDate: string): Promise<number> {
  const result = await db.execute({
    sql: "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE date(created_at) BETWEEN ? AND ? AND status = 'paid'",
    args: [startDate, endDate],
  });
  const row = result.rows[0] as Record<string, number>;
  return Number(row.total);
}

export async function getTotalExpenses(startDate: string, endDate: string): Promise<number> {
  const result = await db.execute({
    sql: "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?",
    args: [startDate, endDate],
  });
  const row = result.rows[0] as Record<string, number>;
  return Number(row.total);
}

// ──── Settings ────

export async function getSetting(key: string): Promise<string> {
  const result = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: [key] });
  const row = result.rows[0] as unknown as { value: string } | undefined;
  return row?.value ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", args: [key, value] });
}

export async function getReceiptOptions(): Promise<ReceiptOptions> {
  const val = await getSetting("receipt_options");
  if (val) {
    try {
      const parsed = JSON.parse(val) as Record<string, unknown>;
      if (typeof parsed.font_size === "string") {
        const presetSizes: Record<string, number> = { compact: 10, regular: 12, large: 14 };
        parsed.font_size = presetSizes[parsed.font_size] ?? 12;
      }
      return { ...DEFAULT_RECEIPT_OPTIONS, ...parsed };
    } catch { /* ignore */ }
  }
  return { ...DEFAULT_RECEIPT_OPTIONS };
}

// ──── Extra Queries ────

export async function getInvoicesByCustomerId(customerId: number): Promise<(Invoice & { customer_name: string })[]> {
  const result = await db.execute({
    sql: `SELECT i.*, c.name as customer_name FROM invoices i
          JOIN customers c ON i.customer_id = c.id
          WHERE i.customer_id = ?
          ORDER BY i.created_at DESC`,
    args: [customerId],
  });
  return result.rows as unknown as (Invoice & { customer_name: string })[];
}

export async function combineInvoices(ids: number[]): Promise<number> {
  const uniq = Array.from(new Set(ids)).sort((a, b) => a - b);
  if (uniq.length < 2) throw new Error("Select at least two invoices");

  const placeholders = uniq.map(() => "?").join(",");
  const invResult = await db.execute({
    sql: `SELECT * FROM invoices WHERE id IN (${placeholders})`,
    args: uniq,
  });
  const invoices = invResult.rows as unknown as Invoice[];
  if (invoices.length !== uniq.length) throw new Error("Invoice not found");

  const targetId = uniq[0];
  const sources = uniq.slice(1);
  const target = invoices.find((i) => i.id === targetId)!;
  if (invoices.some((i) => i.customer_id !== target.customer_id)) {
    throw new Error("Invoices must belong to the same customer");
  }

  await db.execute({
    sql: `UPDATE invoice_items SET invoice_id = ? WHERE invoice_id IN (${sources.map(() => "?").join(",")})`,
    args: [targetId, ...sources],
  });

  const subtotal = invoices.reduce((s, i) => s + i.subtotal, 0);
  const tax = invoices.reduce((s, i) => s + i.tax, 0);
  const total = invoices.reduce((s, i) => s + i.total, 0);
  const amountPaid = invoices.reduce((s, i) => s + i.amount_paid, 0);
  const status = amountPaid >= total ? "paid" : amountPaid > 0 ? "partial" : "unpaid";
  const notes = invoices
    .map((i) => i.notes || "")
    .filter(Boolean)
    .join(" | ");

  await db.execute({
    sql: "UPDATE invoices SET subtotal = ?, tax = ?, total = ?, amount_paid = ?, status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
    args: [subtotal, tax, total, amountPaid, status, notes, targetId],
  });

  await db.execute({
    sql: `DELETE FROM invoices WHERE id IN (${sources.map(() => "?").join(",")})`,
    args: sources,
  });

  return targetId;
}

export async function getExpenseById(id: number): Promise<Expense | undefined> {
  const result = await db.execute({ sql: "SELECT * FROM expenses WHERE id = ?", args: [id] });
  return result.rows[0] as unknown as Expense | undefined;
}

export async function getExpensesTotalByMonth(): Promise<number> {
  const result = await db.execute("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= date('now', 'start of month')");
  const row = result.rows[0] as Record<string, number>;
  return Number(row.total);
}

// ──── Search ────

export async function getFrequentlyPurchasedProducts(customerId: number): Promise<(Product & { purchase_count: number })[]> {
  const result = await db.execute({
    sql: `SELECT p.*, SUM(ii.quantity) as purchase_count
          FROM invoice_items ii
          JOIN invoices i ON ii.invoice_id = i.id
          JOIN products p ON ii.product_id = p.id
          WHERE i.customer_id = ? AND p.active = 1
          GROUP BY p.id
          ORDER BY purchase_count DESC
          LIMIT 20`,
    args: [customerId],
  });
  return result.rows as unknown as (Product & { purchase_count: number })[];
}

export async function search(query: string): Promise<{ type: string; id: number; name: string; detail: string }[]> {
  const results: { type: string; id: number; name: string; detail: string }[] = [];
  const products = await searchProducts(query);
  for (const p of products) results.push({ type: "product", id: p.id, name: p.name, detail: `${p.stock} ${p.unit} in stock` });
  const customers = await searchCustomers(query);
  for (const c of customers) results.push({ type: "customer", id: c.id, name: c.name, detail: c.balance > 0 ? `Owes $${c.balance.toFixed(2)}` : c.phone || "No balance" });
  return results;
}
