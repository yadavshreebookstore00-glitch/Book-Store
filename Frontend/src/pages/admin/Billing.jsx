import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaPrint,
  FaSave,
  FaShoppingCart,
  FaQrcode,
  FaCheckCircle,
  FaBox,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UpiQrModal from '../../components/common/UpiQrModal';

const paymentMethods = [
  { key: 'Cash', label: 'Cash', icon: <FaMoneyBillWave />, color: '#2e7d32' },
  { key: 'UPI', label: 'UPI', icon: <FaMobileAlt />, color: '#1a237e' },
  { key: 'Others', label: 'Others', icon: <FaCreditCard />, color: '#6a1b9a' },
];

// Inline styles me media query nahi chalti, isliye responsive CSS yahan classes me hai
const responsiveCss = `
  .bl-page { padding: 16px 20px; }
  .bl-head h1 { color: #1a237e; font-weight: 800; font-size: 22px; margin: 0 0 2px; }
  .bl-head p { color: #666; font-weight: 500; font-size: 12px; margin: 0; }
  .bl-head { margin-bottom: 14px; }

  .bl-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr); gap: 16px; align-items: start; }
  .bl-col { min-width: 0; }

  .bl-card { background: #fff; padding: 14px; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); margin-bottom: 12px; }
  .bl-card h3 { color: #1a237e; font-weight: 800; font-size: 14px; margin: 0 0 10px; }

  .bl-toast { position: fixed; top: 80px; right: 20px; color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; z-index: 3000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }

  .bl-input { min-width: 0; }
  .bl-input:focus { border-color: #1a237e !important; }

  /* Cart items */
  .bl-item { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  .bl-item:last-child { border-bottom: none; }
  .bl-item-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .bl-item-name { flex: 1; min-width: 0; margin: 0; font-size: 13px; font-weight: 700; color: #1a237e; word-break: break-word; }
  .bl-item-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .bl-mini { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #888; }
  .bl-num { width: 68px; padding: 5px 6px; border: 1.5px solid #ddd; border-radius: 6px; font-size: 13px; font-weight: 600; text-align: right; outline: none; box-sizing: border-box; }
  .bl-price-fixed { font-size: 13px; font-weight: 700; color: #333; }
  .bl-item-total { margin-left: auto; font-size: 15px; font-weight: 800; color: #f57c00; }
  .bl-qty { display: inline-flex; align-items: center; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden; }
  .bl-qty button { background: #f5f5f5; border: none; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .bl-qty span { min-width: 30px; text-align: center; font-weight: 700; font-size: 13px; }
  .bl-del { background: #ffebee; color: #c62828; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .bl-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .bl-pay-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

  .bl-actions { display: flex; flex-direction: column; gap: 10px; }
  .bl-bar-total { display: none; }
  .bl-lbl-sm { display: none; }

  /* Tablet & mobile: ek column */
  @media (max-width: 900px) {
    .bl-layout { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .bl-page { padding: 12px 12px 96px; }
    .bl-toast { top: 64px; left: 12px; right: 12px; text-align: center; }

    /* Sticky bottom bar: total + save buttons hamesha dikhte hain */
    .bl-actions {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000;
      flex-direction: row; align-items: center; gap: 8px;
      background: #fff; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
    }
    .bl-bar-total { display: block; line-height: 1.15; padding-right: 4px; }
    .bl-bar-total small { display: block; font-size: 10px; font-weight: 700; color: #888; }
    .bl-bar-total strong { font-size: 18px; font-weight: 800; color: #f57c00; }
    .bl-actions button { flex: 1; padding: 12px 8px !important; font-size: 14px !important; min-height: 46px; }
    .bl-lbl-lg { display: none; }
    .bl-lbl-sm { display: inline; }
  }

  @media (max-width: 600px) {
    .bl-head h1 { font-size: 19px; }
    .bl-card { padding: 12px; border-radius: 10px; margin-bottom: 10px; }
    /* 16px se iOS input focus pe zoom nahi karta */
    .bl-input, .bl-num { font-size: 16px !important; }
    .bl-num { width: 64px; }
    .bl-qty button { width: 34px; height: 34px; }
    .bl-del { width: 34px; height: 34px; }
    .bl-item-row { gap: 8px; }
  }
`;

const Billing = () => {
  const { user } = useAuth();

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  // Cart
  const [cart, setCart] = useState([]);

  // Manual Item Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualItem, setManualItem] = useState({ name: '', price: '', quantity: 1 });

  // Customer
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  // Custom amount for UPI QR
  const [customAmount, setCustomAmount] = useState('');

  // Processing
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [lastSale, setLastSale] = useState(null);

  // UPI
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  // ===== Search Products =====
  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setSearching(true);
        const { data } = await api.get(`/books/suggestions?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchResults(data.books || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    // touchstart bhi, taaki mobile par bahar tap karne se dropdown band ho
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== Add Book =====
  const addToCart = (book) => {
    const existing = cart.find((item) => item.book === book._id);
    if (existing) {
      setCart(cart.map((item) => item.book === book._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        book: book._id,
        name: book.title,
        price: book.price,
        quantity: 1,
        discount: 0,
        stock: book.stock,
        isManual: false,
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // ===== Add Manual Item =====
  const addManualItem = () => {
    if (!manualItem.name.trim() || !manualItem.price || Number(manualItem.price) <= 0) {
      setToast('⚠️ Item name and price required');
      return;
    }
    setCart([...cart, {
      book: null,
      name: manualItem.name.trim(),
      price: Number(manualItem.price),
      quantity: Number(manualItem.quantity) || 1,
      discount: 0,
      stock: null,
      isManual: true,
    }]);
    setManualItem({ name: '', price: '', quantity: 1 });
    setShowManualModal(false);
    setToast('✅ Item added');
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    const item = cart[index];
    if (!item.isManual && item.book && newQty > item.stock) {
      setToast(`⚠️ Only ${item.stock} in stock`);
      return;
    }
    const updated = [...cart];
    updated[index] = { ...updated[index], quantity: newQty };
    setCart(updated);
  };

  const updateItemDiscount = (index, discount) => {
    const updated = [...cart];
    updated[index] = { ...updated[index], discount: Number(discount) || 0 };
    setCart(updated);
  };

  const updateItemPrice = (index, price) => {
    const updated = [...cart];
    updated[index] = { ...updated[index], price: Number(price) || 0 };
    setCart(updated);
  };

  const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

  // ===== Calculations =====
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity - (item.discount || 0), 0);
  const totalAmount = subtotal - Number(discountAmount || 0) + Number(taxAmount || 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const paid = Number(paidAmount) || 0;
  const changeReturn = paid > totalAmount ? paid - totalAmount : 0;
  const dueAmount = paid > 0 && paid < totalAmount ? totalAmount - paid : 0;

  const qrAmount = Number(customAmount) > 0 ? Number(customAmount) : totalAmount;

  // ===== Save Sale =====
  const handleSave = async (printAfter = false) => {
    if (saving) return;
    if (cart.length === 0) {
      setToast('⚠️ Cart is empty. Please add items first.');
      return;
    }
    if (paymentMethod === 'UPI' && !upiConfirmed) {
      setToast('⚠️ Please confirm UPI payment first (Generate QR & Confirm)');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({
          book: item.book || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          isManual: item.isManual || false,
        })),
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        discountAmount: Number(discountAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        paymentMethod,
        paymentStatus: 'Paid',
        notes,
        reduceStock: true,
        paidAmount: paidAmount ? Number(paidAmount) : qrAmount,
      });

      setLastSale(data);
      setToast(`✅ Sale saved! ${data.invoiceNumber}`);

      if (printAfter) setTimeout(() => handlePrint(data), 300);

      setCart([]);
      setCustomer({ name: '', phone: '' });
      setDiscountAmount(0);
      setTaxAmount(0);
      setNotes('');
      setPaymentMethod('Cash');
      setPaidAmount('');
      setCustomAmount('');
      setUpiConfirmed(false);
    } catch (err) {
      setToast(`⚠️ ${err.response?.data?.message || 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  };

  // ===== Print =====
  const handlePrint = (sale) => {
    const s = sale || lastSale;
    if (!s) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setToast('⚠️ Popup blocked. Allow popups to print.');
      return;
    }

    const formatDate = (date) =>
      new Date(date).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${s.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
          .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 5px; }
          .header p { font-size: 12px; line-height: 1.4; }
          .info { margin-bottom: 15px; font-size: 12px; line-height: 1.6; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
          th { text-align: left; border-bottom: 2px solid #000; padding: 8px 0; }
          th:last-child, td:last-child { text-align: right; }
          td { padding: 6px 0; border-bottom: 1px dashed #eee; }
          .totals { border-top: 2px dashed #000; padding-top: 10px; font-size: 12px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .grand-total { font-size: 16px; font-weight: 900; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #000; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>YADAV SHREE</h1>
          <p><strong>BOOK STORE</strong></p>
          <p>Raipur, Chhattisgarh - 492001</p>
          <p>📞 +91 98765 43210</p>
        </div>
        <div class="info">
          <div class="info-row"><span><strong>Invoice:</strong> ${s.invoiceNumber}</span></div>
          <div class="info-row"><span><strong>Date:</strong> ${formatDate(s.createdAt)}</span></div>
          <div class="info-row"><span><strong>Customer:</strong> ${s.customerName}</span></div>
          ${s.customerPhone ? `<div class="info-row"><span><strong>Phone:</strong> ${s.customerPhone}</span></div>` : ''}
          <div class="info-row"><span><strong>Payment:</strong> ${s.paymentMethod}</span></div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amt</th></tr></thead>
          <tbody>
            ${s.items.map((item) => `
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
          <div class="totals-row"><span>Subtotal:</span><span>₹${s.subtotal.toFixed(2)}</span></div>
          ${s.discountAmount > 0 ? `<div class="totals-row"><span>Discount:</span><span>-₹${s.discountAmount.toFixed(2)}</span></div>` : ''}
          ${s.taxAmount > 0 ? `<div class="totals-row"><span>Tax:</span><span>+₹${s.taxAmount.toFixed(2)}</span></div>` : ''}
          <div class="totals-row grand-total"><span>TOTAL:</span><span>₹${s.totalAmount.toFixed(2)}</span></div>
          ${s.paymentMethod === 'Cash' ? `
            <div class="totals-row" style="margin-top:8px;border-top:1px dashed #000;padding-top:8px;">
              <span>Paid:</span><span>₹${(s.paidAmount || s.totalAmount).toFixed(2)}</span>
            </div>
            ${(s.changeReturn || 0) > 0 ? `<div class="totals-row"><span>Change:</span><span>₹${s.changeReturn.toFixed(2)}</span></div>` : ''}
          ` : ''}
        </div>
        <div class="footer">
          <p><strong>Thank you for shopping!</strong></p>
          <p>Visit again 🙏</p>
          <p style="font-size:10px;margin-top:10px;">*** Computer generated invoice ***</p>
        </div>
        <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bl-page">
      <style>{responsiveCss}</style>

      {toast && (
        <div className="bl-toast" style={{ background: toast.includes('⚠️') ? '#c62828' : '#2e7d32' }}>
          {toast}
        </div>
      )}

      <div className="bl-head">
        <h1>🧾 Billing / POS</h1>
        <p>Create a new sale and print invoice</p>
      </div>

      <div className="bl-layout">
        {/* ===== LEFT ===== */}
        <div className="bl-col">
          {/* Search */}
          <div ref={searchRef} style={{ position: 'relative', marginBottom: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', background: '#fff',
              borderRadius: '10px', padding: '4px 14px',
              border: '2px solid #e0e0e0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}>
              <FaSearch style={{ color: '#1a237e', marginRight: '10px', flexShrink: 0 }} />
              <input
                className="bl-input"
                type="text"
                placeholder="Search book by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#333', padding: '10px 0', background: 'transparent' }}
              />
            </div>

            {searchTerm.length >= 2 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', borderRadius: '10px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)', marginTop: '5px',
                maxHeight: '55vh', overflowY: 'auto', zIndex: 100,
                border: '1px solid #e0e0e0',
              }}>
                {searching ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontWeight: 600, fontSize: '13px' }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontWeight: 500, fontSize: '13px' }}>No books found</div>
                ) : (
                  searchResults.map((book) => (
                    <div
                      key={book._id}
                      onClick={() => addToCart(book)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e8eaf6')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        style={{ width: '34px', height: '46px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/40x55')}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a237e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.author} • Stock: {book.stock}
                        </p>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#f57c00', flexShrink: 0 }}>₹{book.price}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Custom Item */}
          <button
            onClick={() => setShowManualModal(true)}
            style={{
              width: '100%', background: '#fff', border: '2px dashed #1a237e',
              color: '#1a237e', padding: '10px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginBottom: '12px',
            }}
          >
            <FaPlus /> Add Custom Item (not in store)
          </button>

          {/* Cart */}
          <div className="bl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#f5f5f5', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1a237e' }}>CART</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#666' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#999' }}>
                <FaShoppingCart style={{ fontSize: '32px', marginBottom: '10px', color: '#ddd' }} />
                <p style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>Cart is empty. Search a book to add.</p>
              </div>
            ) : (
              cart.map((item, index) => {
                const itemTotal = item.price * item.quantity - (item.discount || 0);
                return (
                  <div key={index} className="bl-item">
                    <div className="bl-item-top">
                      {item.isManual && (
                        <span style={{ background: '#fff3e0', color: '#f57c00', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                          CUSTOM
                        </span>
                      )}
                      <p className="bl-item-name">{item.name}</p>
                      <button className="bl-del" onClick={() => removeItem(index)} aria-label="Remove item">
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div className="bl-item-row">
                      <div className="bl-qty">
                        <button onClick={() => updateQuantity(index, item.quantity - 1)} aria-label="Decrease"><FaMinus size={9} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, item.quantity + 1)} aria-label="Increase"><FaPlus size={9} /></button>
                      </div>

                      <label className="bl-mini">
                        ₹
                        {item.isManual ? (
                          <input
                            className="bl-num"
                            type="number"
                            inputMode="decimal"
                            value={item.price}
                            onChange={(e) => updateItemPrice(index, e.target.value)}
                            min="0"
                          />
                        ) : (
                          <span className="bl-price-fixed">{item.price}</span>
                        )}
                      </label>

                      <label className="bl-mini">
                        Disc
                        <input
                          className="bl-num"
                          type="number"
                          inputMode="decimal"
                          value={item.discount || 0}
                          onChange={(e) => updateItemDiscount(index, e.target.value)}
                          min="0"
                        />
                      </label>

                      <div className="bl-item-total">₹{itemTotal.toFixed(0)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="bl-col">
          {/* Customer Info */}
          <div className="bl-card">
            <h3>
              👤 Customer <span style={{ fontSize: '11px', color: '#999', fontWeight: 500 }}>(Optional)</span>
            </h3>
            <div className="bl-two">
              <input
                className="bl-input"
                type="text"
                placeholder="Name"
                autoComplete="off"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                style={inputStyle}
              />
              <input
                className="bl-input"
                type="tel"
                inputMode="numeric"
                placeholder="Phone"
                autoComplete="off"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength={10}
                style={inputStyle}
              />
            </div>
            <input
              className="bl-input"
              type="number"
              inputMode="decimal"
              placeholder="₹ Custom amount (for UPI QR)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="0"
              style={{ ...inputStyle, marginTop: '8px', borderColor: '#f57c00', fontWeight: 700, color: '#f57c00' }}
            />
            {customAmount && Number(customAmount) > 0 && (
              <p style={{ fontSize: '11px', color: '#f57c00', fontWeight: 600, margin: '6px 0 0' }}>
                💡 QR will generate for ₹{customAmount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bl-card">
            <h3>💳 Payment Method</h3>
            <div className="bl-pay-grid">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(pm.key);
                    if (pm.key === 'UPI') setUpiConfirmed(false);
                  }}
                  style={{
                    padding: '10px 6px',
                    border: `2px solid ${paymentMethod === pm.key ? pm.color : '#ddd'}`,
                    background: paymentMethod === pm.key ? pm.color : '#fff',
                    color: paymentMethod === pm.key ? '#fff' : '#666',
                    borderRadius: '10px', fontWeight: 700, fontSize: '12px',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '15px', display: 'flex' }}>{pm.icon}</span>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI Section */}
          {paymentMethod === 'UPI' && (
            <div className="bl-card" style={{
              background: upiConfirmed ? '#e8f5e9' : '#fff3e0',
              border: `2px solid ${upiConfirmed ? '#2e7d32' : '#f57c00'}`,
            }}>
              {upiConfirmed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontWeight: 700, fontSize: '13px' }}>
                  <FaCheckCircle /> UPI Received ₹{qrAmount.toFixed(0)}
                  <button
                    onClick={() => setUpiConfirmed(false)}
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#2e7d32', cursor: 'pointer', fontSize: '12px', fontWeight: 700, textDecoration: 'underline', padding: '6px' }}
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#f57c00', fontWeight: 700, margin: '0 0 4px' }}>
                    📱 UPI QR se payment karwayein
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: '0 0 10px' }}>
                    Amount: ₹{qrAmount.toFixed(0)}{customAmount && Number(customAmount) > 0 && ' (custom)'}
                  </p>
                  <button
                    onClick={() => {
                      if (qrAmount <= 0) { setToast('⚠️ Enter amount to pay'); return; }
                      setShowUpiModal(true);
                    }}
                    style={{
                      width: '100%', background: '#1a237e', color: '#fff',
                      border: 'none', padding: '12px', borderRadius: '8px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <FaQrcode /> Generate UPI QR (₹{qrAmount.toFixed(0)})
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cash Section */}
          {paymentMethod === 'Cash' && cart.length > 0 && (
            <div className="bl-card" style={{ border: '2px solid #2e7d32' }}>
              <h3 style={{ color: '#2e7d32' }}>💵 Cash Payment</h3>

              <input
                className="bl-input"
                type="number"
                inputMode="decimal"
                placeholder={`Customer paid (Total: ₹${totalAmount.toFixed(0)})`}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                min="0"
                style={{
                  width: '100%', padding: '10px 14px', border: '2px solid #2e7d32',
                  borderRadius: '8px', fontSize: '18px', fontWeight: 800,
                  color: '#2e7d32', outline: 'none', textAlign: 'right',
                  background: '#e8f5e9', boxSizing: 'border-box', marginBottom: '10px',
                }}
              />

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[Math.ceil(totalAmount / 10) * 10, Math.ceil(totalAmount / 50) * 50, Math.ceil(totalAmount / 100) * 100]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0).slice(0, 3)
                  .map((amount) => (
                    <button key={amount} type="button" onClick={() => setPaidAmount(String(amount))}
                      style={{ padding: '7px 12px', background: '#e8f5e9', color: '#2e7d32', border: '1.5px solid #2e7d32', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                      ₹{amount}
                    </button>
                  ))}
                <button type="button" onClick={() => setPaidAmount(String(Math.round(totalAmount)))}
                  style={{ padding: '7px 12px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Exact ₹{totalAmount.toFixed(0)}
                </button>
                <button type="button" onClick={() => setPaidAmount('')}
                  style={{ padding: '7px 12px', background: '#f5f5f5', color: '#666', border: '1.5px solid #ddd', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Clear
                </button>
              </div>

              {paidAmount !== '' && Number(paidAmount) > 0 && (
                <>
                  {changeReturn > 0 ? (
                    <div style={{ background: '#e8f5e9', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #2e7d32' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>🔄 Return Change</p>
                        <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0 }}>Customer ko wapas karein</p>
                      </div>
                      <div style={{ fontSize: '24px', color: '#2e7d32', fontWeight: 800 }}>₹{changeReturn.toFixed(0)}</div>
                    </div>
                  ) : dueAmount > 0 ? (
                    <div style={{ background: '#ffebee', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #c62828' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#c62828', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>⚠️ Still Due</p>
                        <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0 }}>Customer se aur paise lein</p>
                      </div>
                      <div style={{ fontSize: '24px', color: '#c62828', fontWeight: 800 }}>₹{dueAmount.toFixed(0)}</div>
                    </div>
                  ) : (
                    <div style={{ background: '#e8f5e9', padding: '10px 12px', borderRadius: '10px', textAlign: 'center', borderLeft: '4px solid #2e7d32', color: '#2e7d32', fontWeight: 700, fontSize: '13px' }}>
                      ✅ Exact Payment Received
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bill Summary */}
          <div className="bl-card">
            <h3>💰 Bill Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Items ({totalItems})</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            <div className="bl-two" style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>
                Extra Discount (₹)
                <input className="bl-input" type="number" inputMode="decimal" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} min="0" style={{ ...inputStyle, textAlign: 'right', fontWeight: 700 }} />
              </label>
              <label style={labelStyle}>
                Tax (₹)
                <input className="bl-input" type="number" inputMode="decimal" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} min="0" style={{ ...inputStyle, textAlign: 'right', fontWeight: 700 }} />
              </label>
            </div>

            <input className="bl-input" type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />

            <div style={{ borderTop: '2px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1a237e', fontWeight: 800, fontSize: '14px' }}>TOTAL</span>
              <span style={{ color: '#f57c00', fontWeight: 800, fontSize: '24px' }}>₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* ===== BUTTONS (mobile par bottom bar me chipak jaate hain) ===== */}
          <div className="bl-actions">
            <div className="bl-bar-total">
              <small>TOTAL</small>
              <strong>₹{totalAmount.toFixed(0)}</strong>
            </div>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                background: saving ? '#9fa8da' : '#1a237e',
                color: '#fff', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <FaSave />
              {saving ? 'Saving...' : (<><span className="bl-lbl-lg">Save Bill</span><span className="bl-lbl-sm">Save</span></>)}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                background: saving ? '#ffcc80' : '#f57c00',
                color: '#fff', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <FaPrint />
              {saving ? 'Saving...' : (<><span className="bl-lbl-lg">Save &amp; Print</span><span className="bl-lbl-sm">Print</span></>)}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Item Modal */}
      {showManualModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px' }}
          onClick={() => setShowManualModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#1a237e', fontWeight: 800, fontSize: '18px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBox style={{ color: '#f57c00' }} /> Add Custom Item
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Item Name *</label>
                <input className="bl-input" type="text" placeholder="e.g., Notebook, Pen" value={manualItem.name}
                  onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                  autoFocus style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && addManualItem()} />
              </div>
              <div className="bl-two">
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input className="bl-input" type="number" inputMode="decimal" placeholder="0" value={manualItem.price}
                    onChange={(e) => setManualItem({ ...manualItem, price: e.target.value })}
                    min="0" style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && addManualItem()} />
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input className="bl-input" type="number" inputMode="numeric" placeholder="1" value={manualItem.quantity}
                    onChange={(e) => setManualItem({ ...manualItem, quantity: e.target.value })}
                    min="1" style={inputStyle} />
                </div>
              </div>
              {manualItem.price > 0 && (
                <div style={{ background: '#fff8e1', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f57c00' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#666' }}>Subtotal:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#f57c00' }}>
                    ₹{(Number(manualItem.price) * Number(manualItem.quantity || 1)).toFixed(0)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => { setShowManualModal(false); setManualItem({ name: '', price: '', quantity: 1 }); }}
                  style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={addManualItem}
                  style={{ flex: 2, padding: '12px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaPlus /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI Modal */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={qrAmount.toFixed(2)}
        note={`Invoice - ${customer.name || 'Walk-in Customer'}`}
        onConfirm={() => {
          setUpiConfirmed(true);
          setToast('✅ UPI Payment Confirmed!');
        }}
      />
    </div>
  );
};

// ===== Styles =====
const inputStyle = {
  padding: '9px 12px',
  border: '1.5px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#1a237e',
  fontWeight: 700,
  marginBottom: '5px',
};

export default Billing;