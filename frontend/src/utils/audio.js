// Web Audio API Sound Synthesizer for gamification sounds

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Plays a triumphant coin/reward sound (like retro game level-ups)
 */
export const playRewardSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play two notes in quick succession (an arpeggio)
    const playNote = (frequency, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0.1, startTime);
      // exponential decay
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Upward arpeggio for positive feedback (C5, E5, G5, C6)
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.08, 0.15); // E5
    playNote(783.99, now + 0.16, 0.15); // G5
    playNote(1046.50, now + 0.24, 0.45); // C6
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
};

/**
 * Plays a simple success bell/chime sound
 */
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3); // A4
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
};

/**
 * Plays an alarm chime when the timer expires
 */
export const playTimerAlarmSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const playBeep = (time) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, time);
      
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.setValueAtTime(0, time + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.15);
    };

    // Three rapid beeps
    playBeep(now);
    playBeep(now + 0.2);
    playBeep(now + 0.4);
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
};
