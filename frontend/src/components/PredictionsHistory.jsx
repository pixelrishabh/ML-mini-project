import React from "react";
import { Database, Trash2, RefreshCw, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PredictionsHistory({ records, onDelete, onRefresh, loading, storage }) {
  const isMongoConnected = Boolean(storage?.isConnected || storage?.isPersistent);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Academic Prediction Records
            </h3>
            <p className="text-xs text-muted-foreground">
              History of student predictions on the authentic Portuguese secondary scale (0.0 – 20.0).
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Persistence Storage Status Banner */}
      {!isMongoConnected ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Session Storage Active:</strong> MongoDB is currently offline. Prediction records are held in a temporary in-memory session buffer and will not be permanently stored if the server restarts.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span><strong>MongoDB Connected:</strong> Prediction records are permanently stored in the MongoDB database collection.</span>
        </div>
      )}

      {/* Table / Empty State */}
      {records.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">No prediction records stored yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Submit the profile form above to record your first student grade assessment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Study Time</th>
                <th className="py-3 px-3">Failures</th>
                <th className="py-3 px-3">Absences</th>
                <th className="py-3 px-3 text-center">Pred Grade (G3)</th>
                <th className="py-3 px-3 text-center">Tier</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {records.map((item) => {
                const rawScore = item.predicted_grade ?? item.predicted_score ?? item.predicted_cgpa ?? 0;
                const score = typeof rawScore === "number" ? rawScore.toFixed(2) : rawScore;
                const letter = item.grade_letter || "C";
                const id = item._id || item.id;
                const modeLabel = item.experiment === "later_prediction" || item.use_period_grades ? "Midterm" : "Early";
                const studyLabel = item.studytime === 1 ? "<2h" : item.studytime === 2 ? "2-5h" : item.studytime === 3 ? "5-10h" : ">10h";

                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Just now";

                return (
                  <tr key={id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">
                        {item.student_name || "Student"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{dateStr}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground">
                        {modeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground font-mono">{studyLabel}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">{item.failures ?? 0}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">{item.absences ?? 0} days</td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-blue-400 text-sm">{score}</span>
                      <span className="text-[10px] text-muted-foreground"> / 20.0</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {letter}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDelete(id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
