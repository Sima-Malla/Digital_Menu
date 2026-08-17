// lib/crypto.ts — set ENCRYPTION_KEY (32-byte / 64 hex chars) in env
import crypto from "crypto";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY ?? "", "hex");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString("base64")).join(":");
}

export function decrypt(payload: string) {
  const [ivB64, tagB64, encB64] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]).toString("utf8");
}

export function mask(value: string) {
  return value ? `••••••${value.slice(-4)}` : "";
}