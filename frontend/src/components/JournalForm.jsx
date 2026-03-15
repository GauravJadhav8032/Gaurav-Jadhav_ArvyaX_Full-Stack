import { useState } from 'react';
import { createJournalEntry } from '../services/api';

const AMBIENCE_OPTIONS = [
  { value: 'forest', label: '🌲 Forest', color: '#4ade80' },
  { value: 'ocean', label: '🌊 Ocean', color: '#38bdf8' },
  { value: 'mountain', label: '⛰️ Mountain', color: '#a78bfa' },
];

const JournalForm = ({ userId, onEntryCreated }) => {
  const [ambience, setAmbience] = useState('forest');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a User ID at the top of the page.');
      return;
    }
    if (!text.trim()) {
      setError('Please write your journal entry.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createJournalEntry({ userId: userId.trim(), ambience, text: text.trim() });
      setText('');
      setSuccess(true);
      onEntryCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedAmbience = AMBIENCE_OPTIONS.find((o) => o.value === ambience);

  return (
    <div className="card">
      <h2 className="card-title">📝 New Journal Entry</h2>
      <form onSubmit={handleSubmit} className="journal-form">
        {/* Ambience */}
        <div className="field-group">
          <label className="field-label">Session Ambience</label>
          <div className="ambience-pills">
            {AMBIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`ambience-pill ${ambience === opt.value ? 'active' : ''}`}
                style={ambience === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                onClick={() => setAmbience(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div className="field-group">
          <label className="field-label">
            Your Reflection
            <span className="char-count">{text.length}/5000</span>
          </label>
          <textarea
            className="journal-textarea"
            placeholder={`Describe your ${selectedAmbience?.label.split(' ')[1] || 'nature'} session experience…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={5000}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">✅ Entry saved successfully!</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : '💾 Save Entry'}
        </button>
      </form>
    </div>
  );
};

export default JournalForm;
