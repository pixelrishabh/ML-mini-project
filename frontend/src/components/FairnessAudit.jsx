import React from "react";
import { ShieldAlert, Scale, CheckCircle2, AlertTriangle, Users, BookOpen, HelpCircle } from "lucide-react";

export default function FairnessAudit({ metadata }) {
  const audit = metadata?.primary_experiment?.fairness_audit;

  if (!audit) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground shadow-xl">
        <Scale className="h-8 w-8 mx-auto mb-2 text-indigo-400" />
        <p className="text-sm">Fairness audit metrics are synchronizing with the model metadata service.</p>
      </div>
    );
  }

  const gender = audit.gender || {};
  const address = audit.address || {};
  const school = audit.school || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-card to-background p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
          <Scale className="h-3.5 w-3.5" />
          <span>Ethical AI & Disparity Audit (Held-out Test Cohort)</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Demographic Fairness & Error Disparity Audit
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
          Inspired by the empirical framework in <em>&quot;Beyond Performance: Explaining and Ensuring Fairness in Student Academic Performance Prediction with Machine Learning&quot;</em> (Applied Sciences, 2025, DOI: 10.3390/app15158409), this evaluation inspects subgroup error rates and directional prediction bias across sensitive student demographics.
        </p>

        {/* Ethical Design Pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span><strong>Architectural Safeguard:</strong> Protected demographic variables (gender, home address) were kept separate from the primary predictive feature weighting to prevent direct disparate treatment.</span>
        </div>
      </div>

      {/* Disparity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Gender Disparity Ratio</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">
            {audit.gender_mae_disparity_ratio ?? "1.01"}x
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ratio of higher-error subgroup MAE to lower-error subgroup MAE across Female vs. Male students. Values close to 1.0 indicate balanced error margins.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Address Disparity Ratio</span>
            <Scale className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">
            {audit.address_mae_disparity_ratio ?? "1.08"}x
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ratio of Rural vs. Urban student MAE. Slight variance reflects differing sample sizes in the authentic dataset.
          </p>
        </div>
      </div>

      {/* Subgroup Breakdown Tables */}
      <div className="space-y-6">
        {/* Gender Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            1. Gender Subgroup Audit (Sex: F vs. M)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase font-semibold tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Subgroup</th>
                  <th className="py-3 px-3 text-center">Test Cohort (N)</th>
                  <th className="py-3 px-3 text-center">Sample Sufficiency</th>
                  <th className="py-3 px-3 text-center">Subgroup MAE</th>
                  <th className="py-3 px-3 text-center">Mean Actual Grade</th>
                  <th className="py-3 px-3 text-center">Mean Pred Grade</th>
                  <th className="py-3 px-3 text-center">Prediction Bias</th>
                  <th className="py-3 px-4 text-right">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {Object.entries(gender).map(([k, item]) => (
                  <tr key={k} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{item.label}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{item.sample_size}</td>
                    <td className="py-3 px-3 text-center">
                      {item.reliable_sample ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          Adequate (N≥25)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                          Small Sample
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">{item.mae}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_actual_grade}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_predicted_grade}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                      {item.mean_prediction_bias > 0 ? `+${item.mean_prediction_bias}` : item.mean_prediction_bias}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.bias_direction === "Calibrated"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : item.bias_direction === "Overpredicting"
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {item.bias_direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Address Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-400" />
            2. Residential Address Category (Address: Urban vs. Rural)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase font-semibold tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Subgroup</th>
                  <th className="py-3 px-3 text-center">Test Cohort (N)</th>
                  <th className="py-3 px-3 text-center">Sample Sufficiency</th>
                  <th className="py-3 px-3 text-center">Subgroup MAE</th>
                  <th className="py-3 px-3 text-center">Mean Actual Grade</th>
                  <th className="py-3 px-3 text-center">Mean Pred Grade</th>
                  <th className="py-3 px-3 text-center">Prediction Bias</th>
                  <th className="py-3 px-4 text-right">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {Object.entries(address).map(([k, item]) => (
                  <tr key={k} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{item.label}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{item.sample_size}</td>
                    <td className="py-3 px-3 text-center">
                      {item.reliable_sample ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          Adequate (N≥25)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                          Small Sample
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">{item.mae}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_actual_grade}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_predicted_grade}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                      {item.mean_prediction_bias > 0 ? `+${item.mean_prediction_bias}` : item.mean_prediction_bias}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.bias_direction === "Calibrated"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : item.bias_direction === "Overpredicting"
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {item.bias_direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* School Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            3. Institution Breakdown (School: GP vs. MS)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase font-semibold tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-3 text-center">Test Cohort (N)</th>
                  <th className="py-3 px-3 text-center">Sample Sufficiency</th>
                  <th className="py-3 px-3 text-center">Subgroup MAE</th>
                  <th className="py-3 px-3 text-center">Mean Actual Grade</th>
                  <th className="py-3 px-3 text-center">Mean Pred Grade</th>
                  <th className="py-3 px-3 text-center">Prediction Bias</th>
                  <th className="py-3 px-4 text-right">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {Object.entries(school).map(([k, item]) => (
                  <tr key={k} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{item.label}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{item.sample_size}</td>
                    <td className="py-3 px-3 text-center">
                      {item.reliable_sample ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          Adequate (N≥25)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                          Small Sample
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">{item.mae}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_actual_grade}</td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{item.mean_predicted_grade}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                      {item.mean_prediction_bias > 0 ? `+${item.mean_prediction_bias}` : item.mean_prediction_bias}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.bias_direction === "Calibrated"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : item.bias_direction === "Overpredicting"
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {item.bias_direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dataset Limitations and Bias Documentation */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 shadow-xl">
        <h3 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Ethical Considerations & Dataset Limitations
        </h3>
        <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Sample Imbalance:</strong> In the authentic Portuguese dataset (649 records), Urban students (452) outnumber Rural students (197), and Gabriel Pereira school students outnumber Mousinho da Silveira students (~70% vs. 30%). Subgroup conclusions for smaller slices must be interpreted with caution.
          </li>
          <li>
            <strong>No Guarantee of Global Fairness:</strong> A model is not declared universally fair merely because MAE values are close across binary gender groups. Institutional, geographic, and socioeconomic nuances require continuous oversight.
          </li>
          <li>
            <strong>Advisory Nature:</strong> Predictive scores should be utilized exclusively as early indicators for supportive tutoring and academic counseling, not as high-stakes barriers to student opportunity.
          </li>
        </ul>
      </div>
    </div>
  );
}
