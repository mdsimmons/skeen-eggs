"use server";

import { revalidatePath } from "next/cache";
import { toPlain } from "@/lib/db";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/constants";
import { createInvoice, deleteInvoice, getSetting, getFrequentlyPurchasedProducts, createCustomer, getAllProducts, getAllCustomers, getCustomerById, getOpenInvoices } from "@/lib/queries";

export async function fetchProductsAndCustomers() {
  const [products, customers] = await Promise.all([getAllProducts(), getAllCustomers()]);
  return { products: toPlain(products), customers: toPlain(customers) };
}

export async function fetchFrequentProducts(customerId: number) {
  const products = await getFrequentlyPurchasedProducts(customerId);
  return toPlain(products);
}

export async function addNewCustomer(name: string, phone: string) {
  const id = await createCustomer({ name, phone, email: "", address: "", notes: "", receipt_width: "standard", fuel_charge: 0 });
  const customers = await getAllCustomers();
  return { id, customers: toPlain(customers) };
}

interface CartItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
}

export async function fetchFuelCharge() {
  const val = await getSetting("fuel_charge");
  return parseFloat(val) || 0;
}

export async function fetchCustomerFuelCharge(customerId: number) {
  const customer = await getCustomerById(customerId);
  return customer?.fuel_charge ?? 0;
}

export async function fetchPaymentMethods() {
  const val = await getSetting("payment_methods");
  if (val) {
    try {
      const stored = JSON.parse(val);
      return { ...DEFAULT_PAYMENT_METHODS, ...stored };
    } catch { /* ignore */ }
  }
  return { ...DEFAULT_PAYMENT_METHODS };
}

export async function fetchOpenInvoices() {
  const open = await getOpenInvoices();
  return toPlain(open);
}

export async function createSale(data: {
  customer_id?: number;
  invoice_type: string;
  notes: string;
  items: CartItem[];
}) {
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  let fuelCharge = parseFloat(await getSetting("fuel_charge")) || 0;
  if (data.customer_id) {
    const customer = await getCustomerById(data.customer_id);
    if (customer && customer.fuel_charge > 0) {
      fuelCharge = customer.fuel_charge;
    }
  }
  const total = subtotal + fuelCharge;
  const amountPaid = data.invoice_type === "tab" ? 0 : total;

  const invoiceId = await createInvoice({
    customer_id: data.customer_id,
    invoice_type: data.invoice_type,
    status: data.invoice_type === "tab" ? "unpaid" : "paid",
    total: total,
    amount_paid: amountPaid,
    notes: fuelCharge > 0 ? `${data.notes ? data.notes + " | " : ""}Fuel: $${fuelCharge.toFixed(2)}` : data.notes,
    items: data.items,
  });

  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/inventory");

  return { success: true, invoiceId };
}

export async function deleteSale(invoiceId: number) {
  await deleteInvoice(invoiceId);
  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}
