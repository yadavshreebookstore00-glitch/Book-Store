import mongoose from 'mongoose';

const customItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      default: 'Custom',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Track how many times sold
    timesSold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

customItemSchema.index({ name: 'text' });

const CustomItem = mongoose.model('CustomItem', customItemSchema);
export default CustomItem;