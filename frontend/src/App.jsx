import React, { useState, useEffect, useRef } from 'react';
import { Layout, Calendar, BookOpen, Clock, Settings, Flame, Award, ShieldAlert, LogOut } from 'lucide-react';
import { StudyProvider, useStudy } from './context/StudyContext';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import SubjectsManager from './components/SubjectsManager';
import RewardCelebration from './components/RewardCelebration';
import Auth from './components/Auth';
import './App.css';

const AppContent = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [celebration, setCelebration] = useState({
    isOpen: false,
    xpEarned: 0,
    message: '',
    levelUp: false,
    newLevel: 1,
    streakMilestone: false,
    streak: 0
  });

  const { level, xp, streak, token, user, logout } = useStudy();
  
  // Track level changes for celebration
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setCelebration({
        isOpen: true,
        xpEarned: 100, // Level up bonus
        message: `Outstanding! You have reached level ${level}!`,
        levelUp: true,
        newLevel: level,
        streakMilestone: false,
        streak: streak
      });
    }
    prevLevelRef.current = level;
  }, [level, streak]);

  const handleTaskCompleted = (taskDetails) => {
    // If it didn't trigger a level up, trigger standard reward celebration
    setCelebration({
      isOpen: true,
      xpEarned: taskDetails.xpEarned || 20,
      message: taskDetails.isRevision 
        ? "Excellent revision session! You've consolidated your knowledge." 
        : `Successfully completed ${taskDetails.subjectName}!`,
      levelUp: false,
      newLevel: level,
      streakMilestone: streak > 0 && streak % 3 === 0, // Celebrate every 3 days streak
      streak: streak
    });
  };

  // Redirect to Authentication if not logged in
  if (!token) {
    return <Auth />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onTaskCompleted={handleTaskCompleted} />;
      case 'timetable':
        return <Timetable />;
      case 'subjects':
        return <SubjectsManager />;
      default:
        return <Dashboard onTaskCompleted={handleTaskCompleted} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="glass-panel header-bar">
        <div className="brand-section">
          <span className="brand-logo">⚡</span>
          <h1 className="brand-title">StudyQuest</h1>
        </div>

        <div className="gamification-status">
          {user && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              Hi, <strong>{user.username}</strong>
            </span>
          )}
          <div className="stat-pill xp-pill">
            <Award size={16} color="#c084fc" />
            <span>{xp} XP</span>
            <span className="level-badge">LVL {level}</span>
          </div>
          {streak > 0 && (
            <div className="stat-pill streak-pill">
              <Flame size={16} fill="#fbbf24" stroke="none" />
              <span>{streak} Streak</span>
            </div>
          )}
          <button 
            onClick={logout}
            title="Log Out"
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fb7185',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginLeft: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.22)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Desktop navigation tabs */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <Clock size={16} /> Today's Focus
        </button>
        <button 
          className={`nav-tab ${currentTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setCurrentTab('timetable')}
        >
          <Calendar size={16} /> Weekly Timetable
        </button>
        <button 
          className={`nav-tab ${currentTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setCurrentTab('subjects')}
        >
          <BookOpen size={16} /> Study Settings
        </button>
      </nav>

      {/* Main View Area */}
      <main style={{ minHeight: '60vh' }}>
        {renderActiveView()}
      </main>

      {/* Bottom PWA Navigation Bar for Mobile */}
      <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <Clock />
          <span>Focus</span>
        </button>
        <button 
          className={`mobile-nav-item ${currentTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setCurrentTab('timetable')}
        >
          <Calendar />
          <span>Timetable</span>
        </button>
        <button 
          className={`mobile-nav-item ${currentTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setCurrentTab('subjects')}
        >
          <BookOpen />
          <span>Subjects</span>
        </button>
      </nav>

      {/* Reward modal overlay */}
      <RewardCelebration 
        reward={celebration} 
        onClose={() => setCelebration(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}

export default App;
