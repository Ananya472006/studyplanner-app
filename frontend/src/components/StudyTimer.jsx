import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Award, Coffee, BookOpen } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { playTimerAlarmSound, playSuccessSound } from '../utils/audio';

const StudyTimer = ({ onTaskCompleted }) => {
  const {
    activeTimerTask,
    setActiveTimerTask,
    timerSecondsLeft,
    setTimerSecondsLeft,
    timerIsRunning,
    setTimerIsRunning,
    timerDuration,
    setTimerDuration,
    schedule,
    getTodayDateString,
    getDayName,
    history
  } = useStudy();

  const [customMinutes, setCustomMinutes] = useState(25);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1);
  const intervalRef = useRef(null);

  const todayStr = getTodayDateString();
  const dayName = getDayName(todayStr);
  const todaysTasks = schedule[dayName] || [];

  // Filter out already completed tasks from today's active study options
  const activeTodaysTasks = todaysTasks.map((task, index) => {
    const isCompleted = history.some(
      h => h.date === todayStr && h.subjectId === task.subjectId && h.isRevision === !!task.isRevision
    );
    return { ...task, isCompleted, originalIndex: index };
  });

  // Calculate SVG progress ring values
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = timerDuration > 0 ? ((timerDuration - timerSecondsLeft) / timerDuration) * 100 : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Handle countdown logic
  useEffect(() => {
    if (timerIsRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            // Timer expired!
            clearInterval(intervalRef.current);
            setTimerIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timerIsRunning]);

  const handleTimerComplete = () => {
    playTimerAlarmSound();
    
    if (activeTimerTask) {
      playSuccessSound();
      // Notify parent to trigger completion & rewards
      if (onTaskCompleted) {
        onTaskCompleted(activeTimerTask);
      }
    }
  };

  const startTimer = () => {
    if (!activeTimerTask && activeTodaysTasks.length > 0 && selectedTaskIndex >= 0) {
      const task = activeTodaysTasks[selectedTaskIndex];
      setActiveTimerTask({
        subjectId: task.subjectId,
        subjectName: task.subjectName,
        duration: task.duration,
        isRevision: !!task.isRevision,
        date: todayStr
      });
      setTimerSecondsLeft(timerDuration);
    } else if (!activeTimerTask && activeTodaysTasks.length === 0) {
      // Standalone timer without specific task
      setActiveTimerTask({
        subjectId: 'standalone',
        subjectName: 'Custom Study Session',
        duration: timerDuration / 3600,
        isRevision: false,
        date: todayStr
      });
      setTimerSecondsLeft(timerDuration);
    }
    setTimerIsRunning(true);
  };

  const pauseTimer = () => {
    setTimerIsRunning(false);
  };

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(timerDuration);
    setActiveTimerTask(null);
  };

  const setTimerPreset = (minutes) => {
    setTimerIsRunning(false);
    setTimerDuration(minutes * 60);
    setTimerSecondsLeft(minutes * 60);
    setCustomMinutes(minutes);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="glass-panel timer-container">
      <h2 className="section-title">
        <Clock size={20} /> Focus Timer
      </h2>

      {/* Preset Pickers */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className={`btn btn-secondary ${timerDuration === 1500 ? 'active' : ''}`} onClick={() => setTimerPreset(25)}>
          25m Pomodoro
        </button>
        <button className={`btn btn-secondary ${timerDuration === 3000 ? 'active' : ''}`} onClick={() => setTimerPreset(50)}>
          50m Session
        </button>
        <button className={`btn btn-secondary ${timerDuration === 300 ? 'active' : ''}`} onClick={() => setTimerPreset(5)}>
          5m Break
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
          <input 
            type="number" 
            value={customMinutes} 
            onChange={(e) => setCustomMinutes(Math.max(1, Number(e.target.value)))}
            style={{ width: '45px', border: 'none', background: 'transparent', color: '#fff', textAlign: 'center', fontSize: '0.9rem' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>min</span>
          <button className="btn btn-secondary btn-icon" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => setTimerPreset(customMinutes)}>
            Set
          </button>
        </div>
      </div>

      {/* Active Session Display */}
      {activeTimerTask ? (
        <div style={{ marginBottom: '0.5rem' }}>
          <span className="timer-task-name" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', color: '#c084fc', fontWeight: 'bold' }}>
            <BookOpen size={16} /> Studying: {activeTimerTask.subjectName} 
            {activeTimerTask.isRevision && <span style={{ color: '#f472b6', fontSize: '0.75rem' }}>(Revision)</span>}
          </span>
        </div>
      ) : (
        <div className="form-group" style={{ width: '100%', maxWidth: '280px', margin: '0 auto 1.5rem auto' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Link timer to today's task:</label>
          {activeTodaysTasks.length > 0 ? (
            <select 
              className="form-select" 
              value={selectedTaskIndex} 
              onChange={(e) => setSelectedTaskIndex(Number(e.target.value))}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="-1">-- Free Study (No Task) --</option>
              {activeTodaysTasks.map((task, idx) => (
                <option key={idx} value={idx} disabled={task.isCompleted}>
                  {task.subjectName} ({task.duration}h) {task.isCompleted ? '✓' : ''} {task.isRevision ? '[Rev]' : ''}
                </option>
              ))}
            </select>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No active tasks remaining today!</p>
          )}
        </div>
      )}

      {/* Circle countdown */}
      <div className="timer-ring-container">
        <svg className="timer-svg">
          <circle className="timer-bg-circle" cx="100" cy="100" r={radius} />
          <circle 
            className="timer-progress-circle" 
            cx="100" 
            cy="100" 
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke="url(#timerGrad)"
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--color-primary))" />
              <stop offset="100%" stopColor="hsl(var(--color-secondary))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="timer-time-display">
          {formatTime(timerSecondsLeft > 0 ? timerSecondsLeft : timerDuration)}
        </div>
      </div>

      {/* Buttons */}
      <div className="timer-controls">
        {timerIsRunning ? (
          <button className="btn btn-secondary btn-icon" style={{ width: '50px', height: '50px' }} onClick={pauseTimer}>
            <Pause size={24} />
          </button>
        ) : (
          <button className="btn btn-primary btn-icon" style={{ width: '50px', height: '50px' }} onClick={startTimer}>
            <Play size={24} fill="#fff" />
          </button>
        )}
        <button className="btn btn-secondary btn-icon" style={{ width: '50px', height: '50px' }} onClick={resetTimer}>
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default StudyTimer;
