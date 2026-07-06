import "dotenv/config";
import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { prisma } from "./prisma.js";

/** One seed account per role. Passwords are dev defaults — change in production. */
const SEED_USERS = [
  { name: "Super Admin", email: "super@risik.gov", role: "super_admin", password: "Super@123" },
  { name: "Admin User", email: "admin@risik.gov", role: "admin", password: "Admin@123" },
  { name: "Officer User", email: "officer@risik.gov", role: "officer", password: "Officer@123" },
  { name: "Researcher User", email: "researcher@risik.gov", role: "researcher", password: "Research@123" },
] as const;

async function main() {
  for (const u of SEED_USERS) {
    const passwordHash = await argon2.hash(u.password);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role, status: "active", name: u.name },
      create: {
        id: randomUUID(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: "active",
        emailVerified: true,
        passwordHash,
      },
    });
    console.log(`✅ ${user.role.padEnd(12)} → ${user.email}  (password: ${u.password})`);
  }
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
