import Link from 'next/link';

export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl text-red-600">×</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Payment Failed
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          We could not complete your payment.
          Please try again or use another payment method.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/sales/history"
            className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sales History
          </Link>

          <Link
            href="/dashboard"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}