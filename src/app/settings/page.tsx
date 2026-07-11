"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Save, CheckCircle, KeyRound, Bot } from "lucide-react";

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [sbKey, setSbKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedOpenai = localStorage.getItem("openai-key");
    const storedSb = localStorage.getItem("scrapebadger-key");
    if (storedOpenai) setOpenaiKey(storedOpenai);
    if (storedSb) setSbKey(storedSb);
  }, []);

  const handleSave = () => {
    if (!openaiKey.trim()) return;
    localStorage.setItem("openai-key", openaiKey.trim());
    localStorage.setItem("scrapebadger-key", sbKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Header />
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-xl font-bold mb-1">Setup</h1>
        <p className="text-gray-500 text-xs mb-6">
          Configure your API keys to get started.
        </p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">
              OPENAI API KEY
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-••••••••"
                className="w-full bg-white/[0.05] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CCFF33] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Get your key at{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CCFF33] underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">
              SCRAPEBADGER API KEY
            </label>
            <div className="relative">
              <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="password"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="sb_live_••••••••"
                className="w-full bg-white/[0.05] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CCFF33] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Get your key at{" "}
              <a
                href="https://scrapebadger.com/auth/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CCFF33] underline"
              >
                scrapebadger.com
              </a>
              {" "}— sign up for a free trial (1,000 credits)
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!openaiKey.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm py-3.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Configuration Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                SAVE CONFIGURATION
              </>
            )}
          </button>

          {saved && (
            <div className="text-center">
              <span className="text-[#CCFF33] text-xs font-semibold">
                &check; Configuration saved
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
