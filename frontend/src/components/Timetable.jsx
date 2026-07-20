import React, { useState } from 'react';
import { Calendar, AlertTriangle, BookOpen, ArrowRight, RefreshCw, GripVertical } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = () => {
  const { schedule, scheduleWarnings, moveTask, regenerateSchedule } = useStudy();
  const [movingTask, setMovingTask] = useState(null); // { fromDay, taskIndex, task }

  const handleMoveClick = (fromDay, taskIndex, task) => {
    if (movingTask && movingTask.fromDay === fromDay && movingTask.taskIndex === taskIndex) {
      // Clicking the same task again cancels the move
      setMovingTask(null);
    } else {
      setMovingTask({ fromDay, taskIndex, task });
    }
  };

  const handleDayTargetClick = (toDay) => {
    if (!movingTask) return;
    if (toDay === movingTask.fromDay) {
      setMovingTask(null);
      return;
    }
    moveTask(movingTask.fromDay, movingTask.taskIndex, toDay);
    setMovingTask(null);
  };

  const handleRegenerate = () => {
    if (window.confirm('This will reset your entire weekly timetable based on your current subjects and settings. Any manual moves will be lost. Continue?')) {
      regenerateSchedule();
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Weekly Study Timetable</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Click the <strong>arrow icon</strong> on any task, then click a target day to move it. Sunday is reserved for revision.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleRegenerate} style={{ gap: '0.4rem' }}>
          <RefreshCw size={16} /> Regenerate Timetable
        </button>
      </div>

      {/* Move instruction banner */}
      {movingTask && (
        <div style={{
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          color: '#c084fc',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'modal-enter 0.2s ease'
        }}>
          <ArrowRight size={16} />
          Moving <strong>{movingTask.task.subjectName}</strong> from <strong>{movingTask.fromDay}</strong> — now click a target day below to place it there.
          <button 
            onClick={() => setMovingTask(null)} 
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      {scheduleWarnings.length > 0 && (
        <div className="warning-box">
          <AlertTriangle size={16} />
          <div>
            {scheduleWarnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      <div className="timetable-grid">
        {ALL_DAYS.map((day) => {
          const slots = schedule[day] || [];
          const isSunday = day === 'Sunday';
          const isTargetCandidate = movingTask && movingTask.fromDay !== day;

          return (
            <div 
              key={day} 
              className="day-column"
              onClick={() => { if (isTargetCandidate) handleDayTargetClick(day); }}
              style={{
                cursor: isTargetCandidate ? 'pointer' : 'default',
                border: isTargetCandidate 
                  ? '2px dashed rgba(168, 85, 247, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.04)',
                background: isTargetCandidate 
                  ? 'rgba(168, 85, 247, 0.05)' 
                  : 'rgba(255, 255, 255, 0.015)',
                transition: 'all 0.2s ease'
              }}
            >
              <div className={`day-header ${isSunday ? 'sunday' : ''}`}>
                {day}
                {isTargetCandidate && (
                  <span style={{ fontSize: '0.65rem', display: 'block', color: '#c084fc', fontWeight: 400 }}>
                    ↓ Drop here
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {slots.length > 0 ? (
                  slots.map((slot, index) => {
                    const isBeingMoved = movingTask && movingTask.fromDay === day && movingTask.taskIndex === index;

                    return (
                      <div 
                        key={index} 
                        className="time-slot-card"
                        style={{
                          ...(isSunday 
                            ? { borderLeft: '3px solid #f43f5e', background: 'rgba(244, 63, 94, 0.05)' }
                            : slot.difficulty === 'Hard'
                              ? { borderLeft: '3px solid #ef4444' }
                              : slot.difficulty === 'Medium'
                                ? { borderLeft: '3px solid #f59e0b' }
                                : { borderLeft: '3px solid #10b981' }
                          ),
                          ...(isBeingMoved ? { 
                            outline: '2px solid #a855f7', 
                            outlineOffset: '1px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            transform: 'scale(1.03)'
                          } : {})
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="slot-name">{slot.subjectName}</div>
                          <button
                            title={`Move ${slot.subjectName} to another day`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveClick(day, index, slot);
                            }}
                            style={{
                              background: isBeingMoved ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)',
                              border: isBeingMoved ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                              color: isBeingMoved ? '#c084fc' : 'var(--text-secondary)',
                              borderRadius: '6px',
                              padding: '0.15rem 0.25rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <ArrowRight size={12} />
                          </button>
                        </div>
                        <div className="slot-dur">
                          <BookOpen size={12} />
                          <span>{slot.duration} hrs</span>
                          {slot.isRevision && (
                            <span style={{ color: '#f472b6', fontWeight: 600, fontSize: '0.65rem', marginLeft: 'auto' }}>
                              Revision
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      height: '100%', minHeight: '80px', color: 'var(--text-muted)', fontSize: '0.75rem', 
                      border: isTargetCandidate ? 'none' : '1px dashed rgba(255,255,255,0.05)', 
                      borderRadius: '10px' 
                    }}
                  >
                    {isTargetCandidate ? '↓ Drop here' : 'Rest Day'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timetable;
