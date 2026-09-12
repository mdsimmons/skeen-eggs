import { NextRequest, NextResponse } from "next/server";
import { setSetting } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value !== "") {
        await setSetting(key, value);
      }
    }
    const accept = request.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      const host = request.headers.get("host") || request.nextUrl.host || "localhost:3000";
      const proto = request.headers.get("x-forwarded-proto") || "http";
      return NextResponse.redirect(new URL("/settings", `${proto}://${host}`), 303);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}