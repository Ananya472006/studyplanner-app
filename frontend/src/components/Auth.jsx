import React, { useState } from 'react';
import { User, Lock, ShieldAlert, Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useStudy();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const success = await login(username, password);
        if (!success.success) {
          setError(success.error || 'Invalid credentials.');
        }
      } else {
        const success = await register(username, password);
        if (!success.success) {
          setError(success.error || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        {/* Header Logo & Title */}
        <div className="auth-header">
          <span className="auth-logo">⚡</span>
          <h2 className="auth-title">StudyQuest</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Embark on your learning quest. Sign in to track your progress.' 
              : 'Create an account to begin your gamified study quest.'}
          </p>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="auth-error-box">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="auth-input"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="auth-input"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-wrapper">
                <KeyRound size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Quest' : 'Register and Start'}</span>
                <ArrowRight size={16} className="arrow-icon" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-toggle">
          <span>{isLogin ? "New to StudyQuest?" : "Already have a scholar profile?"}</span>
          <button onClick={toggleMode} disabled={loading} className="toggle-mode-btn">
            {isLogin ? (
              <>
                Create Account <Sparkles size={13} style={{ marginLeft: '4px', display: 'inline' }} />
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </div>

      {/* Styled css for auth screen added below */}
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 1.5rem;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-header {
          text-align: center;
        }

        .auth-logo {
          font-size: 2.5rem;
          display: inline-block;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 10px rgba(168, 85, 247, 0.4));
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(to right, #ffffff, #d8b4fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .auth-error-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fb7185;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          opacity: 0.9;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .auth-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 12px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          width: 100%;
          outline: none;
          font-family: var(--font-body);
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .auth-input:focus {
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-submit-btn {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.85rem;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .arrow-icon {
          transition: transform 0.3s;
        }

        .auth-submit-btn:hover .arrow-icon {
          transform: translateX(3px);
        }

        .auth-toggle {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .toggle-mode-btn {
          background: transparent;
          border: none;
          color: #c084fc;
          font-family: var(--font-heading);
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }

        .toggle-mode-btn:hover {
          color: #e879f9;
          text-decoration: underline;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default Auth;
