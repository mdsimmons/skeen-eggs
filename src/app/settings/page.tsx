import { getSetting, getReceiptOptions } from "@/lib/queries";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/constants";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const [businessName, taxRate, currency, lowStockAlert, fuelCharge, paymentMethods, receiptOptions, appLogo, fontSize] = await Promise.all([
    getSetting("business_name"),
    getSetting("tax_rate"),
    getSetting("currency"),
    getSetting("low_stock_alert"),
    getSetting("fuel_charge"),
    getSetting("payment_methods"),
    getReceiptOptions(),
    getSetting("app_logo"),
    getSetting("font_size"),
  ]);

  let stored: Record<string, boolean> = {};
  if (paymentMethods) {
    try { stored = JSON.parse(paymentMethods); } catch { /* ignore */ }
  }
  const methods = { ...DEFAULT_PAYMENT_METHODS, ...stored };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
      <SettingsForm
        defaults={{
          business_name: businessName || "Skeen Eggs",
          tax_rate: taxRate || "0",
          currency: currency || "$",
          low_stock_alert: lowStockAlert || "5",
          fuel_charge: fuelCharge || "0",
          app_logo: appLogo || "",
          font_size: fontSize || "default",
        }}
        paymentMethods={methods}
        receiptOptions={receiptOptions}
      />
      <p className="text-xs text-muted text-center pt-4">Build 2026.09.11.6</p>
    </div>
  );
}
