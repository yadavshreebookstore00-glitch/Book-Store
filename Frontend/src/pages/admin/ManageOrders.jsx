import React, { useState, useEffect, useRef } from 'react';
import {
  FaEllipsisV,
  FaEye,
  FaCopy,
  FaPrint,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaCreditCard,
  FaSearch,
  FaBox,
} from 'react-icons/fa';
import QRCode from 'qrcode';
import api from '../../services/api';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors = {
  Pending:    { bg: '#fff3e0', color: '#f57c00' },
  Processing: { bg: '#e3f2fd', color: '#1976d2' },
  Shipped:    { bg: '#f3e5f5', color: '#6a1b9a' },
  Delivered:  { bg: '#e8f5e9', color: '#2e7d32' },
  Cancelled:  { bg: '#ffebee', color: '#c62828' },
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const menuRef = useRef(null);
  const scrollYRef = useRef(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  useEffect(() => {
    if (selectedOrder) {
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
  }, [selectedOrder]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.shippingAddress?.name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      setOpenMenu(null);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter((o) => o._id !== orderId));
      setOpenMenu(null);
    } catch {
      alert('Failed to delete order');
    }
  };

  const handleCopyId = async (id) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement('textarea');
        ta.value = id;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      alert('Order ID copied!');
    } catch {
      alert('Copy failed. Order ID: ' + id);
    }
    setOpenMenu(null);
  };

  const handlePrint = async (order) => {
    const fmt = (d) =>
      new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

    const qrPayload = JSON.stringify({
      order: '#' + order._id.slice(-8).toUpperCase(),
      date: fmt(order.createdAt),
      customer: order.user?.name || order.shippingAddress?.name || 'Guest',
      amount: order.totalPrice,
      payment: order.paymentMethod,
      status: order.status,
      items: order.orderItems.length,
    });

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 140, margin: 0,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('QR error:', err);
    }

    const logoUrl = `${window.location.origin}/logo.png`;
    const printWindow = window.open('', '_blank', 'width=420,height=760');
    if (!printWindow) {
      alert('Please allow popups to print.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receipt</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            font-family: 'Courier New', monospace;
            background: #fff;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body { width: 80mm; padding: 4mm 3mm; margin: 0 auto; }
          .logo-wrap { text-align: center; margin-bottom: 4px; }
          .logo-wrap img {
            max-width: 55mm; max-height: 22mm;
            object-fit: contain;
            filter: grayscale(100%) contrast(200%);
          }
          .store-name {
            text-align: center; font-size: 15px; font-weight: 900;
            letter-spacing: 0.5px; margin-top: 2px;
          }
          .store-sub {
            text-align: center; font-size: 10px; font-weight: 700; margin-top: 1px;
          }
          .store-info {
            text-align: center; font-size: 9px; margin-top: 2px; line-height: 1.35;
          }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .info-row {
            display: flex; justify-content: space-between;
            font-size: 10px; padding: 1px 0; gap: 6px;
          }
          .info-row span:first-child { font-weight: 700; }
          .info-row span:last-child { text-align: right; word-break: break-word; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          thead th {
            border-bottom: 1px solid #000; border-top: 1px solid #000;
            padding: 3px 1px; text-align: left; font-weight: 900;
            font-size: 9.5px; text-transform: uppercase;
          }
          thead th:last-child, tbody td:last-child { text-align: right; }
          thead th:nth-child(2), tbody td:nth-child(2) { text-align: center; }
          tbody td {
            padding: 3px 1px; border-bottom: 1px dotted #999;
            vertical-align: top; word-break: break-word;
          }
          .item-name { font-weight: 700; font-size: 10px; }
          .totals { margin-top: 4px; }
          .grand-total {
            display: flex; justify-content: space-between;
            font-size: 14px; font-weight: 900;
            border-top: 2px solid #000; border-bottom: 2px solid #000;
            padding: 5px 0; margin-top: 3px;
          }
          .qr-section { text-align: center; margin-top: 6px; }
          .qr-section img { width: 32mm; height: 32mm; }
          .qr-label {
            font-size: 8.5px; font-weight: 700; margin-top: 2px;
            letter-spacing: 0.3px;
          }
          .footer {
            text-align: center; margin-top: 6px; padding-top: 5px;
            border-top: 1px dashed #000; font-size: 9.5px; line-height: 1.4;
          }
          .footer strong { font-size: 10.5px; }
        </style>
      </head>
      <body>
        <div class="logo-wrap">
          <img src="${logoUrl}" alt="Logo" onerror="this.style.display='none'" />
        </div>

        <div class="store-name">YADAV SHREE</div>
        <div class="store-sub">BOOK STORE</div>
        <div class="store-info">
          63, 64, Bholaram Ustad Marg,<br/>
          Pipliya Rao, Ring Road,<br/>
          Indore - 452014<br/>
          📞 +91 98765 43210
        </div>

        <div class="divider"></div>

        <div class="info-row"><span>Order ID:</span><span>#${order._id.slice(-8).toUpperCase()}</span></div>
        <div class="info-row"><span>Date:</span><span>${fmt(order.createdAt)}</span></div>
        <div class="info-row"><span>Customer:</span><span>${order.user?.name || order.shippingAddress?.name || 'Guest'}</span></div>
        ${order.user?.email ? `<div class="info-row"><span>Email:</span><span>${order.user.email}</span></div>` : ''}
        <div class="info-row"><span>Payment:</span><span>${order.paymentMethod} (${order.isPaid ? 'Paid' : 'Unpaid'})</span></div>
        <div class="info-row"><span>Status:</span><span>${order.status}</span></div>

        <div class="divider"></div>

        <div class="info-row"><span>Ship To:</span><span></span></div>
        <div class="info-row"><span></span><span>${order.shippingAddress.name}</span></div>
        <div class="info-row"><span></span><span>${order.shippingAddress.street}</span></div>
        <div class="info-row"><span></span><span>${order.shippingAddress.city}, ${order.shippingAddress.state}</span></div>
        <div class="info-row"><span></span><span>PIN - ${order.shippingAddress.pincode}</span></div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Rate</th><th>Amt</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map((item) => `
              <tr>
                <td><div class="item-name">${item.title}</div></td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="grand-total"><span>TOTAL</span><span>₹${order.totalPrice.toFixed(2)}</span></div>
        </div>

        ${qrDataUrl ? `
          <div class="qr-section">
            <img src="${qrDataUrl}" alt="QR" />
            <div class="qr-label">SCAN TO VERIFY ORDER</div>
          </div>
        ` : ''}

        <div class="footer">
          <strong>Thank you for your order!</strong><br/>
          Visit again 🙏<br/>
          www.yadavshree.com
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () { window.focus(); window.print(); }, 200);
          };
          window.onafterprint = function () {
            setTimeout(function () { window.close(); }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setOpenMenu(null);
  };

  if (loading) return <div className="mo-loading">Loading orders...</div>;

  return (
    <div className="mo-wrapper">
      {/* ===== Header ===== */}
      <div className="mo-header">
        <h1 className="mo-title">📦 Manage Orders</h1>
        <p className="mo-subtitle">{filteredOrders.length} of {orders.length} orders</p>
      </div>

      {/* ===== Filters ===== */}
      <div className="mo-filters">
        <div className="mo-search-wrap">
          <FaSearch className="mo-search-icon" />
          <input
            type="text"
            inputMode="search"
            placeholder="Search order / customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mo-search"
          />
        </div>
        <div className="mo-filter-btns">
          {['all', ...statusOptions].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`mo-filter-btn ${statusFilter === s ? 'active' : ''}`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Empty ===== */}
      {filteredOrders.length === 0 ? (
        <div className="mo-empty">📦 No orders found</div>
      ) : (
        <>
          {/* ===== DESKTOP TABLE ===== */}
          <div className="mo-table-wrap">
            <table className="mo-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const sc = statusColors[order.status] || statusColors.Pending;
                  return (
                    <tr key={order._id}>
                      <td className="mo-order-id">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="mo-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="mo-cust-name">{order.user?.name || 'Guest'}</div>
                        <div className="mo-cust-email">{order.user?.email || ''}</div>
                      </td>
                      <td><span className="mo-items-badge">📦 {order.orderItems.length}</span></td>
                      <td>
                        <div className="mo-payment">{order.paymentMethod}</div>
                        <div className={`mo-paid ${order.isPaid ? 'paid' : 'unpaid'}`}>
                          {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                        </div>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="mo-status-select"
                          style={{ background: sc.bg, color: sc.color, borderColor: sc.color }}
                        >
                          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="mo-total">₹{order.totalPrice.toFixed(0)}</td>
                      <td className="text-center">
                        <div className="mo-menu-wrap" ref={openMenu === order._id ? menuRef : null}>
                          <button
                            className="mo-dots-btn"
                            onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)}
                            aria-label="Actions"
                          >
                            <FaEllipsisV />
                          </button>
                          {openMenu === order._id && (
                            <div className="mo-menu">
                              <button onClick={() => { setSelectedOrder(order); setOpenMenu(null); }}>
                                <FaEye /> View Details
                              </button>
                              <button onClick={() => handleCopyId(order._id)}>
                                <FaCopy /> Copy Order ID
                              </button>
                              <button onClick={() => handlePrint(order)}>
                                <FaPrint /> Print Receipt
                              </button>
                              <button className="danger" onClick={() => handleDelete(order._id)}>
                                <FaTrash /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ============================================================
              ===== MOBILE CARDS — COMPACT CLEAN DESIGN =====
              ============================================================ */}
          <div className="mo-cards">
            {filteredOrders.map((order) => {
              const sc = statusColors[order.status] || statusColors.Pending;
              return (
                <div key={order._id} className="mo-card">
                  {/* Row 1: Order ID + Amount + Menu */}
                  <div className="mo-card-head">
                    <div className="mo-card-head-left">
                      <span className="mo-card-id">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="mo-card-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="mo-card-head-right">
                      <span className="mo-card-amount">
                        ₹{order.totalPrice.toFixed(0)}
                      </span>
                      <div className="mo-menu-wrap">
                        <button
                          className="mo-dots-btn"
                          onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)}
                          aria-label="Actions"
                        >
                          <FaEllipsisV />
                        </button>
                        {openMenu === order._id && (
                          <div className="mo-menu">
                            <button onClick={() => { setSelectedOrder(order); setOpenMenu(null); }}>
                              <FaEye /> View Details
                            </button>
                            <button onClick={() => handleCopyId(order._id)}>
                              <FaCopy /> Copy Order ID
                            </button>
                            <button onClick={() => handlePrint(order)}>
                              <FaPrint /> Print Receipt
                            </button>
                            <button className="danger" onClick={() => handleDelete(order._id)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Compact info line */}
                  <div className="mo-card-meta">
                    <span className="mo-card-meta-item">
                      <FaUser /> {order.user?.name || 'Guest'}
                    </span>
                    <span className="mo-card-meta-dot">•</span>
                    <span className="mo-card-meta-item">
                      <FaBox /> {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Row 3: Payment info */}
                  <div className="mo-card-payment">
                    <span className="mo-card-meta-item">
                      <FaCreditCard /> {order.paymentMethod}
                    </span>
                    <span className={`mo-card-paid ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                    </span>
                  </div>

                  {/* Row 4: Status + Print action */}
                  <div className="mo-card-foot">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="mo-status-select mo-status-compact"
                      style={{ background: sc.bg, color: sc.color, borderColor: sc.color }}
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      className="mo-print-mini"
                      onClick={() => handlePrint(order)}
                      aria-label="Print"
                    >
                      <FaPrint />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== MODAL ===== */}
      {selectedOrder && (
        <div className="mo-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h2>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button className="mo-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close">×</button>
            </div>

            <div className="mo-modal-body">
              <div className="mo-modal-section">
                <h3>👤 Customer</h3>
                <p>{selectedOrder.user?.name || 'Guest'}</p>
                <p className="muted">{selectedOrder.user?.email}</p>
              </div>

              <div className="mo-modal-section">
                <h3>📍 Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.name}</p>
                <p className="muted">
                  {selectedOrder.shippingAddress.street},<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>

              <div className="mo-modal-section">
                <h3>💳 Payment</h3>
                <p>{selectedOrder.paymentMethod} • {selectedOrder.isPaid ? '✅ Paid' : '⏳ Unpaid'}</p>
              </div>

              <div className="mo-modal-section">
                <h3>📦 Items ({selectedOrder.orderItems.length})</h3>
                <div className="mo-modal-items">
                  {selectedOrder.orderItems.map((item, i) => (
                    <div key={i} className="mo-modal-item">
                      <img src={item.image} alt={item.title} />
                      <div className="mo-modal-item-info">
                        <div className="mo-modal-item-title">{item.title}</div>
                        <div className="muted">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="mo-modal-item-total">
                        ₹{(item.quantity * item.price).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mo-modal-footer">
              <div className="mo-modal-total">
                <span>Total</span>
                <strong>₹{selectedOrder.totalPrice.toFixed(2)}</strong>
              </div>
              <button className="mo-modal-print" onClick={() => handlePrint(selectedOrder)}>
                <FaPrint /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CSS
          ============================================================ */}
      <style>{`
        /* ================= WRAPPER ================= */
        .mo-wrapper {
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
          max-width: 100%;
          overflow-x: hidden;
        }
        .mo-loading { padding: 60px 20px; text-align: center; color: #666; font-weight: 600; }

        /* ================= HEADER ================= */
        .mo-header { margin-bottom: 20px; }
        .mo-title { color: #1a237e; font-weight: 800; font-size: 24px; margin: 0; line-height: 1.2; }
        .mo-subtitle { color: #666; font-weight: 500; font-size: 13px; margin: 4px 0 0 0; }

        /* ================= FILTERS ================= */
        .mo-filters {
          background: #fff; padding: 14px; border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 18px;
          display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
        }
        .mo-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f5f5f5; padding: 10px 14px; border-radius: 8px;
          flex: 1 1 240px; min-width: 0;
        }
        .mo-search-icon { color: #1a237e; font-size: 14px; flex-shrink: 0; }
        .mo-search {
          flex: 1; border: none; background: transparent; outline: none;
          font-size: 16px; font-weight: 500; color: #333; min-width: 0;
          -webkit-appearance: none; appearance: none; font-family: inherit;
        }
        .mo-search::placeholder { color: #999; }

        .mo-filter-btns { display: flex; gap: 6px; flex-wrap: wrap; }
        .mo-filter-btn {
          padding: 8px 16px; border: 2px solid #ddd; background: #fff; color: #666;
          border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit; white-space: nowrap;
          -webkit-tap-highlight-color: transparent; min-height: 36px;
        }
        .mo-filter-btn.active { border-color: #1a237e; background: #1a237e; color: #fff; }
        .mo-filter-btn:hover:not(.active) { border-color: #1a237e; color: #1a237e; }

        /* ================= EMPTY ================= */
        .mo-empty {
          background: #fff; padding: 60px 20px; border-radius: 12px;
          text-align: center; color: #666; font-weight: 600; font-size: 14px;
        }

        /* ================= DESKTOP TABLE ================= */
        .mo-table-wrap {
          background: #fff; border-radius: 12px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .mo-table { width: 100%; border-collapse: collapse; }
        .mo-table thead tr { background: #f5f5f5; }
        .mo-table th {
          padding: 13px 16px; text-align: left; font-size: 11px;
          font-weight: 700; color: #1a237e; text-transform: uppercase;
          letter-spacing: 0.5px; white-space: nowrap;
        }
        .mo-table td {
          padding: 13px 16px; font-size: 13px; font-weight: 500;
          color: #333; vertical-align: middle; border-bottom: 1px solid #f0f0f0;
        }
        .mo-table tbody tr:hover { background: #fafafa; }
        .mo-table .text-right { text-align: right; }
        .mo-table .text-center { text-align: center; }

        .mo-order-id { font-weight: 700; color: #1a237e; font-size: 12.5px; white-space: nowrap; }
        .mo-date { color: #666; font-size: 12.5px; white-space: nowrap; }
        .mo-cust-name { font-weight: 600; color: #333; }
        .mo-cust-email { font-size: 11px; color: #999; margin-top: 2px; }
        .mo-items-badge {
          background: #e8eaf6; color: #1a237e; padding: 3px 10px;
          border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap;
        }
        .mo-payment { font-weight: 600; font-size: 12.5px; }
        .mo-paid { font-size: 11px; font-weight: 700; margin-top: 2px; }
        .mo-paid.paid { color: #2e7d32; }
        .mo-paid.unpaid { color: #f57c00; }
        .mo-total { text-align: right; font-weight: 800; color: #f57c00; font-size: 15px; white-space: nowrap; }

        /* ================= STATUS SELECT ================= */
        .mo-status-select {
          padding: 6px 24px 6px 12px; border-radius: 14px; font-size: 11.5px;
          font-weight: 700; cursor: pointer; border: 1.5px solid;
          outline: none; font-family: inherit;
          -webkit-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 7px center;
          min-height: 30px;
        }

        /* ================= 3-DOTS MENU ================= */
        .mo-menu-wrap { position: relative; display: inline-block; }
        .mo-dots-btn {
          background: #f5f5f5; border: none; width: 34px; height: 34px;
          border-radius: 8px; cursor: pointer; color: #666;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mo-dots-btn:hover { background: #1a237e; color: #fff; }
        .mo-dots-btn:active { transform: scale(0.95); }
        .mo-menu {
          position: absolute; right: 0; top: 40px; background: #fff;
          border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          padding: 6px; min-width: 200px; z-index: 500;
          animation: moFade 0.15s ease;
        }
        @keyframes moFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mo-menu button {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 11px 12px; border: none; background: transparent;
          border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;
          color: #333; font-family: inherit; text-align: left;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent; min-height: 42px;
        }
        .mo-menu button:hover { background: #f5f5f5; color: #1a237e; }
        .mo-menu button:active { background: #e8eaf6; }
        .mo-menu button.danger { color: #c62828; }
        .mo-menu button.danger:hover { background: #ffebee; }

        /* ================= MOBILE CARDS (hidden by default) ================= */
        .mo-cards { display: none; }

        /* ================= MODAL ================= */
        .mo-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 16px;
          padding-top: calc(16px + env(safe-area-inset-top, 0px));
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          animation: moOverlayFade 0.2s ease;
        }
        @keyframes moOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        .mo-modal {
          background: #fff; border-radius: 14px; width: 100%; max-width: 520px;
          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);
          overflow: hidden; display: flex; flex-direction: column;
          animation: moModalIn 0.2s ease;
        }
        @keyframes moModalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .mo-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0; gap: 10px;
        }
        .mo-modal-header h2 {
          font-size: 16px; color: #1a237e; font-weight: 800; margin: 0;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .mo-modal-close {
          background: transparent; border: none; font-size: 28px; color: #999;
          cursor: pointer; line-height: 1; padding: 0 6px;
          -webkit-tap-highlight-color: transparent; flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .mo-modal-close:hover { background: #f5f5f5; color: #333; }
        .mo-modal-body {
          padding: 20px; overflow-y: auto;
          -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
        }
        .mo-modal-section { margin-bottom: 18px; }
        .mo-modal-section:last-child { margin-bottom: 0; }
        .mo-modal-section h3 {
          font-size: 12px; color: #1a237e; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .mo-modal-section p {
          font-size: 13.5px; font-weight: 500; color: #333;
          margin: 3px 0; line-height: 1.5;
        }
        .mo-modal-section p.muted { color: #888; font-size: 12.5px; }
        .mo-modal-items { display: flex; flex-direction: column; gap: 10px; }
        .mo-modal-item {
          display: flex; align-items: center; gap: 12px;
          padding: 8px; background: #f9f9f9; border-radius: 8px;
        }
        .mo-modal-item img {
          width: 40px; height: 52px; object-fit: cover;
          border-radius: 4px; flex-shrink: 0;
        }
        .mo-modal-item-info { min-width: 0; flex: 1; }
        .mo-modal-item-title {
          font-size: 13px; font-weight: 700; color: #1a237e;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .mo-modal-item-total {
          font-weight: 800; color: #f57c00; font-size: 14px;
          white-space: nowrap; flex-shrink: 0;
        }
        .mo-modal-footer {
          padding: 14px 20px; border-top: 1px solid #f0f0f0;
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-shrink: 0;
          padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
        }
        .mo-modal-total { display: flex; flex-direction: column; min-width: 0; }
        .mo-modal-total span { font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; }
        .mo-modal-total strong { font-size: 20px; color: #f57c00; font-weight: 800; white-space: nowrap; }
        .mo-modal-print {
          background: #1a237e; color: #fff; border: none;
          padding: 12px 20px; border-radius: 8px; font-weight: 700;
          font-size: 13px; cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 8px;
          -webkit-tap-highlight-color: transparent; min-height: 44px;
          white-space: nowrap;
        }
        .mo-modal-print:hover { background: #f57c00; }
        .mo-modal-print:active { transform: scale(0.97); }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 1024px) {
          .mo-wrapper { padding: 20px; }
          .mo-title { font-size: 22px; }
          .mo-table th, .mo-table td { padding: 11px 12px; }
        }

        /* ===== Switch table → cards ===== */
        @media (max-width: 900px) {
          .mo-table-wrap { display: none; }
          .mo-cards { display: block; }
        }

        /* ============================================================
           📱 MOBILE — COMPACT CLEAN UI
           ============================================================ */
        @media (max-width: 768px) {
          .mo-wrapper {
            padding: 10px;
            max-width: 100%;
            overflow-x: hidden;
          }

          .mo-header {
            margin-bottom: 12px;
            padding: 0 2px;
          }
          .mo-title { font-size: 18px; }
          .mo-subtitle { font-size: 11.5px; margin-top: 2px; }

          /* Filters — compact */
          .mo-filters {
            padding: 10px;
            gap: 8px;
            margin-bottom: 12px;
            border-radius: 10px;
          }
          .mo-search-wrap {
            flex: 1 1 100%;
            padding: 9px 12px;
            border-radius: 8px;
          }
          .mo-filter-btns {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            gap: 6px;
            padding-bottom: 2px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mo-filter-btns::-webkit-scrollbar { display: none; }
          .mo-filter-btn {
            flex-shrink: 0;
            padding: 6px 12px;
            font-size: 11.5px;
            min-height: 32px;
            border-width: 1.5px;
          }

          /* ============ COMPACT CARD ============ */
          .mo-cards {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .mo-card {
            background: #fff;
            border-radius: 10px;
            padding: 10px 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            border: 1px solid #f0f0f0;
          }

          /* Head row: ID + date ---- amount + menu */
          .mo-card-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #ececec;
            margin-bottom: 8px;
          }
          .mo-card-head-left {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            flex: 1;
          }
          .mo-card-id {
            font-size: 13px;
            font-weight: 800;
            color: #1a237e;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }
          .mo-card-date {
            font-size: 10.5px;
            font-weight: 600;
            color: #999;
            background: #f5f5f5;
            padding: 2px 7px;
            border-radius: 8px;
            white-space: nowrap;
          }
          .mo-card-head-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }
          .mo-card-amount {
            font-size: 15px;
            font-weight: 800;
            color: #f57c00;
            letter-spacing: -0.3px;
            white-space: nowrap;
          }

          /* Meta row */
          .mo-card-meta {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            color: #333;
            font-weight: 500;
            margin-bottom: 6px;
            overflow: hidden;
          }
          .mo-card-meta-item {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
          }
          .mo-card-meta-item svg {
            color: #1a237e;
            font-size: 10.5px;
            flex-shrink: 0;
          }
          .mo-card-meta-dot {
            color: #ccc;
            font-size: 12px;
            flex-shrink: 0;
          }

          /* Payment row */
          .mo-card-payment {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 12px;
            color: #333;
            font-weight: 500;
            margin-bottom: 8px;
          }
          .mo-card-paid {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            white-space: nowrap;
          }
          .mo-card-paid.paid { color: #2e7d32; background: #e8f5e9; }
          .mo-card-paid.unpaid { color: #f57c00; background: #fff3e0; }

          /* Foot row: status + print */
          .mo-card-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .mo-status-compact {
            font-size: 11px;
            padding: 5px 22px 5px 10px;
            min-height: 28px;
            border-radius: 12px;
          }
          .mo-print-mini {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: #e3f2fd;
            color: #1976d2;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .mo-print-mini:hover { background: #1976d2; color: #fff; }
          .mo-print-mini:active { transform: scale(0.94); }

          /* Dots button smaller */
          .mo-card .mo-dots-btn {
            width: 30px;
            height: 30px;
            font-size: 12px;
            border-radius: 7px;
          }

          /* Menu positioned right */
          .mo-card .mo-menu {
            top: 36px;
            min-width: 180px;
          }
        }

        /* ===== Very small phones ===== */
        @media (max-width: 400px) {
          .mo-wrapper { padding: 8px; }
          .mo-title { font-size: 17px; }
          .mo-card { padding: 9px 10px; }
          .mo-card-id { font-size: 12px; }
          .mo-card-amount { font-size: 14px; }
          .mo-card-meta { font-size: 11.5px; }
          .mo-card-date { font-size: 10px; padding: 2px 6px; }
          .mo-status-compact { font-size: 10.5px; padding: 4px 20px 4px 9px; }
          .mo-print-mini { width: 30px; height: 30px; }
          .mo-card .mo-dots-btn { width: 28px; height: 28px; font-size: 11px; }
        }

        /* ===== Modal on mobile ===== */
        @media (max-width: 480px) {
          .mo-modal {
            max-width: 100%;
            max-height: calc(100vh - 20px);
            max-height: calc(100dvh - 20px);
            border-radius: 12px;
          }
          .mo-modal-overlay { padding: 10px; }
          .mo-modal-header { padding: 14px 16px; }
          .mo-modal-body { padding: 16px; }
          .mo-modal-footer {
            flex-direction: column;
            align-items: stretch;
            padding: 12px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          }
          .mo-modal-print { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default ManageOrders;