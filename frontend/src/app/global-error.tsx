"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StoryHour critical root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#FAF8F3] text-[#0f0f0f] font-sans min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#C9281D]/10 text-[#C9281D] flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f0f0f]">
            Application Encountered an Error
          </h1>
          <p className="text-sm text-[#5A5A5A] leading-relaxed">
            A critical error prevented the application layout from rendering.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-[#C9281D] hover:bg-[#B01E14] text-white text-xs sm:text-sm font-bold transition shadow cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
