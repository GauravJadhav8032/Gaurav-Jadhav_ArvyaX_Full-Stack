import { useState } from 'react';
import { analyzeEntry } from '../services/api';

const AMBIENCE_ICONS = { forest: '🌲', ocean: '🌊', mountain: '⛰️' };
const AMBIENCE_COLORS = { forest: '#4ade80', ocean: '#38bdf8', mountain: '#a78bfa' };

const JournalCard = ({ entry, onAnalyzed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAnalyzed = !!entry.emotion;
  const icon = AMBIENCE_ICONS[entry.ambience] || '🌿';
  const color = AMBIENCE_COLORS[entry.ambience] || '#6ee7b7';
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeEntry(entry.text);
      // Merge LLM result back to the card so it shows immediately
      onAnalyzed(entry._id, res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-card" style={{ borderLeftColor: color }}>
      {/* Header */}
      <div className="card-header">
        <span className="ambience-badge" style={{ color }}>
          {icon} {entry.ambience}
        </span>
        <span className="entry-date">{date}</span>
      </div>

      {/* Journal Text */}
      <p className="entry-text">{entry.text}</p>

      {/* Analysis Section */}
      {isAnalyzed ? (
        <div className="analysis-section">
          <div className="analysis-header">✨ Emotion Analysis</div>
          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="analysis-label">Emotion</span>
              <span className="emotion-badge">{entry.emotion}</span>
            </div>
            <div className="analysis-item full-width">
              <span className="analysis-label">Summary</span>
              <p className="analysis-summary">{entry.summary}</p>
            </div>
            {entry.keywords?.length > 0 && (
              <div className="analysis-item full-width">
                <span className="analysis-label">Keywords</span>
                <div className="keywords-list">
                  {entry.keywords.map((kw, i) => (
                    <span key={i} className="keyword-chip">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-footer">
          {error && <span className="inline-error">{error}</span>}
          <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Analyzing…</> : '🧠 Analyze Emotion'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JournalCard;
