import React from "react";
import { GraduationCap, Cpu, ShieldCheck, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card/80 via-card/40 to-background p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>University Academic Performance Analytics (0.0 - 10.0 CGPA Scale)</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Predict College Student CGPA{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            With High Precision
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Analyze undergraduate academic performance across 14 key university indicators — including semester credit loads, lecture attendance, lab submissions, study habits, and campus living factors. Our ML regression pipeline estimates final Cumulative Grade Point Average (CGPA on a 0.0 – 10.0 scale).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs font-medium text-muted-foreground">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span>Regression ML Pipeline (R² = 0.74)</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Mongoose DB Validated</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs font-medium text-muted-foreground col-span-2 sm:col-span-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Sub-Second Inference</span>
          </div>
        </div>
      </div>
    </section>
  );
}
