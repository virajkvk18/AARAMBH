"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
          !
        </div>
        <h1 className="text-lg font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-500">
          An unexpected error occurred. Please try again or contact support at
          admin@aarambh.gov.in.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}