import Book from '../models/Book.js';

// ===== GET ALL BOOKS =====
export const getBooks = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { author: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const minPrice = req.query.minPrice
      ? { price: { $gte: Number(req.query.minPrice) } }
      : {};
    const maxPrice = req.query.maxPrice
      ? { price: { $lte: Number(req.query.maxPrice) } }
      : {};

    const filter = { ...keyword, ...category, ...minPrice, ...maxPrice };

    let sort = { createdAt: -1 };
    if (req.query.sort === 'price-asc') sort = { price: 1 };
    if (req.query.sort === 'price-desc') sort = { price: -1 };
    if (req.query.sort === 'rating') sort = { rating: -1 };
    if (req.query.sort === 'popular') sort = { numReviews: -1 };

    const count = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      books,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('❌ getBooks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET SINGLE BOOK =====
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let book;
    if (isObjectId) {
      book = await Book.findById(id);
    } else {
      book = await Book.findOne({ slug: id.toLowerCase() });
    }

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const related = await Book.find({
      category: book.category,
      _id: { $ne: book._id },
    }).limit(4);

    res.json({ book, related });
  } catch (error) {
    console.error('❌ getBookById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET BEST SELLERS =====
export const getBestSellers = async (req, res) => {
  try {
    const books = await Book.find({ isBestSeller: true }).limit(8);
    res.json(books);
  } catch (error) {
    console.error('❌ getBestSellers error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET CATEGORIES =====
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('❌ getCategories error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET SUGGESTIONS =====
export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ books: [], categories: [] });
    }

    const query = q.trim();

    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
      ],
    })
      .select('title author image slug price category rating stock')
      .limit(5);

    const categories = await Book.distinct('category', {
      category: { $regex: query, $options: 'i' },
    });

    res.json({
      books,
      categories: categories.slice(0, 4),
    });
  } catch (error) {
    console.error('❌ getSuggestions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== CREATE BOOK (✅ FIXED) =====
export const createBook = async (req, res) => {
  try {
    console.log('📥 Create book request received');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    const {
      title,
      author,
      description,
      price,
      originalPrice,
      discount,
      category,
      image,
      imagePublicId,
      stock,
      pages,
      language,
      publisher,
      rating,
      numReviews,
      isFeatured,
      isBestSeller,
    } = req.body;

    // ===== Manual Validation =====
    const errors = [];

    if (!title || !title.trim()) errors.push('Title is required');
    if (!author || !author.trim()) errors.push('Author is required');
    if (!description || !description.trim())
      errors.push('Description is required');
    if (price === undefined || price === null || Number(price) <= 0)
      errors.push('Valid price is required');
    if (!category) errors.push('Category is required');
    if (!image || !image.trim()) errors.push('Image is required');

    const validCategories = [
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
    ];

    if (category && !validCategories.includes(category)) {
      errors.push(`Category "${category}" is not valid.`);
    }

    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        message: errors.join(', '),
        errors,
      });
    }

    // ===== Prepare book data (with type conversion) =====
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      discount: Number(discount) || 0,
      category,
      image: image.trim(),
      imagePublicId: imagePublicId || '',
      stock: Number(stock) || 10,
      pages: Number(pages) || 0,
      language: language || 'English',
      publisher: publisher ? publisher.trim() : '',
      rating: Number(rating) || 4.5,
      numReviews: Number(numReviews) || 0,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
    };

    console.log('✅ Prepared book data:', JSON.stringify(bookData, null, 2));

    // ===== Create book =====
    const book = await Book.create(bookData);

    console.log('✅ Book created successfully:', book._id);
    res.status(201).json(book);
  } catch (error) {
    console.error('❌ Create book error:', error);

    if (error.name === 'ValidationError') {
      const fieldErrors = Object.keys(error.errors).map(
        (key) => `${key}: ${error.errors[key].message}`
      );
      return res.status(400).json({
        message: 'Validation failed',
        errors: fieldErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Book with this slug already exists',
      });
    }

    res.status(400).json({ message: error.message });
  }
};

// ===== UPDATE BOOK =====
export const updateBook = async (req, res) => {
  try {
    console.log('📥 Update book request:', req.params.id);
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // ===== Type conversion + safe update =====
    const updateData = { ...req.body };

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined)
      updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.discount !== undefined)
      updateData.discount = Number(updateData.discount);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.pages !== undefined) updateData.pages = Number(updateData.pages);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.numReviews !== undefined)
      updateData.numReviews = Number(updateData.numReviews);
    if (updateData.isFeatured !== undefined)
      updateData.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.isBestSeller !== undefined)
      updateData.isBestSeller = Boolean(updateData.isBestSeller);

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        book[key] = updateData[key];
      }
    });

    const updatedBook = await book.save();

    console.log('✅ Book updated:', updatedBook._id);
    res.json(updatedBook);
  } catch (error) {
    console.error('❌ Update book error:', error);

    if (error.name === 'ValidationError') {
      const fieldErrors = Object.keys(error.errors).map(
        (key) => `${key}: ${error.errors[key].message}`
      );
      return res.status(400).json({
        message: 'Validation failed',
        errors: fieldErrors,
      });
    }

    res.status(400).json({ message: error.message });
  }
};

// ===== DELETE BOOK =====
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book removed' });
  } catch (error) {
    console.error('❌ deleteBook error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ADD REVIEW =====
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: 'Book not found' });

    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Book already reviewed' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    book.reviews.push(review);
    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length;

    await book.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error('❌ addReview error:', error);
    res.status(500).json({ message: error.message });
  }
};