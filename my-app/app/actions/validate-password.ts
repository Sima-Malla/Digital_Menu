"use server";

// app/actions/validate-password.ts

export async function validatePasswordAgainstPolicy(password: string) {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }

  return { valid: errors.length === 0, errors };
}