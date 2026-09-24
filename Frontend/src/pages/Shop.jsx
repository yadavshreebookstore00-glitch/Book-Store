import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Banner from '../components/common/Banner';

const categories = [
  'Fiction',
  'Non-Fiction',
  'Self Help',
  'Business',
  'Biography',
  'Academic',
  'Children',
  'Comics',
  'Romance',
  'Mystery',
];

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (category) params.append('category', category);

        const { data } = await api.get(`/books?${params.toString()}`);
        setBooks(data.books || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [keyword, category]);

  return (
    <div>
      {/* Banner */}
      <Banner placement="shop" />

      <div
        style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            color: '#1a237e',
            fontWeight: 800,
            marginBottom: '25px',
            fontSize: '28px',
          }}
        >
          All Books
        </h1>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search books by title or author..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 15px',
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '12px 15px',
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '180px',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Book Grid */}
        {loading ? (
          <Loader type="shop" />
        ) : books.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666',
              fontWeight: 500,
              fontSize: '15px',
            }}
          >
            📚 No books found matching your search.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '25px',
            }}
          >
            {books.map((book) => (
              // ✅ Slug use kar raha hai
              <Link
                key={book._id}
                to={`/book/${book.slug || book._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '15px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 10px rgba(0,0,0,0.05)';
                  }}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/220x250?text=Book';
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1a237e',
                      marginBottom: '5px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#666',
                      fontWeight: 500,
                      marginBottom: '10px',
                    }}
                  >
                    {book.author}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#f57c00',
                      }}
                    >
                      ₹{book.price}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        fontWeight: 600,
                      }}
                    >
                      ⭐ {book.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;