// src/utils/printInvoice.js
// Shared thermal-receipt (paper roll) invoice printer.
// Used by both Billing.jsx and Sales.jsx so the bill always looks the same.

// ================== EASY SETTINGS ==================
// Paper roll width in mm. Common sizes: 80 (3 inch) or 58 (2 inch).
export const PAPER_WIDTH_MM = 80;

// Logo file inside your React `public/` folder.
// Example: public/logo.png  ->  '/logo.png'
export const LOGO_PATH = '/logo.png';

const STORE = {
  name: 'YADAV SHREE',
  tag: 'BOOK STORE',
  address: '63, 64, Bholaram Ustad Marg,Pipliya Rao, Ring Road,Indore - 452014',
  phone: '+91 70679 74442',
};

const UPI = {
  id: 'Q045239271@ybl',
  name: 'Jeetendra Sahu',
};
// ===================================================

// Escape user-entered text so it can't break the bill HTML
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (n) => Number(n || 0).toFixed(2);

const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Print a sale as a thermal receipt.
 * @param {object} sale     sale object from the API
 * @param {function} onError optional, called with a message if printing fails
 */
export const printInvoice = (sale, onError) => {
  if (!sale) return;

  const win = window.open('', '_blank', 'width=420,height=720');
  if (!win) {
    if (onError) onError('Popup blocked. Please allow popups to print.');
    return;
  }

  // ----- Sizing based on paper width -----
  const narrow = PAPER_WIDTH_MM <= 58;
  const fontSize = narrow ? 10 : 12;
  const logoMaxWidth = narrow ? 32 : 44; // mm
  const qrMm = narrow ? 34 : 40; // mm

  // ----- Logo (needs an absolute URL inside the print window) -----
  const logoUrl = `${window.location.origin}${LOGO_PATH}`;

  // ----- UPI QR -----
  const upiAmount = Number(sale.paidAmount || sale.totalAmount).toFixed(2);
  const upiString = `upi://pay?pa=${UPI.id}&pn=${encodeURIComponent(
    UPI.name
  )}&am=${upiAmount}&cu=INR&tn=Invoice%20${sale.invoiceNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(
    upiString
  )}`;

  // ----- Discounts (Billing saves them per item) -----
  const itemDiscount = (sale.items || []).reduce(
    (sum, i) => sum + (i.discount || 0),
    0
  );
  const totalDiscount = itemDiscount + (sale.discountAmount || 0);

  // ----- Items -----
  const itemsHtml = (sale.items || [])
    .map((item) => {
      const gross = item.price * item.quantity;
      const disc = item.discount || 0;
      const net = gross - disc;
      return `
        <div class="item">
          <div class="item-name">${esc(item.name)}${item.isManual ? ' *' : ''}</div>
          <div class="row">
            <span>${item.quantity} x Rs.${money(item.price)}</span>
            <span>Rs.${money(net)}</span>
          </div>
          ${
            disc > 0
              ? `<div class="row small"><span>Discount</span><span>-Rs.${money(disc)}</span></div>`
              : ''
          }
        </div>`;
    })
    .join('');

  const hasManual = (sale.items || []).some((i) => i.isManual);

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${esc(sale.invoiceNumber)}</title>
  <style>
    @page { size: ${PAPER_WIDTH_MM}mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #fff; }
    body {
      width: ${PAPER_WIDTH_MM}mm;
      margin: 0 auto;
      padding: 3mm 4mm 6mm;
      font-family: 'Courier New', monospace;
      font-size: ${fontSize}px;
      line-height: 1.35;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .center { text-align: center; }
    .logo {
      display: block;
      margin: 0 auto 5px;
      max-width: ${logoMaxWidth}mm;
      max-height: 22mm;
      height: auto;
      filter: grayscale(1) contrast(1.4); /* thermal printers are black & white */
    }
    .store-name { font-size: ${fontSize + 5}px; font-weight: 900; letter-spacing: 1px; }
    .store-tag { font-weight: 700; letter-spacing: 2px; }
    .small { font-size: ${fontSize - 1}px; }
    .hr { border-top: 1px dashed #000; margin: 6px 0; }
    .hr.solid { border-top: 2px solid #000; }
    .row { display: flex; justify-content: space-between; gap: 6px; padding: 1px 0; }
    .row span:last-child { text-align: right; white-space: nowrap; }
    .info .row span:last-child { white-space: normal; }
    .item { padding: 4px 0; border-bottom: 1px dotted #999; }
    .item:last-child { border-bottom: none; }
    .item-name { font-weight: 700; word-break: break-word; }
    .total {
      font-size: ${fontSize + 3}px;
      font-weight: 900;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 6px 0;
      margin: 5px 0;
    }
    .qr { text-align: center; margin: 8px 0 4px; padding: 6px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
    .qr img { width: ${qrMm}mm; height: ${qrMm}mm; display: block; margin: 4px auto; }
    .qr p { font-weight: 700; }
    .footer { text-align: center; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="center">
    <img class="logo" src="${logoUrl}" alt="" onerror="this.style.display='none'" />
    <div class="store-name">${STORE.name}</div>
    <div class="store-tag">${STORE.tag}</div>
    <div class="small">${STORE.address}</div>
    <div class="small">Ph: ${STORE.phone}</div>
  </div>

  <div class="hr"></div>

  <div class="info">
    <div class="row"><span>Invoice:</span><span>${esc(sale.invoiceNumber)}</span></div>
    <div class="row"><span>Date:</span><span>${formatDateTime(sale.createdAt)}</span></div>
    <div class="row"><span>Customer:</span><span>${esc(sale.customerName || 'Walk-in Customer')}</span></div>
    ${
      sale.customerPhone
        ? `<div class="row"><span>Phone:</span><span>${esc(sale.customerPhone)}</span></div>`
        : ''
    }
    <div class="row"><span>Payment:</span><span>${esc(sale.paymentMethod)}</span></div>
  </div>

  <div class="hr"></div>

  ${itemsHtml}

  <div class="hr"></div>

  <div class="row"><span>Subtotal:</span><span>Rs.${money(sale.subtotal)}</span></div>
  ${
    totalDiscount > 0
      ? `<div class="row"><span>Discount:</span><span>-Rs.${money(totalDiscount)}</span></div>`
      : ''
  }
  ${
    sale.taxAmount > 0
      ? `<div class="row"><span>Tax:</span><span>+Rs.${money(sale.taxAmount)}</span></div>`
      : ''
  }
  <div class="row total"><span>TOTAL:</span><span>Rs.${money(sale.totalAmount)}</span></div>

  ${
    sale.paymentMethod === 'Cash'
      ? `
    <div class="row"><span>Paid:</span><span>Rs.${money(sale.paidAmount || sale.totalAmount)}</span></div>
    ${
      (sale.changeReturn || 0) > 0
        ? `<div class="row"><span>Change:</span><span>Rs.${money(sale.changeReturn)}</span></div>`
        : ''
    }`
      : ''
  }

  ${
    sale.paymentMethod === 'UPI'
      ? `
    <div class="qr">
      <p>SCAN &amp; PAY Rs.${upiAmount}</p>
      <img src="${qrUrl}" alt="UPI QR" />
      <p class="small">UPI: ${UPI.id}</p>
      <p class="small">${UPI.name}</p>
    </div>`
      : ''
  }

  <div class="footer">
    <div class="hr"></div>
    <p><strong>Thank you for shopping!</strong></p>
    <p class="small">Visit again</p>
    ${hasManual ? '<p class="small">* Custom item</p>' : ''}
  </div>

  <script>
    window.onload = function () {
      window.print();
      setTimeout(function () { window.close(); }, 500);
    };
  </script>
</body>
</html>`);
  win.document.close();
};