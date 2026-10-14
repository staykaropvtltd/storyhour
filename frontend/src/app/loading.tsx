import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F3]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-[#C9281D]/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-[#C9281D] border-t-transparent animate-spin" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-[#7A756D] font-medium">
        Opening StoryHour…
      </p>
    </div>
  );
}
