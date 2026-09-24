import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', marginBottom: '15px' }}>No Orders Yet</h2>
        <Link to="/shop" style={{ background: '#1a237e', color: '#fff', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const statusColors = {
    Pending: '#f57c00',
    Processing: '#1976d2',
    Shipped: '#6a1b9a',
    Delivered: '#2e7d32',
    Cancelled: '#c62828',
  };

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
        My Orders ({orders.length})
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: '15px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '3px' }}>Order ID</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a237e' }}>#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '3px' }}>Placed on</p>
              <p style={{ fontSize: '13px', fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <span style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status], padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {order.status}
            </span>
            <span style={{ background: order.isPaid ? '#e8f5e9' : '#fff3e0', color: order.isPaid ? '#2e7d32' : '#f57c00', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {order.isPaid ? '✓ Paid' : '○ Pending'} • {order.paymentMethod}
            </span>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginBottom: '15px' }}>
            {order.orderItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                <img src={item.image} alt={item.title} style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a237e' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontWeight: 700, fontSize: '13px' }}>Total</span>
            <span style={{ color: '#f57c00', fontWeight: 800, fontSize: '20px' }}>₹{order.totalPrice}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;