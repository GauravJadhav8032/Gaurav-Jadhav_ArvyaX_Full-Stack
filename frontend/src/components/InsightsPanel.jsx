const InsightsPanel = ({ insights, loading, userId }) => {
  if (!userId) {
    return (
      <div className="card insights-card muted">
        <h2 className="card-title">📊 Insights</h2>
        <p className="muted-hint">Enter a User ID to view your insights.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card insights-card">
        <h2 className="card-title">📊 Insights</h2>
        <div className="loading-state"><span className="spinner" /><p>Loading insights…</p></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="card insights-card muted">
        <h2 className="card-title">📊 Insights</h2>
        <p className="muted-hint">No insights available yet. Write and analyze some entries first.</p>
      </div>
    );
  }

  const { totalEntries, topEmotion, mostUsedAmbience, recentKeywords } = insights;

  const AMBIENCE_ICONS = { forest: '🌲', ocean: '🌊', mountain: '⛰️' };

  return (
    <div className="card insights-card">
      <h2 className="card-title">📊 Insights</h2>
      <div className="insights-grid">
        <div className="insight-tile">
          <span className="insight-value">{totalEntries ?? '–'}</span>
          <span className="insight-label">Total Entries</span>
        </div>
        <div className="insight-tile">
          <span className="insight-value emotion-text">{topEmotion || '–'}</span>
          <span className="insight-label">Top Emotion</span>
        </div>
        <div className="insight-tile">
          <span className="insight-value">
            {mostUsedAmbience
              ? `${AMBIENCE_ICONS[mostUsedAmbience] || ''} ${mostUsedAmbience}`
              : '–'}
          </span>
          <span className="insight-label">Favourite Ambience</span>
        </div>
        <div className="insight-tile keywords-tile">
          <span className="insight-label">Recent Keywords</span>
          {recentKeywords?.length ? (
            <div className="keywords-list">
              {recentKeywords.slice(0, 10).map((kw, i) => (
                <span key={i} className="keyword-chip">{kw}</span>
              ))}
            </div>
          ) : (
            <span className="no-data">No keywords yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
