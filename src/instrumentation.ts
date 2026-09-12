import { db, initSchema } from "@/lib/db";
import { seed } from "@/lib/seed";

export async function register() {
  await initSchema();
  await seed(db);
}
