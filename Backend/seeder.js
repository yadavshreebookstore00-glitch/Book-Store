import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import { books } from './data/books.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Book.deleteMany();
    await Book.insertMany(books);
    console.log('✅ Books Imported!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Book.deleteMany();
    console.log('🗑️ Books Destroyed!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}