import React, { useState } from 'react';
import { Award, Flame, Bell, CheckCircle, RefreshCw, Star, HelpCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import StudyTimer from './StudyTimer';

const Dashboard = ({ onTaskCompleted }) => {
  const {
    schedule,
    scheduleWarnings,
    history,
    streak,
    xp,
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    getTodayDateString,
    getDayName,
    toggleTaskCompletion,
    subjects
  } = useStudy();

  const todayStr = getTodayDateString();
  const todayDayName = getDayName(todayStr);
  const todaysTasks = schedule[todayDayName] || [];

  // --- Reminders System: Find incomplete tasks from the past 7 days ---
  const getReminders = () => {
    const reminders = [];
    const today = new Date();
    
    // Look back at the last 7 days (excluding today)
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      const checkDayName = getDayName(checkDateStr);
      
      // Sunday is revision day, check active study days Mon-Sat
      const checkDayTasks = schedule[checkDayName] || [];
      
      checkDayTasks.forEach(task => {
        // Check if this task was completed on that date
        const isCompleted = history.some(
          h => h.date === checkDateStr && h.subjectId === task.subjectId && h.isRevision === !!task.isRevision
        );
        
        if (!isCompleted) {
          reminders.push({
            date: checkDateStr,
            dayName: checkDayName,
            subjectId: task.subjectId,
            subjectName: task.subjectName,
            duration: task.duration,
            isRevision: !!task.isRevision
          });
        }
      });
    }
    return reminders;
  };

  const missedTasks = getReminders();

  const handleCheckboxChange = (dateStr, subjectId, isRevision, duration) => {
    const result = toggleTaskCompletion(dateStr, subjectId, isRevision, duration);
    if (result.completed && onTaskCompleted) {
      onTaskCompleted({
        subjectId,
        subjectName: subjects.find(s => s.id === subjectId)?.name || 'Subject',
        xpEarned: result.xpEarned,
        isRevision
      });
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Left Pane - Tasks & Reminders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Today's Tasks */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Today's Schedule</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {todayDayName}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {streak > 0 && (
              <div className="stat-pill streak-pill">
                <Flame size={16} fill="#fbbf24" stroke="none" />
                <span>{streak} Day Streak!</span>
              </div>
            )}
          </div>

          {/* Warnings */}
          {scheduleWarnings.length > 0 && (
            <div className="warning-box">
              <HelpCircle size={16} />
              <div>
                {scheduleWarnings.map((w, idx) => (
                  <p key={idx}>{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="task-list">
            {todaysTasks.length > 0 ? (
              todaysTasks.map((task, index) => {
                const isCompleted = history.some(
                  h => h.date === todayStr && h.subjectId === task.subjectId && h.isRevision === !!task.isRevision
                );

                return (
                  <div key={index} className={`task-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="task-left">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleCheckboxChange(todayStr, task.subjectId, task.isRevision, task.duration)}
                        />
                        <span className="checkbox-checkmark"></span>
                      </label>
                      <div className="task-details">
                        <span className="task-title">{task.subjectName}</span>
                        <div className="task-meta">
                          <span className={`difficulty-tag diff-${task.difficulty.toLowerCase()}`}>
                            {task.difficulty}
                          </span>
                          <span>•</span>
                          <span>{task.duration} hrs</span>
                          {task.isRevision && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#f472b6', fontWeight: 600 }}>Revision Day</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <p>No study tasks scheduled for today. Take a break or do some light reading!</p>
              </div>
            )}
          </div>
        </div>

        {/* Reminders / Missed Tasks */}
        {missedTasks.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid #f43f5e' }}>
            <h3 className="section-title" style={{ color: '#fb7185', border: 'none', padding: '0', marginBottom: '1rem' }}>
              <Bell size={18} /> Incomplete Tasks Reminders ({missedTasks.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You missed these study slots recently. Complete them now to earn your XP!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {missedTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="task-item" 
                  style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.03)', borderColor: 'rgba(244, 63, 94, 0.1)' }}
                >
                  <div className="task-left">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleCheckboxChange(task.date, task.subjectId, task.isRevision, task.duration)}
                      />
                      <span className="checkbox-checkmark" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}></span>
                    </label>
                    <div className="task-details">
                      <span className="task-title" style={{ fontSize: '0.95rem' }}>{task.subjectName}</span>
                      <div className="task-meta" style={{ fontSize: '0.7rem' }}>
                        <span style={{ color: '#fda4af' }}>{task.dayName} ({task.date.substring(5)})</span>
                        <span>•</span>
                        <span>{task.duration} hrs</span>
                        {task.isRevision && <span>• [Rev]</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Pane - Timer & Level Progression */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Level Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)' }}>
              <Award size={32} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Level {level} Scholar</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Total Experience: {xp} XP
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <span>Progress: {xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
            <span>Next Level</span>
          </div>
          <div className="xp-progress-bar-container">
            <div 
              className="xp-progress-fill" 
              style={{ width: `${(xpInCurrentLevel / xpNeededForNextLevel) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Focus Timer */}
        <StudyTimer onTaskCompleted={onTaskCompleted} />
      </div>
    </div>
  );
};

export default Dashboard;
