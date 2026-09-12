import { NextResponse } from "next/server";
import { getSetting } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const logo = await getSetting("app_logo");
  return NextResponse.json({ app_logo: logo });
}
