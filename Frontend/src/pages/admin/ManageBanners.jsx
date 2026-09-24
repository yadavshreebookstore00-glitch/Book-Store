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
  subtitle: '',
  image: '',
  imagePublicId: '',
  link: '/shop',
  buttonText: 'Shop Now',
  placement: 'home',
  order: 0,
  isActive: true,
};

const placementOptions = [
  { value: 'home', label: '🏠 Home Page' },
  { value: 'shop', label: '🛍️ Shop Page' },
  { value: 'categories', label: '📚 Categories Page' },
  { value: 'all', label: '🌐 All Pages' },
];

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ===== Fetch Banners =====
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/banners/all');
      setBanners(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ===== Open Add Modal =====
  const handleAddClick = () => {
    setEditingBanner(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  // ===== Open Edit Modal =====
  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      imagePublicId: banner.imagePublicId || '',
      link: banner.link || '/shop',
      buttonText: banner.buttonText || 'Shop Now',
      placement: banner.placement || 'home',
      order: banner.order || 0,
      isActive: banner.isActive !== false,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
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
    setSaving(true);

    try {
      if (!form.image) {
        setFormError('Banner image zaroori hai!');
        setSaving(false);
        return;
      }

      if (!form.placement) {
        setFormError('Placement select karo!');
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        order: Number(form.order) || 0,
      };

      if (editingBanner) {
        const { data } = await api.put(
          `/banners/${editingBanner._id}`,
          payload
        );
        setBanners(
          banners.map((b) => (b._id === editingBanner._id ? data : b))
        );
      } else {
        const { data } = await api.post('/banners', payload);
        setBanners([data, ...banners]);
      }

      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      setBanners(banners.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // ===== Toggle Active =====
  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/banners/${id}/toggle`);
      setBanners(banners.map((b) => (b._id === id ? data : b)));
    } catch (err) {
      alert(err.response?.data?.message || 'Toggle failed');
    }
  };

  // ===== Placement Badge Helper =====
  const getPlacementBadge = (placement) => {
    const badges = {
      home: { label: '🏠 Home', bg: '#1a237e' },
      shop: { label: '🛍️ Shop', bg: '#f57c00' },
      categories: { label: '📚 Categories', bg: '#2e7d32' },
      all: { label: '🌐 All Pages', bg: '#6a1b9a' },
    };
    return badges[placement] || badges.home;
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600 }}>
        Loading banners...
      </div>
    );
  }

  return (
    <div>
      {/* ===== Header ===== */}
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
        <h1
          style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '26px',
            margin: 0,
          }}
        >
          Manage Banners ({banners.length})
        </h1>
        <button onClick={handleAddClick} style={addBtnStyle}>
          <FaPlus /> Add New Banner
        </button>
      </div>

      {error && <div style={errorStyle}>⚠️ {error}</div>}

      {/* ===== Banners Grid ===== */}
      {banners.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '60px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#666',
            fontWeight: 500,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          🖼️ No banners yet. Click "Add New Banner" to create your first
          banner.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {banners.map((banner) => {
            const badge = getPlacementBadge(banner.placement);
            return (
              <div
                key={banner._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  opacity: banner.isActive ? 1 : 0.6,
                  border: banner.isActive
                    ? '2px solid #2e7d32'
                    : '2px solid #ddd',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: 'relative',
                    height: '160px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Placement Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: badge.bg,
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {badge.label}
                  </span>

                  {/* Active Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: banner.isActive ? '#2e7d32' : '#999',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {banner.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '18px' }}>
                  <h3
                    style={{
                      color: '#1a237e',
                      fontWeight: 700,
                      fontSize: '16px',
                      marginBottom: '5px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {banner.title || '(No title)'}
                  </h3>
                  <p
                    style={{
                      color: '#666',
                      fontSize: '13px',
                      fontWeight: 500,
                      marginBottom: '15px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {banner.subtitle || '(No subtitle)'}
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => handleToggle(banner._id)}
                      style={toggleBtnStyle}
                    >
                      {banner.isActive ? (
                        <>
                          <FaEyeSlash /> Hide
                        </>
                      ) : (
                        <>
                          <FaEye /> Show
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditClick(banner)}
                      style={editBtnStyle}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      style={deleteBtnStyle}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Modal ===== */}
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
              <h2
                style={{
                  color: '#1a237e',
                  fontWeight: 800,
                  fontSize: '22px',
                  margin: 0,
                }}
              >
                {editingBanner ? '✏️ Edit Banner' : '➕ Add New Banner'}
              </h2>
              <button onClick={closeModal} style={closeBtnStyle}>
                <FaTimes />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  ...errorStyle,
                  marginBottom: '15px',
                  fontSize: '13px',
                }}
              >
                ⚠️ {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {/* Title */}
              <div>
                <label style={labelStyle}>Banner Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Discover Your Next Favorite Book"
                  style={inputStyle}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="e.g., Thousands of books. Endless possibilities."
                  style={inputStyle}
                />
              </div>

              {/* ===== Placement Dropdown ===== */}
              <div>
                <label style={labelStyle}>📍 Banner Placement *</label>
                <select
                  name="placement"
                  value={form.placement}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                >
                  {placementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    fontWeight: 500,
                    marginTop: '6px',
                  }}
                >
                  {form.placement === 'home' &&
                    'Ye banner sirf Home page pe dikhega'}
                  {form.placement === 'shop' &&
                    'Ye banner sirf Shop page pe dikhega'}
                  {form.placement === 'categories' &&
                    'Ye banner sirf Categories page pe dikhega'}
                  {form.placement === 'all' &&
                    'Ye banner har page pe dikhega (Home, Shop, Categories)'}
                </p>
              </div>

              {/* ===== Image Upload ===== */}
              <div>
                <label style={labelStyle}>
                  Banner Image * (Recommended: 1200x480)
                </label>

                {!form.image ? (
                  <div
                    onClick={() =>
                      !uploading && fileInputRef.current?.click()
                    }
                    style={{
                      border: '2px dashed #ddd',
                      borderRadius: '10px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      background: uploading ? '#f9f9f9' : '#fafafa',
                      transition: 'all 0.3s',
                    }}
                  >
                    {uploading ? (
                      <div>
                        <div
                          style={{
                            fontSize: '30px',
                            color: '#f57c00',
                            marginBottom: '10px',
                          }}
                        >
                          <FaCloudUploadAlt />
                        </div>
                        <p
                          style={{
                            color: '#1a237e',
                            fontWeight: 700,
                            marginBottom: '10px',
                          }}
                        >
                          Uploading... {uploadProgress}%
                        </p>
                        <div
                          style={{
                            background: '#e0e0e0',
                            borderRadius: '10px',
                            height: '6px',
                            overflow: 'hidden',
                            maxWidth: '300px',
                            margin: '0 auto',
                          }}
                        >
                          <div
                            style={{
                              background: '#f57c00',
                              height: '100%',
                              width: `${uploadProgress}%`,
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: '40px',
                            color: '#1a237e',
                            marginBottom: '10px',
                          }}
                        >
                          <FaCloudUploadAlt />
                        </div>
                        <p
                          style={{
                            color: '#1a237e',
                            fontWeight: 700,
                            marginBottom: '5px',
                            fontSize: '15px',
                          }}
                        >
                          Click to upload banner image
                        </p>
                        <p
                          style={{
                            color: '#999',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          JPG, PNG, WEBP • Max 5MB • 1200x480 recommended
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '2px solid #e0e0e0',
                    }}
                  >
                    <img
                      src={form.image}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: '#1976d2',
                          color: '#fff',
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
                          background: '#c62828',
                          color: '#fff',
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
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Link + Button Text */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}
              >
                <div>
                  <label style={labelStyle}>Link (Where to go on click)</label>
                  <input
                    type="text"
                    name="link"
                    value={form.link}
                    onChange={handleChange}
                    placeholder="/shop"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={form.buttonText}
                    onChange={handleChange}
                    placeholder="Shop Now"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Order + Active */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Display Order (Lower = First)
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    style={inputStyle}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '22px',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                    ✅ Active (Show on site)
                  </label>
                </div>
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
                    : editingBanner
                    ? 'Update Banner'
                    : 'Add Banner'}
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

const errorStyle = {
  background: '#ffebee',
  color: '#c62828',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '15px',
  fontWeight: 600,
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

const toggleBtnStyle = {
  background: '#f5f5f5',
  color: '#666',
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

export default ManageBanners;