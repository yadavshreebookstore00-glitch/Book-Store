import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaHashtag,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaTruck,
  FaTimesCircle,
  FaSpinner,
  FaShoppingBag,
  FaCreditCard,
  FaMoneyBillWave,
  FaChevronDown,
  FaClipboardList,
  FaCheck,
  FaBan,
} from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './Orders.module.css';

const STATUS_ICONS = {
  Pending: <FaClock />,
  Processing: <FaCog />,
  Shipped: <FaTruck />,
  Delivered: <FaCheckCircle />,
  Cancelled: <FaTimesCircle />,
};

// Progress tracker ke steps
const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const VISIBLE_ITEMS = 2;

// ===== Progress tracker =====
const Tracker = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className={styles.cancelBar}>
        <FaBan /> This order was cancelled
      </div>
    );
  }

  const current = Math.max(STEPS.indexOf(status), 0);

  return (
    <div className={styles.track}>
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`${styles.step} ${i <= current ? styles.stepDone : ''} ${
            i === current ? styles.stepCurrent : ''
          }`}
        >
          <span className={styles.dot}>
            {i <= current ? <FaCheck /> : i + 1}
          </span>
          {step}
        </div>
      ))}
    </div>
  );
};

// ===== Single order card =====
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const items = order.orderItems || [];
  const shown = expanded ? items : items.slice(0, VISIBLE_ITEMS);
  const hidden = items.length - VISIBLE_ITEMS;
  const isCod = order.paymentMethod === 'COD';

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHead}>
        <div className={styles.meta}>
          <span className={styles.orderId}>
            <FaHashtag /> {order._id.slice(-8).toUpperCase()}
          </span>
          <span>
            <FaCalendarAlt />
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[order.status] || ''}`}>
            {STATUS_ICONS[order.status]} {order.status}
          </span>
          <span
            className={`${styles.badge} ${order.isPaid ? styles.paid : styles.unpaid}`}
          >
            {order.isPaid ? <FaCheckCircle /> : <FaClock />}
            {order.isPaid ? 'Paid' : 'Payment Pending'}
          </span>
        </div>
      </div>

      {/* Progress */}
      <Tracker status={order.status} />

      {/* Items */}
      <div className={styles.items}>
        {shown.map((item, i) => (
          <div key={i} className={styles.item}>
            <img src={item.image} alt={item.title} className={styles.itemImg} />
            <div className={styles.itemBody}>
              <p className={styles.itemTitle}>{item.title}</p>
              <p className={styles.itemMeta}>
                Qty: {item.quantity} × ₹{item.price}
              </p>
            </div>
            <span className={styles.itemPrice}>
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}

        {hidden > 0 && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : `+${hidden} more item${hidden > 1 ? 's' : ''}`}
            <FaChevronDown
              className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
            />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFoot}>
        <span className={styles.payMethod}>
          {isCod ? <FaMoneyBillWave /> : <FaCreditCard />}
          {isCod ? 'Cash on Delivery' : order.paymentMethod}
        </span>
        <div className={styles.totalWrap}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.total}>
            ₹{Number(order.totalPrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ===== Orders page =====
const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className={styles.centerBox}>
        <FaSpinner className={styles.spin} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.centerBox}>
        <FaBoxOpen className={styles.centerIcon} />
        <h2>No Orders Yet</h2>
        <p>Looks like you haven't placed any order.</p>
        <Link to="/shop" className={styles.centerBtn}>
          <FaShoppingBag /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <FaClipboardList /> My Orders
        <span className={styles.count}>{orders.length}</span>
      </h1>

      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default Orders;