import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaPrint,
  FaSave,
  FaShoppingCart,
  FaUser,
  FaPhone,
  FaQrcode,
  FaCheckCircle,
  FaBox,
  FaRupeeSign,
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const updateItemDiscount = (index, discount) => {
    const updated = [...cart];
    updated[index].discount = Number(discount) || 0;
    setCart(updated);
  };

  const updateItemPrice = (index, price) => {
    const updated = [...cart];
    updated[index].price = Number(price) || 0;
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
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const s = sale || lastSale;
    if (!s) return;

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
    <div style={{ padding: '20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px',
          background: toast.includes('⚠️') ? '#c62828' : '#2e7d32',
          color: '#fff', padding: '14px 22px', borderRadius: '8px',
          fontWeight: 700, zIndex: 3000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: '26px', margin: 0, marginBottom: '5px' }}>
          🧾 Billing / POS
        </h1>
        <p style={{ color: '#666', fontWeight: 500, fontSize: '13px', margin: 0 }}>
          Create a new sale and print invoice
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: '20px' }}>
        {/* ===== LEFT ===== */}
        <div>
          {/* Search */}
          <div ref={searchRef} style={{ position: 'relative', marginBottom: '15px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', background: '#fff',
              borderRadius: '10px', padding: '12px 18px',
              border: '2px solid #e0e0e0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}>
              <FaSearch style={{ color: '#1a237e', marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Search book by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#333' }}
              />
            </div>

            {searchTerm.length >= 2 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', borderRadius: '10px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)', marginTop: '5px',
                maxHeight: '400px', overflowY: 'auto', zIndex: 100,
                border: '1px solid #e0e0e0',
              }}>
                {searching ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontWeight: 600 }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontWeight: 500 }}>No books found</div>
                ) : (
                  searchResults.map((book) => (
                    <div
                      key={book._id}
                      onClick={() => addToCart(book)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e8eaf6')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/40x55')}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a237e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, margin: 0 }}>
                          {book.author} • Stock: {book.stock}
                        </p>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f57c00' }}>₹{book.price}</div>
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
              color: '#1a237e', padding: '12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginBottom: '20px',
            }}
          >
            <FaPlus /> Add Custom Item (not in store)
          </button>

          {/* Cart */}
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {cart.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
                <FaShoppingCart style={{ fontSize: '40px', marginBottom: '15px', color: '#ddd' }} />
                <p style={{ fontWeight: 600, fontSize: '14px' }}>Cart is empty.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={thStyle}>Item</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Qty</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Disc</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>✕</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => {
                      const itemTotal = item.price * item.quantity - (item.discount || 0);
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.isManual && (
                                <span style={{
                                  background: '#fff3e0', color: '#f57c00',
                                  padding: '2px 8px', borderRadius: '10px',
                                  fontSize: '10px', fontWeight: 700,
                                }}>CUSTOM</span>
                              )}
                              <p style={{ fontWeight: 700, color: '#1a237e', margin: 0, fontSize: '13px' }}>{item.name}</p>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                              <button onClick={() => updateQuantity(index, item.quantity - 1)} style={qtyBtnStyle}><FaMinus size={8} /></button>
                              <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(index, item.quantity + 1)} style={qtyBtnStyle}><FaPlus size={8} /></button>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                            {item.isManual ? (
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItemPrice(index, e.target.value)}
                                min="0"
                                style={{ width: '70px', padding: '4px 6px', border: '1.5px solid #ddd', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textAlign: 'right', outline: 'none' }}
                              />
                            ) : `₹${item.price}`}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            <input
                              type="number"
                              value={item.discount || 0}
                              onChange={(e) => updateItemDiscount(index, e.target.value)}
                              min="0"
                              style={{ width: '60px', padding: '4px 6px', border: '1.5px solid #ddd', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textAlign: 'right', outline: 'none' }}
                            />
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#f57c00' }}>₹{itemTotal.toFixed(0)}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <button onClick={() => removeItem(index)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div>
          {/* Customer Info */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <h3 style={{ color: '#1a237e', fontWeight: 800, fontSize: '15px', marginBottom: '15px' }}>
              👤 Customer Info <span style={{ fontSize: '11px', color: '#999', fontWeight: 500 }}>(Optional)</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUser style={{ color: '#1a237e', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPhone style={{ color: '#1a237e', flexShrink: 0 }} />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaRupeeSign style={{ color: '#f57c00', flexShrink: 0 }} />
                <input
                  type="number"
                  placeholder="Custom amount (for UPI QR)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="0"
                  style={{ ...inputStyle, borderColor: '#f57c00', fontWeight: 700, color: '#f57c00' }}
                />
              </div>
              {customAmount && Number(customAmount) > 0 && (
                <p style={{ fontSize: '11px', color: '#f57c00', fontWeight: 600, margin: 0 }}>
                  💡 QR will generate for ₹{customAmount}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <h3 style={{ color: '#1a237e', fontWeight: 800, fontSize: '15px', marginBottom: '15px' }}>💳 Payment Method</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {paymentMethods.map((pm) => (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(pm.key);
                    if (pm.key === 'UPI') setUpiConfirmed(false);
                  }}
                  style={{
                    padding: '12px 8px',
                    border: `2px solid ${paymentMethod === pm.key ? pm.color : '#ddd'}`,
                    background: paymentMethod === pm.key ? pm.color : '#fff',
                    color: paymentMethod === pm.key ? '#fff' : '#666',
                    borderRadius: '10px', fontWeight: 700, fontSize: '12px',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '5px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{pm.icon}</span>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI Section */}
          {paymentMethod === 'UPI' && (
            <div style={{
              background: upiConfirmed ? '#e8f5e9' : '#fff3e0',
              padding: '15px', borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px',
              border: `2px solid ${upiConfirmed ? '#2e7d32' : '#f57c00'}`,
            }}>
              {upiConfirmed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32', fontWeight: 700, fontSize: '13px' }}>
                  <FaCheckCircle /> UPI Received ₹{qrAmount.toFixed(0)}
                  <button
                    onClick={() => setUpiConfirmed(false)}
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#2e7d32', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#f57c00', fontWeight: 700, margin: 0, marginBottom: '5px' }}>
                    📱 UPI QR se payment karwayein
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0, marginBottom: '10px' }}>
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
            <div style={{
              background: '#fff', padding: '20px', borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px',
              border: '2px solid #2e7d32',
            }}>
              <h3 style={{ color: '#2e7d32', fontWeight: 800, fontSize: '15px', marginBottom: '15px' }}>💵 Cash Payment</h3>

              <label style={{ display: 'block', fontSize: '12px', color: '#666', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                Customer Paid (₹)
              </label>
              <input
                type="number"
                placeholder={`Total: ₹${totalAmount.toFixed(0)}`}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                min="0"
                style={{
                  width: '100%', padding: '12px 15px', border: '2px solid #2e7d32',
                  borderRadius: '8px', fontSize: '18px', fontWeight: 800,
                  color: '#2e7d32', outline: 'none', textAlign: 'right',
                  background: '#e8f5e9', boxSizing: 'border-box', marginBottom: '12px',
                }}
              />

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {[Math.ceil(totalAmount / 10) * 10, Math.ceil(totalAmount / 50) * 50, Math.ceil(totalAmount / 100) * 100]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0).slice(0, 3)
                  .map((amount) => (
                    <button key={amount} type="button" onClick={() => setPaidAmount(String(amount))}
                      style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d32', border: '1.5px solid #2e7d32', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                      ₹{amount}
                    </button>
                  ))}
                <button type="button" onClick={() => setPaidAmount(String(Math.round(totalAmount)))}
                  style={{ padding: '6px 12px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Exact ₹{totalAmount.toFixed(0)}
                </button>
                <button type="button" onClick={() => setPaidAmount('')}
                  style={{ padding: '6px 12px', background: '#f5f5f5', color: '#666', border: '1.5px solid #ddd', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Clear
                </button>
              </div>

              {paidAmount !== '' && Number(paidAmount) > 0 && (
                <>
                  {changeReturn > 0 ? (
                    <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #2e7d32' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '3px' }}>🔄 Return Change</p>
                        <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0 }}>Customer ko wapas karein</p>
                      </div>
                      <div style={{ fontSize: '28px', color: '#2e7d32', fontWeight: 800 }}>₹{changeReturn.toFixed(0)}</div>
                    </div>
                  ) : dueAmount > 0 ? (
                    <div style={{ background: '#ffebee', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #c62828' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#c62828', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '3px' }}>⚠️ Still Due</p>
                        <p style={{ fontSize: '11px', color: '#666', fontWeight: 500, margin: 0 }}>Customer se aur paise lein</p>
                      </div>
                      <div style={{ fontSize: '28px', color: '#c62828', fontWeight: 800 }}>₹{dueAmount.toFixed(0)}</div>
                    </div>
                  ) : (
                    <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', textAlign: 'center', borderLeft: '4px solid #2e7d32', color: '#2e7d32', fontWeight: 700, fontSize: '14px' }}>
                      ✅ Exact Payment Received
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bill Summary */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <h3 style={{ color: '#1a237e', fontWeight: 800, fontSize: '15px', marginBottom: '15px' }}>💰 Bill Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Items ({totalItems})</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Extra Discount</span>
              <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} min="0"
                style={{ width: '80px', padding: '5px 8px', border: '1.5px solid #ddd', borderRadius: '5px', fontSize: '13px', fontWeight: 700, textAlign: 'right', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Tax (₹)</span>
              <input type="number" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} min="0"
                style={{ width: '80px', padding: '5px 8px', border: '1.5px solid #ddd', borderRadius: '5px', fontSize: '13px', fontWeight: 700, textAlign: 'right', outline: 'none' }} />
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1a237e', fontWeight: 800, fontSize: '15px' }}>TOTAL</span>
              <span style={{ color: '#f57c00', fontWeight: 800, fontSize: '24px' }}>₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', fontWeight: 500, color: '#333', boxSizing: 'border-box' }} />
          </div>

          {/* ===== BUTTONS (Always Enabled) ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleSave(false)}
              style={{
                background: '#1a237e',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#3949ab')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1a237e')}
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Bill'}
            </button>
            <button
              onClick={() => handleSave(true)}
              style={{
                background: '#f57c00',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ef6c00')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f57c00')}
            >
              <FaPrint /> {saving ? 'Saving...' : 'Save & Print'}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Item Modal */}
      {showManualModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px' }}
          onClick={() => setShowManualModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ color: '#1a237e', fontWeight: 800, fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBox style={{ color: '#f57c00' }} /> Add Custom Item
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Item Name *</label>
                <input type="text" placeholder="e.g., Notebook, Pen" value={manualItem.name}
                  onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                  autoFocus style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && addManualItem()} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input type="number" placeholder="0" value={manualItem.price}
                    onChange={(e) => setManualItem({ ...manualItem, price: e.target.value })}
                    min="0" style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && addManualItem()} />
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" placeholder="1" value={manualItem.quantity}
                    onChange={(e) => setManualItem({ ...manualItem, quantity: e.target.value })}
                    min="1" style={inputStyle} />
                </div>
              </div>
              {manualItem.price > 0 && (
                <div style={{ background: '#fff8e1', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f57c00' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#666' }}>Subtotal:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#f57c00' }}>
                    ₹{(Number(manualItem.price) * Number(manualItem.quantity || 1)).toFixed(0)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
const thStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: '#1a237e',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '12px 15px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#333',
  verticalAlign: 'middle',
};

const qtyBtnStyle = {
  background: '#f5f5f5',
  border: 'none',
  width: '28px',
  height: '28px',
  cursor: 'pointer',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const inputStyle = {
  flex: 1,
  padding: '10px 14px',
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
  fontSize: '12px',
  color: '#1a237e',
  fontWeight: 700,
  marginBottom: '6px',
};

export default Billing;