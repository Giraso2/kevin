import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// API Base URL
const API_URL = 'http://localhost:5000/api';

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery categories
  const categories = [
    { id: 'all', name: 'All Photos', icon: 'fas fa-th-large' },
    { id: 'academic', name: 'Academic', icon: 'fas fa-graduation-cap' },
    { id: 'sports', name: 'Sports', icon: 'fas fa-futbol' },
    { id: 'cultural', name: 'Cultural', icon: 'fas fa-music' },
    { id: 'events', name: 'Events', icon: 'fas fa-calendar-alt' }
  ];

  // Fetch gallery from API
  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/gallery/public`);
      const data = await response.json();
      
      if (data.success) {
        setGalleryItems(data.data);
      } else {
        setGalleryItems([]);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setError('Failed to load gallery. Please try again later.');
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  const openLightbox = (item) => {
    setSelectedImage(item);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredItems.findIndex(item => item._id === selectedImage._id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
      if (newIndex >= filteredItems.length) newIndex = 0;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = filteredItems.length - 1;
    }
    setSelectedImage(filteredItems[newIndex]);
  };

  const handleImageDownload = async (image) => {
    Swal.fire({
      title: 'Download Image',
      text: `Would you like to download "${image.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Download',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3c72'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Track download
        try {
          await fetch(`${API_URL}/gallery/${image._id}/download`, { method: 'POST' });
        } catch (e) {
          console.error('Download tracking error:', e);
        }
        
        // Open image in new tab for download
        window.open(image.image, '_blank');
        Swal.fire('Download Started', 'Your image download will begin shortly.', 'success');
      }
    });
  };

  const handleImageShare = (image) => {
    Swal.fire({
      title: 'Share Image',
      text: `Share "${image.title}" with your friends?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Share',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(window.location.href);
        Swal.fire('Shared!', 'Link copied to clipboard', 'success');
      }
    });
  };

  const handleImageInfo = (image) => {
    Swal.fire({
      title: image.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Description:</strong> ${image.description || 'No description available'}</p>
          <p><strong>Date:</strong> ${new Date(image.date).toLocaleDateString()}</p>
          <p><strong>Photographer:</strong> ${image.photographer || 'School Media Team'}</p>
          <p><strong>Category:</strong> ${image.category?.toUpperCase() || 'GENERAL'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#1e3c72'
    });
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return galleryItems.length;
    return galleryItems.filter(item => item.category === categoryId).length;
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : 'fas fa-image';
  };

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
          <p>Loading gallery...</p>
        </div>
        <Footer />
      </>
    );
  }

  const hasImages = galleryItems.length > 0;

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-hero-overlay"></div>
        <div className="container gallery-hero-content">
          <div className="hero-badge">
            <i className="fas fa-camera"></i> CAPTURED MOMENTS
          </div>
          <h1>Our <span className="highlight">Gallery</span></h1>
          <p>Explore memorable moments from our school life - academics, sports, cultural events, and celebrations</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{galleryItems.length}</span>
              <span className="stat-label">Moments Captured</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">{categories.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="gallery-categories">
        <div className="container">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.id)}
              >
                <i className={category.icon}></i>
                <span>{category.name}</span>
                <span className="count">{getCategoryCount(category.id)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* No Images Message */}
      {!hasImages && (
        <section className="no-gallery-section">
          <div className="container">
            <div className="no-gallery-card">
              <i className="fas fa-images"></i>
              <h3>No Photos in Gallery Yet</h3>
              <p>There are currently no photos in the gallery. Please check back later for updates from ESSA Nyarugunga.</p>
              <div className="no-gallery-illustration">
                <i className="fas fa-camera"></i>
                <span>Moments will be captured and shared soon!</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      {hasImages && (
        <section className="gallery-grid-section">
          <div className="container">
            <div className="gallery-stats-bar">
              <p><i className="fas fa-images"></i> Showing {filteredItems.length} of {galleryItems.length} photos</p>
            </div>
            
            <div className="gallery-masonry">
              {filteredItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className="gallery-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="gallery-image-wrapper">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x350/1a3a5c/ffffff?text=Image+Not+Found';
                      }}
                    />
                    <div className="gallery-overlay-actions">
                      <button onClick={() => openLightbox(item)} className="overlay-btn">
                        <i className="fas fa-search-plus"></i>
                      </button>
                      <button onClick={() => handleImageInfo(item)} className="overlay-btn">
                        <i className="fas fa-info-circle"></i>
                      </button>
                      <button onClick={() => handleImageShare(item)} className="overlay-btn">
                        <i className="fas fa-share-alt"></i>
                      </button>
                      <button onClick={() => handleImageDownload(item)} className="overlay-btn">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                    <div className="gallery-category-tag">
                      <i className={getCategoryIcon(item.category)}></i>
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <div className="gallery-info">
                    <h3>{item.title}</h3>
                    <p>{item.description || 'Beautiful moment captured at ESSA Nyarugunga'}</p>
                    <div className="gallery-meta">
                      <span><i className="fas fa-calendar-alt"></i> {formatDate(item.date)}</span>
                      <span><i className="fas fa-camera"></i> {item.photographer || 'School Media Team'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="no-results">
                <i className="fas fa-images"></i>
                <h3>No photos in this category</h3>
                <p>Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Video Section */}
      <section className="featured-video">
        <div className="container">
          <div className="video-card">
            <div className="video-content">
              <i className="fas fa-play-circle"></i>
              <h3>Watch Our School Documentary</h3>
              <p>A journey through ESSA Nyarugunga - Excellence in Science and Administrative Education</p>
              <button className="btn btn-primary" onClick={() => {
                Swal.fire({
                  title: 'School Documentary',
                  html: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>',
                  width: '800px',
                  showConfirmButton: false,
                  showCloseButton: true
                });
              }}>Watch Now <i className="fas fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImage && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
            <button className="lightbox-prev" onClick={() => navigateImage('prev')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="lightbox-image-container">
              <img src={selectedImage.image} alt={selectedImage.title} />
              <div className="lightbox-caption">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.description || 'Beautiful moment at ESSA Nyarugunga'}</p>
                <div className="lightbox-meta">
                  <span><i className="fas fa-calendar-alt"></i> {formatDate(selectedImage.date)}</span>
                  <span><i className="fas fa-camera"></i> {selectedImage.photographer || 'School Media Team'}</span>
                  <span><i className="fas fa-tag"></i> {selectedImage.category}</span>
                </div>
                <div className="lightbox-actions">
                  <button onClick={() => handleImageDownload(selectedImage)}><i className="fas fa-download"></i> Download</button>
                  <button onClick={() => handleImageShare(selectedImage)}><i className="fas fa-share-alt"></i> Share</button>
                  <button onClick={() => handleImageInfo(selectedImage)}><i className="fas fa-info-circle"></i> Info</button>
                </div>
              </div>
            </div>
            <button className="lightbox-next" onClick={() => navigateImage('next')}>
              <i className="fas fa-chevron-right"></i>
            </button>
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
        .no-gallery-section {
          padding: 60px 0;
        }
        .no-gallery-card {
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 50px 30px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        .no-gallery-card i {
          font-size: 4rem;
          color: #1a3a5c;
          margin-bottom: 20px;
        }
        .no-gallery-card h3 {
          font-size: 1.5rem;
          color: #1a3a5c;
          margin-bottom: 15px;
        }
        .no-gallery-card p {
          color: #666;
          margin-bottom: 25px;
        }
        .no-gallery-illustration {
          background: #f0f4f8;
          padding: 15px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }
        .no-gallery-illustration i {
          font-size: 1.2rem;
          margin: 0;
          color: #ffc107;
        }
      `}</style>
    </>
  );
};

export default GalleryPage;