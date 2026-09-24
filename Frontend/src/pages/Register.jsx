import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerWithOtp } = useAuth();

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login page se aaya identifier prefill karo
  useEffect(() => {
    if (location.state?.identifier) {
      setIdentifier(location.state.identifier);
      setType(location.state.type || 'email');
    } else {
      // Direct register page pe aaya (bina OTP) → login pe bhejo
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    const result = await registerWithOtp({
      identifier,
      type,
      name,
      password,
    });

    if (result.success) {
      navigate('/', { replace: true });
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
        fontSize: '24px',
        letterSpacing: '-0.5px'
      }}>
        Complete Registration
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '25px'
      }}>
        Just add your name and password to finish
      </p>

      {/* Verified Identifier Badge */}
      <div style={{
        background: '#e8f5e9',
        color: '#2e7d32',
        padding: '10px 15px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '13px',
        fontWeight: 700,
        textAlign: 'center',
        borderLeft: '4px solid #2e7d32'
      }}>
        ✅ Verified: {identifier}
      </div>

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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          style={inputStyle(loading)}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={inputStyle(loading)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          style={inputStyle(loading)}
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
          {loading ? '⏳ Creating...' : 'Create Account'}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        fontWeight: 500
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#f57c00', fontWeight: 700 }}>
          Login
        </Link>
      </p>
    </div>
  );
};

const inputStyle = (loading) => ({
  padding: '13px 15px',
  border: '1.5px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  background: loading ? '#f5f5f5' : '#fff',
});

export default Register;