import { NextResponse, type NextRequest } from "next/server";
import { getProductById, addItemsToInvoice } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import type { Product } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const invoiceId = Number(id);
  if (!invoiceId) return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });

  let body: { items?: { product_id: number; quantity: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requested = (body.items || []).filter((i) => i && i.product_id && i.quantity > 0);
  if (requested.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  const items: { product_id: number; quantity: number; unit_price: number; total: number }[] = [];
  for (const item of requested) {
    const raw = await getProductById(item.product_id);
    const product = toPlainOne(raw) as Product | undefined;
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 400 });
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 });
    }
    items.push({
      product_id: product.id,
      quantity: item.quantity,
      unit_price: product.price,
      total: Math.round(product.price * item.quantity * 100) / 100,
    });
  }

  try {
    await addItemsToInvoice(invoiceId, items);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add items";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, added: items.length });
}