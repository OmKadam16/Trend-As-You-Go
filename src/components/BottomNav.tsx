"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, Settings } from "lucide-react";

const tabs = [
  { href: "/", label: "Feed", Icon: House },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5"
    >
      <div className="mx-auto max-w-mobile px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map(({ href, label, Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  active ? "text-[#CCFF33]" : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
