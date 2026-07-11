"use client";

import { TrendingUp } from "lucide-react";

type HeaderProps = {
  timestamp?: Date | null;
  rightElement?: React.ReactNode;
};

export default function Header({ timestamp, rightElement }: HeaderProps) {
  const getTimeAgo = (date: Date) => {
    const mins = Math.floor(
      (Date.now() - date.getTime()) / 1000 / 60
    );
    if (mins < 1) return "Just now";
    return `Updated ${mins}m ago`;
  };

  return (
    <div
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5"
    >
      <div className="mx-auto max-w-mobile px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#CCFF33]" />
          <span className="text-white font-bold text-sm tracking-tight">
            Trends As You Go
          </span>
        </div>
        {rightElement ? (
          rightElement
        ) : timestamp ? (
          <span className="text-gray-600 text-xs font-medium">
            {getTimeAgo(timestamp)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
