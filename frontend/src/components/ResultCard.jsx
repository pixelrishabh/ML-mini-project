import React from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  ShieldAlert
} from "lucide-react";

export default function ResultCard({ prediction }) {
  if (!prediction) return null;

  const rawGrade = prediction.predicted_grade ?? prediction.predicted_score ?? prediction.predicted_g3 ?? 0;
  const grade = typeof rawGrade === "number" ? rawGrade.toFixed(2) : rawGrade;
  const studentName = prediction.student_name || "Student";
  const letter = prediction.grade_letter || "C";
  const status = prediction.performance_status || "Satisfactory";
  const statusDesc = prediction.status_description || "Secondary grade estimation";
  const experiment = prediction.experiment || (prediction.use_period_grades ? "later_prediction" : "early_prediction");

  const shap = prediction.shap_explanation || {};
  const positiveFactors = shap.positive_factors || [];
  const negativeFactors = shap.negative_factors || [];

  const getStatusColor = (st) => {
    switch (st) {
      case "Excellent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Good":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Satisfactory":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "Needs Support":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "At Risk":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/40 bg-card p-6 sm:p-8 shadow-2xl transition-all animate-in fade-in duration-300 space-y-6">
      <div className="absolute top-0 right-0 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Main Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
              <Award className="h-3.5 w-3.5" /> Portuguese Secondary Grade G3 Estimate
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border">
              {experiment === "later_prediction" ? "Midterm Monitoring Mode" : "Early Intervention Mode"}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            {studentName}&apos;s Academic Performance Result
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
            {statusDesc}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold border ${getStatusColor(
                status
              )}`}
            >
              {Number(grade) >= 12.0 ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {status}
            </span>

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
              Grading Range: 0.0 – 20.0 (Passing ≥ 10.0)
            </span>
          </div>
        </div>

        {/* Right Badge Display */}
        <div className="flex items-center gap-5 bg-secondary/30 p-5 rounded-3xl border border-border self-start md:self-auto">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estimated Final Grade
            </div>
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              {grade}
              <span className="text-lg font-semibold text-muted-foreground"> / 20.0</span>
            </div>
          </div>

          <div className="h-14 w-px bg-border/60" />

          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Grade Tier
            </div>
            <div className="text-4xl font-black text-indigo-400">
              {letter}
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Local Explainability Section */}
      <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-foreground">
              Local SHAP Explainability Breakdown
            </h4>
          </div>
          {shap.base_grade && (
            <span className="text-[11px] font-mono text-muted-foreground">
              Cohort Base Value: <strong className="text-foreground">{shap.base_grade} / 20.0</strong>
            </span>
          )}
        </div>

        {shap.top_drivers_summary && (
          <p className="text-xs text-foreground/90 bg-background/60 p-3 rounded-xl border border-border/40 leading-relaxed font-medium">
            💡 {shap.top_drivers_summary}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Factors */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> Positive Drivers (Pushed Grade Higher)
            </div>
            {positiveFactors.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No substantial positive deviations from baseline.</p>
            ) : (
              positiveFactors.map((item) => (
                <div
                  key={item.feature}
                  className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-emerald-400">+{item.impact} pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Negative Factors */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5" /> Drag Factors (Pushed Grade Lower)
            </div>
            {negativeFactors.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No substantial negative drags from baseline.</p>
            ) : (
              negativeFactors.map((item) => (
                <div
                  key={item.feature}
                  className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-rose-400">{item.impact} pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prominent Ethical Disclaimer */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold">Academic Disclaimer & Limitations:</strong> Model estimates are statistical approximations learned from the UCI Portuguese secondary school cohort (0–20 grading scale). They do not constitute deterministic judgments of student potential, intelligence, or academic ceiling. Use exclusively as diagnostic early signals to target educational support.
        </div>
      </div>
    </div>
  );
}
