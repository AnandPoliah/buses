import React, { useState, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import "./AIInsight.css";

const AIInsights = () => {
  const { bookings, buses } = useData();

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // --- 1. DATA PREPARATION (The Context for the AI) ---
  const stats = useMemo(() => {
    // Calculate Total Revenue
    const totalRevenue = bookings.reduce(
      (acc, b) => acc + (b.status !== "Cancelled" ? b.totalFare : 0),
      0
    );

    // Count Cancellations
    const cancelledCount = bookings.filter(
      (b) => b.status === "Cancelled"
    ).length;

    // Determine Top Route (Simplified logic for prompt)
    // In a real scenario, you'd aggregate grouped bookings to find the max
    const topRoute = "Chennai - Bangalore";

    return {
      revenue: totalRevenue,
      bookings: bookings.length,
      cancelled: cancelledCount,
      busesActive: buses.length,
      topRoute: topRoute,
    };
  }, [bookings, buses]);

  // --- 2. THE REAL API CALL (Google Gemini) ---
  const generateInsight = async () => {
    setLoading(true);
    setInsight(null);

    // A. PREPARE THE PROMPT
    // We inject the live calculated stats into the text prompt
    const prompt = `
      Act as a Senior Business Analyst for a Bus Transport Company. 
      Here is our current dashboard data:
      
      - Total Revenue: ₹${stats.revenue}
      - Total Bookings: ${stats.bookings}
      - Cancelled Tickets: ${stats.cancelled}
      - Active Buses: ${stats.busesActive}
      - Top Performing Route: ${stats.topRoute}
      
      Based on this data, provide a professional executive summary with exactly 3 sections:
      1. **Financial Assessment:** Analyze the revenue health.
      2. **Operational Flag:** Point out any concern regarding cancellations or bus utilization.
      3. **Strategic Action:** Suggest one specific marketing or operational move to improve profit.
      
      Keep the tone professional, concise, and insightful. Do not use markdown headers (#), just bolding (**).
    `;

    try {
      // B. CALL GOOGLE GEMINI API
      // ⚠️ TODO: Replace this string with your actual API Key from Google AI Studio
      const API_KEY = "AIzaSyDE2mo7LjfBuRxoE6ZMLH3UAsCydg_k4UQ";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // C. HANDLE ERRORS
      if (data.error) {
        throw new Error(data.error.message);
      }

      // D. EXTRACT ANSWER
      const aiText = data.candidates[0].content.parts[0].text;

      setInsight(aiText);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("AI Error:", error);
      setInsight(
        `Error: ${error.message}. \n\nPlease ensure you have replaced 'YOUR_GEMINI_API_KEY' in the code with a valid key.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="title-group">
          <span className="material-symbols-outlined sparkle-icon">
            auto_awesome
          </span>
          <h2>AI Business Intelligence</h2>
        </div>
        <p className="subtitle">
          Real-time analysis of your booking performance.
        </p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="stats-grid-ai">
        <div className="stat-card-ai">
          <label>Total Revenue</label>
          <h3>₹{stats.revenue.toLocaleString()}</h3>
        </div>
        <div className="stat-card-ai">
          <label>Total Bookings</label>
          <h3>{stats.bookings}</h3>
        </div>
        <div className="stat-card-ai warning">
          <label>Cancellations</label>
          <h3>{stats.cancelled}</h3>
        </div>
      </div>

      {/* AI CONSOLE */}
      <div className="ai-console">
        <div className="console-header">
          <span>AI Analyst</span>
          {lastUpdated && (
            <span className="last-updated">Updated: {lastUpdated}</span>
          )}
        </div>

        <div className="console-body">
          {/* 1. Empty State */}
          {!insight && !loading && (
            <div className="empty-state-ai">
              <span className="material-symbols-outlined">psychology</span>
              <p>Ready to analyze your data. Click generate to start.</p>
            </div>
          )}

          {/* 2. Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="pulse-ring"></div>
              <p>Analyzing {stats.bookings} records...</p>
            </div>
          )}

          {/* 3. Result State */}
          {insight && (
            <div className="ai-response">
              {/* Basic parser to handle bold markdown for better display */}
              {insight.split("\n").map((line, i) => (
                <p
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: line.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>"
                    ),
                  }}
                ></p>
              ))}
            </div>
          )}
        </div>

        <div className="console-footer">
          <button
            className="btn-generate"
            onClick={generateInsight}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Generate New Insight"}
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
