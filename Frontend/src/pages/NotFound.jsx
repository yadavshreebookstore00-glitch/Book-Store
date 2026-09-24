import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '80px', color: '#1a237e', margin: 0 }}>404</h1>
      <h2 style={{ color: '#333' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" style={{
        padding: '12px 30px',
        background: '#1a237e',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: '600'
      }}>Go Home</Link>
    </div>
  );
};

export default NotFound;