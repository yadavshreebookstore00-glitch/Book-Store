import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCopy,
  FaCheck,
  FaArrowLeft,
  FaRedoAlt,
  FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

// ✅ Only image import (no logo import — image me already logo hai)
import loginHero from '../assets/login.png';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60;

const Login = () => {
  const [step, setStep] = useState('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const isEmail = /@/.test(identifier.trim());
  const isPhone = /^\d{10}$/.test(identifier.trim());
  const isValidIdentifier = isEmail || isPhone;

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => {
      setResendTimer((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (step !== 'otp' || loading) return;
    const code = otp.join('');
    if (code.length === OTP_LENGTH) {
      handleVerifyOtp({ preventDefault: () => {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ===== Send OTP =====
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isValidIdentifier) {
      setError('Please enter a valid email or 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(identifier.trim());
      if (result.success) {
        setStep('otp');
        setResendTimer(RESEND_TIMEOUT);
        const receivedOtp = result.data?.otp;
        if (receivedOtp) setDevOtp(receivedOtp);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== Verify OTP =====
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(identifier.trim(), code);
      if (result.success) {
        if (result.data.isNewUser) {
          navigate('/register', {
            state: {
              identifier: result.data.identifier,
              type: result.data.type,
            },
            replace: true,
          });
        } else {
          const isAdmin =
            result.data.user?.isAdmin === true ||
            result.data.user?.role === 'admin';
          navigate(isAdmin ? '/admin/dashboard' : '/', { replace: true });
        }
      } else {
        setError(result.message || 'Invalid OTP');
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== Resend OTP =====
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(identifier.trim());
      if (result.success) {
        setResendTimer(RESEND_TIMEOUT);
        const receivedOtp = result.data?.otp;
        if (receivedOtp) setDevOtp(receivedOtp);
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== OTP input handlers =====
  const handleOtpChange = (idx, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        const next = [...otp];
        next[idx - 1] = '';
        setOtp(next);
        otpRefs.current[idx - 1]?.focus();
      } else {
        const next = [...otp];
        next[idx] = '';
        setOtp(next);
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1)
      otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => (next[i] = d));
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  // ===== Copy dev OTP =====
  const handleCopyDevOtp = async () => {
    try {
      await navigator.clipboard.writeText(devOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = devOtp;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ===== Reset to step 1 =====
  const handleBack = () => {
    setStep('input');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setDevOtp('');
    setResendTimer(0);
  };

  return (
    <div className={styles.page}>
      {/* =====================================================
          LEFT: HERO — ONLY IMAGE (no overlay text)
          ===================================================== */}
      <aside className={styles.heroPanel}>
        <img
          src={loginHero}
          alt="Yadav Shree Book Store"
          className={styles.heroImage}
        />
      </aside>

      {/* =====================================================
          RIGHT: FORM PANEL
          ===================================================== */}
      <main className={styles.formPanel}>
        {/* Top register link */}
        <div className={styles.formTop}>
          <span className={styles.registerNote}>New here?</span>
          <Link to="/register" className={styles.registerLink}>
            Create an account <FaArrowRight />
          </Link>
        </div>

        {/* Form card */}
        <div className={styles.formCard}>
          <div className={styles.wrapper}>
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>
                {step === 'input' ? 'Welcome Back 👋' : 'Verify OTP'}
              </h2>
              <p className={styles.subtitle}>
                {step === 'input' ? (
                  'Login with your Email or Mobile number'
                ) : (
                  <>
                    OTP sent to <strong>{identifier}</strong>
                  </>
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.errorBox}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Dev OTP banner */}
            {step === 'otp' && devOtp && (
              <div className={styles.devOtpBanner}>
                <div className={styles.devOtpIcon}>
                  <FaShieldAlt />
                </div>
                <div className={styles.devOtpContent}>
                  <p className={styles.devOtpLabel}>
                    Test Mode <span className={styles.devOtpBadge}>DEV</span>
                  </p>
                  <p className={styles.devOtpCode}>{devOtp}</p>
                </div>
                <button
                  type="button"
                  className={styles.devOtpCopy}
                  onClick={handleCopyDevOtp}
                >
                  {copied ? (
                    <>
                      <FaCheck /> Copied
                    </>
                  ) : (
                    <>
                      <FaCopy /> Copy
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ===== STEP 1: Identifier ===== */}
            {step === 'input' && (
              <form className={styles.form} onSubmit={handleSendOtp}>
                <div className={styles.field}>
                  <label className={styles.label}>Email or Mobile Number</label>
                  <div className={styles.inputWrap}>
                    {isEmail ? (
                      <FaEnvelope className={styles.inputIcon} />
                    ) : (
                      <FaPhone className={styles.inputIcon} />
                    )}
                    <input
                      type="text"
                      inputMode={isPhone ? 'numeric' : 'email'}
                      autoComplete="username"
                      autoFocus
                      placeholder="you@email.com or 9876543210"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError('');
                      }}
                      required
                      disabled={loading}
                      className={styles.input}
                    />
                  </div>
                  <p className={styles.hint}>
                    Example: yourname@email.com or 9876543210
                  </p>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || !isValidIdentifier}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} /> Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <FaArrowRight />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ===== STEP 2: OTP ===== */}
            {step === 'otp' && (
              <form className={styles.form} onSubmit={handleVerifyOtp}>
                <div className={styles.field}>
                  <label className={styles.label}>Enter 6-digit OTP</label>
                  <div className={styles.otpRow}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        onFocus={(e) => e.target.select()}
                        disabled={loading}
                        className={`${styles.otpBox} ${
                          digit ? styles.filled : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || otp.join('').length !== OTP_LENGTH}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} /> Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle /> Verify & Continue
                    </>
                  )}
                </button>

                <div className={styles.resendRow}>
                  <button
                    type="button"
                    className={styles.changeBtn}
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <FaArrowLeft /> Change
                  </button>

                  {resendTimer > 0 ? (
                    <span className={styles.timerBadge}>
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.resendBtn}
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      <FaRedoAlt /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Footer note */}
            <p className={styles.footerNote}>
              New here? Just enter your details above —{' '}
              <strong>we'll register you automatically.</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;