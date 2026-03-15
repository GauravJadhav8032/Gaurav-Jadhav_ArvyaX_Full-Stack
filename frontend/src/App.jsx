import { useState, useEffect, useCallback } from 'react';
import JournalForm from './components/JournalForm';
import JournalList from './components/JournalList';
import InsightsPanel from './components/InsightsPanel';
import { getJournalEntries, getInsights } from './services/api';

const App = () => {
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ─── Fetch entries and insights ───────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    if (!userId.trim()) return;
    setEntriesLoading(true);
    try {
      const res = await getJournalEntries(userId.trim());
      setEntries(res.data || []);
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, [userId]);

  const fetchInsights = useCallback(async () => {
    if (!userId.trim()) return;
    setInsightsLoading(true);
    try {
      const res = await getInsights(userId.trim());
      setInsights(res.data || null);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, [userId]);

  // Refetch when userId changes (debounced with useEffect)
  useEffect(() => {
    if (!userId.trim()) {
      setEntries([]);
      setInsights(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchEntries();
      fetchInsights();
    }, 500);
    return () => clearTimeout(timer);
  }, [userId, fetchEntries, fetchInsights]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /** Called after a new entry is created – refresh list + insights */
  const handleEntryCreated = () => {
    fetchEntries();
    fetchInsights();
  };

  /**
   * Called when JournalCard successfully analyses an entry.
   * Merges analysis result into the entry in local state (no refetch needed).
   */
  const handleAnalyzed = (entryId, analysis) => {
    setEntries((prev) =>
      prev.map((e) => (e._id === entryId ? { ...e, ...analysis } : e))
    );
    fetchInsights(); // Refresh insights as a new emotion may now exist
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <div>
              <h1 className="app-title">NatureJournal</h1>
              <p className="app-subtitle">AI-Powered Reflection & Emotional Insights</p>
            </div>
          </div>
          {/* User ID input */}
          <div className="user-id-area">
            <label className="user-id-label" htmlFor="userId">User ID</label>
            <input
              id="userId"
              className="user-id-input"
              type="text"
              placeholder="Enter your user ID…"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="app-main">
        <div className="content-grid">
          {/* Left column */}
          <div className="col-left">
            <JournalForm userId={userId} onEntryCreated={handleEntryCreated} />
            <InsightsPanel insights={insights} loading={insightsLoading} userId={userId} />
          </div>
          {/* Right column */}
          <div className="col-right">
            <JournalList
              entries={entries}
              loading={entriesLoading}
              onAnalyzed={handleAnalyzed}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p>AI-Assisted Journal System · Built with Node.js, MongoDB & OpenAI</p>
      </footer>
    </div>
  );
};

export default App;
