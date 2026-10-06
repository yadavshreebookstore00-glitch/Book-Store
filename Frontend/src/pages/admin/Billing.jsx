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
  FaPercent,
  FaTimes,
  FaUser,
  FaPhoneAlt,
  FaStickyNote,
  FaReceipt,
  FaRupeeSign,
  FaTag,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaEraser,
  FaWallet,
  FaBookmark,
  FaUndo,
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UpiQrModal from '../../components/common/UpiQrModal';
import { printInvoice } from '../../utils/printInvoice';

const paymentMethods = [
  { key: 'Cash', label: 'Cash', icon: <FaMoneyBillWave />, color: '#2e7d32' },
  { key: 'UPI', label: 'UPI', icon: <FaMobileAlt />, color: '#1a237e' },
  { key: 'Others', label: 'Others', icon: <FaCreditCard />, color: '#6a1b9a' },
];

const POS_CART_KEY = 'pos_cart';

// ============================================================
// RESPONSIVE STYLES (media queries need real CSS, not inline)
// ============================================================
const css = `
.bl-page{padding:16px;max-width:1400px;margin:0 auto;box-sizing:border-box}
.bl-page *{box-sizing:border-box}

/* Header */
.bl-header{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.bl-header-icon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#1a237e,#3949ab);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.bl-header h1{margin:0;color:#1a237e;font-weight:800;font-size:24px;line-height:1.2}
.bl-header p{margin:2px 0 0;color:#666;font-weight:500;font-size:13px}
.bl-cart-badge{margin-left:auto;background:#fff3e0;color:#f57c00;border-radius:20px;padding:7px 13px;font-weight:800;font-size:13px;display:flex;align-items:center;gap:6px;flex-shrink:0}

/* Layout */
.bl-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(330px,1fr);gap:20px;align-items:start}

/* Cards */
.bl-card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(26,35,126,.07);padding:18px;margin-bottom:14px}
.bl-card-title{display:flex;align-items:center;gap:8px;color:#1a237e;font-weight:800;font-size:15px;margin:0 0 14px}
.bl-card-title small{color:#999;font-weight:500;font-size:11px}

/* Inputs */
.bl-input-wrap{position:relative;width:100%}
.bl-input-wrap > svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9aa0b5;font-size:13px;pointer-events:none}
.bl-input{width:100%;padding:12px 14px;border:1.5px solid #dde1ee;border-radius:10px;font-size:14px;font-weight:500;outline:none;font-family:inherit;background:#fff;color:#333;transition:border-color .15s,box-shadow .15s}
.bl-input.has-icon{padding-left:37px}
.bl-input:focus{border-color:#1a237e;box-shadow:0 0 0 3px rgba(26,35,126,.12)}
.bl-input.orange{border-color:#f57c00;color:#f57c00;font-weight:700}
.bl-stack{display:flex;flex-direction:column;gap:10px}
.bl-label{display:flex;align-items:center;gap:5px;font-size:12px;color:#1a237e;font-weight:700;margin-bottom:6px}

/* Search */
.bl-search-box{position:relative;margin-bottom:12px}
.bl-search-bar{display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:4px 14px;border:2px solid #e0e4f2;box-shadow:0 2px 10px rgba(0,0,0,.04);transition:border-color .15s}
.bl-search-bar:focus-within{border-color:#1a237e}
.bl-search-bar svg{color:#1a237e;flex-shrink:0}
.bl-search-bar input{flex:1;border:none;outline:none;font-size:15px;font-weight:500;color:#333;padding:12px 0;min-width:0;background:transparent;font-family:inherit}
.bl-clear-x{background:#f0f1f7;border:none;color:#777;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0}
.bl-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.18);margin-top:6px;max-height:min(400px,60vh);overflow-y:auto;z-index:100;border:1px solid #e0e0e0}
.bl-dd-msg{padding:22px;text-align:center;color:#666;font-weight:600;font-size:14px}
.bl-dd-item{display:flex;align-items:center;gap:12px;padding:11px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;min-height:60px}
.bl-dd-item:last-child{border-bottom:none}
.bl-dd-item:hover,.bl-dd-item:active{background:#e8eaf6}
.bl-dd-img{width:40px;height:54px;object-fit:cover;border-radius:6px;flex-shrink:0;background:#eee}
.bl-dd-ph{width:40px;height:54px;border-radius:6px;background:#fff3e0;color:#f57c00;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.bl-dd-info{flex:1;min-width:0}
.bl-dd-title{margin:0;font-size:14px;font-weight:700;color:#1a237e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-dd-sub{margin:2px 0 0;font-size:12px;color:#666;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-dd-price{font-size:15px;font-weight:800;color:#f57c00;flex-shrink:0}
.bl-tag{background:#fff3e0;color:#f57c00;padding:2px 7px;border-radius:8px;font-size:9px;font-weight:800;letter-spacing:.3px;flex-shrink:0}

/* Add custom button */
.bl-add-custom{width:100%;background:#fff;border:2px dashed #1a237e;color:#1a237e;padding:13px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;font-family:inherit;transition:background .15s}
.bl-add-custom:hover,.bl-add-custom:active{background:#e8eaf6}

/* Cart */
.bl-cart-search{display:flex;align-items:center;gap:8px;background:#f6f7fb;border-radius:10px;padding:2px 12px;border:1.5px solid #e3e6f1;margin-bottom:12px}
.bl-cart-search svg{color:#999;font-size:13px;flex-shrink:0}
.bl-cart-search input{flex:1;border:none;background:transparent;outline:none;font-size:14px;font-weight:500;color:#333;padding:10px 0;min-width:0;font-family:inherit}
.bl-cart-wrap{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(26,35,126,.07);overflow:hidden;margin-bottom:14px}
.bl-empty{padding:50px 20px;text-align:center;color:#999}
.bl-empty svg{font-size:42px;color:#d6d9e8;margin-bottom:12px}
.bl-empty p{margin:0;font-weight:600;font-size:14px}

.bl-table-scroll{overflow-x:auto}
.bl-table{width:100%;border-collapse:collapse}
.bl-table th{padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:.5px;background:#f5f6fb}
.bl-table td{padding:12px 14px;font-size:13px;font-weight:500;color:#333;vertical-align:middle;border-bottom:1px solid #f0f0f5}
.bl-table .r{text-align:right}.bl-table .c{text-align:center}
.bl-name-cell{display:flex;align-items:center;gap:8px;font-weight:700;color:#1a237e;font-size:13px}
.bl-mini-input{width:70px;padding:6px 8px;border:1.5px solid #dde1ee;border-radius:6px;font-size:13px;font-weight:600;text-align:right;outline:none;font-family:inherit}
.bl-mini-input:focus{border-color:#1a237e}

.bl-qty{display:inline-flex;align-items:center;border:1.5px solid #dde1ee;border-radius:8px;overflow:hidden;background:#fff}
.bl-qty button{background:#f3f4fa;border:none;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#1a237e;padding:0}
.bl-qty button:active{background:#dfe2f3}
.bl-qty span{min-width:34px;text-align:center;font-weight:800;font-size:14px}

.bl-icon-btn{border:none;border-radius:8px;width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;padding:0;flex-shrink:0}
.bl-icon-btn.danger{background:#ffebee;color:#c62828}

/* Mobile item cards (hidden on desktop) */
.bl-cards{display:none;padding:10px}
.bl-item{border:1.5px solid #eceef7;border-radius:12px;padding:12px;margin-bottom:10px;background:#fff}
.bl-item:last-child{margin-bottom:0}
.bl-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
.bl-item-name{font-weight:700;color:#1a237e;font-size:14px;line-height:1.35;display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;word-break:break-word}
.bl-item-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end}
.bl-item-grid label{display:block;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
.bl-item-grid .bl-input{padding:9px 10px;font-size:14px}
.bl-item-price{font-weight:700;font-size:15px;color:#333;padding:9px 0}
.bl-item-foot{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px dashed #e3e6f1}
.bl-item-foot span{font-size:12px;font-weight:600;color:#666}
.bl-item-foot b{font-size:17px;font-weight:800;color:#f57c00}
.bl-stock{font-size:10px;color:#888;font-weight:600}

/* Payment */
.bl-pm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.bl-pm{padding:12px 6px;border:2px solid #dde1ee;background:#fff;color:#666;border-radius:12px;font-weight:700;font-size:12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:inherit;transition:all .15s}
.bl-pm svg{font-size:18px}
.bl-pm.active{background:var(--pm);border-color:var(--pm);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.18)}

.bl-upi{padding:15px;border-radius:14px;margin-bottom:14px;border:2px solid #f57c00;background:#fff3e0}
.bl-upi.ok{border-color:#2e7d32;background:#e8f5e9}
.bl-upi-ok{display:flex;align-items:center;gap:8px;color:#2e7d32;font-weight:700;font-size:13px;flex-wrap:wrap}
.bl-link-btn{margin-left:auto;background:transparent;border:none;color:#2e7d32;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;font-family:inherit}
.bl-upi p{margin:0 0 10px;font-size:13px;color:#e65100;font-weight:700;display:flex;align-items:center;gap:6px}
.bl-primary-btn{width:100%;background:#1a237e;color:#fff;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}

.bl-cash{border:2px solid #2e7d32}
.bl-cash .bl-card-title{color:#2e7d32}
.bl-cash-input{width:100%;padding:12px 15px;border:2px solid #2e7d32;border-radius:10px;font-size:20px;font-weight:800;color:#2e7d32;outline:none;text-align:right;background:#e8f5e9;margin-bottom:12px;font-family:inherit}
.bl-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;-webkit-overflow-scrolling:touch}
.bl-chip{padding:8px 14px;background:#e8f5e9;color:#2e7d32;border:1.5px solid #2e7d32;border-radius:20px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px;font-family:inherit;flex-shrink:0}
.bl-chip.solid{background:#1a237e;border-color:#1a237e;color:#fff}
.bl-chip.grey{background:#f3f4fa;border-color:#dde1ee;color:#666}
.bl-note{padding:14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;border-left:4px solid}
.bl-note.green{background:#e8f5e9;border-color:#2e7d32}
.bl-note.red{background:#ffebee;border-color:#c62828}
.bl-note h4{margin:0;font-size:11px;font-weight:800;text-transform:uppercase;display:flex;align-items:center;gap:5px}
.bl-note.green h4{color:#2e7d32}.bl-note.red h4{color:#c62828}
.bl-note small{color:#666;font-size:11px;font-weight:500}
.bl-note .amt{font-size:28px;font-weight:800;white-space:nowrap}
.bl-note.green .amt{color:#2e7d32}.bl-note.red .amt{color:#c62828}
.bl-exact{background:#e8f5e9;padding:14px;border-radius:12px;text-align:center;border-left:4px solid #2e7d32;color:#2e7d32;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px}

/* Summary */
.bl-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:13px;font-weight:600}
.bl-row span:first-child{color:#666}
.bl-discount{color:#2e7d32;background:#e8f5e9;padding:7px 10px;border-radius:8px;font-weight:700}
.bl-discount span:first-child{color:#2e7d32;display:flex;align-items:center;gap:6px}
.bl-total{border-top:2px solid #eee;padding-top:14px;margin-top:6px;display:flex;justify-content:space-between;align-items:center}
.bl-total span:first-child{color:#1a237e;font-weight:800;font-size:15px}
.bl-total span:last-child{color:#f57c00;font-weight:800;font-size:26px}

/* Buttons */
.bl-actions{display:flex;flex-direction:column;gap:10px}
.bl-btn{border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;font-family:inherit}
.bl-btn.blue{background:#1a237e}.bl-btn.orange{background:#f57c00}
.bl-btn:disabled{background:#999;cursor:not-allowed}

/* Sticky mobile bar */
.bl-sticky{display:none;position:fixed;left:0;right:0;bottom:0;background:#fff;box-shadow:0 -4px 20px rgba(0,0,0,.14);padding:10px 14px calc(10px + env(safe-area-inset-bottom));z-index:900;align-items:center;gap:10px}
.bl-sticky-total{display:flex;flex-direction:column;line-height:1.15;min-width:0}
.bl-sticky-total small{font-size:11px;color:#777;font-weight:600}
.bl-sticky-total b{font-size:21px;color:#f57c00;font-weight:800}
.bl-sticky .bl-btn{padding:12px 14px;font-size:14px;border-radius:10px}
.bl-sticky-btns{display:flex;gap:8px;margin-left:auto}

/* Toast */
.bl-toast{position:fixed;top:80px;right:20px;color:#fff;padding:13px 20px;border-radius:10px;font-weight:700;z-index:3000;box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;gap:8px;max-width:calc(100vw - 40px);font-size:14px}
.bl-toast.ok{background:#2e7d32}.bl-toast.err{background:#c62828}

/* Modal */
.bl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:2500;padding:20px}
.bl-modal{background:#fff;border-radius:16px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.bl-modal h2{color:#1a237e;font-weight:800;font-size:19px;margin:0 0 18px;display:flex;align-items:center;gap:8px}
.bl-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bl-save-lib{display:flex;align-items:center;gap:10px;background:#e8f5e9;padding:12px;border-radius:10px;border:1.5px solid #2e7d32;cursor:pointer}
.bl-save-lib input{width:20px;height:20px;cursor:pointer;flex-shrink:0}
.bl-save-lib p{margin:0;font-weight:700;color:#2e7d32;font-size:13px;display:flex;align-items:center;gap:6px}
.bl-save-lib small{color:#666;font-size:11px;font-weight:500}
.bl-preview{background:#fff8e1;padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #f57c00}
.bl-preview span:first-child{font-size:13px;font-weight:700;color:#666}
.bl-preview span:last-child{font-size:20px;font-weight:800;color:#f57c00}
.bl-modal-btns{display:flex;gap:10px;margin-top:4px}
.bl-modal-btns button{padding:13px;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px}
.bl-modal-btns .cancel{flex:1;background:#f3f4fa;color:#666}
.bl-modal-btns .add{flex:2;background:#1a237e;color:#fff}

@keyframes bl-slide{from{transform:translateY(100%)}to{transform:translateY(0)}}

/* ============ TABLET & MOBILE ============ */
@media (max-width:900px){
  .bl-grid{grid-template-columns:1fr}
  .bl-page{padding:12px 12px 100px}
  .bl-desktop-actions{display:none}
  .bl-sticky{display:flex}
}

/* ============ PHONE ============ */
@media (max-width:640px){
  .bl-header h1{font-size:20px}
  .bl-header-icon{width:40px;height:40px;font-size:17px}
  .bl-card{padding:15px;border-radius:12px}
  .bl-table-scroll{display:none}
  .bl-cards{display:block}
  .bl-input,.bl-cash-input,.bl-cart-search input,.bl-search-bar input{font-size:16px} /* stops iOS zoom */
  .bl-toast{top:70px;left:12px;right:12px;max-width:none;justify-content:center}
  .bl-overlay{align-items:flex-end;padding:0}
  .bl-modal{max-width:none;border-radius:20px 20px 0 0;max-height:92vh;padding:20px 18px calc(20px + env(safe-area-inset-bottom));animation:bl-slide .25s ease-out}
  .bl-note .amt{font-size:24px}
}
`;

const Billing = () => {
  const { user } = useAuth();

  // Product search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  // Cart search
  const [cartSearch, setCartSearch] = useState('');

  // Cart
  const [cart, setCart] = useState([]);

  // Manual Item Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualItem, setManualItem] = useState({
    name: '',
    price: '',
    quantity: 1,
    discountPercent: 0,
    saveToLibrary: false,
  });

  // Customer
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [taxAmount, setTaxAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Processing
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [lastSale, setLastSale] = useState(null);

  // UPI
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  // ============================================================
  // SEARCH PRODUCTS (Books + Custom Items dono)
  // ============================================================
  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setSearching(true);

        const [booksRes, customRes] = await Promise.all([
          api
            .get(`/books/suggestions?q=${encodeURIComponent(searchTerm.trim())}`)
            .catch(() => ({ data: { books: [] } })),
          api
            .get(`/custom-items?search=${encodeURIComponent(searchTerm.trim())}`)
            .catch(() => ({ data: { items: [] } })),
        ]);

        const books = (booksRes.data.books || []).map((b) => ({
          _id: b._id,
          title: b.title,
          author: b.author,
          price: b.price,
          stock: b.stock,
          image: b.image,
          isCustom: false,
        }));

        const customItems = (customRes.data.items || []).map((i) => ({
          _id: i._id,
          title: i.name,
          author: i.category || 'Custom Item',
          price: i.price,
          stock: null,
          image: null,
          discountPercent: i.discountPercent || 0,
          isCustom: true,
        }));

        setSearchResults([...customItems, ...books]);
      } catch (err) {
        console.error('Search error:', err);
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

  // Auto-save cart to localStorage
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(POS_CART_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(POS_CART_KEY);
      }
    } catch (err) {
      console.error('POS cart save error:', err);
    }
  }, [cart]);

  // ===== Add Book (or custom item from DB) to cart =====
  const addToCart = (item) => {
    const key = item._id;
    const existing = cart.find(
      (c) => c.book === key || (item.isCustom && c.customItemId === key)
    );

    if (existing) {
      setCart(
        cart.map((c) =>
          c.book === key || (item.isCustom && c.customItemId === key)
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          book: item.isCustom ? null : item._id,
          customItemId: item.isCustom ? item._id : null,
          name: item.title,
          price: item.price,
          quantity: 1,
          discountPercent: item.discountPercent || 0,
          discount: item.isCustom
            ? (item.price * (item.discountPercent || 0)) / 100
            : 0,
          stock: item.stock,
          isManual: item.isCustom,
        },
      ]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // ============================================================
  // ADD MANUAL ITEM (Ad-hoc + Optional save to library)
  // ============================================================
  const addManualItem = async () => {
    if (
      !manualItem.name.trim() ||
      !manualItem.price ||
      Number(manualItem.price) <= 0
    ) {
      setToast('⚠️ Item name and price required');
      return;
    }

    const price = Number(manualItem.price);
    const qty = Number(manualItem.quantity) || 1;
    const percent = Math.min(
      100,
      Math.max(0, Number(manualItem.discountPercent) || 0)
    );
    const lineTotal = price * qty;
    const discountAmt = (lineTotal * percent) / 100;

    let customItemId = null;

    if (manualItem.saveToLibrary) {
      try {
        const { data } = await api.post('/custom-items', {
          name: manualItem.name.trim(),
          price,
          discountPercent: percent,
          category: 'Custom',
        });
        customItemId = data._id;
      } catch (err) {
        if (err.response?.data?.item) {
          customItemId = err.response.data.item._id;
        } else {
          setToast(
            `⚠️ ${err.response?.data?.message || 'Failed to save to library'}`
          );
          return;
        }
      }
    }

    setCart([
      ...cart,
      {
        book: null,
        customItemId,
        name: manualItem.name.trim(),
        price,
        quantity: qty,
        discountPercent: percent,
        discount: Number(discountAmt.toFixed(2)),
        stock: null,
        isManual: true,
      },
    ]);

    setManualItem({
      name: '',
      price: '',
      quantity: 1,
      discountPercent: 0,
      saveToLibrary: false,
    });
    setShowManualModal(false);
    setToast(
      manualItem.saveToLibrary
        ? '✅ Item added to cart + saved to library'
        : '✅ Custom item added to cart'
    );
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

  const updateItemDiscountPercent = (index, percent) => {
    const updated = [...cart];
    const p = Math.min(100, Math.max(0, Number(percent) || 0));
    const item = updated[index];
    const lineTotal = item.price * item.quantity;
    const discountAmt = (lineTotal * p) / 100;

    updated[index] = {
      ...item,
      discountPercent: p,
      discount: Number(discountAmt.toFixed(2)),
    };
    setCart(updated);
  };

  const updateItemPrice = (index, price) => {
    const updated = [...cart];
    const newPrice = Number(price) || 0;
    const item = updated[index];
    const lineTotal = newPrice * item.quantity;
    const discountAmt = (lineTotal * (item.discountPercent || 0)) / 100;

    updated[index] = {
      ...item,
      price: newPrice,
      discount: Number(discountAmt.toFixed(2)),
    };
    setCart(updated);
  };

  const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

  // ===== Calculations =====
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );
  const totalAmount = subtotal - totalDiscount + Number(taxAmount || 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const paid = Number(paidAmount) || 0;
  const changeReturn = paid > totalAmount ? paid - totalAmount : 0;
  const dueAmount = paid > 0 && paid < totalAmount ? totalAmount - paid : 0;

  const qrAmount =
    Number(customAmount) > 0 ? Number(customAmount) : totalAmount;

  const filteredCart = cartSearch
    ? cart.filter((item) =>
        item.name.toLowerCase().includes(cartSearch.toLowerCase())
      )
    : cart;

  // ===== Save Sale =====
  const handleSave = async (printAfter = false) => {
    if (saving) return;
    if (cart.length === 0) {
      setToast('⚠️ Cart is empty');
      return;
    }
    if (paymentMethod === 'UPI' && !upiConfirmed) {
      setToast('⚠️ Please confirm UPI payment first');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({
          book: item.book || null,
          customItemId: item.customItemId || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          isManual: item.isManual || false,
        })),
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        discountAmount: 0,
        discountPercent: 0,
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
      localStorage.removeItem(POS_CART_KEY);
      setCustomer({ name: '', phone: '' });
      setTaxAmount(0);
      setNotes('');
      setPaymentMethod('Cash');
      setPaidAmount('');
      setCustomAmount('');
      setUpiConfirmed(false);
      setCartSearch('');
    } catch (err) {
      setToast(`⚠️ ${err.response?.data?.message || 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  };

  // ===== Print (paper-roll receipt, shared with Sales page) =====
  const handlePrint = (sale) => {
    const s = sale || lastSale;
    if (!s) return;
    printInvoice(s, (msg) => setToast(`⚠️ ${msg}`));
  };

  // ===== Small render helpers =====
  const isErrorToast = toast.includes('⚠️');
  const toastText = toast.replace(/^(⚠️|✅)\s*/, '');

  const renderActionButtons = () => (
    <div className="bl-actions">
      <button
        className="bl-btn blue"
        onClick={() => handleSave(false)}
        disabled={saving}
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Bill'}
      </button>
      <button
        className="bl-btn orange"
        onClick={() => handleSave(true)}
        disabled={saving}
      >
        <FaPrint /> Save & Print
      </button>
    </div>
  );

  return (
    <div className="bl-page">
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`bl-toast ${isErrorToast ? 'err' : 'ok'}`}>
          {isErrorToast ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toastText}
        </div>
      )}

      {/* Header */}
      <div className="bl-header">
        <div className="bl-header-icon">
          <FaReceipt />
        </div>
        <div>
          <h1>Billing / POS</h1>
          <p>Create a new sale and print invoice</p>
        </div>
        {totalItems > 0 && (
          <div className="bl-cart-badge">
            <FaShoppingCart /> {totalItems}
          </div>
        )}
      </div>

      <div className="bl-grid">
        {/* ===================== LEFT ===================== */}
        <div>
          {/* Search */}
          <div ref={searchRef} className="bl-search-box">
            <div className="bl-search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search books or saved items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  className="bl-clear-x"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>

            {searchTerm.length >= 2 && (
              <div className="bl-dropdown">
                {searching ? (
                  <div className="bl-dd-msg">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="bl-dd-msg">No items found</div>
                ) : (
                  searchResults.map((item) => (
                    <div
                      key={(item.isCustom ? 'c-' : 'b-') + item._id}
                      className="bl-dd-item"
                      onClick={() => addToCart(item)}
                    >
                      {item.isCustom ? (
                        <div className="bl-dd-ph">
                          <FaBox />
                        </div>
                      ) : (
                        <img
                          className="bl-dd-img"
                          src={item.image}
                          alt={item.title}
                          onError={(e) =>
                            (e.target.src = 'https://via.placeholder.com/40x55')
                          }
                        />
                      )}
                      <div className="bl-dd-info">
                        <p className="bl-dd-title">
                          {item.title}{' '}
                          {item.isCustom && <span className="bl-tag">CUSTOM</span>}
                        </p>
                        <p className="bl-dd-sub">
                          {item.author}
                          {item.stock !== null && ` • Stock: ${item.stock}`}
                        </p>
                      </div>
                      <div className="bl-dd-price">₹{item.price}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Custom Item */}
          <button
            className="bl-add-custom"
            onClick={() => setShowManualModal(true)}
          >
            <FaPlus /> Add Custom Item (not in store)
          </button>

          {/* Cart Search */}
          {cart.length > 3 && (
            <div className="bl-cart-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search in cart..."
                value={cartSearch}
                onChange={(e) => setCartSearch(e.target.value)}
              />
              {cartSearch && (
                <button
                  type="button"
                  className="bl-clear-x"
                  onClick={() => setCartSearch('')}
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>
          )}

          {/* Cart */}
          <div className="bl-cart-wrap">
            {cart.length === 0 ? (
              <div className="bl-empty">
                <FaShoppingCart />
                <p>Cart is empty. Search a book or add a custom item.</p>
              </div>
            ) : filteredCart.length === 0 ? (
              <div className="bl-empty">
                <p>No items match "{cartSearch}"</p>
              </div>
            ) : (
              <>
                {/* ---- Desktop / tablet table ---- */}
                <div className="bl-table-scroll">
                  <table className="bl-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="c">Qty</th>
                        <th className="r">Price</th>
                        <th className="r">Disc %</th>
                        <th className="r">Total</th>
                        <th className="c"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCart.map((item) => {
                        const realIndex = cart.indexOf(item);
                        const itemTotal =
                          item.price * item.quantity - (item.discount || 0);
                        return (
                          <tr key={realIndex}>
                            <td>
                              <div className="bl-name-cell">
                                {item.isManual && (
                                  <span className="bl-tag">CUSTOM</span>
                                )}
                                {item.name}
                              </div>
                            </td>
                            <td className="c">
                              <div className="bl-qty">
                                <button
                                  onClick={() =>
                                    updateQuantity(realIndex, item.quantity - 1)
                                  }
                                >
                                  <FaMinus size={9} />
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(realIndex, item.quantity + 1)
                                  }
                                >
                                  <FaPlus size={9} />
                                </button>
                              </div>
                            </td>
                            <td className="r" style={{ fontWeight: 600 }}>
                              {item.isManual ? (
                                <input
                                  type="number"
                                  className="bl-mini-input"
                                  value={item.price}
                                  min="0"
                                  onChange={(e) =>
                                    updateItemPrice(realIndex, e.target.value)
                                  }
                                />
                              ) : (
                                `₹${item.price}`
                              )}
                            </td>
                            <td className="r">
                              <input
                                type="number"
                                className="bl-mini-input"
                                style={{ width: '60px' }}
                                value={item.discountPercent || 0}
                                min="0"
                                max="100"
                                onChange={(e) =>
                                  updateItemDiscountPercent(
                                    realIndex,
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td
                              className="r"
                              style={{ fontWeight: 800, color: '#f57c00' }}
                            >
                              ₹{itemTotal.toFixed(0)}
                            </td>
                            <td className="c">
                              <button
                                className="bl-icon-btn danger"
                                onClick={() => removeItem(realIndex)}
                                title="Remove"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ---- Phone cards ---- */}
                <div className="bl-cards">
                  {filteredCart.map((item) => {
                    const realIndex = cart.indexOf(item);
                    const itemTotal =
                      item.price * item.quantity - (item.discount || 0);
                    return (
                      <div className="bl-item" key={realIndex}>
                        <div className="bl-item-top">
                          <div className="bl-item-name">
                            {item.isManual && (
                              <span className="bl-tag">CUSTOM</span>
                            )}
                            {item.name}
                          </div>
                          <button
                            className="bl-icon-btn danger"
                            onClick={() => removeItem(realIndex)}
                            aria-label="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="bl-item-grid">
                          <div>
                            <label>Price</label>
                            {item.isManual ? (
                              <input
                                type="number"
                                inputMode="decimal"
                                className="bl-input"
                                value={item.price}
                                min="0"
                                onChange={(e) =>
                                  updateItemPrice(realIndex, e.target.value)
                                }
                              />
                            ) : (
                              <div className="bl-item-price">
                                ₹{item.price}
                                {typeof item.stock === 'number' && (
                                  <div className="bl-stock">
                                    Stock: {item.stock}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <label>Discount %</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              className="bl-input"
                              value={item.discountPercent || 0}
                              min="0"
                              max="100"
                              onChange={(e) =>
                                updateItemDiscountPercent(
                                  realIndex,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="bl-item-foot">
                          <div className="bl-qty">
                            <button
                              onClick={() =>
                                updateQuantity(realIndex, item.quantity - 1)
                              }
                              aria-label="Decrease"
                            >
                              <FaMinus size={11} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(realIndex, item.quantity + 1)
                              }
                              aria-label="Increase"
                            >
                              <FaPlus size={11} />
                            </button>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span>Total </span>
                            <b>₹{itemTotal.toFixed(0)}</b>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===================== RIGHT ===================== */}
        <div>
          {/* Customer */}
          <div className="bl-card">
            <h3 className="bl-card-title">
              <FaUser /> Customer <small>(Optional)</small>
            </h3>
            <div className="bl-stack">
              <div className="bl-input-wrap">
                <FaUser />
                <input
                  type="text"
                  className="bl-input has-icon"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
              </div>
              <div className="bl-input-wrap">
                <FaPhoneAlt />
                <input
                  type="tel"
                  inputMode="numeric"
                  className="bl-input has-icon"
                  placeholder="Phone number"
                  value={customer.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                />
              </div>
              <div className="bl-input-wrap">
                <FaRupeeSign />
                <input
                  type="number"
                  inputMode="decimal"
                  className="bl-input has-icon orange"
                  placeholder="Custom amount (for UPI QR)"
                  value={customAmount}
                  min="0"
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bl-card">
            <h3 className="bl-card-title">
              <FaWallet /> Payment Method
            </h3>
            <div className="bl-pm-grid">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.key}
                  type="button"
                  className={`bl-pm ${paymentMethod === pm.key ? 'active' : ''}`}
                  style={{ '--pm': pm.color }}
                  onClick={() => {
                    setPaymentMethod(pm.key);
                    if (pm.key === 'UPI') setUpiConfirmed(false);
                  }}
                >
                  {pm.icon}
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI */}
          {paymentMethod === 'UPI' && (
            <div className={`bl-upi ${upiConfirmed ? 'ok' : ''}`}>
              {upiConfirmed ? (
                <div className="bl-upi-ok">
                  <FaCheckCircle /> UPI Received ₹{qrAmount.toFixed(0)}
                  <button
                    className="bl-link-btn"
                    onClick={() => setUpiConfirmed(false)}
                  >
                    <FaUndo size={10} /> Reset
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    <FaMobileAlt /> UPI QR se payment karwayein
                  </p>
                  <button
                    className="bl-primary-btn"
                    onClick={() => {
                      if (qrAmount <= 0) {
                        setToast('⚠️ Enter amount');
                        return;
                      }
                      setShowUpiModal(true);
                    }}
                  >
                    <FaQrcode /> Generate UPI QR (₹{qrAmount.toFixed(0)})
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cash */}
          {paymentMethod === 'Cash' && cart.length > 0 && (
            <div className="bl-card bl-cash">
              <h3 className="bl-card-title">
                <FaMoneyBillWave /> Cash Payment
              </h3>
              <input
                type="number"
                inputMode="decimal"
                className="bl-cash-input"
                placeholder={`Customer paid (Total: ₹${totalAmount.toFixed(0)})`}
                value={paidAmount}
                min="0"
                onChange={(e) => setPaidAmount(e.target.value)}
              />
              <div className="bl-chips">
                {[
                  Math.ceil(totalAmount / 10) * 10,
                  Math.ceil(totalAmount / 50) * 50,
                  Math.ceil(totalAmount / 100) * 100,
                ]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0)
                  .slice(0, 3)
                  .map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="bl-chip"
                      onClick={() => setPaidAmount(String(amount))}
                    >
                      ₹{amount}
                    </button>
                  ))}
                <button
                  type="button"
                  className="bl-chip solid"
                  onClick={() => setPaidAmount(String(Math.round(totalAmount)))}
                >
                  <FaCheckCircle size={11} /> Exact ₹{totalAmount.toFixed(0)}
                </button>
                <button
                  type="button"
                  className="bl-chip grey"
                  onClick={() => setPaidAmount('')}
                >
                  <FaEraser size={11} /> Clear
                </button>
              </div>

              {paidAmount !== '' && Number(paidAmount) > 0 && (
                <>
                  {changeReturn > 0 ? (
                    <div className="bl-note green">
                      <div>
                        <h4>
                          <FaExchangeAlt /> Return Change
                        </h4>
                        <small>Customer ko wapas karein</small>
                      </div>
                      <div className="amt">₹{changeReturn.toFixed(0)}</div>
                    </div>
                  ) : dueAmount > 0 ? (
                    <div className="bl-note red">
                      <div>
                        <h4>
                          <FaExclamationTriangle /> Still Due
                        </h4>
                        <small>Customer se aur paise lein</small>
                      </div>
                      <div className="amt">₹{dueAmount.toFixed(0)}</div>
                    </div>
                  ) : (
                    <div className="bl-exact">
                      <FaCheckCircle /> Exact Payment Received
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bill Summary */}
          <div className="bl-card">
            <h3 className="bl-card-title">
              <FaTag /> Bill Summary
            </h3>

            <div className="bl-row">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="bl-row bl-discount">
                <span>
                  <FaPercent size={11} /> Total Discount
                </span>
                <span>-₹{totalDiscount.toFixed(0)}</span>
              </div>
            )}

            <div className="bl-row">
              <span>Tax (₹)</span>
              <input
                type="number"
                inputMode="decimal"
                className="bl-mini-input"
                style={{ width: '90px' }}
                value={taxAmount}
                min="0"
                onChange={(e) => setTaxAmount(e.target.value)}
              />
            </div>

            <div className="bl-input-wrap" style={{ marginTop: '4px' }}>
              <FaStickyNote />
              <input
                type="text"
                className="bl-input has-icon"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="bl-total">
              <span>TOTAL</span>
              <span>₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="bl-desktop-actions">{renderActionButtons()}</div>
        </div>
      </div>

      {/* ===== Sticky bottom bar (phones & tablets) ===== */}
      {cart.length > 0 && (
        <div className="bl-sticky">
          <div className="bl-sticky-total">
            <small>{totalItems} items • Total</small>
            <b>₹{totalAmount.toFixed(0)}</b>
          </div>
          <div className="bl-sticky-btns">
            <button
              className="bl-btn blue"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <FaSave /> {saving ? '...' : 'Save'}
            </button>
            <button
              className="bl-btn orange"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <FaPrint /> Print
            </button>
          </div>
        </div>
      )}

      {/* ===== Manual Item Modal ===== */}
      {showManualModal && (
        <div className="bl-overlay" onClick={() => setShowManualModal(false)}>
          <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              <FaBox style={{ color: '#f57c00' }} /> Add Custom Item
            </h2>

            <div className="bl-stack" style={{ gap: '14px' }}>
              <div>
                <label className="bl-label">Item Name *</label>
                <input
                  type="text"
                  className="bl-input"
                  placeholder="e.g., Notebook, Pen"
                  value={manualItem.name}
                  autoFocus
                  onChange={(e) =>
                    setManualItem({ ...manualItem, name: e.target.value })
                  }
                />
              </div>

              <div className="bl-modal-grid">
                <div>
                  <label className="bl-label">
                    <FaRupeeSign size={10} /> Price *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="bl-input"
                    placeholder="0"
                    min="0"
                    value={manualItem.price}
                    onChange={(e) =>
                      setManualItem({ ...manualItem, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="bl-label">Quantity</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="bl-input"
                    placeholder="1"
                    min="1"
                    value={manualItem.quantity}
                    onChange={(e) =>
                      setManualItem({ ...manualItem, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="bl-label">
                  <FaPercent size={10} /> Discount %
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="bl-input"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={manualItem.discountPercent}
                  onChange={(e) =>
                    setManualItem({
                      ...manualItem,
                      discountPercent: e.target.value,
                    })
                  }
                />
              </div>

              <label className="bl-save-lib">
                <input
                  type="checkbox"
                  checked={manualItem.saveToLibrary}
                  onChange={(e) =>
                    setManualItem({
                      ...manualItem,
                      saveToLibrary: e.target.checked,
                    })
                  }
                />
                <div>
                  <p>
                    <FaBookmark size={12} /> Save to Library (permanent)
                  </p>
                  <small>Next time search me bhi milega</small>
                </div>
              </label>

              {manualItem.price > 0 && (
                <div className="bl-preview">
                  <span>Total:</span>
                  <span>
                    ₹
                    {(
                      Number(manualItem.price) *
                      Number(manualItem.quantity || 1) *
                      (1 - (Number(manualItem.discountPercent) || 0) / 100)
                    ).toFixed(0)}
                  </span>
                </div>
              )}

              <div className="bl-modal-btns">
                <button
                  className="cancel"
                  onClick={() => {
                    setShowManualModal(false);
                    setManualItem({
                      name: '',
                      price: '',
                      quantity: 1,
                      discountPercent: 0,
                      saveToLibrary: false,
                    });
                  }}
                >
                  <FaTimes /> Cancel
                </button>
                <button className="add" onClick={addManualItem}>
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

export default Billing;