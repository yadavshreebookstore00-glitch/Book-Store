import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [saleItemSchema],
    customerName: {
      type: String,
      default: 'Walk-in Customer',
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    subtotal: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    changeReturn: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Others'],
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial'],
      default: 'Paid',
    },
    notes: { type: String, default: '' },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ invoiceNumber: 1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;