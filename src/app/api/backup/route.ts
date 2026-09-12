import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbPath = join(process.cwd(), "data", "skeen-eggs.db");
  const buffer = readFileSync(dbPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": `attachment; filename="skeen-eggs-backup-${new Date().toISOString().split("T")[0]}.db"`,
    },
  });
}
