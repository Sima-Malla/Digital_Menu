import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentResultPage({
  searchParams,
}: {
  searchParams: { status?: string; orderId?: string };
}) {
  const isPaid = searchParams.status === "paid";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${isPaid ? "bg-green-100" : "bg-red-100"}`}>
          {isPaid ? <CheckCircle2 className="h-7 w-7 text-green-600" /> : <XCircle className="h-7 w-7 text-red-600" />}
        </div>
        <h1 className="mt-4 text-lg font-bold text-gray-900">
          {isPaid ? "Payment confirmed!" : "Payment didn't go through"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isPaid
            ? searchParams.orderId
              ? `Order #${searchParams.orderId} is paid — the kitchen has been notified.`
              : "Your payment was received."
            : "No money was deducted. You can try again or pay at the counter."}
        </p>
        <Link href="/" className="mt-6 inline-block w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700">
          Back to MenuTap
        </Link>
      </div>
    </div>
  );
}