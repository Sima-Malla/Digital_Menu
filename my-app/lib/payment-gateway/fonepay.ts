import crypto from "crypto";

/**
 * ⚠️ IMPORTANT: Unlike eSewa (which has one well-documented public API),
 * FonePay does not publish a single canonical spec — the field names below
 * (PID/MD/PRN/AMT/CRN/DT/R1/R2/RU) match their commonly-documented classic
 * merchant web-redirect flow as of 2026, but the sandbox URL, production
 * URL, and exact verification response format vary across sources.
 * CONFIRM every field and both URLs against the merchant PDF/docs FonePay
 * gives you directly when you sign up, before processing a single real
 * payment. Do not treat this file as production-verified the way esewa.ts is.
 */

const FONEPAY_MERCHANT_CODE = process.env.FONEPAY_MERCHANT_CODE ?? "";
const FONEPAY_SECRET_KEY = process.env.FONEPAY_SECRET_KEY ?? "";
const FONEPAY_GATEWAY_URL =
  process.env.FONEPAY_ENV === "production"
    ? "https://clientapi.fonepay.com/api/merchantRequest"
    : "https://dev-clientapi.fonepay.com/api/merchantRequest";
const FONEPAY_VERIFY_URL =
  process.env.FONEPAY_ENV === "production"
    ? "https://clientapi.fonepay.com/api/merchantRequest/verificationMerchant"
    : "https://dev-clientapi.fonepay.com/api/merchantRequest/verificationMerchant";

function formatFonepayDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

export function buildFonepayRedirectUrl(params: {
  amount: number;
  prn: string; // "Product Reference Number" — FonePay's name for our paymentRef
  remarks1: string;
  remarks2?: string;
  returnUrl: string;
}): string {
  const fields = {
    PID: FONEPAY_MERCHANT_CODE,
    MD: "P",
    PRN: params.prn,
    AMT: String(params.amount),
    CRN: "NPR",
    DT: formatFonepayDate(new Date()),
    R1: params.remarks1,
    R2: params.remarks2 ?? "",
    RU: params.returnUrl,
  };

  const message = [fields.PID, fields.MD, fields.PRN, fields.AMT, fields.CRN, fields.DT, fields.R1, fields.R2, fields.RU].join(",");
  const DV = crypto.createHmac("sha512", FONEPAY_SECRET_KEY).update(message, "utf-8").digest("hex");

  const url = new URL(FONEPAY_GATEWAY_URL);
  for (const [key, value] of Object.entries({ ...fields, DV })) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Confirms a returned transaction with FonePay directly rather than trusting the redirect alone. */
export async function verifyFonepayTransaction(params: {
  prn: string;
  amount: string;
  bid: string; // Bank's transaction ID, returned by FonePay on the redirect back
  uid: string; // FonePay's own transaction ID, returned on the redirect back
}): Promise<{ paymentSuccess: boolean } | null> {
  const message = [FONEPAY_MERCHANT_CODE, params.amount, params.prn, params.bid, params.uid].join(",");
  const DV = crypto.createHmac("sha512", FONEPAY_SECRET_KEY).update(message, "utf-8").digest("hex");

  const url = new URL(FONEPAY_VERIFY_URL);
  url.searchParams.set("PID", FONEPAY_MERCHANT_CODE);
  url.searchParams.set("PRN", params.prn);
  url.searchParams.set("BID", params.bid);
  url.searchParams.set("UID", params.uid);
  url.searchParams.set("AMT", params.amount);
  url.searchParams.set("DV", DV);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const text = await res.text();
    // Confirm the exact success-value FonePay returns here — "success" is
    // the commonly documented value but verify against your merchant docs.
    return { paymentSuccess: text.trim().toLowerCase() === "success" };
  } catch (err) {
    console.error("FonePay verification failed:", err);
    return null;
  }
}