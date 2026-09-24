import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaBook,
  FaShoppingBag,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaExclamationTriangle,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#1a237e', '#f57c00', '#2e7d32', '#c62828', '#6a1b9a', '#0277bd', '#00838f', '#ef6c00'];

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
      <div style={{ padding: '60px', textAlign: 'center', fontWeight: 600 }}>
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        background: '#ffebee',
        color: '#c62828',
        padding: '20px',
        borderRadius: '12px',
        fontWeight: 600,
      }}>
        ⚠️ {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const { stats, orderStatus, recentOrders, lowStockBooks, salesChartData, topBooks, categoryChartData } = data;

  // ===== Stat Cards Config =====
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
  ];

  // ===== Order Status Donut Data =====
  const orderStatusData = Object.entries(orderStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  const statusColors = {
    Pending: '#f57c00',
    Processing: '#1976d2',
    Shipped: '#6a1b9a',
    Delivered: '#2e7d32',
    Cancelled: '#c62828',
  };

  return (
    <div>
      {/* ===== Header ===== */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{
          color: '#1a237e',
          fontWeight: 800,
          fontSize: '26px',
          margin: 0,
          marginBottom: '5px',
        }}>
          Dashboard Overview
        </h1>
        <p style={{
          color: '#666',
          fontWeight: 500,
          fontSize: '14px',
          margin: 0,
        }}>
          Welcome back, <span style={{ color: '#f57c00', fontWeight: 700 }}>{user?.name}</span>! 👋
        </p>
      </div>

      {/* ===== Today's Highlight ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        borderRadius: '12px',
        padding: '20px 25px',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        color: '#fff',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, opacity: 0.85, marginBottom: '3px' }}>
            TODAY'S PERFORMANCE
          </p>
          <p style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            📈 {stats.todayOrders} orders • ₹{stats.todayRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 700,
        }}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
      }}>
        {statCards.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#fff',
                padding: '22px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                borderLeft: `5px solid ${stat.color}`,
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '55px',
                height: '55px',
                borderRadius: '12px',
                background: stat.bg,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  fontWeight: 600,
                  marginBottom: '4px',
                  margin: 0,
                }}>
                  {stat.title}
                </p>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: stat.color,
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {stat.value}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== Charts Row 1: Sales + Order Status ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
      }}>
        {/* Sales Chart */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              margin: 0,
              marginBottom: '3px',
            }}>
              📈 Monthly Sales
            </h3>
            <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
              Last 6 months revenue trend
            </p>
          </div>

          {salesChartData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#999',
              fontWeight: 500,
              fontSize: '13px',
            }}>
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#666' }}
                />
                <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    fontWeight: 600,
                  }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a237e"
                  strokeWidth={3}
                  dot={{ fill: '#f57c00', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              margin: 0,
              marginBottom: '3px',
            }}>
              🥧 Order Status
            </h3>
            <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
              Current orders by status
            </p>
          </div>

          {orderStatusData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#999',
              fontWeight: 500,
              fontSize: '13px',
            }}>
              No orders yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderStatusData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={statusColors[entry.name] || COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ===== Charts Row 2: Top Books + Categories ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
      }}>
        {/* Top Selling Books */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              margin: 0,
              marginBottom: '3px',
            }}>
              🏆 Top Selling Books
            </h3>
            <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
              Top 5 bestsellers by quantity
            </p>
          </div>

          {topBooks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#999',
              fontWeight: 500,
              fontSize: '13px',
            }}>
              No sales yet
            </div>
          ) : (
            topBooks.map((book, i) => (
              <div
                key={book._id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: i < topBooks.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: i === 0 ? '#f57c00' : i === 1 ? '#1a237e' : '#666',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <img
                  src={book.image}
                  alt={book.title}
                  style={{
                    width: '35px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/35x48';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1a237e',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {book.title}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    {book.totalSold} sold
                  </p>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#f57c00',
                  flexShrink: 0,
                }}>
                  ₹{book.revenue}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Category Distribution */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              margin: 0,
              marginBottom: '3px',
            }}>
              📚 Books by Category
            </h3>
            <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
              Category wise book count
            </p>
          </div>

          {categoryChartData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#999',
              fontWeight: 500,
              fontSize: '13px',
            }}>
              No books yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="value" fill="#f57c00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ===== Recent Orders + Low Stock ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* Recent Orders */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <h3 style={{
                color: '#1a237e',
                fontWeight: 800,
                fontSize: '17px',
                margin: 0,
                marginBottom: '3px',
              }}>
                🕐 Recent Orders
              </h3>
              <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
                Latest 5 orders
              </p>
            </div>
            <Link
              to="/admin/orders"
              style={{
                color: '#f57c00',
                fontWeight: 700,
                fontSize: '12px',
                textDecoration: 'none',
                background: '#fff3e0',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#999',
              fontWeight: 500,
              fontSize: '13px',
            }}>
              No orders yet
            </div>
          ) : (
            recentOrders.map((order) => {
              const statusColor = statusColors[order.status] || '#666';
              return (
                <div
                  key={order._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${statusColor}15`,
                    color: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    {order.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1a237e',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {order.user?.name || 'Unknown User'}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#666',
                      fontWeight: 500,
                      margin: 0,
                    }}>
                      #{order._id.slice(-6).toUpperCase()} •{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#f57c00',
                      margin: 0,
                    }}>
                      ₹{order.totalPrice}
                    </p>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: statusColor,
                      background: `${statusColor}15`,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'inline-block',
                      marginTop: '3px',
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Low Stock Alert */}
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <h3 style={{
                color: '#c62828',
                fontWeight: 800,
                fontSize: '17px',
                margin: 0,
                marginBottom: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <FaExclamationTriangle /> Low Stock Alert
              </h3>
              <p style={{ color: '#666', fontSize: '12px', fontWeight: 500, margin: 0 }}>
                Books with stock ≤ 5
              </p>
            </div>
            <Link
              to="/admin/books"
              style={{
                color: '#f57c00',
                fontWeight: 700,
                fontSize: '12px',
                textDecoration: 'none',
                background: '#fff3e0',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              Manage →
            </Link>
          </div>

          {lowStockBooks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              color: '#2e7d32',
              fontWeight: 700,
              fontSize: '13px',
              background: '#e8f5e9',
              borderRadius: '8px',
            }}>
              ✅ All books are well-stocked!
            </div>
          ) : (
            lowStockBooks.map((book) => (
              <div
                key={book._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  style={{
                    width: '35px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/35x48';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1a237e',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {book.title}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    margin: 0,
                    color: book.stock === 0 ? '#c62828' : '#f57c00',
                  }}>
                    {book.stock === 0
                      ? '❌ Out of Stock'
                      : `⚠️ Only ${book.stock} left`}
                  </p>
                </div>
                <Link
                  to="/admin/books"
                  style={{
                    color: '#1a237e',
                    background: '#e8eaf6',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <FaEye /> Fix
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;