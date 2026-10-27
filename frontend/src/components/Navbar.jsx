import React from "react";
import { GraduationCap, Moon, Sun, Database, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ activeTab, onSelectTab, storage }) {
  const { theme, toggleTheme } = useTheme();
  const isMongoConnected = Boolean(storage?.isConnected || storage?.isPersistent);

  const tabs = [
    { id: "studio", label: "Prediction Studio" },
    { id: "diagnostics", label: "Model Benchmarks" },
    { id: "fairness", label: "Fairness Audit" },
    { id: "dataset", label: "Dataset Info" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                StudentPerf ML
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                <Sparkles className="h-3 w-3" /> UCI 0–20 Scale
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Machine Learning Analysis &amp; Ethical Fairness Audit
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/40 p-1 rounded-2xl border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Storage Status Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
              isMongoConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
            title={storage?.warning || "MongoDB Storage Active"}
          >
            {isMongoConnected ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            <span>{isMongoConnected ? "MongoDB" : "Session Buffer"}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 text-foreground transition-all hover:bg-secondary cursor-pointer"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-border/40 bg-card/60 px-2 py-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
