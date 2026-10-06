import CustomItem from '../models/CustomItem.js';

// ============================================================
// GET ALL CUSTOM ITEMS
// @route GET /api/custom-items
// @access Private/Admin
// ============================================================
export const getCustomItems = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const count = await CustomItem.countDocuments(filter);
    const items = await CustomItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      items,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count,
    });
  } catch (error) {
    console.error('Get custom items error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// CREATE CUSTOM ITEM
// @route POST /api/custom-items
// @access Private/Admin
// ============================================================
export const createCustomItem = async (req, res) => {
  try {
    const { name, price, discountPercent = 0, category, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    // Check if already exists
    const existing = await CustomItem.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        message: 'Item with this name already exists',
        item: existing,
      });
    }

    const item = await CustomItem.create({
      name: name.trim(),
      price: Number(price),
      discountPercent: Number(discountPercent) || 0,
      category: category || 'Custom',
      description: description || '',
      createdBy: req.user._id,
    });

    console.log('✅ Custom item created:', item.name);
    res.status(201).json(item);
  } catch (error) {
    console.error('Create custom item error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// UPDATE CUSTOM ITEM
// @route PUT /api/custom-items/:id
// @access Private/Admin
// ============================================================
export const updateCustomItem = async (req, res) => {
  try {
    const item = await CustomItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (req.body.name) item.name = req.body.name.trim();
    if (req.body.price !== undefined) item.price = Number(req.body.price);
    if (req.body.discountPercent !== undefined)
      item.discountPercent = Number(req.body.discountPercent);
    if (req.body.category) item.category = req.body.category;
    if (req.body.description !== undefined)
      item.description = req.body.description;

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    console.error('Update custom item error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// DELETE CUSTOM ITEM (Soft Delete)
// @route DELETE /api/custom-items/:id
// @access Private/Admin
// ============================================================
export const deleteCustomItem = async (req, res) => {
  try {
    const item = await CustomItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.isActive = false;
    await item.save();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete custom item error:', error);
    res.status(500).json({ message: error.message });
  }
};