/**
 * One-time script to create the first Super Admin account.
 * Run with: npx tsx scripts/create-superadmin.ts
 *
 * There is intentionally no public signup path for this role — Super Admin
 * accounts are provisioned here (for the first one) or, once at least one
 * exists, should come from an internal invite mechanism, not a form anyone
 * can reach.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "node:readline/promises";

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const fullName = await rl.question("Full name: ");
  const email = (await rl.question("Email: ")).trim().toLowerCase();
  const password = await rl.question("Password (min 8 chars): ");

  rl.close();

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.superAdmin.findUnique({ where: { email } });
  if (existing) {
    console.error(`A Super Admin with email ${email} already exists.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.superAdmin.create({
    data: { fullName, email, password: hashedPassword },
  });

  console.log(`Super Admin created: ${admin.email} (id: ${admin.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});