import React from "react";
import { Database, Trash2, RefreshCw, Layers } from "lucide-react";

export default function PredictionsHistory({ records, onDelete, onRefresh, loading }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              University Student Predictions History (MongoDB Collection)
            </h3>
            <p className="text-xs text-muted-foreground">
              Stored prediction entries from the Express API & Mongoose Collection (0.0 - 10.0 scale).
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">No prediction records found yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Submit the form above to store your first college student CGPA assessment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Major</th>
                <th className="py-3 px-3">Prior GPA</th>
                <th className="py-3 px-3">Study Hrs</th>
                <th className="py-3 px-3 text-center">Pred CGPA</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {records.map((item) => {
                const rawScore = item.predicted_cgpa ?? item.predicted_score ?? item.predicted_grade;
                const score = typeof rawScore === 'number' ? rawScore.toFixed(2) : rawScore;
                const letter = item.grade_letter || "B";
                const id = item._id || item.id;
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "Just now";

                return (
                  <tr key={id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">
                        {item.student_name || "Student"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{dateStr}</div>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground">{item.major || "Engineering"}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.high_school_gpa ?? item.current_cgpa ?? "7.5"}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.weekly_study_hours ?? item.study_hours} hrs</td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-blue-400">{score}</span>
                      <span className="text-[10px] text-muted-foreground"> / 10.0</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {letter}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDelete(id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
