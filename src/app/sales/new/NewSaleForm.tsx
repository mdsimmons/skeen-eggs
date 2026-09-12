"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { fetchFrequentProducts, addNewCustomer } from "../actions";
import type { Product, Customer } from "@/lib/db";
import PaymentStep from "./PaymentStep";

type ProductWithCount = Product & { purchase_count?: number };

interface CartItem {
  product: Product;
  quantity: number;
}

type Step = "customer" | "products" | "payment";

export default function NewSaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
const [step, setStep] = useState<Step>("customer");
  const [productList, setProductList] = useState<Product[]>(products);
  const [customerList, setCustomerList] = useState<Customer[]>(customers);
  const [frequentProducts, setFrequentProducts] = useState<ProductWithCount[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const DRAFT_KEY = "skeen_draft_sale";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.customerId) {
        const cust = (customers as Customer[]).find((c) => c.id === draft.customerId);
        setSelectedCustomer(cust ?? null);
        if (cust) {
          fetchFrequentProducts(cust.id)
            .then(setFrequentProducts)
            .catch(() => setFrequentProducts([]));
        }
      }
      if (Array.isArray(draft.cart)) {
        const restored = draft.cart
          .map((item: { product_id: number; quantity: number }) => {
            const product = (products as Product[]).find((p) => p.id === item.product_id);
            return product ? { product, quantity: item.quantity } : null;
          })
          .filter(Boolean) as CartItem[];
        setCart(restored);
      }
      if (typeof draft.notes === "string") setNotes(draft.notes);
      if (draft.step === "products" || draft.step === "payment") setStep(draft.step);
    } catch {}
  }, []);

  const firstSave = useRef(true);
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    try {
      if (step === "customer" && cart.length === 0) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          step,
          customerId: selectedCustomer?.id ?? null,
          notes,
          cart: cart.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
          })),
        })
      );
    } catch {}
  }, [step, cart, selectedCustomer, notes]);

  function selectCustomer(customer: Customer | null) {
    setSelectedCustomer(customer);
    setCart([]);
    setNotes("");
    setSearchQuery("");
    setFrequentProducts([]);
    setStep("products");
    if (customer) {
      fetchFrequentProducts(customer.id)
        .then(setFrequentProducts)
        .catch(() => setFrequentProducts([]));
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return productList;
    const q = searchQuery.toLowerCase();
    return productList.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [productList, searchQuery]);

  const displayProducts = useMemo(() => {
    if (searchQuery) return filteredProducts;
    if (frequentProducts.length > 0) {
      const frequentIds = new Set(frequentProducts.map((p) => p.id));
      const rest = productList.filter((p) => !frequentIds.has(p.id));
      return [...frequentProducts, ...rest];
    }
    return productList;
  }, [productList, frequentProducts, searchQuery, filteredProducts]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.round((item.quantity + 1) * 100) / 100 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => item.product.id === productId ? { ...item, quantity: Math.round((item.quantity + delta) * 100) / 100 } : item)
        .filter((item) => item.quantity > 0.01)
    );
  }

  function setQuantity(productId: number, qty: number) {
    setCart((prev) =>
      prev.map((item) => item.product.id === productId ? { ...item, quantity: Math.round(qty * 100) / 100 } : item)
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  async function handleAddNewCustomer() {
    if (!newCustomerName.trim()) return;
    const { id, customers: updated } = await addNewCustomer(newCustomerName.trim(), newCustomerPhone.trim());
    setCustomerList(updated);
    const newCust = updated.find((c) => c.id === id);
    if (newCust) {
      setNewCustomerName("");
      setNewCustomerPhone("");
      setShowNewCustomer(false);
      selectCustomer(newCust);
    }
  }

  if (step === "customer") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">New Sale</h1>
        <p className="text-base text-muted">Select a customer or continue as walk-up.</p>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="space-y-3">
            <button
              onClick={() => selectCustomer(null)}
              className="w-full text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary-bg/30 transition-colors"
            >
              <p className="font-medium text-base">Walk-up Customer</p>
              <p className="text-sm text-muted">No customer selected</p>
            </button>
            {customerList.map((customer) => (
              <button
                key={customer.id}
                onClick={() => selectCustomer(customer)}
                className="w-full text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary-bg/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base">{customer.name}</p>
                    <p className="text-sm text-muted">{customer.phone || "No phone"}</p>
                  </div>
                  {customer.balance > 0 && (
                    <span className="text-sm font-medium text-danger">Owes ${customer.balance.toFixed(2)}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            {!showNewCustomer ? (
              <button onClick={() => setShowNewCustomer(true)} className="text-base text-primary font-medium hover:underline">
                + Add new customer
              </button>
            ) : (
              <div className="space-y-3">
                <input type="text" placeholder="Customer name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-base" autoFocus />
                <input type="tel" placeholder="Phone (optional)" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-base" />
                <div className="flex gap-2">
                  <button onClick={handleAddNewCustomer} className="flex-1 py-3 bg-primary text-white rounded-lg text-base font-medium">Add & Select</button>
                  <button onClick={() => { setShowNewCustomer(false); setNewCustomerName(""); setNewCustomerPhone(""); }} className="px-4 py-3 border border-border rounded-lg text-base">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──── STEP 3: Payment ────
  if (step === "payment") {
    return (
      <PaymentStep
        cart={cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          total: item.product.price * item.quantity,
          product_name: item.product.name,
          unit: item.product.unit,
          case_size: item.product.case_size,
        }))}
        subtotal={subtotal}
        customerId={selectedCustomer?.id ?? null}
        customerName={selectedCustomer?.name ?? "Walk-up"}
        notes={notes}
        onBack={() => setStep("products")}
      />
    );
  }

  // ──── STEP 2: Build Order ────
  return (
    <div className="space-y-5 pb-32 md:pb-4">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => setStep("customer")} className="text-muted hover:text-foreground text-base shrink-0">Customers</button>
        <span className="text-muted shrink-0">/</span>
        <h1 className="text-2xl md:text-3xl font-bold min-w-0 truncate">{selectedCustomer ? selectedCustomer.name : "Walk-up"}</h1>
      </div>

      {/* Frequent Items */}
      {frequentProducts.length > 0 && !searchQuery && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-medium text-muted mb-3">Frequently ordered by {selectedCustomer?.name}</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {frequentProducts.slice(0, 8).map((product) => {
              const cartQty = cart.find((item) => item.product.id === product.id)?.quantity;
              return (
                <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`relative shrink-0 w-32 p-3 border rounded-lg text-left hover:border-primary disabled:opacity-40 transition-colors ${cartQty ? "border-primary bg-primary-bg/40 ring-2 ring-primary/40" : "border-border"}`}>
                  {cartQty && (
                    <span className="absolute top-1.5 right-1.5 min-w-6 h-6 px-1 flex items-center justify-center bg-primary text-white rounded-full font-bold text-xs">({cartQty})</span>
                  )}
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-primary font-bold text-base">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-muted">{product.stock} left</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="bg-card border border-border rounded-xl p-5">
        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg mb-3 text-base" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto">
          {displayProducts.map((product) => {
            const isFrequent = frequentProducts.some((fp) => fp.id === product.id);
            const cartQty = cart.find((item) => item.product.id === product.id)?.quantity;
            return (
              <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`relative p-4 border rounded-lg text-left hover:border-primary disabled:opacity-40 transition-colors ${cartQty ? "border-primary bg-primary-bg/40 ring-2 ring-primary/40" : isFrequent && !searchQuery ? "border-primary/40 bg-primary-bg/20" : "border-border"}`}>
                {cartQty && (
                  <span className="absolute top-2 right-2 min-w-7 h-7 px-1.5 flex items-center justify-center bg-primary text-white rounded-full font-bold text-sm">({cartQty})</span>
                )}
                <p className="font-medium text-base truncate">{product.name}</p>
                <p className="text-primary font-bold text-lg">${product.price.toFixed(2)}</p>
                <p className="text-sm text-muted">{product.stock} {product.unit} left</p>
                {isFrequent && !searchQuery && <p className="text-xs text-primary mt-0.5">Frequent</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-3">Order</h2>
        {cart.length === 0 ? (
          <p className="text-base text-muted">Tap products above to add</p>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-start justify-between p-4 bg-muted-bg rounded-lg gap-3">
                <div className="flex-1 min-w-0 pt-1">
                  <p className="font-medium text-base truncate">{item.product.name}</p>
                  <p className="text-sm text-muted">
                    ${item.product.price.toFixed(2)} x {item.quantity} {item.product.unit}
                    {item.product.case_size > 0 && (
                      <> · {(item.quantity / item.product.case_size).toFixed(2)} case{(item.quantity / item.product.case_size) === 1 ? "" : "s"}</>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="h-12 px-4 flex items-center justify-center bg-card border border-border rounded-lg text-lg font-bold">-1</button>
                    <input
                      key={`${item.product.id}-${item.quantity}`}
                      type="text"
                      inputMode="decimal"
                      defaultValue={item.quantity}
                      onBlur={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setQuantity(item.product.id, v); }}
                      className="w-16 text-center text-lg font-medium bg-card border border-border rounded-lg py-2.5"
                    />
                    <button onClick={() => updateQuantity(item.product.id, 1)} disabled={item.quantity + 1 > item.product.stock} className="h-12 px-4 flex items-center justify-center bg-card border border-border rounded-lg text-lg font-bold disabled:opacity-50">+1</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, -0.25)} className="h-10 px-3 flex items-center justify-center bg-card border border-border rounded-lg text-sm font-bold">-0.25</button>
                    <button onClick={() => updateQuantity(item.product.id, 0.25)} disabled={item.quantity + 0.25 > item.product.stock} className="h-10 px-3 flex items-center justify-center bg-card border border-border rounded-lg text-sm font-bold disabled:opacity-50">+0.25</button>
                    <button onClick={() => removeFromCart(item.product.id)} className="h-10 px-3 flex items-center justify-center text-danger font-bold text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="font-semibold text-lg">Subtotal</span>
          <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-base text-muted">
          <span>Items</span>
          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes (optional)" className="w-full px-4 py-3 border border-border rounded-lg text-base resize-none" rows={2} />
      </div>

      {/* Submit */}
      <div className="sticky bottom-[110px] p-4 bg-card border-t border-border z-10 md:static md:bottom-auto md:bg-transparent md:border-0 md:p-0 md:z-auto safe-bottom">
        <button onClick={() => setStep("payment")} disabled={cart.length === 0} className="w-full py-5 bg-primary text-white rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light transition-colors">
          Review Order - ${subtotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
