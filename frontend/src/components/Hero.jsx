import React from "react";
import { GraduationCap, Cpu, ShieldCheck, Sparkles, Scale, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card/90 via-card/50 to-background p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Authentic UCI Student Performance Analytics (0.0 – 20.0 Scale)</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Student Performance Analysis{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            & Transparent Explainability
          </span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
          Upgraded machine learning system analyzing student habits, parental background, support systems, and lifestyle factors using the authentic UCI Portuguese Language Course dataset (649 records). Features a leak-free early prediction pipeline, local SHAP attribution explanations, and transparent demographic fairness auditing (Applied Sciences, 2025).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-secondary/30 p-3 text-xs font-medium text-foreground">
            <Cpu className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <span>Random Forest (MAE = 2.05 / 20)</span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-secondary/30 p-3 text-xs font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span>SHAP Local Feature Explanations</span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-secondary/30 p-3 text-xs font-medium text-foreground">
            <Scale className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Ethical Demographic Audit</span>
          </div>
        </div>
      </div>
    </section>
  );
}
