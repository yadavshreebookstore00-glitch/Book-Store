import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f3f6',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '60px' }} />
        </Link>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;