import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600 }}>
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
        Manage Users ({users.length})
      </h1>

      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontWeight: 600
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {users.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#666', fontWeight: 500 }}>
            No users registered yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Mobile</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{u.name}</td>

                    {/* ===== EMAIL COLUMN ===== */}
                    <td style={tdStyle}>
                      {u.email ? (
                        <span style={{ color: '#1a237e', fontWeight: 600 }}>
                           {u.email}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* ===== MOBILE COLUMN ===== */}
                    <td style={tdStyle}>
                      {u.phone ? (
                        <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                           {u.phone}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* ===== ROLE ===== */}
                    <td style={tdStyle}>
                      <span style={{
                        background: u.role === 'admin' ? '#fff3e0' : '#e8eaf6',
                        color: u.role === 'admin' ? '#f57c00' : '#1a237e',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* ===== JOINED DATE ===== */}
                    <td style={tdStyle}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* ===== ACTION ===== */}
                    <td style={tdStyle}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          style={{
                            background: '#ffebee',
                            color: '#c62828',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  padding: '15px 20px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a237e',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '15px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  whiteSpace: 'nowrap'
};

export default ManageUsers;