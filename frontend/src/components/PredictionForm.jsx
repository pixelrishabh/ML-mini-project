import React, { useState } from "react";
import {
  GraduationCap,
  Wand2,
  BookOpen,
  HeartHandshake,
  Activity,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Info
} from "lucide-react";

const PRESETS = {
  high: {
    student_name: "Inês Ferreira",
    age: 16,
    studytime: 3,
    failures: 0,
    absences: 2,
    higher: "yes",
    Medu: 4,
    Fedu: 4,
    Mjob: "teacher",
    Fjob: "services",
    famsize: "GT3",
    Pstatus: "T",
    reason: "course",
    guardian: "mother",
    traveltime: 1,
    schoolsup: "no",
    famsup: "yes",
    paid: "no",
    activities: "yes",
    nursery: "yes",
    internet: "yes",
    romantic: "no",
    famrel: 4,
    freetime: 3,
    goout: 2,
    Dalc: 1,
    Walc: 1,
    health: 4,
    sex: "F",
    address: "U",
    school: "GP",
    use_period_grades: false,
    G1: 15,
    G2: 16
  },
  average: {
    student_name: "Tiago Silva",
    age: 16,
    studytime: 2,
    failures: 0,
    absences: 6,
    higher: "yes",
    Medu: 2,
    Fedu: 2,
    Mjob: "services",
    Fjob: "other",
    famsize: "GT3",
    Pstatus: "T",
    reason: "reputation",
    guardian: "mother",
    traveltime: 1,
    schoolsup: "no",
    famsup: "yes",
    paid: "no",
    activities: "yes",
    nursery: "yes",
    internet: "yes",
    romantic: "no",
    famrel: 4,
    freetime: 3,
    goout: 3,
    Dalc: 1,
    Walc: 2,
    health: 4,
    sex: "M",
    address: "U",
    school: "GP",
    use_period_grades: false,
    G1: 12,
    G2: 12
  },
  struggling: {
    student_name: "Rodrigo Santos",
    age: 17,
    studytime: 1,
    failures: 2,
    absences: 14,
    higher: "no",
    Medu: 1,
    Fedu: 1,
    Mjob: "at_home",
    Fjob: "other",
    famsize: "LE3",
    Pstatus: "A",
    reason: "other",
    guardian: "father",
    traveltime: 3,
    schoolsup: "yes",
    famsup: "no",
    paid: "no",
    activities: "no",
    nursery: "no",
    internet: "no",
    romantic: "yes",
    famrel: 2,
    freetime: 4,
    goout: 4,
    Dalc: 2,
    Walc: 4,
    health: 2,
    sex: "M",
    address: "R",
    school: "MS",
    use_period_grades: false,
    G1: 8,
    G2: 7
  }
};

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(PRESETS.high);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const applyPreset = (key) => {
    setFormData(PRESETS[key]);
    setValidationErrors({});
  };

  const validate = () => {
    const errs = {};
    if (formData.studytime < 1 || formData.studytime > 4) {
      errs.studytime = "Weekly study time must be between 1 and 4.";
    }
    if (formData.failures < 0 || formData.failures > 4) {
      errs.failures = "Past class failures must be between 0 and 4.";
    }
    if (formData.absences < 0 || formData.absences > 93) {
      errs.absences = "Absences must be between 0 and 93.";
    }
    if (formData.age < 15 || formData.age > 25) {
      errs.age = "Student age must be between 15 and 25.";
    }
    if (formData.use_period_grades) {
      if (formData.G1 < 0 || formData.G1 > 20) {
        errs.G1 = "Midterm G1 grade must be between 0 and 20.";
      }
      if (formData.G2 < 0 || formData.G2 > 20) {
        errs.G2 = "Midterm G2 grade must be between 0 and 20.";
      }
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
      {/* Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            Student Academic & Behavioral Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Authentic UCI Student Performance features. Predicts Final Course Grade G3 (0 - 20 Portuguese Scale).
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Wand2 className="h-3.5 w-3.5 text-blue-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("high")}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            Honor Student
          </button>
          <button
            type="button"
            onClick={() => applyPreset("average")}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
          >
            Average
          </button>
          <button
            type="button"
            onClick={() => applyPreset("struggling")}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            At-Risk / Intervention
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Experiment Mode Banner */}
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Prediction Experiment Mode
            </div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              {formData.use_period_grades
                ? "Later Prediction (Includes Midterm G1 & G2 Grades)"
                : "Early Prediction (Pre-Midterm - Excludes G1 & G2 to Avoid Leakage)"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formData.use_period_grades
                ? "Uses midterm exam results for late-stage continuous monitoring."
                : "Primary experiment: strictly simulates early intervention before semester exams."}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-card px-3 py-1.5 rounded-xl border border-border">
            <input
              type="checkbox"
              name="use_period_grades"
              checked={formData.use_period_grades}
              onChange={handleChange}
              className="sr-only"
            />
            <span className="text-xs font-semibold text-foreground">Include G1 & G2:</span>
            {formData.use_period_grades ? (
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Enabled</span>
            ) : (
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">Disabled</span>
            )}
          </label>
        </div>

        {/* Optional Midterm Grades Input (when enabled) */}
        {formData.use_period_grades && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                First Period Grade G1 (0 - 20 scale)
              </label>
              <input
                type="number"
                name="G1"
                min="0"
                max="20"
                step="0.5"
                value={formData.G1}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors.G1 && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.G1}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Second Period Grade G2 (0 - 20 scale)
              </label>
              <input
                type="number"
                name="G2"
                min="0"
                max="20"
                step="0.5"
                value={formData.G2}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors.G2 && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.G2}</p>}
            </div>
          </div>
        )}

        {/* SECTION 1: Core Academic Habits */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border/40 pb-2 mb-4">
            <BookOpen className="h-4 w-4 text-blue-400" />
            1. Core Academic Indicators & Study Habits
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Student Name / Alias
              </label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Weekly Study Time */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Weekly Study Time (studytime)
              </label>
              <select
                name="studytime"
                value={formData.studytime}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1: &lt; 2 hours / week</option>
                <option value={2}>2: 2 to 5 hours / week</option>
                <option value={3}>3: 5 to 10 hours / week</option>
                <option value={4}>4: &gt; 10 hours / week</option>
              </select>
              {validationErrors.studytime && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.studytime}</p>
              )}
            </div>

            {/* Past Failures */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Past Failures (failures: 0 - 4)
              </label>
              <input
                type="number"
                name="failures"
                min="0"
                max="4"
                value={formData.failures}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.failures && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.failures}</p>
              )}
            </div>

            {/* School Absences */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Absences (absences: 0 - 93 days)
              </label>
              <input
                type="number"
                name="absences"
                min="0"
                max="93"
                value={formData.absences}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.absences && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.absences}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Family & Support Background */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border/40 pb-2 mb-4">
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
            2. Family Background & Educational Aspirations
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mother's Education */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Mother&apos;s Education (Medu)
              </label>
              <select
                name="Medu"
                value={formData.Medu}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Primary (4th Grade)</option>
                <option value={2}>2: 5th to 9th Grade</option>
                <option value={3}>3: Secondary Education</option>
                <option value={4}>4: Higher University Education</option>
              </select>
            </div>

            {/* Father's Education */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Father&apos;s Education (Fedu)
              </label>
              <select
                name="Fedu"
                value={formData.Fedu}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Primary (4th Grade)</option>
                <option value={2}>2: 5th to 9th Grade</option>
                <option value={3}>3: Secondary Education</option>
                <option value={4}>4: Higher University Education</option>
              </select>
            </div>

            {/* Higher Education Aspiration */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Aims for Higher Ed (higher)
              </label>
              <select
                name="higher"
                value={formData.higher}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="yes">Yes (Desires University)</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* School Support */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Extra School Support (schoolsup)
              </label>
              <select
                name="schoolsup"
                value={formData.schoolsup}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Social & Health Factors */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border/40 pb-2 mb-4">
            <Activity className="h-4 w-4 text-purple-400" />
            3. Lifestyle, Social Engagement & Well-being
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Family Relationship (1-5)
              </label>
              <input
                type="number"
                name="famrel"
                min="1"
                max="5"
                value={formData.famrel}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Free Time (1-5)
              </label>
              <input
                type="number"
                name="freetime"
                min="1"
                max="5"
                value={formData.freetime}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Going Out (1-5)
              </label>
              <input
                type="number"
                name="goout"
                min="1"
                max="5"
                value={formData.goout}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Workday Alcohol (1-5)
              </label>
              <input
                type="number"
                name="Dalc"
                min="1"
                max="5"
                value={formData.Dalc}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Weekend Alcohol (1-5)
              </label>
              <input
                type="number"
                name="Walc"
                min="1"
                max="5"
                value={formData.Walc}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Health Status (1-5)
              </label>
              <input
                type="number"
                name="health"
                min="1"
                max="5"
                value={formData.health}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Demographic Fairness Audit Inputs */}
        <div className="p-4 rounded-2xl border border-border bg-secondary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Demographic Audit Metadata
            </span>
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">
              Audited separately from ML feature weighting
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Gender (sex)
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="F">Female (F)</option>
                <option value="M">Male (M)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Home Address (address)
              </label>
              <select
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="U">Urban (U)</option>
                <option value="R">Rural (R)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Institution (school)
              </label>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="GP">Gabriel Pereira (GP)</option>
                <option value="MS">Mousinho da Silveira (MS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                <span>Running ML Inference & Local SHAP Analysis...</span>
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                <span>Predict Final Grade G3 & Compute SHAP Explanations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
