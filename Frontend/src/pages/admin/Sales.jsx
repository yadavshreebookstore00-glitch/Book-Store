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
  FaPhone,
  FaCreditCard,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, search]);

  // ===== Print Invoice =====
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

  const formatDateShort = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="sales-wrapper">
      {/* ===== Header ===== */}
      <div className="sales-header">
        <h1 className="sales-title">📊 Sales History</h1>
        <p className="sales-subtitle">View all your sales transactions</p>
      </div>

      {/* ===== Summary Cards ===== */}
      {summary && (
        <div className="sales-summary-grid">
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
      <div className="sales-filters">
        <div className="sales-search-wrap">
          <FaSearch className="sales-search-icon" />
          <input
            type="text"
            placeholder="Search invoice / customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sales-search"
          />
        </div>

        <div className="sales-filter-btns">
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
              className={`sales-filter-btn ${filterType === f.key ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Sales Content ===== */}
      <div className="sales-content">
        {loading ? (
          <div className="sales-loading">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="sales-empty">📊 No sales found</div>
        ) : (
          <>
            {/* ===== Desktop Table ===== */}
            <div className="sales-table-desktop">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="sales-invoice">{sale.invoiceNumber}</td>
                      <td>{formatDate(sale.createdAt)}</td>
                      <td>
                        <div className="sales-cust-name">{sale.customerName}</div>
                        {sale.customerPhone && (
                          <div className="sales-cust-phone">{sale.customerPhone}</div>
                        )}
                      </td>
                      <td>
                        <span className="sales-items-badge">
                          {sale.items.length} items
                        </span>
                      </td>
                      <td>
                        <span className={`sales-payment ${sale.paymentMethod.toLowerCase()}`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="sales-amount">₹{sale.totalAmount.toFixed(0)}</td>
                      <td>
                        <div className="sales-actions">
                          <button
                            onClick={() => handlePrint(sale)}
                            title="Print"
                            className="sales-btn-print"
                          >
                            <FaPrint />
                          </button>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            title="Delete"
                            className="sales-btn-delete"
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
            <div className="sales-cards-mobile">
              {sales.map((sale) => (
                <div key={sale._id} className="sales-card">
                  {/* Top: Invoice + Amount */}
                  <div className="sales-card-top">
                    <div className="sales-card-invoice-wrap">
                      <span className="sales-card-label">Invoice</span>
                      <span className="sales-card-invoice">{sale.invoiceNumber}</span>
                    </div>
                    <div className="sales-card-amount-wrap">
                      <span className="sales-card-label">Amount</span>
                      <span className="sales-card-amount">₹{sale.totalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Info Rows */}
                  <div className="sales-card-info">
                    <div className="sales-card-row">
                      <FaCalendarAlt className="sales-card-icon" />
                      <span>{formatDateShort(sale.createdAt)}</span>
                    </div>

                    <div className="sales-card-row">
                      <FaUser className="sales-card-icon" />
                      <span>{sale.customerName || 'Walk-in Customer'}</span>
                    </div>

                    {sale.customerPhone && (
                      <div className="sales-card-row">
                        <FaPhone className="sales-card-icon" />
                        <span>{sale.customerPhone}</span>
                      </div>
                    )}

                    <div className="sales-card-row">
                      <FaCreditCard className="sales-card-icon" />
                      <span className={`sales-payment ${sale.paymentMethod.toLowerCase()}`}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Items count */}
                  <div className="sales-card-items-row">
                    <span className="sales-items-badge">
                      📦 {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="sales-card-actions">
                    <button
                      onClick={() => handlePrint(sale)}
                      className="sales-card-btn print"
                    >
                      <FaPrint /> Print
                    </button>
                    <button
                      onClick={() => handleDelete(sale._id)}
                      className="sales-card-btn delete"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Pagination ===== */}
            {totalPages > 1 && (
              <div className="sales-pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="sales-page-btn"
                >
                  ← Prev
                </button>
                <span className="sales-page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="sales-page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================================
          CSS
          ============================================================ */}
      <style>{`
        /* ================= WRAPPER ================= */
        .sales-wrapper {
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        /* ================= HEADER ================= */
        .sales-header {
          margin-bottom: 24px;
        }

        .sales-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 24px;
          margin: 0;
        }

        .sales-subtitle {
          color: #666;
          font-weight: 500;
          font-size: 13px;
          margin: 5px 0 0 0;
        }

        /* ================= SUMMARY GRID ================= */
        .sales-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 24px;
        }

        /* ================= FILTERS ================= */
        .sales-filters {
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .sales-search-wrap {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 8px;
          padding: 9px 14px;
          flex: 1 1 250px;
          gap: 8px;
        }

        .sales-search-icon {
          color: #1a237e;
          font-size: 13px;
          flex-shrink: 0;
        }

        .sales-search {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          min-width: 0;
        }

        .sales-filter-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sales-filter-btn {
          padding: 8px 16px;
          border: 2px solid #ddd;
          background: #fff;
          color: #666;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
        }

        .sales-filter-btn.active {
          border-color: #1a237e;
          background: #1a237e;
          color: #fff;
        }

        .sales-filter-btn:hover:not(.active) {
          border-color: #1a237e;
          color: #1a237e;
        }

        /* ================= CONTENT ================= */
        .sales-content {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .sales-loading,
        .sales-empty {
          padding: 50px 20px;
          text-align: center;
          color: #666;
          font-weight: 600;
          font-size: 14px;
        }

        /* ================= DESKTOP TABLE ================= */
        .sales-table-desktop {
          display: block;
          overflow-x: auto;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sales-table thead tr {
          background: #f5f5f5;
        }

        .sales-table th {
          padding: 14px 18px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #1a237e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .sales-table td {
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          vertical-align: middle;
          border-bottom: 1px solid #f0f0f0;
        }

        .sales-table tbody tr:hover {
          background: #fafafa;
        }

        .sales-table .text-right { text-align: right; }
        .sales-table .text-center { text-align: center; }

        .sales-invoice {
          font-weight: 700;
          color: #1a237e;
          font-size: 12.5px;
        }

        .sales-cust-name {
          font-weight: 600;
          color: #333;
        }

        .sales-cust-phone {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }

        .sales-items-badge {
          background: #e8eaf6;
          color: #1a237e;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sales-payment {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          display: inline-block;
        }

        .sales-payment.cash {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .sales-payment.upi {
          background: #e3f2fd;
          color: #1976d2;
        }

        .sales-payment.others {
          background: #f3e5f5;
          color: #6a1b9a;
        }

        .sales-amount {
          text-align: right;
          font-weight: 800;
          color: #f57c00;
          font-size: 15px;
        }

        .sales-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .sales-btn-print,
        .sales-btn-delete {
          border: none;
          padding: 7px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .sales-btn-print {
          background: #e3f2fd;
          color: #1976d2;
        }

        .sales-btn-print:hover {
          background: #1976d2;
          color: #fff;
        }

        .sales-btn-delete {
          background: #ffebee;
          color: #c62828;
        }

        .sales-btn-delete:hover {
          background: #c62828;
          color: #fff;
        }

        /* ================= MOBILE CARDS ================= */
        .sales-cards-mobile {
          display: none;
        }

        .sales-card {
          background: #fff;
          padding: 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        .sales-card:last-child {
          border-bottom: none;
        }

        .sales-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #e0e0e0;
          margin-bottom: 12px;
        }

        .sales-card-invoice-wrap,
        .sales-card-amount-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .sales-card-amount-wrap {
          text-align: right;
        }

        .sales-card-label {
          font-size: 9.5px;
          font-weight: 800;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .sales-card-invoice {
          font-size: 12.5px;
          font-weight: 700;
          color: #1a237e;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sales-card-amount {
          font-size: 18px;
          font-weight: 800;
          color: #f57c00;
          line-height: 1;
        }

        .sales-card-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sales-card-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #333;
          font-weight: 500;
        }

        .sales-card-icon {
          color: #1a237e;
          font-size: 11px;
          flex-shrink: 0;
          width: 14px;
        }

        .sales-card-items-row {
          padding-top: 10px;
          padding-bottom: 10px;
          border-top: 1px solid #f5f5f5;
          border-bottom: 1px solid #f5f5f5;
          margin-bottom: 12px;
        }

        .sales-card-actions {
          display: flex;
          gap: 8px;
        }

        .sales-card-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12.5px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .sales-card-btn.print {
          background: #e3f2fd;
          color: #1976d2;
        }

        .sales-card-btn.print:hover {
          background: #1976d2;
          color: #fff;
        }

        .sales-card-btn.delete {
          background: #ffebee;
          color: #c62828;
        }

        .sales-card-btn.delete:hover {
          background: #c62828;
          color: #fff;
        }

        /* ================= PAGINATION ================= */
        .sales-pagination {
          padding: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-top: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }

        .sales-page-btn {
          padding: 8px 16px;
          background: #1a237e;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .sales-page-btn:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .sales-page-btn:hover:not(:disabled) {
          background: #f57c00;
        }

        .sales-page-info {
          font-weight: 700;
          color: #1a237e;
          font-size: 13px;
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 1024px) {
          .sales-wrapper {
            padding: 20px;
          }
          .sales-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .sales-title {
            font-size: 22px;
          }
        }

        @media (max-width: 768px) {
          .sales-wrapper {
            padding: 16px;
          }

          .sales-title {
            font-size: 20px;
          }

          .sales-subtitle {
            font-size: 12.5px;
          }

          .sales-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 18px;
          }

          .sales-filters {
            padding: 14px;
            gap: 10px;
          }

          .sales-search-wrap {
            flex: 1 1 100%;
          }

          .sales-filter-btns {
            width: 100%;
            justify-content: space-between;
          }

          .sales-filter-btn {
            flex: 1;
            padding: 8px 8px;
            font-size: 11.5px;
          }

          /* Hide desktop table, show mobile cards */
          .sales-table-desktop {
            display: none;
          }

          .sales-cards-mobile {
            display: block;
          }

          .sales-pagination {
            padding: 14px 12px;
          }

          .sales-page-btn {
            padding: 8px 14px;
            font-size: 11.5px;
          }

          .sales-page-info {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .sales-wrapper {
            padding: 12px;
          }

          .sales-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .sales-title {
            font-size: 18px;
          }

          .sales-card {
            padding: 12px;
          }

          .sales-filter-btn {
            padding: 7px 6px;
            font-size: 11px;
          }

          .sales-page-btn {
            padding: 7px 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// Summary Card Component
// ============================================================
const SummaryCard = ({ title, data, color, bg, icon }) => (
  <div
    className="sales-summary-card"
    style={{
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderLeft: `5px solid ${color}`,
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 35, 126, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '10.5px',
            color: '#999',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: '20px',
            color: color,
            fontWeight: 800,
            margin: '5px 0 0 0',
            letterSpacing: '-0.5px',
          }}
        >
          ₹{data.totalRevenue.toLocaleString('en-IN')}
        </h3>
      </div>
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        gap: '12px',
        fontSize: '11px',
        color: '#666',
        fontWeight: 600,
        flexWrap: 'wrap',
      }}
    >
      <span>🧾 {data.totalSales} sales</span>
      <span>📦 {data.totalItems} items</span>
    </div>
  </div>
);

export default Sales;