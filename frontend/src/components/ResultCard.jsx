import React from "react";
import { Award, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export default function ResultCard({ prediction }) {
  if (!prediction) return null;

  const rawScore = prediction.predicted_cgpa ?? prediction.predicted_score ?? prediction.predicted_grade;
  const score = typeof rawScore === 'number' ? rawScore.toFixed(2) : rawScore;
  const studentName = prediction.student_name || "Student";
  const letter = prediction.grade_letter || "B";
  const status = prediction.performance_status || "Satisfactory";

  const getStatusColor = (st) => {
    switch (st) {
      case "Outstanding":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Strong":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Satisfactory":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "Needs Attention":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-card p-6 sm:p-8 shadow-2xl transition-all animate-in fade-in duration-300">
      <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Award className="h-3.5 w-3.5" /> University CGPA Estimate Generated
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            {studentName}&apos;s Academic Result
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            Based on university entrance scores, semester credit load, department major, study habits, lecture attendance, and campus living factors, the ML regression pipeline estimates the college cumulative GPA (0.0 - 10.0 scale):
          </p>

          <div className="flex items-center gap-3 pt-1">
            <span
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold border ${getStatusColor(
                status
              )}`}
            >
              {Number(score) >= 7.0 ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {status}
            </span>

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" /> Model Confidence: High
            </span>
          </div>
        </div>

        {/* Right Badge Display */}
        <div className="flex items-center gap-4 bg-secondary/30 p-5 rounded-2xl border border-border">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estimated CGPA
            </div>
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {score}
              <span className="text-xl font-semibold text-muted-foreground"> / 10.00</span>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Grade Letter
            </div>
            <div className="text-4xl font-extrabold text-indigo-400">
              {letter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
