import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCloudUploadAlt,
  FaSearch,
  FaBook,
} from 'react-icons/fa';
import api from '../../services/api';
import styles from './ManageBooks.module.css';

const emptyForm = {
  title: '',
  author: '',
  description: '',
  price: '',
  originalPrice: '',
  discount: 0,
  category: 'Fiction',
  image: '',
  imagePublicId: '',
  stock: 10,
  pages: 0,
  language: 'English',
  publisher: '',
  rating: 4.5,
  numReviews: 0,
  isFeatured: false,
  isBestSeller: false,
};

const categories = [
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

// ===== Highlight helper =====
const Highlight = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const q = query.toLowerCase();
  const t = String(text);
  const idx = t.toLowerCase().indexOf(q);
  if (idx === -1) return <>{t}</>;
  return (
    <>
      {t.slice(0, idx)}
      <span className={styles.highlight}>{t.slice(idx, idx + q.length)}</span>
      {t.slice(idx + q.length)}
    </>
  );
};

// ===== Stock helper =====
const getStockClass = (stock) => {
  if (stock > 10) return styles.stockIn;
  if (stock > 0) return styles.stockLow;
  return styles.stockOut;
};

// ===== Skeleton =====
const SkeletonTable = ({ rows = 6 }) => (
  <div className={styles.skeletonWrap}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={styles.skeletonRow}>
        <div className={styles.skThumb} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={`${styles.skLine} ${styles.skTitle}`} />
          <div className={`${styles.skLine} ${styles.skSub}`} />
        </div>
        <div className={`${styles.skLine} ${styles.skMeta}`} />
        <div className={`${styles.skLine} ${styles.skMeta}`} />
      </div>
    ))}
  </div>
);

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [search, setSearch] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const scrollYRef = useRef(0);

  // ===== Fetch =====
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/books?page=1');
      setBooks(data.books || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ===== iOS-safe scroll lock =====
  useEffect(() => {
    if (showModal) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
        scrollYRef.current = 0;
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // ===== ESC to close =====
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving && !uploading) closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, saving, uploading]);

  // ===== Add / Edit / Close =====
  const handleAddClick = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      price: book.price || '',
      originalPrice: book.originalPrice || '',
      discount: book.discount || 0,
      category: book.category || 'Fiction',
      image: book.image || '',
      imagePublicId: book.imagePublicId || '',
      stock: book.stock || 10,
      pages: book.pages || 0,
      language: book.language || 'English',
      publisher: book.publisher || '',
      rating: book.rating || 4.5,
      numReviews: book.numReviews || 0,
      isFeatured: book.isFeatured || false,
      isBestSeller: book.isBestSeller || false,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setShowModal(false);
    setEditingBook(null);
    setForm(emptyForm);
    setFormError('');
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ===== Upload =====
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be less than 5MB');
      return;
    }

    setFormError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(percent);
        },
      });

      setForm((prev) => ({
        ...prev,
        image: data.url,
        imagePublicId: data.public_id,
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setFormError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: '', imagePublicId: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) return setFormError('Title is required');
    if (!form.author.trim()) return setFormError('Author is required');
    if (!form.description.trim()) return setFormError('Description is required');
    if (!form.price || Number(form.price) <= 0)
      return setFormError('Valid price is required');
    if (!form.image) return setFormError('Book image is required');

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        discount: Number(form.discount) || 0,
        category: form.category,
        image: form.image,
        imagePublicId: form.imagePublicId || '',
        stock: Number(form.stock) || 10,
        pages: Number(form.pages) || 0,
        language: form.language || 'English',
        publisher: form.publisher.trim() || '',
        rating: Number(form.rating) || 4.5,
        numReviews: Number(form.numReviews) || 0,
        isFeatured: Boolean(form.isFeatured),
        isBestSeller: Boolean(form.isBestSeller),
      };

      if (editingBook) {
        const { data } = await api.put(`/books/${editingBook._id}`, payload);
        setBooks(books.map((b) => (b._id === editingBook._id ? data : b)));
      } else {
        const { data } = await api.post('/books', payload);
        setBooks([data, ...books]);
      }

      closeModal();
      fetchBooks();
    } catch (err) {
      console.error('Submit error:', err);
      const errData = err.response?.data;
      if (errData?.errors && Array.isArray(errData.errors)) {
        setFormError(errData.errors.join('\n'));
      } else {
        setFormError(errData?.message || 'Failed to save book');
      }
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // ===== Filtered (memoized) =====
  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [books, search]);

  return (
    <div className={styles.wrapper}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Manage Books
            <span className={styles.countPill}>{books.length}</span>
          </h1>
          <p className={styles.subtitle}>
            Add, edit and manage your book inventory
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleAddClick}>
          <FaPlus /> Add New Book
        </button>
      </div>

      {/* ===== Filters ===== */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            inputMode="search"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorBox}>⚠️ {error}</div>}

      {/* ===== Content ===== */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredBooks.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FaBook />
          </div>
          <p className={styles.emptyTitle}>
            {search ? 'No books found' : 'No books added yet'}
          </p>
          <p className={styles.emptyText}>
            {search
              ? `No results for "${search}"`
              : 'Add your first book to get started'}
          </p>
          {!search && (
            <button className={styles.addBtn} onClick={handleAddClick}>
              <FaPlus /> Add Book
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ===== DESKTOP TABLE ===== */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colIdx}>#</th>
                  <th className={styles.colImg}></th>
                  <th className={styles.colTitle}>Title</th>
                  <th className={styles.colAuthor}>Author</th>
                  <th className={styles.colCat}>Category</th>
                  <th className={styles.colPrice}>Price</th>
                  <th className={styles.colStock}>Stock</th>
                  <th className={styles.colRating}>Rating</th>
                  <th className={styles.colActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b, i) => (
                  <tr key={b._id}>
                    <td className={styles.colIdx}>{i + 1}</td>
                    <td className={styles.colImg}>
                      <img
                        src={b.image}
                        alt={b.title}
                        className={styles.thumb}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.visibility = 'hidden';
                        }}
                      />
                    </td>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.titleText}>
                          <Highlight text={b.title} query={search} />
                        </span>
                        {b.isBestSeller && (
                          <span className={styles.badgeBest}>Best</span>
                        )}
                        {b.isFeatured && (
                          <span className={styles.badgeFeatured}>Feat</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.authorCell}>
                        <Highlight text={b.author} query={search} />
                      </span>
                    </td>
                    <td>
                      <span className={styles.badgeCat}>{b.category}</span>
                    </td>
                    <td>
                      <span className={styles.price}>₹{b.price}</span>
                      {b.originalPrice > b.price && (
                        <span className={styles.priceStrike}>
                          ₹{b.originalPrice}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.stockPill} ${getStockClass(
                          b.stock
                        )}`}
                      >
                        {b.stock}
                      </span>
                    </td>
                    <td>
                      <span className={styles.rating}>
                        <span className={styles.ratingStar}>★</span>
                        {b.rating?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.iconBtn} ${styles.edit}`}
                          onClick={() => handleEditClick(b)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.delete}`}
                          onClick={() => handleDelete(b._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className={styles.cards}>
            {filteredBooks.map((b) => (
              <div key={b._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <img
                    src={b.image}
                    alt={b.title}
                    className={styles.cardImg}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.visibility = 'hidden';
                    }}
                  />
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>
                      <Highlight text={b.title} query={search} />
                    </h3>
                    <p className={styles.cardAuthor}>
                      by <Highlight text={b.author} query={search} />
                    </p>
                    <div className={styles.cardTags}>
                      <span className={styles.badgeCat}>{b.category}</span>
                      {b.isBestSeller && (
                        <span className={styles.badgeBest}>Best</span>
                      )}
                      {b.isFeatured && (
                        <span className={styles.badgeFeatured}>Feat</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.cardMetaLeft}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Price</span>
                      <span className={`${styles.metaValue} ${styles.price}`}>
                        ₹{b.price}
                        {b.originalPrice > b.price && (
                          <span className={styles.priceStrike}>
                            ₹{b.originalPrice}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Rating</span>
                      <span className={styles.metaValue}>
                        <span className={styles.ratingStar}>★</span>{' '}
                        {b.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardMetaRight}>
                    <span
                      className={`${styles.stockPill} ${getStockClass(
                        b.stock
                      )}`}
                    >
                      {b.stock} in stock
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.iconBtn} ${styles.edit}`}
                    onClick={() => handleEditClick(b)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.delete}`}
                    onClick={() => handleDelete(b._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={closeModal}
                disabled={saving || uploading}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className={styles.modalBody}>
                {formError && (
                  <div className={styles.formError}>⚠️ {formError}</div>
                )}

                {/* Title */}
                <div className={styles.field}>
                  <label className={styles.label}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Atomic Habits"
                    className={styles.input}
                    required
                  />
                </div>

                {/* Author */}
                <div className={styles.field}>
                  <label className={styles.label}>Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="e.g., James Clear"
                    className={styles.input}
                    required
                  />
                </div>

                {/* Description */}
                <div className={styles.field}>
                  <label className={styles.label}>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Short description..."
                    rows="3"
                    className={styles.textarea}
                    required
                  />
                </div>

                {/* Image */}
                <div className={styles.field}>
                  <label className={styles.label}>Book Image *</label>

                  {!form.image ? (
                    <div
                      className={`${styles.uploadBox} ${
                        uploading ? styles.uploadBoxDisabled : ''
                      }`}
                      onClick={() =>
                        !uploading && fileInputRef.current?.click()
                      }
                    >
                      {uploading ? (
                        <>
                          <FaCloudUploadAlt className={styles.uploadIcon} />
                          <p className={styles.uploadTitle}>
                            Uploading... {uploadProgress}%
                          </p>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <FaCloudUploadAlt className={styles.uploadIcon} />
                          <p className={styles.uploadTitle}>
                            Click to upload image
                          </p>
                          <p className={styles.uploadHint}>
                            JPG, PNG, WEBP • Max 5MB
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={styles.previewWrap}>
                      <img
                        src={form.image}
                        alt="Preview"
                        className={styles.previewImg}
                      />
                      <div className={styles.previewActions}>
                        <button
                          type="button"
                          className={`${styles.previewBtn} ${styles.change}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className={`${styles.previewBtn} ${styles.remove}`}
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Category + Language */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={styles.input}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Language</label>
                    <input
                      type="text"
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                      placeholder="English"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Selling Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="399"
                      min="0"
                      step="0.01"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Original Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={form.originalPrice}
                      onChange={handleChange}
                      placeholder="599"
                      min="0"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Stock + Pages */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="10"
                      min="0"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Pages</label>
                    <input
                      type="number"
                      name="pages"
                      value={form.pages}
                      onChange={handleChange}
                      placeholder="320"
                      min="0"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Rating + Reviews */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Rating (0-5) *</label>
                    <input
                      type="number"
                      name="rating"
                      value={form.rating}
                      onChange={handleChange}
                      placeholder="4.5"
                      min="0"
                      max="5"
                      step="0.1"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Reviews Count</label>
                    <input
                      type="number"
                      name="numReviews"
                      value={form.numReviews}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Publisher */}
                <div className={styles.field}>
                  <label className={styles.label}>Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    placeholder="e.g., Penguin"
                    className={styles.input}
                  />
                </div>

                {/* Checkboxes */}
                <div className={styles.checkRow}>
                  <label className={styles.checkItem}>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                    />
                    <span>⭐ Featured</span>
                  </label>
                  <label className={styles.checkItem}>
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={form.isBestSeller}
                      onChange={handleChange}
                    />
                    <span>🔥 Best Seller</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                  disabled={saving || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving || uploading}
                >
                  <FaSave />
                  {saving
                    ? 'Saving...'
                    : uploading
                    ? 'Uploading...'
                    : editingBook
                    ? 'Update Book'
                    : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;