import cloudinary from '../config/cloudinary.js';

// ================= UPLOAD IMAGE =================
// @route POST /api/upload
// @access Private/Admin
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename, // For deletion later
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE IMAGE =================
// @route DELETE /api/upload/:publicId
// @access Private/Admin
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
};