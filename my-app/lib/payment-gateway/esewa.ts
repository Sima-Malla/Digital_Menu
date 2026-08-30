import crypto from "crypto";

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST";
// "8gBm/:&EnhH.1/q" is eSewa's own published UAT/sandbox test secret — safe
// to use for testing. Replace with your real merchant secret in production.
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q";
const ESEWA_GATEWAY_URL =
  process.env.ESEWA_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // UAT/sandbox
const ESEWA_STATUS_URL =
  process.env.ESEWA_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc.esewa.com.np/api/epay/transaction/status/";

export type EsewaFormFields = {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
};

/**
 * eSewa ePay v2 is a redirect/form-submission flow, not a server-to-server
 * API call: the merchant builds a signed form on the server, and the
 * customer's browser submits it directly to eSewa's hosted payment page.
 * That page is where the customer's balance actually gets deducted.
 */
export function buildEsewaPaymentForm(params: {
  amount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}): { gatewayUrl: string; fields: EsewaFormFields } {
  const totalAmount = params.amount.toFixed(2);
  const message = `total_amount=${totalAmount},transaction_uuid=${params.transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");

  return {
    gatewayUrl: ESEWA_GATEWAY_URL,
    fields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: params.transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: params.successUrl,
      failure_url: params.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    },
  };
}

/** Decodes the base64 payload eSewa appends to success_url as ?data=... */
export function decodeEsewaCallback(encodedData: string): Record<string, string> | null {
  try {
    return JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/** Recomputes eSewa's own signature on the callback and compares it (timing-safe) to detect tampering. */
export function verifyEsewaCallbackSignature(payload: Record<string, string>): boolean {
  const signedFields = (payload.signed_field_names ?? "").split(",");
  const message = signedFields.map((field) => `${field}=${payload[field]}`).join(",");
  const expected = crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
  const provided = payload.signature ?? "";
  return (
    expected.length === provided.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  );
}

/** Defence in depth: ask eSewa directly for the transaction's status rather than trusting the redirect alone. */
export async function checkEsewaTransactionStatus(params: {
  transactionUuid: string;
  totalAmount: number;
}): Promise<{ status: string } | null> {
  const url = new URL(ESEWA_STATUS_URL);
  url.searchParams.set("product_code", ESEWA_PRODUCT_CODE);
  url.searchParams.set("total_amount", String(params.totalAmount));
  url.searchParams.set("transaction_uuid", params.transactionUuid);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("eSewa status check failed:", err);
    return null;
  }
}