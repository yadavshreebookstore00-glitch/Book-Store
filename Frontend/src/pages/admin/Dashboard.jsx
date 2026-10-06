import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaBook,
  FaShoppingBag,
  FaRupeeSign,
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaClock,
  FaArrowRight,
  FaChartLine,
  FaChartPie,
  FaTrophy,
  FaLayerGroup,
  FaHistory,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInbox,
  FaCalendarAlt,
  FaBolt,
  FaEdit,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardSkeleton from '../../components/common/DashboardSkeleton';

const COLORS = ['#1a237e', '#f57c00', '#2e7d32', '#c62828', '#6a1b9a', '#0277bd', '#00838f', '#ef6c00'];

const STATUS_COLORS = {
  Pending: '#f57c00',
  Processing: '#1976d2',
  Shipped: '#6a1b9a',
  Delivered: '#2e7d32',
  Cancelled: '#c62828',
};

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #eceef7',
  boxShadow: '0 6px 18px rgba(26,35,126,.12)',
  fontWeight: 600,
  fontSize: 12,
  padding: '6px 10px',
};

const axisTick = { fontSize: 11, fontWeight: 600, fill: '#8a8fa5' };

// ============================================================
// STYLES
// ============================================================
const css = `
.db{max-width:1400px;margin:0 auto;box-sizing:border-box}
.db *{box-sizing:border-box}

/* Header */
.db-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.db-head h1{margin:0;color:#1a237e;font-weight:800;font-size:22px;line-height:1.2}
.db-head p{margin:2px 0 0;color:#6b7089;font-weight:500;font-size:13px}
.db-head p b{color:#f57c00;font-weight:700}
.db-date{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid #e6e9f5;color:#1a237e;padding:7px 12px;border-radius:20px;font-size:12px;font-weight:700}

/* Today banner */
.db-today{background:linear-gradient(135deg,#1a237e,#3949ab);border-radius:12px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px;color:#fff}
.db-today-icon{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.db-today small{display:block;font-size:10.5px;font-weight:700;letter-spacing:.7px;opacity:.8;text-transform:uppercase}
.db-today b{font-size:16px;font-weight:800}
.db-today-split{margin-left:auto;display:flex;gap:20px}
.db-today-split div{text-align:right}

/* Stat cards */
.db-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:14px}
.db-stat{position:relative;background:#fff;border-radius:12px;padding:13px 14px;box-shadow:0 1px 8px rgba(26,35,126,.06);display:flex;align-items:center;gap:12px;text-decoration:none;border:1px solid transparent;transition:transform .18s,box-shadow .18s,border-color .18s}
.db-stat:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(26,35,126,.12);border-color:var(--c)}
.db-stat-icon{width:40px;height:40px;border-radius:10px;background:var(--bg);color:var(--c);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.db-stat-body{min-width:0}
.db-stat-label{margin:0;font-size:11.5px;color:#7a7f98;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.db-stat-value{margin:1px 0 0;font-size:20px;font-weight:800;color:#1b1f3b;line-height:1.15;word-break:break-word}
.db-badge{position:absolute;top:8px;right:8px;background:#f57c00;color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:10px;letter-spacing:.3px;text-transform:uppercase}

/* Grids */
.db-row{display:grid;gap:14px;margin-bottom:14px}
.db-row.r-chart{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.db-row.r-half{grid-template-columns:repeat(2,minmax(0,1fr))}

/* Panel */
.db-panel{background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(26,35,126,.06);padding:16px}
.db-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.db-title{display:flex;align-items:center;gap:9px;min-width:0}
.db-title-icon{width:30px;height:30px;border-radius:8px;background:var(--bg,#e8eaf6);color:var(--c,#1a237e);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.db-title h3{margin:0;font-size:14.5px;font-weight:800;color:#1b1f3b;line-height:1.2;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.db-title p{margin:1px 0 0;font-size:11.5px;color:#8a8fa5;font-weight:500}
.db-link{display:inline-flex;align-items:center;gap:5px;flex-shrink:0;background:var(--bg,#e8eaf6);color:var(--c,#1a237e);padding:6px 11px;border-radius:7px;font-size:11.5px;font-weight:700;text-decoration:none;white-space:nowrap;transition:filter .15s}
.db-link:hover{filter:brightness(.95)}
.db-pill{background:#f57c00;color:#fff;font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:10px;letter-spacing:.3px}

/* Empty */
.db-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:34px 16px;color:#a0a5ba;font-weight:600;font-size:12.5px;background:#fafbfe;border-radius:10px}
.db-empty svg{font-size:24px;color:#cfd3e4}
.db-empty.good{background:#e8f5e9;color:#2e7d32}
.db-empty.good svg{color:#2e7d32}

/* Donut legend */
.db-donut{position:relative}
.db-donut-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.db-donut-center b{display:block;font-size:22px;font-weight:800;color:#1b1f3b;line-height:1}
.db-donut-center span{font-size:10.5px;color:#8a8fa5;font-weight:600}
.db-legend{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin-top:6px}
.db-legend div{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#555}
.db-legend i{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.db-legend b{margin-left:auto;color:#1b1f3b;font-weight:800}

/* Lists */
.db-list{display:flex;flex-direction:column}
.db-item{display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid #f1f2f8;text-decoration:none;color:inherit}
.db-item:last-child{border-bottom:none;padding-bottom:0}
.db-item:first-child{padding-top:0}
.db-rank{width:26px;height:26px;border-radius:7px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0}
.db-cover{width:32px;height:44px;object-fit:cover;border-radius:5px;flex-shrink:0;background:#eef0f7}
.db-avatar{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0}
.db-item-main{flex:1;min-width:0}
.db-item-title{margin:0;font-size:12.5px;font-weight:700;color:#1b1f3b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px}
.db-item-sub{margin:1px 0 0;font-size:11px;color:#8a8fa5;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.db-item-sub.warn{color:#f57c00;font-weight:600;display:flex;align-items:center;gap:5px}
.db-item-sub.bad{color:#c62828;font-weight:600;display:flex;align-items:center;gap:5px}
.db-item-end{text-align:right;flex-shrink:0}
.db-money{margin:0;font-size:12.5px;font-weight:800;color:#f57c00}
.db-time{font-size:10.5px;color:#8a8fa5;font-weight:600}
.db-status{display:inline-block;margin-top:2px;font-size:10px;font-weight:700;padding:1px 8px;border-radius:10px}
.db-new{background:#f57c00;color:#fff;font-size:8.5px;font-weight:800;padding:1px 6px;border-radius:8px;letter-spacing:.3px;flex-shrink:0}
.db-fix{display:inline-flex;align-items:center;gap:5px;background:#e8eaf6;color:#1a237e;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;flex-shrink:0}

/* Contact mini stats */
.db-mini{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}
.db-mini-card{display:flex;align-items:center;gap:9px;background:var(--bg);border:1px solid color-mix(in srgb,var(--c) 15%,transparent);border-radius:9px;padding:9px 10px}
.db-mini-icon{width:28px;height:28px;border-radius:7px;background:#fff;color:var(--c);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.db-mini-card span{display:block;font-size:10px;font-weight:700;color:#6b7089;text-transform:uppercase;letter-spacing:.4px}
.db-mini-card b{display:block;font-size:16px;font-weight:800;color:var(--c);line-height:1.1}

/* Error */
.db-error{display:flex;align-items:center;gap:10px;background:#ffebee;color:#c62828;padding:14px 16px;border-radius:12px;font-weight:600;font-size:14px}

/* ============ Tablet ============ */
@media (max-width:1100px){
  .db-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:900px){
  .db-row.r-chart,.db-row.r-half{grid-template-columns:1fr}
}

/* ============ Phone ============ */
@media (max-width:640px){
  .db-head h1{font-size:19px}
  .db-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .db-stat{padding:11px;gap:10px}
  .db-stat-icon{width:36px;height:36px;font-size:14px}
  .db-stat-value{font-size:17px}
  .db-today{flex-wrap:wrap;padding:12px}
  .db-today-split{margin-left:0;width:100%;justify-content:space-between}
  .db-today-split div{text-align:left}
  .db-panel{padding:14px}
  .db-mini{grid-template-columns:repeat(2,minmax(0,1fr))}
  .db-link span{display:none}
}
`;

// ============================================================
// Small helpers
// ============================================================
const Panel = ({ icon, color = '#1a237e', bg = '#e8eaf6', title, sub, badge, action, children }) => (
  <div className="db-panel" style={{ '--c': color, '--bg': bg }}>
    <div className="db-panel-head">
      <div className="db-title">
        <div className="db-title-icon">{icon}</div>
        <div style={{ minWidth: 0 }}>
          <h3>
            {title}
            {badge ? <span className="db-pill">{badge}</span> : null}
          </h3>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Empty = ({ text, good = false, icon }) => (
  <div className={`db-empty ${good ? 'good' : ''}`}>
    {icon || <FaInbox />}
    <span>{text}</span>
  </div>
);

const MiniStat = ({ icon, label, value, color, bg }) => (
  <div className="db-mini-card" style={{ '--c': color, '--bg': bg }}>
    <div className="db-mini-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  </div>
);

const formatDate = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// ============================================================
// Dashboard
// ============================================================
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard/stats');
        setData(data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="db-error">
        <style>{css}</style>
        <FaExclamationTriangle /> {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const {
    stats,
    orderStatus,
    recentOrders,
    recentContacts = [],
    lowStockBooks,
    salesChartData,
    topBooks,
    categoryChartData,
  } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: '#1a237e',
      bg: '#e8eaf6',
      link: '/admin/users',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: <FaBook />,
      color: '#f57c00',
      bg: '#fff3e0',
      link: '/admin/books',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FaShoppingBag />,
      color: '#2e7d32',
      bg: '#e8f5e9',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: <FaRupeeSign />,
      color: '#c62828',
      bg: '#ffebee',
      link: '/admin/orders',
    },
    {
      title: 'Messages',
      value: stats.totalContacts || 0,
      icon: <FaEnvelope />,
      color: '#6a1b9a',
      bg: '#f3e5f5',
      link: '/admin/contacts',
      badge: stats.unreadContacts > 0 ? `${stats.unreadContacts} new` : null,
    },
  ];

  const orderStatusData = Object.entries(orderStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));
  const orderTotal = orderStatusData.reduce((sum, s) => sum + s.value, 0);
  const statusColor = (name, idx = 0) => STATUS_COLORS[name] || COLORS[idx % COLORS.length];

  const rankColor = (i) => (i === 0 ? '#f57c00' : i === 1 ? '#1a237e' : '#8a8fa5');

  return (
    <div className="db">
      <style>{css}</style>

      {/* ===== Header ===== */}
      <div className="db-head">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Welcome back, <b>{user?.name}</b>
          </p>
        </div>
        <div className="db-date">
          <FaCalendarAlt />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </div>
      </div>

      {/* ===== Today banner ===== */}
      <div className="db-today">
        <div className="db-today-icon">
          <FaBolt />
        </div>
        <div>
          <small>Today's performance</small>
          <b>Live summary</b>
        </div>
        <div className="db-today-split">
          <div>
            <small>Orders</small>
            <b>{stats.todayOrders}</b>
          </div>
          <div>
            <small>Revenue</small>
            <b>₹{stats.todayRevenue.toLocaleString('en-IN')}</b>
          </div>
        </div>
      </div>

      {/* ===== Stat cards ===== */}
      <div className="db-stats">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="db-stat"
            style={{ '--c': stat.color, '--bg': stat.bg }}
          >
            {stat.badge && <span className="db-badge">{stat.badge}</span>}
            <div className="db-stat-icon">{stat.icon}</div>
            <div className="db-stat-body">
              <p className="db-stat-label">{stat.title}</p>
              <h2 className="db-stat-value">{stat.value}</h2>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== Charts row 1 ===== */}
      <div className="db-row r-chart">
        <Panel
          icon={<FaChartLine />}
          title="Monthly Sales"
          sub="Last 6 months revenue trend"
        >
          {salesChartData.length === 0 ? (
            <Empty text="No sales data yet" icon={<FaChartLine />} />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={salesChartData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a237e"
                  strokeWidth={2.5}
                  dot={{ fill: '#f57c00', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel
          icon={<FaChartPie />}
          color="#6a1b9a"
          bg="#f3e5f5"
          title="Order Status"
          sub="Current orders by status"
        >
          {orderStatusData.length === 0 ? (
            <Empty text="No orders yet" icon={<FaShoppingBag />} />
          ) : (
            <>
              <div className="db-donut">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderStatusData.map((entry, idx) => (
                        <Cell key={entry.name} fill={statusColor(entry.name, idx)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-donut-center">
                  <b>{orderTotal}</b>
                  <span>Orders</span>
                </div>
              </div>
              <div className="db-legend">
                {orderStatusData.map((s, idx) => (
                  <div key={s.name}>
                    <i style={{ background: statusColor(s.name, idx) }} />
                    {s.name}
                    <b>{s.value}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* ===== Contact messages ===== */}
      <div style={{ marginBottom: 14 }}>
        <Panel
          icon={<FaEnvelope />}
          color="#6a1b9a"
          bg="#f3e5f5"
          title="Contact Messages"
          sub="Recent customer inquiries"
          badge={stats.unreadContacts > 0 ? `${stats.unreadContacts} NEW` : null}
          action={
            <Link to="/admin/contacts" className="db-link">
              <span>View All</span> <FaArrowRight size={10} />
            </Link>
          }
        >
          <div className="db-mini">
            <MiniStat icon={<FaEnvelope />} label="Total" value={stats.totalContacts || 0} color="#1a237e" bg="#e8eaf6" />
            <MiniStat icon={<FaClock />} label="Unread" value={stats.unreadContacts || 0} color="#f57c00" bg="#fff3e0" />
            <MiniStat icon={<FaEnvelopeOpen />} label="Read" value={stats.readContacts || 0} color="#1976d2" bg="#e3f2fd" />
            <MiniStat icon={<FaReply />} label="Replied" value={stats.repliedContacts || 0} color="#2e7d32" bg="#e8f5e9" />
          </div>

          {recentContacts.length === 0 ? (
            <Empty text="No messages yet" icon={<FaInbox />} />
          ) : (
            <div className="db-list">
              {recentContacts.map((contact) => {
                const isNew = contact.status === 'new';
                return (
                  <Link key={contact._id} to="/admin/contacts" className="db-item">
                    <div
                      className="db-avatar"
                      style={{
                        background: isNew
                          ? 'linear-gradient(135deg,#f57c00,#ef6c00)'
                          : 'linear-gradient(135deg,#6a1b9a,#8e24aa)',
                        color: '#fff',
                      }}
                    >
                      {contact.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="db-item-main">
                      <p className="db-item-title">
                        {contact.name}
                        {isNew && <span className="db-new">NEW</span>}
                      </p>
                      <p className="db-item-sub">
                        {contact.subject} • {contact.email}
                      </p>
                    </div>
                    <div className="db-item-end">
                      <span className="db-time">{formatDate(contact.createdAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* ===== Charts row 2 ===== */}
      <div className="db-row r-half">
        <Panel
          icon={<FaTrophy />}
          color="#f57c00"
          bg="#fff3e0"
          title="Top Selling Books"
          sub="Top 5 bestsellers by quantity"
        >
          {topBooks.length === 0 ? (
            <Empty text="No sales yet" icon={<FaTrophy />} />
          ) : (
            <div className="db-list">
              {topBooks.map((book, i) => (
                <div key={book._id || i} className="db-item">
                  <div className="db-rank" style={{ background: rankColor(i) }}>
                    {i + 1}
                  </div>
                  <img
                    className="db-cover"
                    src={book.image}
                    alt={book.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/32x44';
                    }}
                  />
                  <div className="db-item-main">
                    <p className="db-item-title">{book.title}</p>
                    <p className="db-item-sub">{book.totalSold} sold</p>
                  </div>
                  <div className="db-item-end">
                    <p className="db-money">₹{book.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          icon={<FaLayerGroup />}
          color="#0277bd"
          bg="#e1f5fe"
          title="Books by Category"
          sub="Category wise book count"
        >
          {categoryChartData.length === 0 ? (
            <Empty text="No books yet" icon={<FaBook />} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryChartData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10.5 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(26,35,126,.05)' }} />
                <Bar dataKey="value" fill="#f57c00" radius={[5, 5, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* ===== Recent orders + Low stock ===== */}
      <div className="db-row r-half" style={{ marginBottom: 0 }}>
        <Panel
          icon={<FaHistory />}
          title="Recent Orders"
          sub="Latest 5 orders"
          action={
            <Link to="/admin/orders" className="db-link" style={{ '--c': '#f57c00', '--bg': '#fff3e0' }}>
              <span>View All</span> <FaArrowRight size={10} />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <Empty text="No orders yet" icon={<FaShoppingBag />} />
          ) : (
            <div className="db-list">
              {recentOrders.map((order) => {
                const color = STATUS_COLORS[order.status] || '#666';
                return (
                  <div key={order._id} className="db-item">
                    <div className="db-avatar" style={{ background: `${color}18`, color }}>
                      {order.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="db-item-main">
                      <p className="db-item-title">{order.user?.name || 'Unknown User'}</p>
                      <p className="db-item-sub">
                        #{order._id.slice(-6).toUpperCase()} •{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="db-item-end">
                      <p className="db-money">₹{order.totalPrice}</p>
                      <span className="db-status" style={{ color, background: `${color}18` }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          icon={<FaExclamationTriangle />}
          color="#c62828"
          bg="#ffebee"
          title="Low Stock Alert"
          sub="Books with stock ≤ 5"
          action={
            <Link to="/admin/books" className="db-link" style={{ '--c': '#f57c00', '--bg': '#fff3e0' }}>
              <span>Manage</span> <FaArrowRight size={10} />
            </Link>
          }
        >
          {lowStockBooks.length === 0 ? (
            <Empty good text="All books are well-stocked" icon={<FaCheckCircle />} />
          ) : (
            <div className="db-list">
              {lowStockBooks.map((book) => (
                <div key={book._id} className="db-item">
                  <img
                    className="db-cover"
                    src={book.image}
                    alt={book.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/32x44';
                    }}
                  />
                  <div className="db-item-main">
                    <p className="db-item-title">{book.title}</p>
                    {book.stock === 0 ? (
                      <p className="db-item-sub bad">
                        <FaTimesCircle /> Out of stock
                      </p>
                    ) : (
                      <p className="db-item-sub warn">
                        <FaExclamationTriangle /> Only {book.stock} left
                      </p>
                    )}
                  </div>
                  <Link to="/admin/books" className="db-fix">
                    <FaEdit /> Fix
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;