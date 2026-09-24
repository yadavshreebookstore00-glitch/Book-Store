import QRCode from 'qrcode';

// ===== GENERATE UPI QR CODE =====
// @route POST /api/upi/generate-qr
// @access Private/Admin
export const generateUpiQr = async (req, res) => {
  try {
    const { amount, note = 'Payment', transactionId = '' } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const upiId = process.env.UPI_ID;
    const upiName = process.env.UPI_NAME || 'Yadav Shree Book Store';

    if (!upiId) {
      return res.status(500).json({
        message: 'UPI ID not configured. Please contact admin.',
      });
    }

    // UPI Deep Link URL
    const upiUrl = new URL('upi://pay');
    upiUrl.searchParams.set('pa', upiId);
    upiUrl.searchParams.set('pn', upiName);
    upiUrl.searchParams.set('am', Number(amount).toFixed(2));
    upiUrl.searchParams.set('cu', 'INR');
    upiUrl.searchParams.set('tn', note);

    if (transactionId) {
      upiUrl.searchParams.set('tr', transactionId);
    }

    const upiString = upiUrl.toString();
    console.log('💰 UPI String:', upiString);

    // Generate QR code as Data URL
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#1a237e',
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      qrCode: qrDataUrl,
      upiString,
      upiId,
      upiName,
      amount: Number(amount),
      note,
      transactionId,
    });
  } catch (error) {
    console.error('UPI QR error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET UPI INFO =====
// @route GET /api/upi/info
// @access Private/Admin
export const getUpiInfo = async (req, res) => {
  try {
    res.json({
      upiId: process.env.UPI_ID || '',
      upiName: process.env.UPI_NAME || 'Yadav Shree Book Store',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};