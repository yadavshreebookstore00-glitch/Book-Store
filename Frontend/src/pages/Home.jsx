import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Banner from '../components/common/Banner';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/books/bestsellers');
        setBooks(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div>
      {/* Banner */}
      <Banner placement="home" />

      {/* Best Sellers */}
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {error && (
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <h2
          style={{
            color: '#1a237e',
            fontWeight: 800,
            marginBottom: '20px',
            fontSize: '24px',
          }}
        >
          🔥 Best Sellers
        </h2>

        {loading ? (
          <Loader type="books" />
        ) : books.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px',
              color: '#666',
              fontWeight: 500,
            }}
          >
            No books available yet.
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
              // ✅ Slug use kar raha hai (fallback ID)
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

export default Home;