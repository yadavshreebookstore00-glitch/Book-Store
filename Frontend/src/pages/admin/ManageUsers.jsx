import React, { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';

const css = `
  .mu-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
  .mu-title { color: #1a237e; font-weight: 800; font-size: 22px; margin: 0; }
  .mu-title span { color: #999; font-weight: 700; font-size: 15px; }

  .mu-search { display: flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #e0e0e6; border-radius: 10px; padding: 0 12px; height: 40px; width: 280px; max-width: 100%; box-sizing: border-box; }
  .mu-search:focus-within { border-color: #1a237e; }
  .mu-search svg { color: #1a237e; font-size: 13px; flex-shrink: 0; }
  .mu-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 14px; font-weight: 500; font-family: inherit; color: #333; }

  .mu-error { background: #ffebee; color: #c62828; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-weight: 600; font-size: 13px; }

  .mu-box { background: #fff; border-radius: 12px; border: 1px solid #ececf3; overflow: hidden; }
  .mu-empty { padding: 44px 20px; text-align: center; color: #666; font-weight: 500; font-size: 14px; }

  /* ===== Desktop table ===== */
  .mu-table-wrap { overflow-x: auto; }
  .mu-table { width: 100%; border-collapse: collapse; }
  .mu-table th { background: #f7f7fa; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #1a237e; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .mu-table td { padding: 12px 16px; font-size: 14px; font-weight: 500; color: #333; white-space: nowrap; border-top: 1px solid #f0f0f4; vertical-align: middle; }
  .mu-table tbody tr:hover { background: #fafbff; }
  .mu-user { display: flex; align-items: center; gap: 10px; font-weight: 700; }
  .mu-muted { color: #aaa; }

  .mu-avatar { width: 34px; height: 34px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
  .mu-role { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
  .mu-role.admin { background: #fff3e0; color: #f57c00; }
  .mu-role.user { background: #e8eaf6; color: #1a237e; }

  .mu-del { background: #ffebee; color: #c62828; border: none; height: 34px; padding: 0 12px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; transition: background 0.2s, color 0.2s; }
  .mu-del:hover:not(:disabled) { background: #c62828; color: #fff; }
  .mu-del:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ===== Mobile cards ===== */
  .mu-cards { display: none; }
  .mu-card { padding: 12px; border-top: 1px solid #f0f0f4; }
  .mu-card:first-child { border-top: none; }
  .mu-card-top { display: flex; align-items: center; gap: 10px; }
  .mu-card-name { flex: 1; min-width: 0; }
  .mu-card-name b { display: block; color: #1a237e; font-size: 14.5px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mu-card-name .mu-role { margin-top: 3px; }
  .mu-card-del { width: 38px; height: 38px; border-radius: 10px; border: none; background: #ffebee; color: #c62828; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .mu-card-del:disabled { opacity: 0.5; }
  .mu-card-info { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #444; }
  .mu-line { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .mu-line svg { color: #999; font-size: 12px; flex-shrink: 0; }
  .mu-line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

  /* Toast */
  .mu-toast { position: fixed; top: 80px; right: 20px; background: #c62828; color: #fff; padding: 11px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; z-index: 1100; box-shadow: 0 8px 22px rgba(0,0,0,0.15); }

  @media (max-width: 760px) {
    .mu-table-wrap { display: none; }
    .mu-cards { display: block; }
    .mu-title { font-size: 19px; }
    .mu-search { width: 100%; height: 42px; }
    .mu-search input { font-size: 16px; }
    .mu-toast { top: 64px; left: 12px; right: 12px; text-align: center; }
  }
`;

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState('');

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setToast(`⚠️ ${err.response?.data?.message || 'Delete failed'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) =>
        [u.name, u.email, u.phone].some((v) => (v || '').toLowerCase().includes(q))
      )
    : users;

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600, color: '#1a237e' }}>
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <style>{css}</style>

      {toast && <div className="mu-toast">{toast}</div>}

      <div className="mu-head">
        <h1 className="mu-title">
          Manage Users <span>({filtered.length}{q ? ` of ${users.length}` : ''})</span>
        </h1>
        <label className="mu-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {error && <div className="mu-error">⚠️ {error}</div>}

      <div className="mu-box">
        {filtered.length === 0 ? (
          <div className="mu-empty">
            {users.length === 0 ? 'No users registered yet.' : 'No users match your search.'}
          </div>
        ) : (
          <>
            {/* ===== Desktop / tablet: table ===== */}
            <div className="mu-table-wrap">
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u._id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="mu-user">
                          <span className="mu-avatar">{(u.name || '?').charAt(0).toUpperCase()}</span>
                          {u.name}
                        </div>
                      </td>
                      <td>
                        {u.email ? (
                          <span style={{ color: '#1a237e', fontWeight: 600 }}>{u.email}</span>
                        ) : (
                          <span className="mu-muted">—</span>
                        )}
                      </td>
                      <td>
                        {u.phone ? (
                          <span style={{ color: '#2e7d32', fontWeight: 600 }}>{u.phone}</span>
                        ) : (
                          <span className="mu-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`mu-role ${u.role === 'admin' ? 'admin' : 'user'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            className="mu-del"
                            onClick={() => handleDelete(u._id)}
                            disabled={deletingId === u._id}
                          >
                            <FaTrash size={11} /> {deletingId === u._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== Mobile: cards ===== */}
            <div className="mu-cards">
              {filtered.map((u) => (
                <div key={u._id} className="mu-card">
                  <div className="mu-card-top">
                    <span className="mu-avatar">{(u.name || '?').charAt(0).toUpperCase()}</span>
                    <div className="mu-card-name">
                      <b>{u.name}</b>
                      <span className={`mu-role ${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role || 'user'}
                      </span>
                    </div>
                    {u.role !== 'admin' && (
                      <button
                        className="mu-card-del"
                        onClick={() => handleDelete(u._id)}
                        disabled={deletingId === u._id}
                        aria-label={`Delete ${u.name}`}
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="mu-card-info">
                    <div className="mu-line">
                      <FaEnvelope />
                      <span style={{ color: u.email ? '#1a237e' : '#aaa' }}>{u.email || '—'}</span>
                    </div>
                    <div className="mu-line">
                      <FaPhone />
                      <span style={{ color: u.phone ? '#2e7d32' : '#aaa' }}>{u.phone || '—'}</span>
                    </div>
                    <div className="mu-line">
                      <FaCalendarAlt />
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;