"use client";

import { useState, useRef } from "react";
import { PAYMENT_METHODS, type ReceiptOptions } from "@/lib/constants";

function LogoUpload({
  label,
  currentLogo,
  onUpload,
}: {
  label: string;
  currentLogo: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogo);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="block text-base font-medium mb-1">{label}</label>}
      <div className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt={label} className="h-14 w-auto rounded border border-border bg-white" />
        ) : (
          <div className="h-14 w-14 rounded border border-border bg-muted-bg flex items-center justify-center text-sm text-muted">
            No logo
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-base border border-border rounded-lg hover:bg-muted-bg transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); onUpload(""); }}
              className="px-4 py-2 text-base text-danger border border-border rounded-lg hover:bg-muted-bg transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>
    </div>
  );
}

export default function SettingsForm({
  defaults,
  paymentMethods,
  receiptOptions,
}: {
  defaults: Record<string, string>;
  paymentMethods: Record<string, boolean>;
  receiptOptions: ReceiptOptions;
}) {
  const [settings, setSettings] = useState(defaults);
  const [methods, setMethods] = useState(paymentMethods);
  const [receipt, setReceipt] = useState<ReceiptOptions>(receiptOptions);
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData();
    for (const [key, value] of Object.entries(settings)) {
      form.set(key, value);
    }
    form.set("payment_methods", JSON.stringify(methods));
    form.set("receipt_options", JSON.stringify(receipt));
    setIsPending(true);
    try {
      const res = await fetch("/api/settings", { method: "POST", body: form });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => window.location.reload(), 600);
    } catch {
      alert("Save failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} method="post" action="/api/settings" className="space-y-5">
      <div>
        <label className="block text-base font-medium mb-1">Business Name</label>
        <input name="business_name" value={settings.business_name} onChange={(e) => setSettings({ ...settings, business_name: e.target.value })} className={cls} />
      </div>
      <div>
        <label className="block text-base font-medium mb-1">Currency Symbol</label>
        <input name="currency" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className={cls} maxLength={3} />
      </div>
      <div>
        <label className="block text-base font-medium mb-1">Tax Rate (%)</label>
        <input name="tax_rate" type="number" step="0.01" min="0" max="100" value={settings.tax_rate} onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })} className={cls} />
      </div>
      <div>
        <label className="block text-base font-medium mb-1">Fuel / Delivery Charge ($)</label>
        <input name="fuel_charge" type="number" step="0.01" min="0" value={settings.fuel_charge} onChange={(e) => setSettings({ ...settings, fuel_charge: e.target.value })} className={cls} placeholder="0.00" />
        <p className="text-sm text-muted mt-1">Added to every order. Set to 0 for no charge.</p>
      </div>
      <div>
        <label className="block text-base font-medium mb-1">Low Stock Alert Threshold</label>
        <input name="low_stock_alert" type="number" min="0" value={settings.low_stock_alert} onChange={(e) => setSettings({ ...settings, low_stock_alert: e.target.value })} className={cls} />
      </div>
      <div>
        <label className="block text-base font-medium mb-1">Text Size</label>
        <select name="font_size" value={settings.font_size || "default"} onChange={(e) => setSettings({ ...settings, font_size: e.target.value })} className={cls}>
          <option value="small">Small (16px)</option>
          <option value="default">Default (18px)</option>
          <option value="large">Large (20px)</option>
          <option value="xlarge">Extra Large (22px)</option>
        </select>
        <p className="text-sm text-muted mt-1">Changes apply after saving.</p>
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-base font-medium mb-1">App Logo</label>
        <p className="text-sm text-muted mb-3">Displayed in the sidebar header.</p>
        <LogoUpload
          label=""
          currentLogo={settings.app_logo || ""}
          onUpload={(url) => setSettings({ ...settings, app_logo: url })}
        />
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-base font-medium mb-1">Payment Methods</label>
        <p className="text-sm text-muted mb-3">Choose which payment types appear at checkout.</p>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.value} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted-bg transition-colors">
              <input
                type="checkbox"
                checked={methods[method.value]}
                onChange={(e) => setMethods({ ...methods, [method.value]: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30"
              />
              <div>
                <span className="text-base font-medium">{method.label}</span>
                <span className="text-sm text-muted ml-2">{method.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-base font-medium mb-1">Printed Receipt</label>
        <p className="text-sm text-muted mb-3">Customize how invoices look when printed.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-base font-medium mb-1">Header Style</label>
              <select value={receipt.style} onChange={(e) => setReceipt({ ...receipt, style: e.target.value as ReceiptOptions["style"] })} className={cls}>
                <option value="color">Color header</option>
                <option value="simple">Simple (black &amp; white)</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Receipt Width</label>
              <select value={receipt.width} onChange={(e) => setReceipt({ ...receipt, width: e.target.value as ReceiptOptions["width"] })} className={cls}>
                <option value="standard">Standard (Letter)</option>
                <option value="thermal">Thermal (3.25&quot; / 80mm)</option>
              </select>
            </div>
          </div>

          <LogoUpload
            label="Receipt Logo"
            currentLogo={receipt.receipt_logo}
            onUpload={(url) => setReceipt({ ...receipt, receipt_logo: url })}
          />

          <div>
            <label className="block text-base font-medium mb-1">
              Base Font Size: <span className="text-primary font-semibold">{receipt.font_size}px</span>
            </label>
            <input
              type="range"
              min="8"
              max="18"
              step="1"
              value={receipt.font_size}
              onChange={(e) => setReceipt({ ...receipt, font_size: Number(e.target.value) })}
              className="w-full accent-primary h-3"
            />
            <p className="text-sm text-muted mt-1">10-12px is best for thermal printers.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-base font-medium mb-1">
                Item Text: <span className="text-primary font-semibold">{receipt.item_font_size}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="18"
                step="1"
                value={receipt.item_font_size}
                onChange={(e) => setReceipt({ ...receipt, item_font_size: Number(e.target.value) })}
                className="w-full accent-primary h-3"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">
                Prices: <span className="text-primary font-semibold">{receipt.price_font_size}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="18"
                step="1"
                value={receipt.price_font_size}
                onChange={(e) => setReceipt({ ...receipt, price_font_size: Number(e.target.value) })}
                className="w-full accent-primary h-3"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">
                Total: <span className="text-primary font-semibold">{receipt.total_font_size}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="22"
                step="1"
                value={receipt.total_font_size}
                onChange={(e) => setReceipt({ ...receipt, total_font_size: Number(e.target.value) })}
                className="w-full accent-primary h-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Tagline (under business name)</label>
            <input value={receipt.tagline} onChange={(e) => setReceipt({ ...receipt, tagline: e.target.value })} className={cls} placeholder="Eggs & farm goods" />
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Address</label>
            <input value={receipt.address} onChange={(e) => setReceipt({ ...receipt, address: e.target.value })} className={cls} placeholder="123 Farm Rd, Anywhere" />
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Phone</label>
            <input value={receipt.phone} onChange={(e) => setReceipt({ ...receipt, phone: e.target.value })} className={cls} placeholder="(555) 123-4567" />
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Footer Message</label>
            <input value={receipt.footer} onChange={(e) => setReceipt({ ...receipt, footer: e.target.value })} className={cls} placeholder="Thank you for your business!" />
          </div>

          <div>
            <label className="block text-base font-medium mb-2">Item Lines</label>
            <div className="space-y-2">
              {(
                [
                  { key: "show_qty", label: "Show quantity" },
                  { key: "show_unit_price", label: "Show unit price" },
                  { key: "show_line_total", label: "Show line total" },
                  { key: "show_notes", label: "Show order notes" },
                ] as const
              ).map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={receipt[opt.key]}
                    onChange={(e) => setReceipt({ ...receipt, [opt.key]: e.target.checked })}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-base font-medium">{opt.label}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted-bg transition-colors">
                <input
                  type="checkbox"
                  checked={receipt.show_customer}
                  onChange={(e) => setReceipt({ ...receipt, show_customer: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-base font-medium">Show customer name</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white rounded-lg py-3.5 text-base font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
          {isPending ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
