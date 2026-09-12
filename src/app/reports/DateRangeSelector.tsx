"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "7 Days" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All Time" },
];

export default function DateRangeSelector({
  current,
  start,
  end,
}: {
  current: string;
  start: string;
  end: string;
}) {
  const router = useRouter();
  const isCustom = current === "custom";
  const [customStart, setCustomStart] = useState(start);
  const [customEnd, setCustomEnd] = useState(end);

  function applyCustom() {
    if (!customStart || !customEnd) return;
    const from = customStart < customEnd ? customStart : customEnd;
    const to = customStart < customEnd ? customEnd : customStart;
    router.push(`/reports?start=${from}&end=${to}`);
  }

  const inputCls = "rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => router.push(`/reports?range=${r.value}`)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              current === r.value
                ? "bg-primary text-white"
                : "bg-muted-bg text-muted hover:bg-border"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className={`flex items-center gap-2 flex-wrap ${isCustom ? "opacity-100" : "opacity-90"}`}>
        <span className="text-xs font-medium text-muted">Custom:</span>
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          className={inputCls}
        />
        <span className="text-xs text-muted">to</span>
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          className={inputCls}
        />
        <button
          onClick={applyCustom}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-light transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
