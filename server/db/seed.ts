import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name,
        passwordHash,
        role: "admin",
      },
    });

  console.log(`[seed] Admin user upserted: ${email}`);
}
