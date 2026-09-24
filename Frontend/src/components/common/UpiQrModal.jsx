import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaQrcode,
  FaCheckCircle,
  FaCopy,
  FaMobileAlt,
} from 'react-icons/fa';
import api from '../../services/api';

const UpiQrModal = ({ isOpen, onClose, amount, note = 'Payment', onConfirm }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQrData(null);
      setError('');
      setCopied(false);
      return;
    }

    const generate = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.post('/upi/generate-qr', {
          amount: Number(amount),
          note,
          transactionId: `TXN${Date.now()}`,
        });
        if (!data || !data.qrCode) {
          setError('Invalid response from server');
          return;
        }
        setQrData(data);
      } catch (err) {
        console.error('QR error:', err);
        setError(err.response?.data?.message || 'Failed to generate QR');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [isOpen, amount, note]);

  const copyUpiId = () => {
    if (qrData?.upiId) {
      navigator.clipboard.writeText(qrData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
            padding: '20px 25px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaQrcode /> UPI Payment
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
              Scan & pay ₹{amount}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '25px' }}>
          <div
            style={{
              background: '#e8eaf6',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              marginBottom: '20px',
              borderLeft: '4px solid #1a237e',
            }}
          >
            <p style={{ fontSize: '12px', color: '#666', fontWeight: 600, textTransform: 'uppercase', margin: 0, marginBottom: '5px' }}>
              Amount to Pay
            </p>
            <h2 style={{ fontSize: '32px', color: '#1a237e', fontWeight: 800, margin: 0 }}>
              ₹{amount}
            </h2>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 15px',
                  border: '4px solid #e8eaf6',
                  borderTopColor: '#1a237e',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ color: '#666', fontWeight: 600, fontSize: '13px' }}>
                Generating QR...
              </p>
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '15px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '15px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && qrData && (
            <>
              <div
                style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e8eaf6',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <img
                  src={qrData.qrCode}
                  alt="UPI QR Code"
                  style={{ width: '100%', maxWidth: '260px', height: 'auto', display: 'block', margin: '0 auto' }}
                />
              </div>

              <div
                style={{
                  background: '#f9f9f9',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '10px', color: '#999', fontWeight: 700, textTransform: 'uppercase', margin: 0, marginBottom: '2px' }}>
                    UPI ID
                  </p>
                  <p style={{ fontSize: '13px', color: '#1a237e', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {qrData.upiId}
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', fontWeight: 600, margin: 0, marginTop: '2px' }}>
                    {qrData.upiName}
                  </p>
                </div>
                <button
                  onClick={copyUpiId}
                  style={{
                    background: copied ? '#e8f5e9' : '#e8eaf6',
                    color: copied ? '#2e7d32' : '#1a237e',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copied ? <><FaCheckCircle /> Copied</> : <><FaCopy /> Copy</>}
                </button>
              </div>

              <div
                style={{
                  background: '#fff3e0',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#f57c00',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <FaMobileAlt style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Customer ko QR scan karne bolen. Amount <strong>auto-filled</strong> hoga.
                </span>
              </div>

              <button
                onClick={() => {
                  onConfirm && onConfirm();
                  onClose();
                }}
                style={{
                  width: '100%',
                  background: '#2e7d32',
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
                  marginBottom: '10px',
                }}
              >
                <FaCheckCircle /> Payment Received ✓
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default UpiQrModal;