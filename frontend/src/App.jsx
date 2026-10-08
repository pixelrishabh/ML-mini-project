import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";
import PredictionsHistory from "./components/PredictionsHistory";
import { ThemeProvider } from "./context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

function MainApp() {
  const [loading, setLoading] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predictions`);
      if (res.ok) {
        const json = await res.json();
        setHistoryRecords(json.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch predictions history:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePredictSubmit = async (formData) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Prediction request failed.");
      }

      setCurrentPrediction(json.data);
      fetchHistory();
    } catch (err) {
      setErrorMessage(err.message || "Failed to generate prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/predictions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistoryRecords((prev) => prev.filter((item) => (item._id || item.id) !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Hero />

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-400 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <PredictionForm onSubmit={handlePredictSubmit} loading={loading} />

        {currentPrediction && <ResultCard prediction={currentPrediction} />}

        <PredictionsHistory
          records={historyRecords}
          onDelete={handleDeleteRecord}
          onRefresh={fetchHistory}
          loading={historyLoading}
        />
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Student Performance Predictor • Full MERN Stack App (MongoDB + Express + React + Node.js)
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
