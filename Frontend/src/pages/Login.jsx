import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState('');

  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // ===== Step 1: Send OTP =====
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await sendOtp(identifier);

    if (result.success) {
      setStep('otp');
      // ⚠️ Dev mode: OTP alert me dikhao (production me hatana)
      setOtpSent(result.data.otp);
      alert(`📱 OTP Sent! (Dev Mode)\n\nYour OTP: ${result.data.otp}`);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // ===== Step 2: Verify OTP =====
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyOtp(identifier, otp);

    if (result.success) {
      if (result.data.isNewUser) {
        // New user → Register page pe bhejo (identifier pass karo)
        navigate('/register', {
          state: {
            identifier: result.data.identifier,
            type: result.data.type,
          },
          replace: true,
        });
      } else {
        // Existing user → Login ho gaya
        const isAdmin =
          result.data.user?.isAdmin === true ||
          result.data.user?.role === 'admin';

        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // ===== Resend OTP =====
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    const result = await sendOtp(identifier);
    if (result.success) {
      setOtpSent(result.data.otp);
      alert(`📱 OTP Resent! (Dev Mode)\n\nYour OTP: ${result.data.otp}`);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{
        color: '#1a237e',
        textAlign: 'center',
        marginBottom: '10px',
        fontWeight: 800,
        fontSize: '26px',
        letterSpacing: '-0.5px'
      }}>
        {step === 'input' ? 'Welcome Back' : 'Verify OTP'}
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '25px'
      }}>
        {step === 'input'
          ? 'Login with Email or Mobile number'
          : `OTP sent to ${identifier}`}
      </p>

      {/* Error */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #c62828'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ========== STEP 1: Input ========== */}
      {step === 'input' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Email or Mobile Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '13px 15px',
              border: '1.5px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
              background: loading ? '#f5f5f5' : '#fff'
            }}
          />
          <p style={{
            fontSize: '12px',
            color: '#999',
            fontWeight: 500,
            marginTop: '-8px'
          }}>
            Example: yourname@email.com or 9876543210
          </p>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              background: loading ? '#999' : '#1a237e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? '⏳ Sending OTP...' : '📩 Send OTP'}
          </button>
        </form>
      )}

      {/* ========== STEP 2: OTP Verify ========== */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            disabled={loading}
            maxLength={6}
            style={{
              padding: '13px 15px',
              border: '1.5px solid #ddd',
              borderRadius: '6px',
              fontSize: '20px',
              fontWeight: 700,
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '8px',
              background: loading ? '#f5f5f5' : '#fff'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              background: loading ? '#999' : '#1a237e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? '⏳ Verifying...' : '✅ Verify & Continue'}
          </button>

          {/* Resend + Change number */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <button
              type="button"
              onClick={() => { setStep('input'); setOtp(''); setError(''); setOtpSent(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a237e',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              ← Change
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#f57c00',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                textDecoration: 'underline'
              }}
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}

      {/* Register Link */}
      <p style={{
        textAlign: 'center',
        marginTop: '25px',
        fontSize: '14px',
        fontWeight: 500
      }}>
        New here? Just enter your details above — we'll register you automatically.
      </p>
    </div>
  );
};

export default Login;