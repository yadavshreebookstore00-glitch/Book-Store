import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        'Fiction',
        'Non-Fiction',
        'Self Help',
        'Academic',
        'Children',
        'Biography',
        'Business',
        'Comics',
        'Romance',
        'Mystery',
      ],
    },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    images: [String],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    stock: { type: Number, required: true, default: 10 },
    language: { type: String, default: 'English' },
    pages: { type: Number, default: 0 },
    publisher: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ===== Slug Generator =====
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ===== Pre-save hook (Mongoose 8 style - no next) =====
bookSchema.pre('save', async function () {
  if (this.slug && !this.isModified('title')) return;
  if (!this.title) return;

  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await mongoose.models.Book.findOne({
      slug,
      _id: { $ne: this._id },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
});

bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;