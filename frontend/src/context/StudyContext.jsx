import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateSchedule } from '../utils/scheduler';

const StudyContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  // --- Auth State ---
  const [token, setToken] = useState(() => {
    return localStorage.getItem('study_quest_token') || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('study_quest_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Core Configuration ---
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('study_subjects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Mathematics', difficulty: 'Hard', weeklyHours: 6, preferredDaysCount: 3 },
      { id: '2', name: 'Physics', difficulty: 'Hard', weeklyHours: 4, preferredDaysCount: 2 },
      { id: '3', name: 'English Literature', difficulty: 'Easy', weeklyHours: 2, preferredDaysCount: 2 },
      { id: '4', name: 'History', difficulty: 'Medium', weeklyHours: 3, preferredDaysCount: 2 }
    ];
  });

  const [dailyBudget, setDailyBudget] = useState(() => {
    const saved = localStorage.getItem('study_daily_budget');
    return saved ? Number(saved) : 3;
  });

  const [compulsorySingleSubject, setCompulsorySingleSubject] = useState(() => {
    const saved = localStorage.getItem('study_compulsory_single');
    return saved ? JSON.parse(saved) : false;
  });

  // --- Schedule ---
  const [schedule, setSchedule] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [scheduleWarnings, setScheduleWarnings] = useState([]);

  // --- Gamification & History ---
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('study_xp');
    return saved ? Number(saved) : 0;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('study_streak');
    return saved ? Number(saved) : 0;
  });

  const [lastActiveDate, setLastActiveDate] = useState(() => {
    return localStorage.getItem('study_last_active_date') || '';
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('study_history');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Active Timer State ---
  const [activeTimerTask, setActiveTimerTask] = useState(null); // { subjectId, subjectName, duration, isRevision, date }
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(1500); // 25 minutes default

  // --- Load User Data from Database ---
  const loadDataFromServer = async (authToken) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/load`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}` 
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Update state and local storage with database values
        if (data.subjects) setSubjects(data.subjects);
        if (data.dailyBudget) setDailyBudget(data.dailyBudget);
        setCompulsorySingleSubject(!!data.compulsorySingleSubject);
        setXp(data.xp || 0);
        setStreak(data.streak || 0);
        setLastActiveDate(data.lastActiveDate || '');
        if (data.history) setHistory(data.history);

        console.log('Loaded data from database successfully');
      } else {
        console.warn('Failed to load user data from server');
      }
    } catch (err) {
      console.warn('Error loading data from server:', err);
    }
  };

  // --- Load database data on mount if token exists ---
  useEffect(() => {
    if (token) {
      loadDataFromServer(token);
    }
  }, [token]);

  // --- Trigger schedule generation when inputs change ---
  useEffect(() => {
    const result = generateSchedule(subjects, dailyBudget, compulsorySingleSubject);
    setSchedule(result.schedule);
    setScheduleWarnings(result.warnings);
    localStorage.setItem('study_subjects', JSON.stringify(subjects));
    localStorage.setItem('study_daily_budget', dailyBudget.toString());
    localStorage.setItem('study_compulsory_single', JSON.stringify(compulsorySingleSubject));
  }, [subjects, dailyBudget, compulsorySingleSubject]);

  // --- Sync gamification data to localStorage ---
  useEffect(() => {
    localStorage.setItem('study_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('study_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('study_last_active_date', lastActiveDate);
  }, [lastActiveDate]);

  useEffect(() => {
    localStorage.setItem('study_history', JSON.stringify(history));
  }, [history]);

  // --- Auto Sync to MySQL backend (Debounced) ---
  useEffect(() => {
    if (!token) return;

    const delayDebounceFn = setTimeout(() => {
      syncWithBackend(token);
    }, 1000); // Save to server 1 second after changes stop

    return () => clearTimeout(delayDebounceFn);
  }, [subjects, dailyBudget, compulsorySingleSubject, xp, streak, lastActiveDate, history, token]);

  // --- Level Calculation ---
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpNeededForNextLevel = 100;

  // --- Date Helpers ---
  const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    const options = { weekday: 'long' };
    return d.toLocaleDateString('en-US', options); // e.g. "Monday"
  };

  // --- Actions ---
  const addSubject = (subject) => {
    const newSub = {
      ...subject,
      id: Date.now().toString()
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (updatedSub) => {
    setSubjects(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const toggleTaskCompletion = (dateStr, subjectId, isRevision = false, taskDuration = 1) => {
    const today = getTodayDateString();
    
    // Find existing completion entry
    const existingIndex = history.findIndex(
      h => h.date === dateStr && h.subjectId === subjectId && h.isRevision === !!isRevision
    );

    let xpEarned = 0;
    let completed = false;

    if (existingIndex > -1) {
      // Toggle to incomplete
      const newHistory = [...history];
      newHistory.splice(existingIndex, 1);
      setHistory(newHistory);
      
      // Subtract XP (cap at 0)
      const subXp = isRevision ? 15 : Math.round(taskDuration * 20);
      setXp(prev => Math.max(0, prev - subXp));
      completed = false;
    } else {
      // Toggle to complete
      const newEntry = {
        date: dateStr,
        subjectId,
        completed: true,
        hoursCompleted: taskDuration,
        isRevision: !!isRevision,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, newEntry]);
      
      // Calculate XP
      xpEarned = isRevision ? 15 : Math.round(taskDuration * 20); // 20 XP per hour, 15 XP for revision
      setXp(prev => prev + xpEarned);
      completed = true;

      // Update streaks
      updateStreaksOnCompletion(dateStr);
    }

    return { completed, xpEarned };
  };

  const updateStreaksOnCompletion = (dateStr) => {
    const today = getTodayDateString();
    if (dateStr !== today) return; // Streaks only increment when completing today's tasks

    // Check if all today's tasks are completed
    const dayName = getDayName(today);
    const todaysTasks = schedule[dayName] || [];
    if (todaysTasks.length === 0) return;

    // Get number of completed tasks today
    const completedToday = history.filter(h => h.date === today).length;
    // Note: since this function runs inside the toggle that just added one task,
    // let's check if the total completed matches the schedule length
    if (completedToday + 1 >= todaysTasks.length) {
      if (lastActiveDate !== today) {
        // Check if yesterday was completed to continue streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayStr || streak === 0) {
          setStreak(prev => prev + 1);
        } else if (lastActiveDate !== today) {
          // Missed a day, reset streak to 1
          setStreak(1);
        }
        setLastActiveDate(today);
      }
    }
  };

  // Check streaks on mount (e.g. check if a day was missed)
  useEffect(() => {
    const today = getTodayDateString();
    if (lastActiveDate && lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActiveDate !== yesterdayStr && lastActiveDate !== today) {
        // Missed day, reset streak to 0
        setStreak(0);
      }
    }
  }, [lastActiveDate]);

  // --- Syncing with Backend ---
  const syncWithBackend = async (authToken) => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return false;

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          subjects,
          dailyBudget,
          compulsorySingleSubject,
          xp,
          streak,
          lastActiveDate,
          history
        })
      });
      if (response.ok) {
        console.log('Synced with backend successfully');
        return true;
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    }
    return false;
  };

  // --- Auth Actions ---
  const login = async (username, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      
      localStorage.setItem('study_quest_token', data.token);
      localStorage.setItem('study_quest_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      return { success: true };
    } catch (err) {
      console.error('Login request error:', err);
      return { success: false, error: 'Could not connect to database server. Please check that the server is running.' };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      localStorage.setItem('study_quest_token', data.token);
      localStorage.setItem('study_quest_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Immediately push existing local data to server for the new user profile
      await syncWithBackend(data.token);
      
      return { success: true };
    } catch (err) {
      console.error('Registration request error:', err);
      return { success: false, error: 'Could not connect to database server. Please check that the server is running.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('study_quest_token');
    localStorage.removeItem('study_quest_user');
    setToken(null);
    setUser(null);

    // Reset settings to default values upon logout
    setSubjects([
      { id: '1', name: 'Mathematics', difficulty: 'Hard', weeklyHours: 6, preferredDaysCount: 3 },
      { id: '2', name: 'Physics', difficulty: 'Hard', weeklyHours: 4, preferredDaysCount: 2 },
      { id: '3', name: 'English Literature', difficulty: 'Easy', weeklyHours: 2, preferredDaysCount: 2 },
      { id: '4', name: 'History', difficulty: 'Medium', weeklyHours: 3, preferredDaysCount: 2 }
    ]);
    setDailyBudget(3);
    setCompulsorySingleSubject(false);
    setXp(0);
    setStreak(0);
    setLastActiveDate('');
    setHistory([]);
  };

  return (
    <StudyContext.Provider value={{
      token,
      user,
      login,
      register,
      logout,
      subjects,
      dailyBudget,
      compulsorySingleSubject,
      schedule,
      scheduleWarnings,
      xp,
      level,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      streak,
      history,
      lastActiveDate,
      addSubject,
      updateSubject,
      deleteSubject,
      setDailyBudget,
      setCompulsorySingleSubject,
      toggleTaskCompletion,
      getTodayDateString,
      getDayName,
      // Timer
      activeTimerTask,
      setActiveTimerTask,
      timerSecondsLeft,
      setTimerSecondsLeft,
      timerIsRunning,
      setTimerIsRunning,
      timerDuration,
      setTimerDuration,
      syncWithBackend
    }}>
      {children}
    </StudyContext.Provider>
  );
};

