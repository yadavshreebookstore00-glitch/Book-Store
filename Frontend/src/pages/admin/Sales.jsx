import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaPrint,
  FaTrash,
  FaFileInvoiceDollar,
  FaRupeeSign,
  FaShoppingBag,
} from 'react-icons/fa';
import api from '../../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
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
      if (search) params.append('search', search);

      const now = new Date();
      let start = '', end = '';

      if (filterType === 'today') {
        const d = new Date(); d.setHours(0, 0, 0, 0);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (filterType === 'week') {
        const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0);
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

  useEffect(() => {
    fetchSales();
  }, [page, filterType, search]);

  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const formatDate = (date) =>
      new Date(date).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { font-size: 22px; font-weight: 900; }
        .info { margin-bottom: 15px; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
        th { text-align: left; border-bottom: 2px solid #000; padding: 8px 0; }
        th:last-child, td:last-child { text-align: right; }
        td { padding: 6px 0; border-bottom: 1px dashed #eee; }
        .totals { border-top: 2px dashed #000; padding-top: 10px; font-size: 12px; }
        .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .grand-total { font-size: 16px; font-weight: 900; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #000; font-size: 11px; }
      </style></head><body>
      <div class="header">
        <h1>YADAV SHREE</h1>
        <p><strong>BOOK STORE</strong></p>
        <p>Raipur, Chhattisgarh - 492001</p>
        <p>📞 +91 98765 43210</p>
      </div>
      <div class="info">
        <div class="info-row"><span><strong>Invoice:</strong> ${sale.invoiceNumber}</span></div>
        <div class="info-row"><span><strong>Date:</strong> ${formatDate(sale.createdAt)}</span></div>
        <div class="info-row"><span><strong>Customer:</strong> ${sale.customerName}</span></div>
        ${sale.customerPhone ? `<div class="info-row"><span><strong>Phone:</strong> ${sale.customerPhone}</span></div>` : ''}
        <div class="info-row"><span><strong>Payment:</strong> ${sale.paymentMethod}</span></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amt</th></tr></thead>
        <tbody>
          ${sale.items.map((item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price}</td>
              <td>₹${(item.price * item.quantity - (item.discount || 0)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Subtotal:</span><span>₹${sale.subtotal.toFixed(2)}</span></div>
        ${sale.discountAmount > 0 ? `<div class="totals-row"><span>Discount:</span><span>-₹${sale.discountAmount.toFixed(2)}</span></div>` : ''}
        ${sale.taxAmount > 0 ? `<div class="totals-row"><span>Tax:</span><span>+₹${sale.taxAmount.toFixed(2)}</span></div>` : ''}
        <div class="totals-row grand-total"><span>TOTAL:</span><span>₹${sale.totalAmount.toFixed(2)}</span></div>
        ${sale.paymentMethod === 'Cash' ? `
          <div class="totals-row" style="margin-top:8px;border-top:1px dashed #000;padding-top:8px;">
            <span>Paid:</span><span>₹${(sale.paidAmount || sale.totalAmount).toFixed(2)}</span>
          </div>
          ${(sale.changeReturn || 0) > 0 ? `<div class="totals-row"><span>Change:</span><span>₹${sale.changeReturn.toFixed(2)}</span></div>` : ''}
        ` : ''}
      </div>
      <div class="footer">
        <p><strong>Thank you for shopping!</strong></p>
        <p>Visit again 🙏</p>
      </div>
      <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };</script>
      </body></html>
    `);
    printWindow.document.close();
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
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: '26px', margin: 0 }}>
          📊 Sales History
        </h1>
        <p style={{ color: '#666', fontWeight: 500, fontSize: '13px', margin: 0, marginTop: '5px' }}>
          View all your sales transactions
        </p>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          <SummaryCard title="Today" data={summary.today} color="#1a237e" bg="#e8eaf6" icon={<FaFileInvoiceDollar />} />
          <SummaryCard title="This Week" data={summary.week} color="#2e7d32" bg="#e8f5e9" icon={<FaCalendarAlt />} />
          <SummaryCard title="This Month" data={summary.month} color="#f57c00" bg="#fff3e0" icon={<FaRupeeSign />} />
          <SummaryCard title="This Year" data={summary.year} color="#c62828" bg="#ffebee" icon={<FaShoppingBag />} />
        </div>
      )}

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '8px', padding: '8px 14px', flex: '1 1 250px' }}>
            <FaSearch style={{ color: '#1a237e', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search invoice / customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 500 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilterType(f.key); setPage(1); }}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${filterType === f.key ? '#1a237e' : '#ddd'}`,
                  background: filterType === f.key ? '#1a237e' : '#fff',
                  color: filterType === f.key ? '#fff' : '#666',
                  borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600, color: '#666' }}>Loading...</div>
        ) : sales.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999', fontWeight: 500 }}>📊 No sales found</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={thStyle}>Invoice</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Items</th>
                    <th style={thStyle}>Payment</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{sale.invoiceNumber}</td>
                      <td style={tdStyle}>{formatDate(sale.createdAt)}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{sale.customerName}</div>
                        {sale.customerPhone && <div style={{ fontSize: '11px', color: '#666' }}>{sale.customerPhone}</div>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: '#e8eaf6', color: '#1a237e', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                          {sale.items.length} items
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: sale.paymentMethod === 'Cash' ? '#e8f5e9' : sale.paymentMethod === 'UPI' ? '#e3f2fd' : '#f3e5f5',
                          color: sale.paymentMethod === 'Cash' ? '#2e7d32' : sale.paymentMethod === 'UPI' ? '#1976d2' : '#6a1b9a',
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                        }}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#f57c00', fontSize: '15px' }}>
                        ₹{sale.totalAmount.toFixed(0)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button onClick={() => handlePrint(sale)} title="Print"
                            style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            <FaPrint />
                          </button>
                          <button onClick={() => handleDelete(sale._id)} title="Delete"
                            style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', borderTop: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 16px', background: page === 1 ? '#f5f5f5' : '#1a237e',
                    color: page === 1 ? '#999' : '#fff', border: 'none', borderRadius: '6px',
                    fontWeight: 700, fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Prev
                </button>
                <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '13px' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 16px', background: page === totalPages ? '#f5f5f5' : '#1a237e',
                    color: page === totalPages ? '#999' : '#fff', border: 'none', borderRadius: '6px',
                    fontWeight: 700, fontSize: '12px', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, data, color, bg, icon }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div>
        <p style={{ fontSize: '11px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{title}</p>
        <h3 style={{ fontSize: '22px', color: color, fontWeight: 800, margin: '5px 0 0 0' }}>
          ₹{data.totalRevenue.toLocaleString('en-IN')}
        </h3>
      </div>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '15px', fontSize: '11px', color: '#666', fontWeight: 600 }}>
      <span>🧾 {data.totalSales} sales</span>
      <span>📦 {data.totalItems} items</span>
    </div>
  </div>
);

const thStyle = {
  padding: '14px 18px', textAlign: 'left', fontSize: '11px',
  fontWeight: 700, color: '#1a237e', textTransform: 'uppercase',
  letterSpacing: '0.5px', whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '14px 18px', fontSize: '13px', fontWeight: 500,
  color: '#333', verticalAlign: 'middle',
};

export default Sales;