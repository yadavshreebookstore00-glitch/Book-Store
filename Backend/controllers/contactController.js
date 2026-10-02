import Contact from '../models/Contact.js';

// ============================================================
// CREATE CONTACT (Public - from Contact form)
// @route POST /api/contacts
// @access Public
// ============================================================
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email and message are required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status: 'new',
    });

    console.log('📬 New contact submission:', {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will get back to you soon.',
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// GET ALL CONTACTS (Admin)
// @route GET /api/contacts
// @access Private/Admin
// ============================================================
export const getAllContacts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sort = 'newest',
    } = req.query;

    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const count = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Get stats
    const stats = {
      total: await Contact.countDocuments(),
      new: await Contact.countDocuments({ status: 'new' }),
      read: await Contact.countDocuments({ status: 'read' }),
      replied: await Contact.countDocuments({ status: 'replied' }),
      closed: await Contact.countDocuments({ status: 'closed' }),
    };

    res.json({
      contacts,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count,
      stats,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// GET SINGLE CONTACT (Admin)
// @route GET /api/contacts/:id
// @access Private/Admin
// ============================================================
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// UPDATE CONTACT STATUS / NOTES (Admin)
// @route PUT /api/contacts/:id
// @access Private/Admin
// ============================================================
export const updateContact = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (status) contact.status = status;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;

    if (status === 'replied' && !contact.repliedAt) {
      contact.repliedAt = new Date();
    }

    const updated = await contact.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// DELETE CONTACT (Admin)
// @route DELETE /api/contacts/:id
// @access Private/Admin
// ============================================================
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};