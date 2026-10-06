import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaSearch,
  FaEye,
  FaTimes,
  FaClock,
  FaReply,
  FaArchive,
  FaEnvelopeOpen,
  FaEllipsisV,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import api from '../../services/api';
import styles from './ManageContacts.module.css';
import useDebounce from '../../hooks/useDebounce';

const statusConfig = {
  new:     { bg: '#fff7ed', color: '#c2410c', label: 'New' },
  read:    { bg: '#eff6ff', color: '#1d4ed8', label: 'Read' },
  replied: { bg: '#f0fdf4', color: '#15803d', label: 'Replied' },
  closed:  { bg: '#f1f5f9', color: '#475569', label: 'Closed' },
};

// ===== Highlight helper =====
const Highlight = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const q = query.toLowerCase();
  const t = String(text);
  const idx = t.toLowerCase().indexOf(q);
  if (idx === -1) return <>{t}</>;
  return (
    <>
      {t.slice(0, idx)}
      <span className={styles.highlight}>{t.slice(idx, idx + q.length)}</span>
      {t.slice(idx + q.length)}
    </>
  );
};

// ===== Skeleton =====
const SkeletonRow = () => (
  <div className={styles.skeletonRow}>
    <div className={`${styles.skAvatar}`} />
    <div className={`${styles.skeletonCol} ${styles.skCol1}`}>
      <div className={`${styles.skLine} ${styles.skLine1}`} />
      <div className={`${styles.skLine} ${styles.skLine2}`} />
    </div>
    <div className={`${styles.skeletonCol} ${styles.skCol2}`}>
      <div className={`${styles.skLine} ${styles.skLine3}`} />
      <div className={`${styles.skLine} ${styles.skLine4}`} />
    </div>
    <div className={`${styles.skeletonCol} ${styles.skCol3}`}>
      <div className={`${styles.skLine} ${styles.skLine3}`} />
    </div>
    <div className={`${styles.skeletonCol} ${styles.skCol4}`}>
      <div className={`${styles.skLine} ${styles.skLine3}`} />
    </div>
    <div className={`${styles.skeletonCol} ${styles.skCol5}`}>
      <div className={`${styles.skLine} ${styles.skLine4}`} />
    </div>
    <div className={`${styles.skeletonCol} ${styles.skCol6}`}>
      <div className={`${styles.skLine} ${styles.skLine4}`} />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 8 }) => (
  <div className={styles.skeletonWrap}>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ===== Menu: track position so it never goes off-screen =====
  const [menu, setMenu] = useState({
    open: false,
    id: null,
    top: 0,
    left: 0,
  });
  const menuRef = useRef(null);
  const scrollYRef = useRef(0);
  const abortRef = useRef(null);
  const isFirstLoad = useRef(true);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // ===== Fetch =====
  const fetchContacts = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isFirstLoad.current) setLoading(true);
      else setFetching(true);
      setError('');

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const { data } = await api.get(`/contacts?${params.toString()}`, {
        signal: controller.signal,
      });

      setContacts(data.contacts || []);
      setTotalPages(data.pages || 1);
      setStats(data.stats || null);
      isFirstLoad.current = false;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ===== Close menu on outside click =====
  useEffect(() => {
    if (!menu.open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu((m) => ({ ...m, open: false }));
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menu.open]);

  // ===== Close menu on scroll (throttled via rAF) =====
  useEffect(() => {
    if (!menu.open) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMenu((m) => ({ ...m, open: false }));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menu.open]);

  // ===== iOS-safe body scroll lock =====
  useEffect(() => {
    if (showModal) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
        scrollYRef.current = 0;
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // ===== SMART MENU POSITION =====
  // Opens up if no room below, and clamps to viewport edges
  const openMenuAt = useCallback((e, contactId) => {
    e.stopPropagation();
    e.preventDefault();

    // If already open for this row → close
    if (menu.open && menu.id === contactId) {
      setMenu((m) => ({ ...m, open: false }));
      return;
    }

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 200;
    const menuHeight = 260; // approx
    const gap = 6;
    const edge = 8;

    // Horizontal: prefer right-aligned to button
    let left = rect.right - menuWidth;
    if (left < edge) left = edge;
    if (left + menuWidth > window.innerWidth - edge) {
      left = window.innerWidth - menuWidth - edge;
    }

    // Vertical: open down if room, else up
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let top;
    if (spaceBelow >= menuHeight + gap) {
      top = rect.bottom + gap;
    } else if (spaceAbove >= menuHeight + gap) {
      top = rect.top - menuHeight - gap;
    } else {
      // Not enough either way → pin to top edge with scroll
      top = Math.max(edge, window.innerHeight - menuHeight - edge);
    }

    setMenu({ open: true, id: contactId, top, left });
  }, [menu.open, menu.id]);

  // ===== Open detail =====
  const openContact = useCallback(async (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    setMenu({ open: false, id: null, top: 0, left: 0 });

    if (contact.status === 'new') {
      setContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, status: 'read' } : c))
      );
      setSelectedContact({ ...contact, status: 'read' });
      try {
        await api.put(`/contacts/${contact._id}`, { status: 'read' });
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // ===== Update status =====
  const updateStatus = useCallback(
    async (id, newStatus) => {
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedContact?._id === id) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }
      setMenu({ open: false, id: null, top: 0, left: 0 });
      try {
        await api.put(`/contacts/${id}`, { status: newStatus });
      } catch {
        alert('Failed to update status');
        fetchContacts();
      }
    },
    [selectedContact, fetchContacts]
  );

  // ===== Delete =====
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this contact message?')) return;
      const prev = contacts;
      setContacts((c) => c.filter((x) => x._id !== id));
      setShowModal(false);
      setMenu({ open: false, id: null, top: 0, left: 0 });
      try {
        await api.delete(`/contacts/${id}`);
      } catch {
        alert('Failed to delete');
        setContacts(prev);
      }
    },
    [contacts]
  );

  // ===== Time-ago =====
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatFullDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const filterChips = useMemo(
    () => [
      { key: 'all', label: 'All', count: stats?.total },
      { key: 'new', label: 'New', count: stats?.new },
      { key: 'read', label: 'Read', count: stats?.read },
      { key: 'replied', label: 'Replied', count: stats?.replied },
      { key: 'closed', label: 'Closed', count: stats?.closed },
    ],
    [stats]
  );

  // ===== Render menu (shared between table & card) =====
  const renderMenu = (contact) => {
    if (!menu.open || menu.id !== contact._id) return null;
    return (
      <div
        ref={menuRef}
        className={styles.menu}
        style={{ top: menu.top, left: menu.left }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            openContact(contact);
          }}
        >
          <FaEye /> View Details
        </button>
        {contact.status !== 'read' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStatus(contact._id, 'read');
            }}
          >
            <FaEnvelopeOpen /> Mark as Read
          </button>
        )}
        {contact.status !== 'replied' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStatus(contact._id, 'replied');
            }}
          >
            <FaCheckCircle /> Mark Replied
          </button>
        )}
        {contact.status !== 'closed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStatus(contact._id, 'closed');
            }}
          >
            <FaArchive /> Close
          </button>
        )}
        <div className={styles.menuDivider} />
        <button
          className={styles.danger}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(contact._id);
          }}
        >
          <FaTrash /> Delete
        </button>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Messages</h1>
          <p className={styles.subtitle}>Manage all customer inquiries</p>
        </div>
        {contacts.length > 0 && (
          <span className={styles.countBadge}>
            {contacts.length} {contacts.length === 1 ? 'message' : 'messages'}
          </span>
        )}
      </div>

      {/* ===== Stats ===== */}
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard icon={<FaEnvelope />} label="Total" value={stats.total} color="#1a237e" bg="#e8eaf6" />
          <StatCard icon={<FaClock />} label="New" value={stats.new} color="#f57c00" bg="#fff3e0" />
          <StatCard icon={<FaEnvelopeOpen />} label="Read" value={stats.read} color="#1976d2" bg="#e3f2fd" />
          <StatCard icon={<FaReply />} label="Replied" value={stats.replied} color="#2e7d32" bg="#e8f5e9" />
        </div>
      )}

      {/* ===== Filters ===== */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            inputMode="search"
            placeholder="Search by name, email, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {fetching && <FaSpinner className={styles.searchSpinner} />}
          {searchTerm && !fetching && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className={styles.filterBtns}>
          {filterChips.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`${styles.filterBtn} ${
                statusFilter === f.key ? styles.active : ''
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={styles.filterBtnCount}>{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : error ? (
        <div className={styles.errorBox}>⚠️ {error}</div>
      ) : contacts.length === 0 ? (
        <div className={styles.emptyBox}>
          {debouncedSearch
            ? `No results for "${debouncedSearch}"`
            : 'No contact messages yet'}
        </div>
      ) : (
        <>
          {/* ============ DESKTOP TABLE ============ */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colSender}>Sender</th>
                  <th className={styles.colContact}>Contact</th>
                  <th className={styles.colSubject}>Subject</th>
                  <th className={styles.colPreview}>Message</th>
                  <th className={styles.colStatus}>Status</th>
                  <th className={styles.colDate}>Received</th>
                  <th className={styles.colActions}></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => {
                  const sc = statusConfig[contact.status] || statusConfig.new;
                  const isNew = contact.status === 'new';
                  return (
                    <tr
                      key={contact._id}
                      onClick={() => openContact(contact)}
                      className={isNew ? styles.rowNew : ''}
                    >
                      <td>
                        <div className={styles.senderCell}>
                          <div
                            className={`${styles.avatar} ${
                              isNew ? styles.avatarNew : styles.avatarRead
                            }`}
                          >
                            {contact.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className={styles.senderInfo}>
                            <p className={styles.senderName}>
                              <Highlight text={contact.name} query={debouncedSearch} />
                            </p>
                            <p className={styles.senderEmail}>
                              <Highlight text={contact.email} query={debouncedSearch} />
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.contactCell}>
                          <span className={styles.contactLine}>
                            <FaEnvelope /> {contact.email}
                          </span>
                          {contact.phone && (
                            <span className={styles.contactLine}>
                              <FaPhone /> {contact.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={styles.subject}>
                          <Highlight text={contact.subject} query={debouncedSearch} />
                        </span>
                      </td>

                      <td>
                        <span className={styles.preview}>
                          <Highlight text={contact.message} query={debouncedSearch} />
                        </span>
                      </td>

                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </td>

                      <td>
                        <span className={styles.dateCell}>
                          {formatDate(contact.createdAt)}
                        </span>
                      </td>

                      <td className={styles.colActions}>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.dotsBtn}
                            onClick={(e) => openMenuAt(e, contact._id)}
                            aria-label="Actions"
                          >
                            <FaEllipsisV />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS ============ */}
          <div className={styles.cards}>
            {contacts.map((contact) => {
              const sc = statusConfig[contact.status] || statusConfig.new;
              const isNew = contact.status === 'new';
              return (
                <div
                  key={contact._id}
                  className={`${styles.card} ${isNew ? styles.cardNew : ''}`}
                  onClick={() => openContact(contact)}
                >
                  {/* Head: avatar + name/email + status */}
                  <div className={styles.cardHead}>
                    <div
                      className={`${styles.cardAvatar} ${
                        isNew ? styles.avatarNew : styles.avatarRead
                      }`}
                    >
                      {contact.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className={styles.cardHeadInfo}>
                      <p className={styles.cardName}>{contact.name}</p>
                      <p className={styles.cardEmail}>{contact.email}</p>
                    </div>
                    <span
                      className={styles.cardStatus}
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className={styles.cardSubject}>{contact.subject}</p>

                  {/* Message preview (2 lines) */}
                  <p className={styles.cardPreview}>{contact.message}</p>

                  {/* Foot: date + quick actions */}
                  <div className={styles.cardFoot}>
                    <span className={styles.cardDate}>
                      <FaClock /> {formatDate(contact.createdAt)}
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.cardIconBtn} ${styles.reply}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${contact.email}?subject=Re: ${contact.subject}`;
                          updateStatus(contact._id, 'replied');
                        }}
                        aria-label="Reply"
                      >
                        <FaReply />
                      </button>
                      <button
                        className={styles.cardIconBtn}
                        onClick={(e) => openMenuAt(e, contact._id)}
                        aria-label="More"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== Global Menu Portal ===== */}
          {menu.open && (
            <>
              {contacts.map((c) => renderMenu(c))}
            </>
          )}

          {/* ===== Pagination ===== */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={styles.pageBtn}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== Modal ===== */}
      {showModal && selectedContact && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                <FaEnvelope /> Message Details
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.senderBox}>
                <h3 className={styles.senderName}>{selectedContact.name}</h3>
                <div className={styles.senderMeta}>
                  <span>
                    <FaEnvelope /> {selectedContact.email}
                  </span>
                  {selectedContact.phone && (
                    <span>
                      <FaPhone /> {selectedContact.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <label className={styles.sectionLabel}>Subject</label>
                <p className={styles.sectionValue}>{selectedContact.subject}</p>
              </div>

              <div className={styles.section}>
                <label className={styles.sectionLabel}>Message</label>
                <p className={styles.messageBox}>{selectedContact.message}</p>
              </div>

              <p className={styles.dateLine}>
                Received: {formatFullDate(selectedContact.createdAt)}
              </p>

              <div className={styles.modalActions}>
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className={styles.btnReply}
                  onClick={() => updateStatus(selectedContact._id, 'replied')}
                >
                  <FaReply /> Reply
                </a>

                {selectedContact.status !== 'closed' && (
                  <button
                    onClick={() => updateStatus(selectedContact._id, 'closed')}
                    className={styles.btnClose}
                  >
                    <FaArchive /> Close
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedContact._id)}
                  className={styles.btnDelete}
                  aria-label="Delete"
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
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: bg, color }}>
      {icon}
    </div>
    <div className={styles.statInfo}>
      <p className={styles.statLabel}>{label}</p>
      <h3 className={styles.statValue} style={{ color }}>
        {value}
      </h3>
    </div>
  </div>
);

export default ManageContacts;