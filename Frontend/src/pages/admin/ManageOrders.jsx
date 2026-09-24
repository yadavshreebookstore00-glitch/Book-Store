import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div>
      <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
        Manage Orders ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#666', fontWeight: 500 }}>
          📦 No orders yet.
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>ORDER ID</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a237e' }}>#{order._id.slice(-8).toUpperCase()}</p>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, marginTop: '8px' }}>
                  👤 {order.user?.name} • 📧 {order.user?.email}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>TOTAL</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#f57c00' }}>₹{order.totalPrice}</p>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginTop: '5px' }}>
                  {order.paymentMethod} • {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              <strong style={{ color: '#1a237e' }}>Ship to:</strong> {order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f5f5f5', padding: '8px', borderRadius: '6px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '35px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1a237e' }}>{item.title}</p>
                    <p style={{ fontSize: '11px', color: '#666' }}>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Change */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: '#1a237e' }}>Status:</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, marginLeft: 'auto' }}>
                📅 {new Date(order.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageOrders;