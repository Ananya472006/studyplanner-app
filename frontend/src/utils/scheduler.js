/**
 * Generates a weekly timetable based on user inputs.
 * 
 * @param {Array} subjects - List of subjects. Each has: { id, name, difficulty ('Easy'|'Medium'|'Hard'), weeklyHours, preferredDaysCount }
 * @param {number} dailyBudget - Maximum hours the user will study in a single day.
 * @param {boolean} compulsorySingleSubject - If true, only one subject is scheduled per day.
 * @returns {Object} { schedule, warnings }
 */
export function generateSchedule(subjects, dailyBudget, compulsorySingleSubject) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const schedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [] // Locked for revision
  };
  
  const warnings = [];
  
  if (!subjects || subjects.length === 0) {
    return { schedule, warnings };
  }

  // 1. Validate total hours vs capacity
  const totalRequestedHours = subjects.reduce((sum, s) => sum + Number(s.weeklyHours), 0);
  const totalCapacity = dailyBudget * 6; // Mon-Sat
  if (totalRequestedHours > totalCapacity) {
    warnings.push(`Your requested weekly hours (${totalRequestedHours}h) exceed your weekly study capacity (${totalCapacity}h) based on your daily budget of ${dailyBudget}h/day. Some subjects may not be fully scheduled.`);
  }

  // 2. Sort subjects: Hard first (they need more energy/focus), then Medium, then Easy
  const difficultyWeight = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
  const sortedSubjects = [...subjects].sort((a, b) => {
    const diffA = difficultyWeight[a.difficulty] || 1;
    const diffB = difficultyWeight[b.difficulty] || 1;
    if (diffA !== diffB) return diffB - diffA; // Higher difficulty first
    return Number(b.weeklyHours) - Number(a.weeklyHours); // Larger hours first
  });

  // Track remaining hours to be scheduled for each subject
  const remainingHours = {};
  sortedSubjects.forEach(s => {
    remainingHours[s.id] = Number(s.weeklyHours);
  });

  // Track remaining budget for each day
  const dailyRemainingBudget = {};
  days.forEach(d => {
    dailyRemainingBudget[d] = dailyBudget;
  });

  // Track which subjects are scheduled on which days
  const scheduledDaysBySubject = {};
  sortedSubjects.forEach(s => {
    scheduledDaysBySubject[s.id] = new Set();
  });

  // Helper to check if a day is available for a subject
  const isDayAvailableForSubject = (day, subjectId) => {
    if (dailyRemainingBudget[day] <= 0.1) return false; // Day is full (or near full)
    
    if (compulsorySingleSubject) {
      // If single subject compulsory, check if this day is already assigned to a DIFFERENT subject
      const hasOtherSubject = schedule[day].some(item => item.subjectId !== subjectId);
      if (hasOtherSubject) return false;
    }
    
    return true;
  };

  // 3. Allocate hours
  // We do multiple passes.
  // Pass 1: Try to distribute sessions according to preferredDaysCount
  sortedSubjects.forEach(subject => {
    let prefDays = Number(subject.preferredDaysCount) || 1;
    prefDays = Math.min(prefDays, 6); // Max 6 days (Mon-Sat)
    
    if (remainingHours[subject.id] <= 0) return;

    // Ideal session duration
    let targetSessionDuration = remainingHours[subject.id] / prefDays;
    // Limit session duration to not exceed dailyBudget
    targetSessionDuration = Math.min(targetSessionDuration, dailyBudget);
    // Let's not make sessions too tiny unless necessary (e.g. min 0.5 hours)
    targetSessionDuration = Math.max(targetSessionDuration, 0.5);

    // Find available days
    // Hard subjects prefer earlier days (Monday, Tuesday, etc.)
    // Easy subjects can go anywhere. Let's score days.
    // Score based on:
    // - Remaining budget (more budget is better)
    // - Day index (earlier is preferred for Hard subjects)
    const getDayScore = (day, index) => {
      const budget = dailyRemainingBudget[day];
      const diffMultiplier = difficultyWeight[subject.difficulty] || 1;
      // For hard subjects, earlier days (lower index) get a boost.
      // For easy subjects, day order matters less.
      const dayPreferenceBoost = (6 - index) * (diffMultiplier - 1) * 0.1;
      return budget + dayPreferenceBoost;
    };

    let sessionsCreated = 0;
    
    // Sort days based on suitability for this subject
    const candidateDays = days
      .map((day, idx) => ({ day, score: getDayScore(day, idx), index: idx }))
      .sort((a, b) => b.score - a.score);

    for (const candidate of candidateDays) {
      if (sessionsCreated >= prefDays || remainingHours[subject.id] <= 0) {
        break;
      }
      
      const day = candidate.day;
      if (isDayAvailableForSubject(day, subject.id)) {
        const availableBudget = dailyRemainingBudget[day];
        const duration = Math.min(availableBudget, targetSessionDuration, remainingHours[subject.id]);
        
        if (duration >= 0.25) { // At least 15 mins
          schedule[day].push({
            subjectId: subject.id,
            subjectName: subject.name,
            difficulty: subject.difficulty,
            duration: Number(duration.toFixed(1))
          });
          
          dailyRemainingBudget[day] -= duration;
          remainingHours[subject.id] -= duration;
          scheduledDaysBySubject[subject.id].add(day);
          sessionsCreated++;
        }
      }
    }
  });

  // Pass 2: Clean up remaining hours that couldn't be scheduled in Pass 1 due to preferredDays constraint
  // We distribute them to any day with remaining budget that meets the single-subject constraint
  sortedSubjects.forEach(subject => {
    if (remainingHours[subject.id] <= 0) return;

    // Look for any day with space
    for (const day of days) {
      if (remainingHours[subject.id] <= 0) break;

      if (isDayAvailableForSubject(day, subject.id)) {
        // If we are already scheduled on this day, we can just expand the existing session
        const existingSession = schedule[day].find(item => item.subjectId === subject.id);
        const availableBudget = dailyRemainingBudget[day];
        const durationToAdd = Math.min(availableBudget, remainingHours[subject.id]);

        if (durationToAdd >= 0.25) {
          if (existingSession) {
            existingSession.duration = Number((existingSession.duration + durationToAdd).toFixed(1));
          } else {
            schedule[day].push({
              subjectId: subject.id,
              subjectName: subject.name,
              difficulty: subject.difficulty,
              duration: Number(durationToAdd.toFixed(1))
            });
          }
          dailyRemainingBudget[day] -= durationToAdd;
          remainingHours[subject.id] -= durationToAdd;
          scheduledDaysBySubject[subject.id].add(day);
        }
      }
    }
  });

  // Check if any subject has remaining unscheduled hours
  sortedSubjects.forEach(subject => {
    const unscheduled = remainingHours[subject.id];
    if (unscheduled > 0.1) {
      warnings.push(`Could not schedule ${unscheduled.toFixed(1)}h of "${subject.name}" due to schedule capacity constraints.`);
    }
  });

  // 4. Sunday Revision
  // Sunday is locked for revision of all subjects that were actually scheduled during the week
  const scheduledSubjects = new Set();
  days.forEach(d => {
    schedule[d].forEach(item => {
      scheduledSubjects.add(item.subjectId);
    });
  });

  sortedSubjects.forEach(subject => {
    if (scheduledSubjects.has(subject.id)) {
      // revision is 30 mins per scheduled subject by default
      schedule['Sunday'].push({
        subjectId: subject.id,
        subjectName: subject.name,
        difficulty: subject.difficulty,
        duration: 0.5, // 30 minutes
        isRevision: true
      });
    }
  });

  return { schedule, warnings };
}
