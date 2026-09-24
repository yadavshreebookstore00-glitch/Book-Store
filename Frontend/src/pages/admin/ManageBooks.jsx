import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCloudUploadAlt,
  FaEye,
  FaEyeSlash,
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

  // ===== Submit (CREATE / UPDATE) =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
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
      // ✅ Clean payload with proper type conversion
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

      console.log('📤 Sending payload:', payload);

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
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: '26px', margin: 0 }}>
          Manage Books ({books.length})
        </h1>
        <button onClick={handleAddClick} style={addBtnStyle}>
          <FaPlus /> Add New Book
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 15px',
            border: '1.5px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            outline: 'none',
          }}
        />
      </div>

      {error && <div style={errorBoxStyle}>⚠️ {error}</div>}

      {/* Books Table */}
      <div style={tableWrapperStyle}>
        {filteredBooks.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#666', fontWeight: 500 }}>
            {search ? 'No books match your search.' : '📚 No books added yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Author</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Rating</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b, i) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <img
                        src={b.image}
                        alt={b.title}
                        style={{
                          width: '45px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/45x60?text=Book';
                        }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>
                      {b.title}
                      {b.isBestSeller && (
                        <span
                          style={{
                            marginLeft: '8px',
                            background: '#fff3e0',
                            color: '#f57c00',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{b.author}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: '#e8eaf6',
                          color: '#1a237e',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {b.category}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#f57c00' }}>
                      ₹{b.price}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color:
                            b.stock > 10 ? '#2e7d32' : b.stock > 0 ? '#f57c00' : '#c62828',
                          fontWeight: 700,
                        }}
                      >
                        {b.stock}
                      </span>
                    </td>
                    <td style={tdStyle}>⭐ {b.rating?.toFixed(1) || '0.0'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditClick(b)} style={editBtnStyle}>
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(b._id)} style={deleteBtnStyle}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
              }}
            >
              <h2 style={{ color: '#1a237e', fontWeight: 800, fontSize: '22px', margin: 0 }}>
                {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <button onClick={closeModal} style={closeBtnStyle}>
                <FaTimes />
              </button>
            </div>

            {formError && (
              <div style={{ ...errorBoxStyle, marginBottom: '15px', fontSize: '13px', whiteSpace: 'pre-line' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Atomic Habits"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="e.g., James Clear"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label style={labelStyle}>Book Image *</label>

                {!form.image ? (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={uploadBoxStyle(uploading)}
                  >
                    {uploading ? (
                      <div>
                        <FaCloudUploadAlt style={{ fontSize: '30px', color: '#f57c00', marginBottom: '10px' }} />
                        <p style={{ color: '#1a237e', fontWeight: 700, marginBottom: '10px' }}>
                          Uploading... {uploadProgress}%
                        </p>
                        <div style={progressBarStyle}>
                          <div style={{ ...progressFillStyle, width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt style={{ fontSize: '40px', color: '#1a237e', marginBottom: '10px' }} />
                        <p style={{ color: '#1a237e', fontWeight: 700, marginBottom: '5px', fontSize: '15px' }}>
                          Click to upload image
                        </p>
                        <p style={{ color: '#999', fontSize: '12px', fontWeight: 500 }}>
                          JPG, PNG, WEBP • Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center',
                      padding: '15px',
                      background: '#f5f5f5',
                      borderRadius: '10px',
                      border: '2px solid #e0e0e0',
                    }}
                  >
                    <img
                      src={form.image}
                      alt="Uploaded"
                      style={{
                        width: '80px',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '2px solid #fff',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#2e7d32', fontWeight: 700, marginBottom: '5px', fontSize: '14px' }}>
                        ✅ Image uploaded
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            background: '#ffebee',
                            color: '#c62828',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Language</label>
                  <input
                    type="text"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    placeholder="English"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="399"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="599"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Stock + Pages */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={form.pages}
                    onChange={handleChange}
                    placeholder="320"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Rating + Reviews */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>⭐ Rating (0-5) *</label>
                  <input
                    type="number"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Reviews Count</label>
                  <input
                    type="number"
                    name="numReviews"
                    value={form.numReviews}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="e.g., Penguin"
                  style={inputStyle}
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  ⭐ Featured
                </label>
                <label style={checkboxLabelStyle}>
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
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '10px',
                  paddingTop: '15px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  style={cancelBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    ...saveBtnStyle,
                    background: saving || uploading ? '#999' : '#1a237e',
                    cursor: saving || uploading ? 'not-allowed' : 'pointer',
                  }}
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

// ===== Styles =====
const thStyle = {
  padding: '15px 20px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a237e',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '15px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  verticalAlign: 'middle',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a237e',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
  overflow: 'auto',
};

const modalStyle = {
  background: '#fff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '30px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
};

const closeBtnStyle = {
  background: '#f5f5f5',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#666',
};

const editBtnStyle = {
  background: '#e3f2fd',
  color: '#1976d2',
  border: 'none',
  padding: '8px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

const deleteBtnStyle = {
  background: '#ffebee',
  color: '#c62828',
  border: 'none',
  padding: '8px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

const addBtnStyle = {
  background: '#f57c00',
  color: '#fff',
  border: 'none',
  padding: '12px 22px',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const cancelBtnStyle = {
  padding: '12px 24px',
  background: '#f5f5f5',
  color: '#666',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
};

const saveBtnStyle = {
  padding: '12px 24px',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
};

const errorBoxStyle = {
  background: '#ffebee',
  color: '#c62828',
  padding: '12px',
  borderRadius: '6px',
  fontWeight: 600,
};

const tableWrapperStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  overflow: 'hidden',
};

const uploadBoxStyle = (uploading) => ({
  border: '2px dashed #ddd',
  borderRadius: '10px',
  padding: '40px 20px',
  textAlign: 'center',
  cursor: uploading ? 'not-allowed' : 'pointer',
  background: uploading ? '#f9f9f9' : '#fafafa',
  transition: 'all 0.3s',
});

const progressBarStyle = {
  background: '#e0e0e0',
  borderRadius: '10px',
  height: '6px',
  overflow: 'hidden',
  maxWidth: '300px',
  margin: '0 auto',
};

const progressFillStyle = {
  background: '#f57c00',
  height: '100%',
  transition: 'width 0.3s',
};

export default ManageBooks;