import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';

// ================= GET ALL ACTIVE BANNERS (Public) =================
// @route GET /api/banners
// @access Public


// ================= GET ALL BANNERS (Admin) =================
// @route GET /api/banners/all
// @access Private/Admin
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CREATE BANNER =================
// @route POST /api/banners
// @access Private/Admin
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, imagePublicId, link, buttonText, order } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    const banner = await Banner.create({
      title: title || '',
      subtitle: subtitle || '',
      image,
      imagePublicId: imagePublicId || '',
      link: link || '/shop',
      buttonText: buttonText || 'Shop Now',
      order: order || 0,
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= UPDATE BANNER =================
// @route PUT /api/banners/:id
// @access Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= DELETE BANNER =================
// @route DELETE /api/banners/:id
// @access Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    // Cloudinary se image delete karo
    if (banner.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(banner.imagePublicId);
      } catch (err) {
        console.error('Cloudinary delete error:', err.message);
      }
    }

    await banner.deleteOne();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TOGGLE BANNER STATUS =================
// @route PATCH /api/banners/:id/toggle
// @access Private/Admin
export const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= GET ACTIVE BANNERS BY PLACEMENT (Public) =================
// @route GET /api/banners?placement=home
// @access Public
export const getActiveBanners = async (req, res) => {
  try {
    const { placement } = req.query;

    // Filter build karo
    const filter = { isActive: true };

    if (placement && placement !== 'all') {
      // User ne specific placement maanga hai
      // Toh us placement ke banners + 'all' placement ke banners dono do
      filter.placement = { $in: [placement, 'all'] };
    }

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};