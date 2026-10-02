import React, { useState, useEffect } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaSearch,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaReply,
  FaArchive,
  FaEnvelopeOpen,
} from 'react-icons/fa';
import api from '../../services/api';

const statusColors = {
  new: { bg: '#fff3e0', color: '#f57c00', label: 'New' },
  read: { bg: '#e3f2fd', color: '#1976d2', label: 'Read' },
  replied: { bg: '#e8f5e9', color: '#2e7d32', label: 'Replied' },
  closed: { bg: '#f5f5f5', color: '#666', label: 'Closed' },
};

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ===== Fetch Contacts =====
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const { data } = await api.get(`/contacts?${params.toString()}`);
      setContacts(data.contacts || []);
      setTotalPages(data.pages || 1);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchTerm]);

  // ===== Open Contact Detail =====
  const openContact = async (contact) => {
    setSelectedContact(contact);
    setShowModal(true);

    // Auto-mark as read if new
    if (contact.status === 'new') {
      try {
        const { data } = await api.put(`/contacts/${contact._id}`, {
          status: 'read',
        });
        setContacts(
          contacts.map((c) => (c._id === contact._id ? data : c))
        );
        setSelectedContact(data);
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  // ===== Update Status =====
  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/contacts/${id}`, {
        status: newStatus,
      });
      setContacts(contacts.map((c) => (c._id === id ? data : c)));
      if (selectedContact?._id === id) setSelectedContact(data);
      fetchContacts();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // ===== Delete Contact =====
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(contacts.filter((c) => c._id !== id));
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // ===== Format Date =====
  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div>
      {/* ===== Header ===== */}
      <div style={{ marginBottom: '25px' }}>
        <h1
          style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '26px',
            margin: 0,
            marginBottom: '5px',
          }}
        >
          📬 Contact Messages
        </h1>
        <p
          style={{
            color: '#666',
            fontWeight: 500,
            fontSize: '13px',
            margin: 0,
          }}
        >
          Manage all customer inquiries
        </p>
      </div>

      {/* ===== Stats Cards ===== */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '15px',
            marginBottom: '25px',
          }}
        >
          <StatCard
            icon={<FaEnvelope />}
            label="Total"
            value={stats.total}
            color="#1a237e"
            bg="#e8eaf6"
          />
          <StatCard
            icon={<FaClock />}
            label="New"
            value={stats.new}
            color="#f57c00"
            bg="#fff3e0"
          />
          <StatCard
            icon={<FaEnvelopeOpen />}
            label="Read"
            value={stats.read}
            color="#1976d2"
            bg="#e3f2fd"
          />
          <StatCard
            icon={<FaReply />}
            label="Replied"
            value={stats.replied}
            color="#2e7d32"
            bg="#e8f5e9"
          />
        </div>
      )}

      {/* ===== Filters ===== */}
      <div
        style={{
          background: '#fff',
          padding: '18px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '9px 14px',
            flex: '1 1 250px',
          }}
        >
          <FaSearch style={{ color: '#999', fontSize: '13px' }} />
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              fontWeight: 500,
              color: '#333',
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'new', label: 'New' },
            { key: 'read', label: 'Read' },
            { key: 'replied', label: 'Replied' },
            { key: 'closed', label: 'Closed' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              style={{
                padding: '8px 14px',
                border: `2px solid ${
                  statusFilter === f.key ? '#1a237e' : '#ddd'
                }`,
                background: statusFilter === f.key ? '#1a237e' : '#fff',
                color: statusFilter === f.key ? '#fff' : '#666',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Contacts List ===== */}
      {loading ? (
        <div
          style={{
            padding: '50px',
            textAlign: 'center',
            color: '#666',
            fontWeight: 600,
          }}
        >
          Loading messages...
        </div>
      ) : error ? (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '10px',
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      ) : contacts.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '60px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#666',
            fontWeight: 500,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          📭 No contact messages yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map((contact) => {
            const statusConfig = statusColors[contact.status] || statusColors.new;
            const isNew = contact.status === 'new';

            return (
              <div
                key={contact._id}
                onClick={() => openContact(contact)}
                style={{
                  background: '#fff',
                  padding: '18px',
                  borderRadius: '12px',
                  boxShadow: isNew
                    ? '0 4px 16px rgba(245, 124, 0, 0.15)'
                    : '0 2px 10px rgba(0,0,0,0.05)',
                  border: isNew
                    ? '1.5px solid rgba(245, 124, 0, 0.3)'
                    : '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isNew
                    ? '0 8px 24px rgba(245, 124, 0, 0.2)'
                    : '0 8px 24px rgba(26, 35, 126, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isNew
                    ? '0 4px 16px rgba(245, 124, 0, 0.15)'
                    : '0 2px 10px rgba(0,0,0,0.05)';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${
                      isNew ? '#f57c00' : '#1a237e'
                    } 0%, ${isNew ? '#ef6c00' : '#3949ab'} 100%)`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {contact.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px',
                      marginBottom: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3
                        style={{
                          color: '#1a237e',
                          fontWeight: 800,
                          fontSize: '15px',
                          margin: 0,
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {contact.name}
                        {isNew && (
                          <span
                            style={{
                              background: '#f57c00',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              letterSpacing: '0.5px',
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </h3>

                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          fontSize: '12px',
                          color: '#666',
                          fontWeight: 500,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaEnvelope style={{ fontSize: '10px' }} />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaPhone style={{ fontSize: '10px' }} />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Subject + Message preview */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#1a237e',
                      fontWeight: 700,
                      margin: '6px 0 4px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {contact.subject}
                  </p>
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#888',
                      fontWeight: 500,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {contact.message}
                  </p>

                  <p
                    style={{
                      fontSize: '11px',
                      color: '#bbb',
                      fontWeight: 600,
                      margin: '8px 0 0 0',
                    }}
                  >
                    📅 {formatDate(contact.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                padding: '20px 0',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={paginationBtnStyle(page === 1)}
              >
                ← Prev
              </button>
              <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '13px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={paginationBtnStyle(page === totalPages)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== Contact Detail Modal ===== */}
      {showModal && selectedContact && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                padding: '22px 26px',
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaEnvelope /> Message Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '26px' }}>
              {/* Sender Info */}
              <div
                style={{
                  background: '#f9f9f9',
                  padding: '18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #1a237e',
                }}
              >
                <h3
                  style={{
                    color: '#1a237e',
                    fontSize: '18px',
                    fontWeight: 800,
                    margin: '0 0 4px 0',
                  }}
                >
                  {selectedContact.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '18px',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: 500,
                    flexWrap: 'wrap',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaEnvelope style={{ color: '#f57c00' }} />
                    {selectedContact.email}
                  </span>
                  {selectedContact.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhone style={{ color: '#f57c00' }} />
                      {selectedContact.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Subject
                </label>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#1a237e',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {selectedContact.subject}
                </p>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Message
                </label>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    margin: 0,
                    padding: '16px',
                    background: '#fafafa',
                    borderRadius: '10px',
                    border: '1px solid #f0f0f0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedContact.message}
                </p>
              </div>

              {/* Date */}
              <p
                style={{
                  fontSize: '11.5px',
                  color: '#999',
                  fontWeight: 600,
                  margin: '0 0 22px 0',
                }}
              >
                📅 Received: {formatDate(selectedContact.createdAt)}
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  paddingTop: '20px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  style={{
                    flex: '1 1 140px',
                    padding: '12px',
                    background: '#2e7d32',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => updateStatus(selectedContact._id, 'replied')}
                >
                  <FaReply /> Reply via Email
                </a>

                {selectedContact.status !== 'closed' && (
                  <button
                    onClick={() =>
                      updateStatus(selectedContact._id, 'closed')
                    }
                    style={{
                      flex: '1 1 100px',
                      padding: '12px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <FaArchive /> Close
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedContact._id)}
                  style={{
                    flex: '0 0 auto',
                    padding: '12px 16px',
                    background: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Stat Card =====
const StatCard = ({ icon, label, value, color, bg }) => (
  <div
    style={{
      background: '#fff',
      padding: '18px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}
  >
    <div
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background: bg,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '17px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <p
        style={{
          fontSize: '11px',
          color: '#999',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
        }}
      >
        {label}
      </p>
      <h3
        style={{
          fontSize: '22px',
          color: color,
          fontWeight: 800,
          margin: '2px 0 0 0',
        }}
      >
        {value}
      </h3>
    </div>
  </div>
);

// ===== Pagination Button Style =====
const paginationBtnStyle = (disabled) => ({
  padding: '8px 16px',
  background: disabled ? '#f5f5f5' : '#1a237e',
  color: disabled ? '#999' : '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '12px',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

export default ManageContacts;