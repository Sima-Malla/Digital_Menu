import crypto from "crypto";

export function computeTokenHash(passwordHash: string, userId: string): string {
  return crypto
    .createHash("sha256")
    .update(`${passwordHash}:${userId}`)
    .digest("hex")
    .slice(0, 16);
}
