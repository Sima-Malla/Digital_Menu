// scripts/reset-superadmin-password.ts
/**
 * One-time utility to reset a Super Admin's password when it's been lost.
 * Run with: npx tsx scripts/reset-superadmin-password.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "node:readline/promises";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const email = (await rl.question("Super Admin email to reset: ")).trim().toLowerCase();
  const newPassword = await rl.question("New password (min 8 chars): ");

  rl.close();

  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.superAdmin.findUnique({ where: { email } });
  if (!existing) {
    console.error(`No Super Admin found with email ${email}.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.superAdmin.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`Password reset for ${email}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});