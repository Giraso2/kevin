import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// API Base URL
const API_URL = 'http://localhost:5000/api';

const NewsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 6;

  // News categories
  const categories = [
    { id: 'all', name: 'All News', icon: 'fas fa-newspaper', color: '#1a3a5c' },
    { id: 'achievement', name: 'Achievements', icon: 'fas fa-trophy', color: '#27ae60' },
    { id: 'announcement', name: 'Announcements', icon: 'fas fa-bullhorn', color: '#e74c3c' },
    { id: 'event', name: 'Events', icon: 'fas fa-calendar-alt', color: '#3498db' },
    { id: 'academic', name: 'Academic', icon: 'fas fa-graduation-cap', color: '#9b59b6' },
    { id: 'sports', name: 'Sports', icon: 'fas fa-futbol', color: '#f39c12' }
  ];

  // Fetch news from API
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/news/public`);
      const data = await response.json();
      
      if (data.success) {
        setNewsItems(data.data);
      } else {
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news. Please try again later.');
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter news based on category and search
  const filteredNews = newsItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsClick = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      try {
        const response = await fetch(`${API_URL}/subscriptions/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        Swal.fire({
          title: data.success ? 'Subscribed!' : 'Already Subscribed',
          text: data.message || 'You have successfully subscribed to our newsletter.',
          icon: data.success ? 'success' : 'info',
          confirmButtonColor: '#1e3c72'
        });
        e.target.reset();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to subscribe. Please try again.',
          icon: 'error',
          confirmButtonColor: '#1e3c72'
        });
      }
    }
  };

  const handleShare = (news) => {
    Swal.fire({
      title: 'Share Article',
      text: `Share "${news.title}" with your friends?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Share',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        // Copy link to clipboard
        navigator.clipboard.writeText(window.location.href);
        Swal.fire('Shared!', 'Link copied to clipboard', 'success');
      }
    });
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : 'fas fa-newspaper';
  };

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#1a3a5c';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="loading-spinner"></div>
          <p>Loading news...</p>
        </div>
        <Footer />
      </>
    );
  }

  const hasNews = newsItems.length > 0;
  const featuredNews = hasNews ? newsItems[0] : null;

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="news-hero">
        <div className="news-hero-overlay"></div>
        <div className="container news-hero-content">
          <div className="hero-badge">
            <i className="fas fa-newspaper"></i> STAY INFORMED
          </div>
          <h1>News & <span className="highlight">Events</span></h1>
          <p>Stay updated with the latest happenings, achievements, and announcements from ESSA Nyarugunga</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{newsItems.length}</span>
              <span className="stat-label">Articles Published</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">{categories.filter(c => c.id !== 'all').length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscribe Bar */}
      <section className="newsletter-bar">
        <div className="container">
          <div className="newsletter-wrapper">
            <div className="newsletter-text">
              <i className="fas fa-envelope"></i>
              <div>
                <h3>Subscribe to Our Newsletter</h3>
                <p>Get the latest news and updates directly in your inbox</p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form-inline">
              <input type="email" name="email" placeholder="Your email address" required />
              <button type="submit">Subscribe <i className="fas fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="news-search-section">
        <div className="container">
          <div className="search-filter-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search news articles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="category-pills">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                  style={{ '--category-color': category.color }}
                >
                  <i className={category.icon}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* No News Message */}
      {!hasNews && (
        <section className="no-news-section">
          <div className="container">
            <div className="no-news-card">
              <i className="fas fa-newspaper"></i>
              <h3>No News Published Yet</h3>
              <p>There are currently no news articles or announcements. Please check back later for updates from ESSA Nyarugunga.</p>
              <div className="no-news-illustration">
                <i className="fas fa-clock"></i>
                <span>Stay tuned for upcoming events and achievements!</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured News Section - Only if news exists */}
      {hasNews && activeCategory === 'all' && searchTerm === '' && featuredNews && (
        <section className="featured-news">
          <div className="container">
            <div className="featured-card">
              <div className="featured-image">
                <img src={featuredNews.image || 'https://via.placeholder.com/800x400/1a3a5c/ffffff?text=ESSA+News'} alt={featuredNews.title} />
                <div className="featured-badge">
                  <i className={getCategoryIcon(featuredNews.category)}></i>
                  Featured Story
                </div>
              </div>
              <div className="featured-content">
                <div className="news-category" style={{ background: getCategoryColor(featuredNews.category) }}>
                  <i className={getCategoryIcon(featuredNews.category)}></i>
                  {featuredNews.category?.toUpperCase() || 'NEWS'}
                </div>
                <h2>{featuredNews.title}</h2>
                <div className="news-meta">
                  <span><i className="fas fa-calendar-alt"></i> {formatDate(featuredNews.date || featuredNews.createdAt)}</span>
                  <span><i className="fas fa-user"></i> {featuredNews.author || 'ESSA Admin'}</span>
                  <span><i className="fas fa-eye"></i> {featuredNews.views || 0} views</span>
                </div>
                <p>{featuredNews.summary}</p>
                <button onClick={() => handleNewsClick(featuredNews)} className="read-more-btn">
                  Read Full Story <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      {hasNews && (
        <section className="news-grid-section">
          <div className="container">
            <div className="section-header">
              <h2>
                {activeCategory === 'all' ? 'Latest News' : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p>{filteredNews.length} article(s) found</p>
            </div>

            {filteredNews.length > 0 ? (
              <>
                <div className="news-grid">
                  {paginatedNews.map((news, index) => (
                    <div 
                      key={news._id || news.id} 
                      className="news-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="news-image-wrapper">
                        <img 
                          src={news.image || 'https://via.placeholder.com/400x250/1a3a5c/ffffff?text=ESSA+News'} 
                          alt={news.title} 
                        />
                        <div className="news-category-tag" style={{ background: getCategoryColor(news.category) }}>
                          <i className={getCategoryIcon(news.category)}></i>
                          {news.category}
                        </div>
                      </div>
                      <div className="news-card-content">
                        <div className="news-date">
                          <i className="fas fa-calendar-alt"></i> {formatDate(news.date || news.createdAt)}
                        </div>
                        <h3>{news.title}</h3>
                        <p>{news.summary?.substring(0, 120)}...</p>
                        {news.tags && news.tags.length > 0 && (
                          <div className="news-tags">
                            {news.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="news-tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="news-card-footer">
                          <div className="news-stats">
                            <span><i className="fas fa-eye"></i> {news.views || 0}</span>
                          </div>
                          <button onClick={() => handleNewsClick(news)} className="read-more">
                            Read More <i className="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`page-number ${currentPage === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No news found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button onClick={() => { setActiveCategory('all'); setSearchTerm(''); }} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Upcoming Events Section - Static for now */}
      <section className="upcoming-events">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-calendar-alt"></i> Upcoming Events</h2>
            <div className="underline"></div>
          </div>
          <div className="events-list">
            <div className="event-item">
              <div className="event-date">
                <span className="event-day">15</span>
                <span className="event-month">MAY</span>
              </div>
              <div className="event-details">
                <h3>Parent-Teacher Conference</h3>
                <p><i className="fas fa-clock"></i> 8:00 AM - 5:00 PM</p>
                <p><i className="fas fa-map-marker-alt"></i> School Auditorium</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="event-day">20</span>
                <span className="event-month">MAY</span>
              </div>
              <div className="event-details">
                <h3>Science Fair Exhibition</h3>
                <p><i className="fas fa-clock"></i> 9:00 AM - 3:00 PM</p>
                <p><i className="fas fa-map-marker-alt"></i> Science Laboratory</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="event-day">10</span>
                <span className="event-month">JUN</span>
              </div>
              <div className="event-details">
                <h3>Term 2 Examinations Begin</h3>
                <p><i className="fas fa-clock"></i> All Day</p>
                <p><i className="fas fa-map-marker-alt"></i> Various Classrooms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Modal */}
      {isModalOpen && selectedNews && (
        <div className="news-modal" onClick={closeModal}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-image">
              <img src={selectedNews.image || 'https://via.placeholder.com/800x400/1a3a5c/ffffff?text=ESSA+News'} alt={selectedNews.title} />
              <div className="modal-category" style={{ background: getCategoryColor(selectedNews.category) }}>
                <i className={getCategoryIcon(selectedNews.category)}></i>
                {selectedNews.category?.toUpperCase() || 'NEWS'}
              </div>
            </div>
            <div className="modal-body">
              <h2>{selectedNews.title}</h2>
              <div className="modal-meta">
                <span><i className="fas fa-calendar-alt"></i> {formatDate(selectedNews.date || selectedNews.createdAt)}</span>
                <span><i className="fas fa-user"></i> {selectedNews.author || 'ESSA Admin'}</span>
                <span><i className="fas fa-eye"></i> {selectedNews.views || 0} views</span>
              </div>
              <div className="modal-content-text">
                <p>{selectedNews.content || selectedNews.summary}</p>
              </div>
              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="modal-tags">
                  {selectedNews.tags.map((tag, idx) => (
                    <span key={idx} className="modal-tag">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="modal-actions">
                <button onClick={() => handleShare(selectedNews)} className="modal-share-btn">
                  <i className="fas fa-share-alt"></i> Share Article
                </button>
                <button className="modal-print-btn" onClick={() => window.print()}>
                  <i className="fas fa-print"></i> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top-color: #1a3a5c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .no-news-section {
          padding: 60px 0;
        }
        .no-news-card {
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 50px 30px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        .no-news-card i {
          font-size: 4rem;
          color: #1a3a5c;
          margin-bottom: 20px;
        }
        .no-news-card h3 {
          font-size: 1.5rem;
          color: #1a3a5c;
          margin-bottom: 15px;
        }
        .no-news-card p {
          color: #666;
          margin-bottom: 25px;
        }
        .no-news-illustration {
          background: #f0f4f8;
          padding: 15px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }
        .no-news-illustration i {
          font-size: 1.2rem;
          margin: 0;
          color: #ffc107;
        }
      `}</style>
    </>
  );
};

export default NewsPage;