"use server";

import { readFileSync } from "fs";
import { join } from "path";

export async function triggerBackup() {
  const dbPath = join(process.cwd(), "data", "skeen-eggs.db");
  const buffer = readFileSync(dbPath);
  const blob = new Blob([buffer], { type: "application/x-sqlite3" });
  return blob;
}
