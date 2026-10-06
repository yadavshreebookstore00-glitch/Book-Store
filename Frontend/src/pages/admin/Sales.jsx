import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaPrint,
  FaTrash,
  FaFileInvoiceDollar,
  FaRupeeSign,
  FaShoppingBag,
  FaUser,
  FaPhoneAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBoxOpen,
  FaReceipt,
  FaChartLine,
  FaInbox,
} from 'react-icons/fa';
import api from '../../services/api';
import { printInvoice } from '../../utils/printInvoice';

// ===== Payment helpers =====
const paymentIcon = (method) => {
  if (method === 'Cash') return <FaMoneyBillWave />;
  if (method === 'UPI') return <FaMobileAlt />;
  return <FaCreditCard />;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

// ============================================================
// STYLES
// ============================================================
const css = `
.sl-page{padding:20px;max-width:1400px;margin:0 auto;box-sizing:border-box}
.sl-page *{box-sizing:border-box}

/* Header */
.sl-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.sl-header-icon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#1a237e,#3949ab);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.sl-header h1{margin:0;color:#1a237e;font-weight:800;font-size:24px;line-height:1.2}
.sl-header p{margin:2px 0 0;color:#666;font-weight:500;font-size:13px}

/* Summary */
.sl-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.sl-stat{background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 12px rgba(26,35,126,.07);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
.sl-stat::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--c)}
.sl-stat:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(26,35,126,.12)}
.sl-stat-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:12px}
.sl-stat-label{margin:0;font-size:10.5px;color:#8a8fa5;font-weight:800;text-transform:uppercase;letter-spacing:.6px}
.sl-stat-value{margin:5px 0 0;font-size:22px;font-weight:800;color:var(--c);letter-spacing:-.5px;line-height:1.1}
.sl-stat-icon{width:40px;height:40px;border-radius:11px;background:var(--bg);color:var(--c);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.sl-stat-foot{display:flex;gap:8px;flex-wrap:wrap}
.sl-stat-chip{display:inline-flex;align-items:center;gap:5px;background:#f4f5fa;color:#555;padding:4px 9px;border-radius:20px;font-size:11px;font-weight:700}
.sl-stat-chip svg{color:var(--c);font-size:10px}

/* Filters */
.sl-filters{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(26,35,126,.07);padding:14px;margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.sl-search{display:flex;align-items:center;gap:10px;background:#f4f5fa;border:2px solid transparent;border-radius:10px;padding:2px 14px;flex:1 1 260px;transition:border-color .15s,background .15s}
.sl-search:focus-within{border-color:#1a237e;background:#fff}
.sl-search svg{color:#1a237e;font-size:13px;flex-shrink:0}
.sl-search input{flex:1;min-width:0;border:none;background:transparent;outline:none;font-size:14px;font-weight:500;color:#333;padding:11px 0;font-family:inherit}
.sl-clear{background:#e3e5f0;border:none;color:#666;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0}
.sl-chips{display:flex;gap:6px}
.sl-chip{padding:9px 16px;border:2px solid #e0e3f0;background:#fff;color:#666;border-radius:20px;font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s}
.sl-chip:hover:not(.active){border-color:#1a237e;color:#1a237e}
.sl-chip.active{background:#1a237e;border-color:#1a237e;color:#fff;box-shadow:0 4px 10px rgba(26,35,126,.25)}

/* Content */
.sl-content{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(26,35,126,.07);overflow:hidden}
.sl-empty{padding:60px 20px;text-align:center;color:#999}
.sl-empty svg{font-size:44px;color:#d6d9e8;margin-bottom:12px}
.sl-empty p{margin:0;font-weight:700;font-size:15px;color:#666}
.sl-empty small{display:block;margin-top:4px;font-size:12px;font-weight:500}

/* Skeleton */
.sl-skel{padding:6px 18px}
.sl-skel-row{display:flex;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid #f0f0f5}
.sl-skel-row:last-child{border-bottom:none}
.sl-bar{height:14px;border-radius:7px;background:linear-gradient(90deg,#eef0f7 25%,#f8f9fc 50%,#eef0f7 75%);background-size:200% 100%;animation:sl-shine 1.2s infinite}
@keyframes sl-shine{to{background-position:-200% 0}}

/* Table */
.sl-table-wrap{overflow-x:auto}
.sl-table{width:100%;border-collapse:collapse}
.sl-table th{padding:13px 18px;text-align:left;font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:.5px;background:#f5f6fb;white-space:nowrap}
.sl-table td{padding:14px 18px;font-size:13px;font-weight:500;color:#333;vertical-align:middle;border-bottom:1px solid #f0f0f5}
.sl-table tbody tr{transition:background .12s}
.sl-table tbody tr:hover{background:#fafbff}
.sl-table .r{text-align:right}.sl-table .c{text-align:center}
.sl-inv{font-weight:700;color:#1a237e;font-size:12.5px}
.sl-date{color:#555;font-size:12.5px;white-space:nowrap}
.sl-cname{font-weight:600;color:#333}
.sl-cphone{font-size:11px;color:#777;margin-top:2px;display:flex;align-items:center;gap:4px}
.sl-amount{text-align:right;font-weight:800;color:#f57c00;font-size:15px;white-space:nowrap}

.sl-badge{display:inline-flex;align-items:center;gap:5px;background:#e8eaf6;color:#1a237e;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.sl-pay{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.sl-pay.cash{background:#e8f5e9;color:#2e7d32}
.sl-pay.upi{background:#e3f2fd;color:#1976d2}
.sl-pay.others{background:#f3e5f5;color:#6a1b9a}

.sl-acts{display:flex;gap:6px;justify-content:center}
.sl-ibtn{border:none;width:34px;height:34px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;padding:0;transition:all .15s}
.sl-ibtn.print{background:#e3f2fd;color:#1976d2}
.sl-ibtn.print:hover{background:#1976d2;color:#fff}
.sl-ibtn.del{background:#ffebee;color:#c62828}
.sl-ibtn.del:hover{background:#c62828;color:#fff}

/* Mobile cards */
.sl-cards{display:none;padding:10px}
.sl-card{border:1.5px solid #eceef7;border-radius:14px;padding:14px;margin-bottom:10px;background:#fff}
.sl-card:last-child{margin-bottom:0}
.sl-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding-bottom:12px;border-bottom:1px dashed #e3e6f1;margin-bottom:12px}
.sl-card-top small{display:block;font-size:9.5px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px}
.sl-card-inv{font-size:13px;font-weight:700;color:#1a237e;word-break:break-all}
.sl-card-amt{font-size:21px;font-weight:800;color:#f57c00;line-height:1}
.sl-card-info{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin-bottom:12px}
.sl-card-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#333;font-weight:500;min-width:0}
.sl-card-row.full{grid-column:1 / -1}
.sl-card-row svg{color:#1a237e;font-size:11px;flex-shrink:0;width:14px}
.sl-card-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sl-card-foot{display:flex;gap:8px;align-items:center}
.sl-card-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}
.sl-card-btn.print{background:#e3f2fd;color:#1976d2}
.sl-card-btn.del{background:#ffebee;color:#c62828}
.sl-card-btn:active{transform:scale(.98)}

/* Pagination */
.sl-pager{padding:14px;display:flex;justify-content:center;align-items:center;gap:12px;border-top:1px solid #f0f0f5;flex-wrap:wrap}
.sl-page-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:#1a237e;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit;transition:background .15s}
.sl-page-btn:hover:not(:disabled){background:#f57c00}
.sl-page-btn:disabled{background:#f0f1f7;color:#aaa;cursor:not-allowed}
.sl-page-info{font-weight:700;color:#1a237e;font-size:13px}

/* ============ Tablet ============ */
@media (max-width:1024px){
  .sl-page{padding:16px}
  .sl-summary{grid-template-columns:repeat(2,1fr);gap:12px}
}

/* ============ Phone ============ */
@media (max-width:768px){
  .sl-page{padding:12px}
  .sl-header h1{font-size:20px}
  .sl-header-icon{width:40px;height:40px;font-size:17px}
  .sl-summary{gap:10px;margin-bottom:16px}
  .sl-stat{padding:13px}
  .sl-stat-value{font-size:19px}
  .sl-stat-icon{width:34px;height:34px;font-size:14px}
  .sl-filters{padding:12px;gap:10px}
  .sl-search{flex:1 1 100%}
  .sl-search input{font-size:16px} /* stops iOS zoom */
  .sl-chips{width:100%;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}
  .sl-chip{flex:1;padding:9px 12px;text-align:center}
  .sl-table-wrap{display:none}
  .sl-cards{display:block}
  .sl-skel{padding:6px 14px}
}

@media (max-width:380px){
  .sl-stat-value{font-size:17px}
  .sl-card-info{grid-template-columns:1fr}
}
`;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/sales/summary');
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const now = new Date();
      let start = '',
        end = '';

      if (filterType === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (filterType === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        d.setHours(0, 0, 0, 0);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (filterType === 'month') {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (filterType === 'year') {
        const d = new Date(now.getFullYear(), 0, 1);
        start = d.toISOString();
        end = new Date().toISOString();
      }

      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      const { data } = await api.get(`/sales?${params.toString()}`);
      setSales(data.sales || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Debounce search (avoid an API call on every keystroke)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, debouncedSearch]);

  // ===== Print Invoice (paper-roll receipt with logo + UPI QR) =====
  const handlePrint = (sale) => {
    printInvoice(sale, (msg) => alert(msg));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await api.delete(`/sales/${id}`);
      setSales(sales.filter((s) => s._id !== id));
      fetchSummary();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDateShort = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="sl-page">
      <style>{css}</style>

      {/* ===== Header ===== */}
      <div className="sl-header">
        <div className="sl-header-icon">
          <FaChartLine />
        </div>
        <div>
          <h1>Sales History</h1>
          <p>View all your sales transactions</p>
        </div>
      </div>

      {/* ===== Summary Cards ===== */}
      {summary && (
        <div className="sl-summary">
          <SummaryCard
            title="Today"
            data={summary.today}
            color="#1a237e"
            bg="#e8eaf6"
            icon={<FaFileInvoiceDollar />}
          />
          <SummaryCard
            title="This Week"
            data={summary.week}
            color="#2e7d32"
            bg="#e8f5e9"
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="This Month"
            data={summary.month}
            color="#f57c00"
            bg="#fff3e0"
            icon={<FaRupeeSign />}
          />
          <SummaryCard
            title="This Year"
            data={summary.year}
            color="#c62828"
            bg="#ffebee"
            icon={<FaShoppingBag />}
          />
        </div>
      )}

      {/* ===== Filters ===== */}
      <div className="sl-filters">
        <div className="sl-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search invoice / customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="sl-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <FaTimes size={10} />
            </button>
          )}
        </div>

        <div className="sl-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilterType(f.key);
                setPage(1);
              }}
              className={`sl-chip ${filterType === f.key ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Sales Content ===== */}
      <div className="sl-content">
        {loading ? (
          <div className="sl-skel">
            {[1, 2, 3, 4, 5].map((n) => (
              <div className="sl-skel-row" key={n}>
                <div className="sl-bar" style={{ width: '22%' }} />
                <div className="sl-bar" style={{ width: '28%' }} />
                <div className="sl-bar" style={{ width: '20%' }} />
                <div className="sl-bar" style={{ width: '12%', marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="sl-empty">
            <FaInbox />
            <p>No sales found</p>
            <small>Try a different search or date filter</small>
          </div>
        ) : (
          <>
            {/* ===== Desktop Table ===== */}
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th className="r">Amount</th>
                    <th className="c">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="sl-inv">{sale.invoiceNumber}</td>
                      <td className="sl-date">{formatDate(sale.createdAt)}</td>
                      <td>
                        <div className="sl-cname">
                          {sale.customerName || 'Walk-in Customer'}
                        </div>
                        {sale.customerPhone && (
                          <div className="sl-cphone">
                            <FaPhoneAlt size={9} /> {sale.customerPhone}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="sl-badge">
                          <FaBoxOpen size={11} /> {sale.items.length}{' '}
                          {sale.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>
                        <span className={`sl-pay ${sale.paymentMethod.toLowerCase()}`}>
                          {paymentIcon(sale.paymentMethod)} {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="sl-amount">₹{sale.totalAmount.toFixed(0)}</td>
                      <td>
                        <div className="sl-acts">
                          <button
                            className="sl-ibtn print"
                            onClick={() => handlePrint(sale)}
                            title="Print"
                          >
                            <FaPrint />
                          </button>
                          <button
                            className="sl-ibtn del"
                            onClick={() => handleDelete(sale._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== Mobile Cards ===== */}
            <div className="sl-cards">
              {sales.map((sale) => (
                <div key={sale._id} className="sl-card">
                  <div className="sl-card-top">
                    <div style={{ minWidth: 0 }}>
                      <small>Invoice</small>
                      <div className="sl-card-inv">{sale.invoiceNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small>Amount</small>
                      <div className="sl-card-amt">₹{sale.totalAmount.toFixed(0)}</div>
                    </div>
                  </div>

                  <div className="sl-card-info">
                    <div className="sl-card-row">
                      <FaCalendarAlt />
                      <span>{formatDateShort(sale.createdAt)}</span>
                    </div>
                    <div className="sl-card-row">
                      <FaUser />
                      <span>{sale.customerName || 'Walk-in Customer'}</span>
                    </div>
                    {sale.customerPhone && (
                      <div className="sl-card-row">
                        <FaPhoneAlt />
                        <span>{sale.customerPhone}</span>
                      </div>
                    )}
                    <div className="sl-card-row">
                      <span className={`sl-pay ${sale.paymentMethod.toLowerCase()}`}>
                        {paymentIcon(sale.paymentMethod)} {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="sl-card-row">
                      <span className="sl-badge">
                        <FaBoxOpen size={11} /> {sale.items.length}{' '}
                        {sale.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>

                  <div className="sl-card-foot">
                    <button
                      className="sl-card-btn print"
                      onClick={() => handlePrint(sale)}
                    >
                      <FaPrint /> Print
                    </button>
                    <button
                      className="sl-card-btn del"
                      onClick={() => handleDelete(sale._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Pagination ===== */}
            {totalPages > 1 && (
              <div className="sl-pager">
                <button
                  className="sl-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <FaChevronLeft size={10} /> Prev
                </button>
                <span className="sl-page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="sl-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <FaChevronRight size={10} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Summary Card Component
// ============================================================
const SummaryCard = ({ title, data, color, bg, icon }) => (
  <div className="sl-stat" style={{ '--c': color, '--bg': bg }}>
    <div className="sl-stat-top">
      <div style={{ minWidth: 0 }}>
        <p className="sl-stat-label">{title}</p>
        <h3 className="sl-stat-value">
          ₹{data.totalRevenue.toLocaleString('en-IN')}
        </h3>
      </div>
      <div className="sl-stat-icon">{icon}</div>
    </div>
    <div className="sl-stat-foot">
      <span className="sl-stat-chip">
        <FaReceipt /> {data.totalSales} sales
      </span>
      <span className="sl-stat-chip">
        <FaBoxOpen /> {data.totalItems} items
      </span>
    </div>
  </div>
);

export default Sales;