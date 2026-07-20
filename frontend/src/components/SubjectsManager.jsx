import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Book, Sliders, CheckCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const SubjectsManager = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    dailyBudget,
    setDailyBudget,
    compulsorySingleSubject,
    setCompulsorySingleSubject
  } = useStudy();

  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [preferredDaysCount, setPreferredDaysCount] = useState(2);
  const [editingId, setEditingId] = useState(null);

  const totalWeeklyHours = subjects.reduce((sum, s) => sum + Number(s.weeklyHours), 0);
  const capacity = dailyBudget * 6; // Mon-Sat active capacity

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      difficulty,
      weeklyHours: Number(weeklyHours),
      preferredDaysCount: Number(preferredDaysCount)
    };

    if (editingId) {
      updateSubject({ ...data, id: editingId });
      setEditingId(null);
    } else {
      addSubject(data);
    }

    setName('');
    setDifficulty('Medium');
    setWeeklyHours(4);
    setPreferredDaysCount(2);
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setName(sub.name);
    setDifficulty(sub.difficulty);
    setWeeklyHours(sub.weeklyHours);
    setPreferredDaysCount(sub.preferredDaysCount);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Settings & Add Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Global Planning Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="section-title">
            <Sliders size={18} /> Schedule Settings
          </h3>
          <div className="form-group">
            <label className="form-label">Daily Study Budget (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className="form-input"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Math.max(1, Number(e.target.value)))}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              How many hours max will you study in a day?
            </span>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            <label className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="compulsory-toggle">
              One Subject Per Day Only
            </label>
            <label className="checkbox-container">
              <input
                id="compulsory-toggle"
                type="checkbox"
                checked={compulsorySingleSubject}
                onChange={(e) => setCompulsorySingleSubject(e.target.checked)}
              />
              <span className="checkbox-checkmark"></span>
            </label>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            If checked, the planner will allocate at most one subject per study day.
          </p>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Weekly Hours Planned:</span>
              <span style={{ fontWeight: 'bold', color: totalWeeklyHours > capacity ? '#f87171' : '#34d399' }}>
                {totalWeeklyHours}h
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Weekly Maximum Capacity:</span>
              <span style={{ fontWeight: 'bold' }}>{capacity}h</span>
            </div>
          </div>
        </div>

        {/* Add/Edit Subject Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="section-title">
            <Book size={18} /> {editingId ? 'Edit Subject' : 'Add Subject'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Physics, Calculus, Python"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Hours</label>
              <input
                type="number"
                min="1"
                max="50"
                className="form-input"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Days Target</label>
              <input
                type="number"
                min="1"
                max="6"
                className="form-input"
                value={preferredDaysCount}
                onChange={(e) => setPreferredDaysCount(Math.max(1, Math.min(6, Number(e.target.value))))}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Split weekly hours across how many days? (1-6)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? 'Save Changes' : 'Add Subject'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setDifficulty('Medium');
                    setWeeklyHours(4);
                    setPreferredDaysCount(2);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Subjects List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="section-title">My Subjects ({subjects.length})</h3>
        {subjects.length > 0 ? (
          <div>
            {subjects.map((sub) => (
              <div key={sub.id} className="subject-card">
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{sub.name}</h4>
                  <div className="task-meta" style={{ marginTop: '0.25rem' }}>
                    <span className={`difficulty-tag diff-${sub.difficulty.toLowerCase()}`}>
                      {sub.difficulty}
                    </span>
                    <span>•</span>
                    <span>{sub.weeklyHours} hrs/week</span>
                    <span>•</span>
                    <span>{sub.preferredDaysCount} days/week</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(sub)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-secondary btn-icon" onClick={() => deleteSubject(sub.id)}>
                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Book size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No subjects added yet. Add your subjects to generate your study timetable!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsManager;
