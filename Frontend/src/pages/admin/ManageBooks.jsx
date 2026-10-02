import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCloudUploadAlt,
  FaSearch,
} from 'react-icons/fa';
import api from '../../services/api';

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

  // ===== Fetch Books =====
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

  // ===== Image Upload =====
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
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

    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!form.author.trim()) {
      setFormError('Author is required');
      return;
    }
    if (!form.description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFormError('Valid price is required');
      return;
    }
    if (!form.image) {
      setFormError('Book image is required');
      return;
    }

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600 }}>
        Loading books...
      </div>
    );
  }

  return (
    <div className="mb-wrapper">
      {/* ===== Header ===== */}
      <div className="mb-header">
        <h1 className="mb-title">Manage Books ({books.length})</h1>
        <button onClick={handleAddClick} className="mb-add-btn">
          <FaPlus /> Add New Book
        </button>
      </div>

      {/* ===== Search ===== */}
      <div className="mb-search-wrap">
        <FaSearch className="mb-search-icon" />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-search"
        />
      </div>

      {error && <div className="mb-error">⚠️ {error}</div>}

      {/* ===== Content ===== */}
      <div className="mb-table-wrap">
        {filteredBooks.length === 0 ? (
          <div className="mb-empty">
            {search ? 'No books match your search.' : '📚 No books added yet.'}
          </div>
        ) : (
          <>
            {/* ===== Desktop: Table ===== */}
            <div className="mb-table-desktop">
              <table className="mb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((b, i) => (
                    <tr key={b._id}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          src={b.image}
                          alt={b.title}
                          className="mb-thumb"
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/45x60?text=Book';
                          }}
                        />
                      </td>
                      <td className="mb-cell-title">
                        {b.title}
                        {b.isBestSeller && (
                          <span className="mb-badge-best">BEST</span>
                        )}
                      </td>
                      <td>{b.author}</td>
                      <td>
                        <span className="mb-badge-cat">{b.category}</span>
                      </td>
                      <td className="mb-price">₹{b.price}</td>
                      <td>
                        <span
                          className={`mb-stock ${
                            b.stock > 10
                              ? 'in'
                              : b.stock > 0
                              ? 'low'
                              : 'out'
                          }`}
                        >
                          {b.stock}
                        </span>
                      </td>
                      <td>⭐ {b.rating?.toFixed(1) || '0.0'}</td>
                      <td>
                        <div className="mb-actions">
                          <button
                            onClick={() => handleEditClick(b)}
                            className="mb-btn-edit"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="mb-btn-delete"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== Mobile: Cards ===== */}
            <div className="mb-cards-mobile">
              {filteredBooks.map((b, i) => (
                <div key={b._id} className="mb-card">
                  <div className="mb-card-top">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="mb-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/60x80?text=Book';
                      }}
                    />
                    <div className="mb-card-info">
                      <h3 className="mb-card-title">
                        {b.title}
                        {b.isBestSeller && (
                          <span className="mb-badge-best">BEST</span>
                        )}
                      </h3>
                      <p className="mb-card-author">{b.author}</p>
                      <div className="mb-card-tags">
                        <span className="mb-badge-cat">{b.category}</span>
                        <span
                          className={`mb-stock ${
                            b.stock > 10
                              ? 'in'
                              : b.stock > 0
                              ? 'low'
                              : 'out'
                          }`}
                        >
                          Stock: {b.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-card-meta">
                    <div className="mb-card-meta-item">
                      <span className="mb-card-meta-label">Price</span>
                      <span className="mb-card-meta-value price">
                        ₹{b.price}
                      </span>
                    </div>
                    <div className="mb-card-meta-item">
                      <span className="mb-card-meta-label">Rating</span>
                      <span className="mb-card-meta-value">
                        ⭐ {b.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-card-actions">
                    <button
                      onClick={() => handleEditClick(b)}
                      className="mb-btn-edit"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="mb-btn-delete"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== Modal ===== */}
      {showModal && (
        <div className="mb-modal-overlay" onClick={closeModal}>
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h2 className="mb-modal-title">
                {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <button onClick={closeModal} className="mb-modal-close">
                <FaTimes />
              </button>
            </div>

            {formError && <div className="mb-form-error">⚠️ {formError}</div>}

            <form onSubmit={handleSubmit} className="mb-form">
              <div className="mb-form-group">
                <label className="mb-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Atomic Habits"
                  className="mb-input"
                  required
                />
              </div>

              <div className="mb-form-group">
                <label className="mb-label">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="e.g., James Clear"
                  className="mb-input"
                  required
                />
              </div>

              <div className="mb-form-group">
                <label className="mb-label">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows="3"
                  className="mb-textarea"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-form-group">
                <label className="mb-label">Book Image *</label>

                {!form.image ? (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`mb-upload-box ${uploading ? 'uploading' : ''}`}
                  >
                    {uploading ? (
                      <div>
                        <FaCloudUploadAlt className="mb-upload-icon uploading-icon" />
                        <p className="mb-upload-text">
                          Uploading... {uploadProgress}%
                        </p>
                        <div className="mb-progress-bar">
                          <div
                            className="mb-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="mb-upload-icon" />
                        <p className="mb-upload-text">Click to upload image</p>
                        <p className="mb-upload-hint">
                          JPG, PNG, WEBP • Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mb-image-preview">
                    <img src={form.image} alt="Uploaded" />
                    <div className="mb-image-info">
                      <p className="mb-image-success">✅ Image uploaded</p>
                      <div className="mb-image-actions">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mb-btn-change"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mb-btn-remove"
                        >
                          Remove
                        </button>
                      </div>
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
              <div className="mb-form-row">
                <div className="mb-form-group">
                  <label className="mb-label">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mb-input"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-form-group">
                  <label className="mb-label">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    placeholder="English"
                    className="mb-input"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="mb-form-row">
                <div className="mb-form-group">
                  <label className="mb-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="399"
                    min="0"
                    step="0.01"
                    className="mb-input"
                    required
                  />
                </div>
                <div className="mb-form-group">
                  <label className="mb-label">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="599"
                    min="0"
                    className="mb-input"
                  />
                </div>
              </div>

              {/* Stock + Pages */}
              <div className="mb-form-row">
                <div className="mb-form-group">
                  <label className="mb-label">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    className="mb-input"
                    required
                  />
                </div>
                <div className="mb-form-group">
                  <label className="mb-label">Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={form.pages}
                    onChange={handleChange}
                    placeholder="320"
                    min="0"
                    className="mb-input"
                  />
                </div>
              </div>

              {/* Rating + Reviews */}
              <div className="mb-form-row">
                <div className="mb-form-group">
                  <label className="mb-label">⭐ Rating (0-5) *</label>
                  <input
                    type="number"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                    className="mb-input"
                    required
                  />
                </div>
                <div className="mb-form-group">
                  <label className="mb-label">Reviews Count</label>
                  <input
                    type="number"
                    name="numReviews"
                    value={form.numReviews}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="mb-input"
                  />
                </div>
              </div>

              <div className="mb-form-group">
                <label className="mb-label">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="e.g., Penguin"
                  className="mb-input"
                />
              </div>

              {/* Checkboxes */}
              <div className="mb-checkbox-row">
                <label className="mb-checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  ⭐ Featured
                </label>
                <label className="mb-checkbox-label">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller}
                    onChange={handleChange}
                  />
                  🔥 Best Seller
                </label>
              </div>

              {/* Submit */}
              <div className="mb-form-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="mb-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="mb-btn-save"
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

      {/* ============================================================
          CSS
          ============================================================ */}
      <style>{`
        /* ================= WRAPPER ================= */
        .mb-wrapper {
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        /* ================= HEADER ================= */
        .mb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .mb-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 24px;
          margin: 0;
        }

        .mb-add-btn {
          background: #f57c00;
          color: #fff;
          border: none;
          padding: 11px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .mb-add-btn:hover {
          background: #ef6c00;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 124, 0, 0.35);
        }

        /* ================= SEARCH ================= */
        .mb-search-wrap {
          position: relative;
          max-width: 400px;
          margin-bottom: 20px;
        }

        .mb-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 13px;
          pointer-events: none;
        }

        .mb-search {
          width: 100%;
          padding: 11px 14px 11px 38px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          font-family: inherit;
          background: #fff;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .mb-search:focus {
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.08);
        }

        .mb-error {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 13px;
        }

        /* ================= TABLE WRAPPER ================= */
        .mb-table-wrap {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .mb-empty {
          padding: 50px 20px;
          text-align: center;
          color: #666;
          font-weight: 500;
        }

        /* ================= DESKTOP TABLE ================= */
        .mb-table-desktop {
          display: block;
          overflow-x: auto;
        }

        .mb-table {
          width: 100%;
          border-collapse: collapse;
        }

        .mb-table thead tr {
          background: #f5f5f5;
        }

        .mb-table th {
          padding: 14px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: #1a237e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .mb-table td {
          padding: 14px 16px;
          font-size: 13.5px;
          font-weight: 500;
          color: #333;
          vertical-align: middle;
          border-bottom: 1px solid #f0f0f0;
        }

        .mb-table tbody tr:hover {
          background: #fafafa;
        }

        .mb-thumb {
          width: 45px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
        }

        .mb-cell-title {
          font-weight: 700;
          color: #1a237e;
        }

        .mb-price {
          font-weight: 700;
          color: #f57c00;
        }

        .mb-badge-best {
          margin-left: 8px;
          background: #fff3e0;
          color: #f57c00;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .mb-badge-cat {
          background: #e8eaf6;
          color: #1a237e;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
        }

        .mb-stock {
          font-weight: 800;
          font-size: 13px;
        }

        .mb-stock.in { color: #2e7d32; }
        .mb-stock.low { color: #f57c00; }
        .mb-stock.out { color: #c62828; }

        .mb-actions {
          display: flex;
          gap: 8px;
        }

        .mb-btn-edit,
        .mb-btn-delete {
          border: none;
          padding: 7px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: inherit;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .mb-btn-edit {
          background: #e3f2fd;
          color: #1976d2;
        }

        .mb-btn-edit:hover {
          background: #1976d2;
          color: #fff;
        }

        .mb-btn-delete {
          background: #ffebee;
          color: #c62828;
        }

        .mb-btn-delete:hover {
          background: #c62828;
          color: #fff;
        }

        /* ================= MOBILE CARDS ================= */
        .mb-cards-mobile {
          display: none;
        }

        .mb-card {
          background: #fff;
          padding: 14px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s;
        }

        .mb-card:last-child {
          border-bottom: none;
        }

        .mb-card:hover {
          background: #fafafa;
        }

        .mb-card-top {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .mb-card-img {
          width: 60px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
          box-shadow: 2px 4px 10px rgba(26, 35, 126, 0.15);
        }

        .mb-card-info {
          flex: 1;
          min-width: 0;
        }

        .mb-card-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #1a237e;
          margin: 0 0 4px 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .mb-card-author {
          font-size: 12.5px;
          color: #666;
          font-weight: 500;
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mb-card-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .mb-card-tags .mb-badge-cat {
          font-size: 10.5px;
          padding: 2px 8px;
        }

        .mb-card-tags .mb-stock {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          background: #f5f5f5;
        }

        .mb-card-tags .mb-stock.in { background: #e8f5e9; }
        .mb-card-tags .mb-stock.low { background: #fff3e0; }
        .mb-card-tags .mb-stock.out { background: #ffebee; }

        .mb-card-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 10px 0;
          border-top: 1px solid #f5f5f5;
          border-bottom: 1px solid #f5f5f5;
          margin-bottom: 12px;
        }

        .mb-card-meta-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mb-card-meta-label {
          font-size: 10px;
          font-weight: 800;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .mb-card-meta-value {
          font-size: 14px;
          font-weight: 800;
          color: #1a237e;
        }

        .mb-card-meta-value.price {
          color: #f57c00;
          font-size: 16px;
        }

        .mb-card-actions {
          display: flex;
          gap: 8px;
        }

        .mb-card-actions .mb-btn-edit,
        .mb-card-actions .mb-btn-delete {
          flex: 1;
          justify-content: center;
          padding: 10px;
          font-size: 13px;
        }

        /* ================= MODAL ================= */
        .mb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          overflow-y: auto;
        }

        .mb-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          max-height: 92vh;
          overflow-y: auto;
          padding: 26px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          animation: mbModalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes mbModalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mb-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          gap: 10px;
        }

        .mb-modal-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 20px;
          margin: 0;
        }

        .mb-modal-close {
          background: #f5f5f5;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 15px;
          color: #666;
          transition: all 0.2s;
        }

        .mb-modal-close:hover {
          background: #ffebee;
          color: #c62828;
        }

        .mb-form-error {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-weight: 600;
          font-size: 13px;
          white-space: pre-line;
          border-left: 4px solid #c62828;
        }

        .mb-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .mb-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .mb-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .mb-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #1a237e;
          letter-spacing: 0.3px;
        }

        .mb-input,
        .mb-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          background: #fff;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .mb-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .mb-input:focus,
        .mb-textarea:focus {
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.08);
        }

        /* ================= IMAGE UPLOAD ================= */
        .mb-upload-box {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          background: #fafafa;
          transition: all 0.25s ease;
        }

        .mb-upload-box:hover:not(.uploading) {
          border-color: #1a237e;
          background: #f5f6fb;
        }

        .mb-upload-box.uploading {
          cursor: not-allowed;
          background: #f9f9f9;
        }

        .mb-upload-icon {
          font-size: 36px;
          color: #1a237e;
          margin-bottom: 10px;
        }

        .mb-upload-icon.uploading-icon {
          color: #f57c00;
          font-size: 30px;
        }

        .mb-upload-text {
          color: #1a237e;
          font-weight: 700;
          margin: 0 0 6px 0;
          font-size: 14px;
        }

        .mb-upload-hint {
          color: #999;
          font-size: 11.5px;
          font-weight: 500;
          margin: 0;
        }

        .mb-progress-bar {
          background: #e0e0e0;
          border-radius: 10px;
          height: 6px;
          overflow: hidden;
          max-width: 260px;
          margin: 8px auto 0;
        }

        .mb-progress-fill {
          background: #f57c00;
          height: 100%;
          transition: width 0.3s ease;
        }

        /* ================= IMAGE PREVIEW ================= */
        .mb-image-preview {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px;
          background: #f5f5f5;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .mb-image-preview img {
          width: 70px;
          height: 95px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .mb-image-info {
          flex: 1;
          min-width: 0;
        }

        .mb-image-success {
          color: #2e7d32;
          font-weight: 700;
          margin: 0 0 8px 0;
          font-size: 13px;
        }

        .mb-image-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mb-btn-change,
        .mb-btn-remove {
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 11.5px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .mb-btn-change {
          background: #e3f2fd;
          color: #1976d2;
        }

        .mb-btn-change:hover {
          background: #1976d2;
          color: #fff;
        }

        .mb-btn-remove {
          background: #ffebee;
          color: #c62828;
        }

        .mb-btn-remove:hover {
          background: #c62828;
          color: #fff;
        }

        /* ================= CHECKBOXES ================= */
        .mb-checkbox-row {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          padding: 4px 0;
        }

        .mb-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          color: #333;
        }

        .mb-checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #1a237e;
        }

        /* ================= FORM FOOTER ================= */
        .mb-form-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .mb-btn-cancel,
        .mb-btn-save {
          padding: 12px 22px;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s;
        }

        .mb-btn-cancel {
          background: #f5f5f5;
          color: #666;
        }

        .mb-btn-cancel:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .mb-btn-save {
          background: #1a237e;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mb-btn-save:hover:not(:disabled) {
          background: #f57c00;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 124, 0, 0.3);
        }

        .mb-btn-cancel:disabled,
        .mb-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 1024px) {
          .mb-wrapper {
            padding: 20px;
          }
          .mb-title {
            font-size: 22px;
          }
        }

        @media (max-width: 768px) {
          .mb-wrapper {
            padding: 16px;
          }

          .mb-title {
            font-size: 20px;
          }

          .mb-add-btn {
            padding: 10px 16px;
            font-size: 13px;
          }

          .mb-search-wrap {
            max-width: 100%;
          }

          /* ✅ Hide desktop table, show mobile cards */
          .mb-table-desktop {
            display: none;
          }

          .mb-cards-mobile {
            display: block;
          }

          /* Modal adjustments */
          .mb-modal {
            padding: 20px;
            border-radius: 14px;
            max-height: 94vh;
          }

          .mb-modal-title {
            font-size: 17px;
          }

          .mb-form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .mb-form-footer {
            flex-direction: column-reverse;
            gap: 10px;
          }

          .mb-btn-cancel,
          .mb-btn-save {
            width: 100%;
            justify-content: center;
            padding: 13px;
          }

          .mb-upload-box {
            padding: 26px 16px;
          }

          .mb-upload-icon {
            font-size: 30px;
          }

          .mb-image-preview {
            padding: 12px;
            gap: 12px;
          }

          .mb-image-preview img {
            width: 60px;
            height: 82px;
          }
        }

        @media (max-width: 480px) {
          .mb-wrapper {
            padding: 12px;
          }

          .mb-title {
            font-size: 18px;
          }

          .mb-card {
            padding: 12px;
          }

          .mb-card-img {
            width: 55px;
            height: 74px;
          }

          .mb-card-title {
            font-size: 13.5px;
          }

          .mb-modal {
            padding: 16px;
            border-radius: 12px;
          }

          .mb-modal-header {
            margin-bottom: 18px;
          }

          .mb-modal-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageBooks;