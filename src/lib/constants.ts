export const PRODUCT_CATEGORIES = [
  { value: "eggs", label: "Eggs" },
  { value: "dairy", label: "Dairy" },
  { value: "poultry", label: "Poultry" },
  { value: "honey", label: "Honey" },
  { value: "produce", label: "Produce" },
  { value: "baked", label: "Baked Goods" },
  { value: "other", label: "Other" },
];

export const UNIT_OPTIONS = [
  { value: "dozen", label: "Dozen" },
  { value: "half-dozen", label: "Half Dozen" },
  { value: "case", label: "Case (5 dozen)" },
  { value: "flat", label: "Flat (30 ct)" },
  { value: "pint", label: "Pint" },
  { value: "quart", label: "Quart" },
  { value: "gallon", label: "Gallon" },
  { value: "lb", label: "Pound" },
  { value: "each", label: "Each" },
];

export const EXPENSE_CATEGORIES = [
  { value: "feed", label: "Feed" },
  { value: "supplies", label: "Supplies" },
  { value: "packaging", label: "Packaging" },
  { value: "transport", label: "Transport" },
  { value: "equipment", label: "Equipment" },
  { value: "veterinary", label: "Veterinary" },
  { value: "utilities", label: "Utilities" },
  { value: "market_fees", label: "Market Fees" },
  { value: "general", label: "General" },
];

export const INVOICE_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "tab", label: "Tab" },
];

export const INVOICE_STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", description: "Immediate cash payment" },
  { value: "card", label: "Card", description: "Credit/debit card" },
  { value: "check", label: "Check", description: "Paper or mobile check" },
  { value: "applepay", label: "Apple Pay", description: "Apple Pay on iPhone or Apple Watch" },
  { value: "cashapp", label: "CashApp", description: "CashApp transfer" },
  { value: "ach", label: "ACH", description: "ACH bank transfer" },
  { value: "tab", label: "Invoice", description: "Send an invoice to pay later (credit)" },
];

export const DEFAULT_PAYMENT_METHODS: Record<string, boolean> = {
  cash: true,
  card: true,
  check: true,
  applepay: true,
  cashapp: true,
  ach: true,
  tab: true,
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  check: "Check",
  applepay: "Apple Pay",
  cashapp: "CashApp",
  ach: "ACH",
  tab: "Invoice",
};

export interface ReceiptOptions {
  tagline: string;
  address: string;
  phone: string;
  footer: string;
  style: "simple" | "color";
  font_size: number;
  item_font_size: number;
  price_font_size: number;
  total_font_size: number;
  show_customer: boolean;
  show_qty: boolean;
  show_unit_price: boolean;
  show_line_total: boolean;
  show_notes: boolean;
  width: "standard" | "thermal";
  receipt_logo: string;
}

export const DEFAULT_RECEIPT_OPTIONS: ReceiptOptions = {
  tagline: "Eggs & farm goods",
  address: "",
  phone: "",
  footer: "Thank you for supporting your local farm!",
  style: "color",
  font_size: 12,
  item_font_size: 12,
  price_font_size: 12,
  total_font_size: 14,
  show_customer: true,
  show_qty: true,
  show_unit_price: true,
  show_line_total: true,
  show_notes: true,
  width: "standard",
  receipt_logo: "",
};
