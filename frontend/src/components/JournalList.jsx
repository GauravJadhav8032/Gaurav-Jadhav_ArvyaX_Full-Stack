import JournalCard from './JournalCard';

const JournalList = ({ entries, loading, onAnalyzed }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">
          <span className="spinner-lg" />
          <p>Loading your entries…</p>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="card empty-state">
        <span className="empty-icon">📖</span>
        <p>No journal entries yet.</p>
        <p className="empty-hint">Write your first reflection above.</p>
      </div>
    );
  }

  return (
    <div className="journal-list">
      <h2 className="section-title">📚 Journal History ({entries.length})</h2>
      {entries.map((entry) => (
        <JournalCard key={entry._id} entry={entry} onAnalyzed={onAnalyzed} />
      ))}
    </div>
  );
};

export default JournalList;
