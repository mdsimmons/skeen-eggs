import type { Client } from "@libsql/client";

export async function seed(client: Client) {
  const catResult = await client.execute("SELECT COUNT(*) as count FROM categories");
  const catCount = (catResult.rows[0] as unknown as { count: number }).count;
  if (catCount === 0) {
    await client.executeMultiple(`
      INSERT INTO categories (value, label, sort_order) VALUES
        ('eggs', 'Eggs', 1),
        ('dairy', 'Dairy', 2),
        ('poultry', 'Poultry', 3),
        ('honey', 'Honey', 4),
        ('produce', 'Produce', 5),
        ('baked', 'Baked Goods', 6),
        ('other', 'Other', 99);
    `);
  }

  const existing = await client.execute("SELECT COUNT(*) as count FROM products");
  const count = (existing.rows[0] as unknown as { count: number }).count;
  if (count > 0) return;

  await client.executeMultiple(`
    INSERT INTO products (name, category, unit, price, cost, stock, low_stock_threshold, notes) VALUES
      ('Brown Eggs - Large', 'eggs', 'dozen', 5.50, 2.25, 60, 12, 'Most popular item'),
      ('Brown Eggs - Jumbo', 'eggs', 'dozen', 6.50, 2.75, 30, 8, ''),
      ('Brown Eggs - Medium', 'eggs', 'dozen', 4.50, 1.80, 45, 10, ''),
      ('White Eggs - Large', 'eggs', 'dozen', 5.00, 2.00, 50, 10, ''),
      ('White Eggs - Jumbo', 'eggs', 'dozen', 6.00, 2.50, 20, 6, ''),
      ('Mixed Eggs - Large', 'eggs', 'dozen', 5.25, 2.10, 40, 10, 'Brown + white mix'),
      ('Egg Flat (30 ct)', 'eggs', 'flat', 12.00, 5.00, 15, 4, ''),
      ('Free Range Brown', 'eggs', 'dozen', 7.00, 3.00, 25, 6, 'Premium free range'),
      ('Duck Eggs', 'eggs', 'dozen', 9.00, 4.50, 10, 3, 'Seasonal'),
      ('Quail Eggs', 'eggs', 'dozen', 8.00, 4.00, 8, 2, ''),
      ('Raw Honey - 16oz', 'honey', 'each', 12.00, 5.00, 20, 5, 'Local wildflower'),
      ('Raw Honey - 8oz', 'honey', 'each', 7.00, 3.00, 30, 8, ''),
      ('Honey Comb', 'honey', 'each', 15.00, 6.00, 5, 2, 'Limited supply'),
      ('Bread - Sourdough', 'baked', 'each', 6.00, 2.00, 10, 3, 'Fresh baked'),
      ('Bread - Wheat', 'baked', 'each', 5.50, 1.80, 8, 3, ''),
      ('Whole Chicken', 'poultry', 'each', 18.00, 8.00, 12, 4, 'Corn-fed'),
      ('Chicken Thighs (lb)', 'poultry', 'lb', 7.00, 3.00, 15, 4, '');

    INSERT INTO customers (name, phone, email, notes) VALUES
      ('Martha Jenkins', '555-0101', '', 'Regular every Saturday'),
      ('Tom & Sara Mitchell', '555-0102', '', 'Prefer free range'),
      ('Local Diner', '555-0103', 'diner@example.com', 'Bulk order weekly'),
      ('Farmhouse Cafe', '555-0104', 'cafe@example.com', 'Delivery Tuesdays'),
      ('Riverside Market', '555-0105', '', 'Wholesale account'),
      ('Betty Cooper', '555-0106', '', 'Runs a tab, pays monthly');

    INSERT INTO expenses (description, amount, category, date, notes) VALUES
      ('Chicken feed - 50lb bag', 28.50, 'feed', date('now', '-1 day'), 'Purina Layena'),
      ('Egg cartons (100ct)', 35.00, 'packaging', date('now', '-2 days'), 'Generic brown'),
      ('Market booth fee', 25.00, 'market_fees', date('now', '-3 days'), 'Saturday farmers market'),
      ('Gas - market run', 15.00, 'transport', date('now', '-3 days'), 'Round trip to market'),
      ('Vet checkup - flock', 75.00, 'veterinary', date('now', '-5 days'), 'Annual wellness'),
      ('Feed supplement', 12.00, 'feed', date('now', '-6 days'), 'Oyster shell'),
      ('Market booth fee', 25.00, 'market_fees', date('now', '-7 days'), 'Saturday farmers market');
  `);
}
