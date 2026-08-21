"use server";

// app/actions/validate-password.ts
import { prisma } from "@/lib/prisma";

export async function validatePasswordAgainstPolicy(password: string) {
  // 1. Database bata Super Admin le save gareko rule haru nikaalne
  const rules = await prisma.securitySettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const errors: string[] = [];

  // 2. Password lai euta-euta rule sanga compare garne
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters.`);
  }
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must include an uppercase letter.");
  }
  if (rules.requireNumber && !/[0-9]/.test(password)) {
    errors.push("Password must include a number.");
  }
  if (rules.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include a special character.");
  }

  // 3. Result return garne
  return { valid: errors.length === 0, errors };
}