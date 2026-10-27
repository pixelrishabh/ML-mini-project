import React from "react";
import { Database, FileText, ExternalLink, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

export default function DatasetInfo({ metadata }) {
  const dataset = metadata?.dataset;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-2">
              <Database className="h-3.5 w-3.5" />
              <span>Authentic Repository Source</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              UCI Student Performance Dataset (Portuguese Course)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Curated from two Portuguese secondary schools (Gabriel Pereira and Mousinho da Silveira) during the 2005–2006 academic year.
            </p>
          </div>

          <a
            href="https://archive.ics.uci.edu/dataset/320/student+performance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-all self-start"
          >
            <span>UCI Machine Learning Repository</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl border border-border bg-secondary/20">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">Authentic Records</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">649</div>
            <div className="text-[10px] text-emerald-400 font-medium">100% Real Records (student-por.csv)</div>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-secondary/20">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">Features Recorded</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">33</div>
            <div className="text-[10px] text-muted-foreground">Academic, Demographic, Social</div>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-secondary/20">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">Target Variable</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">G3</div>
            <div className="text-[10px] text-muted-foreground">0 - 20 Portuguese Scale</div>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-secondary/20">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">Data Quality</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">0 Nulls</div>
            <div className="text-[10px] text-muted-foreground">0 Duplicates Detected</div>
          </div>
        </div>

        {/* Official Citation */}
        <div className="p-5 rounded-2xl border border-border bg-secondary/30 text-xs text-muted-foreground space-y-2">
          <div className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            Official Research Citation
          </div>
          <p className="font-mono text-[11px] text-foreground/90 bg-background/50 p-3 rounded-xl border border-border">
            P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student Performance. In A. Brito and J. Teixeira Eds., Proceedings of 5th FUture BUsiness TEChnology Conference (FUBUTEC 2008) pp. 5-12, Porto, Portugal, April, 2008, EUROSIS, ISBN 978-9077381-39-7.
          </p>
        </div>
      </div>

      {/* Feature Definitions Table */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" />
          Primary Feature Dictionary
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase font-semibold tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Valid Range / Values</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">studytime</td>
                <td className="py-3 px-3 text-muted-foreground">Ordinal (1-4)</td>
                <td className="py-3 px-3 text-foreground">1: &lt;2h, 2: 2-5h, 3: 5-10h, 4: &gt;10h</td>
                <td className="py-3 px-4 text-muted-foreground">Weekly individual study time outside class.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">failures</td>
                <td className="py-3 px-3 text-muted-foreground">Numeric (0-4)</td>
                <td className="py-3 px-3 text-foreground">0 to 4 past classes</td>
                <td className="py-3 px-4 text-muted-foreground">Number of previous subject class failures.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">absences</td>
                <td className="py-3 px-3 text-muted-foreground">Numeric (0-93)</td>
                <td className="py-3 px-3 text-foreground">0 to 93 days</td>
                <td className="py-3 px-4 text-muted-foreground">Total school session absences.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">Medu / Fedu</td>
                <td className="py-3 px-3 text-muted-foreground">Ordinal (0-4)</td>
                <td className="py-3 px-3 text-foreground">0: None, 1: 4th gr, 2: 5-9th, 3: Secondary, 4: Higher</td>
                <td className="py-3 px-4 text-muted-foreground">Mother&apos;s and Father&apos;s highest educational attainment.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">higher</td>
                <td className="py-3 px-3 text-muted-foreground">Binary</td>
                <td className="py-3 px-3 text-foreground">&quot;yes&quot;, &quot;no&quot;</td>
                <td className="py-3 px-4 text-muted-foreground">Aspiration to attend higher university education.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">schoolsup / famsup</td>
                <td className="py-3 px-3 text-muted-foreground">Binary</td>
                <td className="py-3 px-3 text-foreground">&quot;yes&quot;, &quot;no&quot;</td>
                <td className="py-3 px-4 text-muted-foreground">Extra educational support provided by school or family.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">Dalc / Walc</td>
                <td className="py-3 px-3 text-muted-foreground">Ordinal (1-5)</td>
                <td className="py-3 px-3 text-foreground">1: Very low to 5: Very high</td>
                <td className="py-3 px-4 text-muted-foreground">Workday and weekend alcohol consumption metrics.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-400">G1 / G2 (Optional)</td>
                <td className="py-3 px-3 text-muted-foreground">Numeric (0-20)</td>
                <td className="py-3 px-3 text-foreground">0 to 20 grade points</td>
                <td className="py-3 px-4 text-muted-foreground">First and second period exam marks (used only in Later Monitoring experiment).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">G3 (Target)</td>
                <td className="py-3 px-3 text-muted-foreground">Target Numeric (0-20)</td>
                <td className="py-3 px-3 text-foreground">0 to 20 grade points</td>
                <td className="py-3 px-4 text-foreground font-semibold">Final Portuguese course grade output target.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
