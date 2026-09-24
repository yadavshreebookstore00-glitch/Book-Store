import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '/shop',
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
    },
    // ✅ NEW: Where to display this banner
    placement: {
      type: String,
      enum: ['home', 'shop', 'categories', 'all'],
      default: 'home',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;