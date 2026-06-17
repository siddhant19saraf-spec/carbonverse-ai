"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-2">Page Error</h2>
        <p className="text-sm text-white/60 mb-6">
          This page encountered an error. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
