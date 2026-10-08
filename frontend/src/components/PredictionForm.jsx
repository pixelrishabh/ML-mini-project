import React, { useState } from "react";
import { Calculator, Sparkles, Wand2, RefreshCw, GraduationCap, Activity, HeartHandshake, BookOpen } from "lucide-react";

const PRESETS = {
  high: {
    student_name: "Aarav Sharma",
    high_school_gpa: 9.2,
    entrance_exam_score: 92,
    course_load: 18,
    attendance_rate: 96,
    major: "Engineering",
    weekly_study_hours: 24,
    class_participation: 9,
    assignment_submission_rate: 98,
    extracurricular_hours: 6,
    daily_sleep_hours: 7.5,
    part_time_work_hours: 4,
    commute_time_minutes: 15,
    screen_time_hours: 2.5,
    family_income_level: "High",
  },
  average: {
    student_name: "Priya Patel",
    high_school_gpa: 7.4,
    entrance_exam_score: 75,
    course_load: 15,
    attendance_rate: 84,
    major: "Business",
    weekly_study_hours: 14,
    class_participation: 6,
    assignment_submission_rate: 86,
    extracurricular_hours: 5,
    daily_sleep_hours: 6.5,
    part_time_work_hours: 10,
    commute_time_minutes: 30,
    screen_time_hours: 4,
    family_income_level: "Middle",
  },
  low: {
    student_name: "Rohan Kumar",
    high_school_gpa: 5.2,
    entrance_exam_score: 54,
    course_load: 14,
    attendance_rate: 62,
    major: "Arts",
    weekly_study_hours: 6,
    class_participation: 3,
    assignment_submission_rate: 55,
    extracurricular_hours: 2,
    daily_sleep_hours: 5.0,
    part_time_work_hours: 24,
    commute_time_minutes: 55,
    screen_time_hours: 7,
    family_income_level: "Low",
  },
};

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(PRESETS.high);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyPreset = (presetKey) => {
    setFormData(PRESETS[presetKey]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            University Student Academic Profile (CGPA Scale: 0.0 - 10.0)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Input college academic credentials, semester credit load, study habits, and campus lifestyle indicators.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Wand2 className="h-3.5 w-3.5" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("high")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            University Scholar (High)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("average")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
          >
            Typical Undergraduate
          </button>
          <button
            type="button"
            onClick={() => applyPreset("low")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            Undergraduate At-Risk
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Identifier */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
            College Student Name / Enrollment ID
          </label>
          <input
            type="text"
            name="student_name"
            value={formData.student_name}
            onChange={handleChange}
            placeholder="e.g. Aarav Sharma (CS Year 2)"
            className="w-full rounded-xl border border-input bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            required
          />
        </div>

        {/* Section 1: Academic Factors */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-border/40 pb-2">
            <BookOpen className="h-4 w-4" /> University Academic Background
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                High School GPA / Prior GPA (0.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="10.0"
                name="high_school_gpa"
                value={formData.high_school_gpa}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                University Entrance Score (40 - 100)
              </label>
              <input
                type="number"
                step="0.1"
                min="40"
                max="100"
                name="entrance_exam_score"
                value={formData.entrance_exam_score}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Semester Credit Load (12 - 21 Credits)
              </label>
              <input
                type="number"
                step="1"
                min="12"
                max="21"
                name="course_load"
                value={formData.course_load}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Lecture Attendance Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="40"
                max="100"
                name="attendance_rate"
                value={formData.attendance_rate}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Academic Department / Major
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Engineering">Engineering & Computer Science</option>
                <option value="Business">Business & Management</option>
                <option value="Science">Natural Sciences & Math</option>
                <option value="Arts">Humanities & Arts</option>
                <option value="Social Science">Social Sciences & Law</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Study Habits & Campus Engagement */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Activity className="h-4 w-4" /> Study Habits & Campus Engagement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Weekly Self-Study Hours (0 - 45)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="45"
                name="weekly_study_hours"
                value={formData.weekly_study_hours}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Seminar/Lab Participation (1 - 10)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="10"
                name="class_participation"
                value={formData.class_participation}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Lab & Assignment Submission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="100"
                name="assignment_submission_rate"
                value={formData.assignment_submission_rate}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Clubs & Extracurriculars (Hrs/Wk)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                name="extracurricular_hours"
                value={formData.extracurricular_hours}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lifestyle & Socioeconomic Factors */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 border-b border-border/40 pb-2">
            <HeartHandshake className="h-4 w-4" /> Living & Socioeconomic Factors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Nightly Sleep (Hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="10"
                name="daily_sleep_hours"
                value={formData.daily_sleep_hours}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Part-Time Job/Internship (Hrs)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="35"
                name="part_time_work_hours"
                value={formData.part_time_work_hours}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Campus Commute (Mins)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                max="100"
                name="commute_time_minutes"
                value={formData.commute_time_minutes}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Leisure Screen Time (Hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="14"
                name="screen_time_hours"
                value={formData.screen_time_hours}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Socioeconomic Bracket
              </label>
              <select
                name="family_income_level"
                value={formData.family_income_level}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-secondary/20 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="High">High Income Bracket</option>
                <option value="Middle">Middle Income Bracket</option>
                <option value="Low">Low Income / Aid Eligible</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Predicting College CGPA (0.0 - 10.0 Scale)...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Predict College CGPA (0.0 - 10.0) & Save Entry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
