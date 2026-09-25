import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import dashboardRoutes from './routes/dashboardRoutes.js';

// Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import upiRoutes from './routes/upiRoutes.js';

// Models
import Book from "./models/Book.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// ===== Slug Generator =====
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ===== Auto-generate slugs for existing books =====
const migrateSlugs = async () => {
  try {
    const books = await Book.find({});

    if (books.length === 0) {
      console.log("📚 No books to migrate");
      return;
    }

    let updatedCount = 0;

    for (const book of books) {
      if (book.slug && book.slug.trim() !== "") continue;
      if (!book.title) continue;

      let baseSlug = generateSlug(book.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await Book.findOne({
          slug,
          _id: { $ne: book._id },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update directly without triggering save hook
      await Book.updateOne({ _id: book._id }, { $set: { slug } });
      updatedCount++;
      console.log(`  ✅ "${book.title}" → ${slug}`);
    }

    if (updatedCount > 0) {
      console.log(`✅ Slugs generated for ${updatedCount} book(s)`);
    } else {
      console.log("✅ All books already have slugs");
    }
  } catch (error) {
    console.error("❌ Slug migration error:", error.message);
  }
};

// ===== Start Server =====
const startServer = async () => {
  try {
    await connectDB();
    await migrateSlugs();

    const app = express();

    app.use(
      cors({
        origin: process.env.CLIENT_URL || "https://book-store-r57i.onrender.com",
        credentials: true,
      }),
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.get("/", (req, res) => {
      res.json({ message: "📚 Yadav Shree Book Store API is running!" });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/auth", otpRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/banners", bannerRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/wishlist", wishlistRoutes);
    app.use("/api/orders", orderRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/upi', upiRoutes);

    app.use(notFound);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on https://book-store-r57i.onrender.com:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server start error:", error.message);
    process.exit(1);
  }
};

startServer();
