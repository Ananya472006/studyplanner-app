import React, { useEffect } from 'react';
import { Award, Star, Flame, Trophy } from 'lucide-react';
import { playRewardSound } from '../utils/audio';
import confetti from 'canvas-confetti';

const RewardCelebration = ({ reward, onClose }) => {
  useEffect(() => {
    if (reward && reward.isOpen) {
      // Play level up or standard reward sound
      playRewardSound();

      // Trigger standard confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#10b981', '#fbbf24']
      });

      // If it's a major accomplishment (e.g., level up or streak milestone), do fireworks!
      if (reward.levelUp || reward.streakMilestone) {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }
  }, [reward]);

  if (!reward || !reward.isOpen) return null;

  // Nice congratulatory messages
  const defaultMessages = [
    "Fantastic study session!",
    "You are crushing your goals today!",
    "Knowledge is power! Keep it up!",
    "Consistency is the key to success!",
    "Brain cells activated!",
    "One step closer to mastering this subject!"
  ];
  
  const randomMessage = reward.message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content reward-card-glow">
        <div style={{ position: 'relative' }}>
          {/* Decorative floating stars */}
          <div style={{ position: 'absolute', top: -40, left: '10%', animation: 'float 2s infinite ease-in-out' }}>
            <Star size={24} fill="#fbbf24" stroke="none" />
          </div>
          <div style={{ position: 'absolute', top: -30, right: '10%', animation: 'float 2.5s infinite ease-in-out' }}>
            <Star size={18} fill="#f472b6" stroke="none" />
          </div>

          {reward.levelUp ? (
            <div>
              <span className="badge-reward-icon">🏆</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                LEVEL UP!
              </h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fcd34d', marginBottom: '1rem' }}>
                You reached Level {reward.newLevel}!
              </p>
            </div>
          ) : (
            <div>
              <span className="badge-reward-icon">⚡</span>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #c084fc, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TASK COMPLETED!
              </h2>
            </div>
          )}

          <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '1rem 0', fontStyle: 'italic' }}>
            "{randomMessage}"
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={20} fill="#c084fc" />
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>+{reward.xpEarned}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>XP GAINED</span>
            </div>

            {reward.streakMilestone && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Flame size={20} fill="#fbbf24" />
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{reward.streak}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>STREAK</span>
              </div>
            )}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} onClick={onClose}>
            Awesomeness Received!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardCelebration;
