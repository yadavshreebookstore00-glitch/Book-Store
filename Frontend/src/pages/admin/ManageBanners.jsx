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
  FaImage,
  FaLink,
} from 'react-icons/fa';
import api from '../../services/api';
import styles from './ManageBanners.module.css';

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

const getPlacementBadge = (placement) => {
  const badges = {
    home: { label: '🏠 Home', bg: '#1a237e' },
    shop: { label: '🛍️ Shop', bg: '#f57c00' },
    categories: { label: '📚 Categories', bg: '#2e7d32' },
    all: { label: '🌐 All Pages', bg: '#6a1b9a' },
  };
  return badges[placement] || badges.home;
};

// ===== Skeleton =====
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonLine} ${styles.skL1}`} />
      <div className={`${styles.skeletonLine} ${styles.skL2}`} />
      <div className={`${styles.skeletonLine} ${styles.skL3}`} />
      <div className={`${styles.skeletonLine} ${styles.skL4}`} />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 6 }) => (
  <div className={styles.grid}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
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
  const scrollYRef = useRef(0);

  // ===== Fetch =====
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

  // ===== ESC key closes modal =====
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving && !uploading) closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, saving, uploading]);

  // ===== Open Add =====
  const handleAddClick = () => {
    setEditingBanner(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  // ===== Open Edit =====
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
    if (saving || uploading) return;
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

  // ===== Upload =====
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image (JPG, PNG, WEBP)');
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

    if (!form.image) {
      setFormError('Banner image zaroori hai!');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };

      if (editingBanner) {
        const { data } = await api.put(`/banners/${editingBanner._id}`, payload);
        setBanners(banners.map((b) => (b._id === editingBanner._id ? data : b)));
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

  // ===== Toggle active =====
  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/banners/${id}/toggle`);
      setBanners(banners.map((b) => (b._id === id ? data : b)));
    } catch (err) {
      alert(err.response?.data?.message || 'Toggle failed');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Manage Banners
            <span className={styles.countPill}>{banners.length}</span>
          </h1>
          <p className={styles.subtitle}>
            Create and manage website banners
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleAddClick}>
          <FaPlus /> Add New Banner
        </button>
      </div>

      {error && <div className={styles.errorBox}>⚠️ {error}</div>}

      {/* ===== Content ===== */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : banners.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FaImage />
          </div>
          <p className={styles.emptyTitle}>No banners yet</p>
          <p className={styles.emptyText}>
            Create your first banner to display on your website
          </p>
          <button className={styles.addBtn} onClick={handleAddClick}>
            <FaPlus /> Add Banner
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {banners.map((banner) => {
            const badge = getPlacementBadge(banner.placement);
            return (
              <div
                key={banner._id}
                className={`${styles.card} ${
                  !banner.isActive ? styles.cardInactive : ''
                }`}
              >
                {/* Image */}
                <div className={styles.cardImageWrap}>
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                  <div className={styles.cardBadges}>
                    <span
                      className={styles.placementBadge}
                      style={{ background: badge.bg }}
                    >
                      {badge.label}
                    </span>
                    <span
                      className={`${styles.activeBadge} ${
                        banner.isActive ? styles.on : styles.off
                      }`}
                    >
                      <span className={styles.activeDot} />
                      {banner.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>
                    {banner.title || '(No title)'}
                  </h3>
                  <p className={styles.cardSubtitle}>
                    {banner.subtitle || '(No subtitle)'}
                  </p>

                  {banner.link && (
                    <div className={styles.cardMeta}>
                      <FaLink /> {banner.link}
                    </div>
                  )}

                  {/* Actions */}
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.toggleBtn}`}
                      onClick={() => handleToggle(banner._id)}
                      title={banner.isActive ? 'Hide' : 'Show'}
                    >
                      {banner.isActive ? <FaEyeSlash /> : <FaEye />}
                      {banner.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => handleEditClick(banner)}
                      title="Edit"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(banner._id)}
                      title="Delete"
                    >
                      <FaTrash />
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBanner ? '✏️ Edit Banner' : '➕ Add New Banner'}
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
                  <div className={styles.errorBox}>⚠️ {formError}</div>
                )}

                {/* Title */}
                <div className={styles.field}>
                  <label className={styles.label}>Banner Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Discover Your Next Favorite Book"
                    className={styles.input}
                  />
                </div>

                {/* Subtitle */}
                <div className={styles.field}>
                  <label className={styles.label}>Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="e.g., Thousands of books. Endless possibilities."
                    className={styles.input}
                  />
                </div>

                {/* Placement */}
                <div className={styles.field}>
                  <label className={styles.label}>📍 Banner Placement *</label>
                  <select
                    name="placement"
                    value={form.placement}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  >
                    {placementOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className={styles.fieldHint}>
                    {form.placement === 'home' &&
                      'Ye banner sirf Home page pe dikhega'}
                    {form.placement === 'shop' &&
                      'Ye banner sirf Shop page pe dikhega'}
                    {form.placement === 'categories' &&
                      'Ye banner sirf Categories page pe dikhega'}
                    {form.placement === 'all' &&
                      'Ye banner har page pe dikhega'}
                  </p>
                </div>

                {/* Image */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Banner Image *
                    <span className={styles.labelHint}>
                      (1200×480 recommended)
                    </span>
                  </label>

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
                          <div className={styles.uploadIcon}>
                            <FaCloudUploadAlt />
                          </div>
                          <p className={styles.uploadTitle}>
                            Uploading... {uploadProgress}%
                          </p>
                          <div className={styles.uploadProgress}>
                            <div className={styles.uploadProgressBar}>
                              <div
                                className={styles.uploadProgressFill}
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.uploadIcon}>
                            <FaCloudUploadAlt />
                          </div>
                          <p className={styles.uploadTitle}>
                            Click to upload banner image
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

                {/* Link + Button Text */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Link</label>
                    <input
                      type="text"
                      name="link"
                      value={form.link}
                      onChange={handleChange}
                      placeholder="/shop"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Button Text</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={form.buttonText}
                      onChange={handleChange}
                      placeholder="Shop Now"
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Order + Active */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Display Order</label>
                    <input
                      type="number"
                      name="order"
                      value={form.order}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <div className={styles.checkRow}>
                      <input
                        id="isActive"
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                      />
                      <label htmlFor="isActive">
                        {form.isActive ? '✅ Active' : '○ Inactive'}
                      </label>
                    </div>
                  </div>
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

export default ManageBanners;