import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";
import PredictionsHistory from "./components/PredictionsHistory";
import ModelDiagnostics from "./components/ModelDiagnostics";
import FairnessAudit from "./components/FairnessAudit";
import DatasetInfo from "./components/DatasetInfo";
import { ThemeProvider } from "./context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

function MainApp() {
  const [activeTab, setActiveTab] = useState("studio");
  const [loading, setLoading] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modelMetadata, setModelMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predictions`);
      if (res.ok) {
        const json = await res.json();
        setHistoryRecords(json.data || []);
        if (json.storage) setStorageStatus(json.storage);
      }
    } catch (err) {
      console.warn("Failed to fetch predictions history:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMetadata = async () => {
    setMetadataLoading(true);
    try {
      const res = await fetch(`${API_BASE}/model/metadata`);
      if (res.ok) {
        const json = await res.json();
        setModelMetadata(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch model metadata:", err.message);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchMetadata();
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
      if (json.storage) setStorageStatus(json.storage);
      fetchHistory();
      setActiveTab("studio");
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
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} storage={storageStatus} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Hero />

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-400 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Studio Tab View */}
        {activeTab === "studio" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <PredictionForm onSubmit={handlePredictSubmit} loading={loading} />

            {currentPrediction && <ResultCard prediction={currentPrediction} />}

            <PredictionsHistory
              records={historyRecords}
              onDelete={handleDeleteRecord}
              onRefresh={fetchHistory}
              loading={historyLoading}
              storage={storageStatus}
            />
          </div>
        )}

        {/* Diagnostics & Metrics Tab View */}
        {activeTab === "diagnostics" && (
          <ModelDiagnostics metadata={modelMetadata} loading={metadataLoading} />
        )}

        {/* Fairness Audit Tab View */}
        {activeTab === "fairness" && (
          <FairnessAudit metadata={modelMetadata} />
        )}

        {/* Dataset Info Tab View */}
        {activeTab === "dataset" && (
          <DatasetInfo metadata={modelMetadata} />
        )}
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Student Performance Analysis &amp; Prediction System • UCI Machine Learning Dataset • Full MERN Stack &amp; Python ML Architecture
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
