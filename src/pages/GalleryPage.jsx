import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import all images directly from assets folder
import heroBg from '../assets/hero-bg.jpg';
import campusImage from '../assets/campus.png';
import studentsImage from '../assets/students.png';
import classroomImg from '../assets/classroom.png';
import libraryImg from '../assets/library.png';
import footballImg from '../assets/football.png';
import basketballImg from '../assets/basketball.png';
import scienceLabImg from '../assets/science-lab.png';
import musicImg from '../assets/music.png';
import artImg from '../assets/art.png';
import graduationImg from '../assets/graduation.png';
import debateClubImg from '../assets/debate-club.png';
import musicClubImg from '../assets/music-club.png';
import sportsClubImg from '../assets/sports-club.png';

// Fallback image URLs in case local images fail to load
const fallbackImages = {
  heroBg: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=800&fit=crop',
  campusImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=450&fit=crop',
  studentsImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=350&fit=crop',
  classroomImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
  libraryImg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop',
  scienceLabImg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
  footballImg: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=250&fit=crop',
  musicImg: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=250&fit=crop',
  graduationImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop'
};

// Helper function to get image with fallback
const getImage = (localImg, fallbackUrl) => {
  return localImg || fallbackUrl;
};

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Gallery categories
  const categories = [
    { id: 'all', name: 'All Photos', icon: 'fas fa-th-large', count: 24 },
    { id: 'academic', name: 'Academic', icon: 'fas fa-graduation-cap', count: 8 },
    { id: 'sports', name: 'Sports', icon: 'fas fa-futbol', count: 6 },
    { id: 'cultural', name: 'Cultural', icon: 'fas fa-music', count: 5 },
    { id: 'events', name: 'Events', icon: 'fas fa-calendar-alt', count: 5 }
  ];

  // Gallery items with local images and fallbacks
  const galleryItems = [
    // Academic Category
    { id: 1, category: 'academic', img: getImage(classroomImg, fallbackImages.classroomImg), title: 'Modern Classroom', description: 'Students engaged in interactive learning session', date: 'March 2026', photographer: 'School Media Team' },
    { id: 2, category: 'academic', img: getImage(scienceLabImg, fallbackImages.scienceLabImg), title: 'Science Laboratory', description: 'Students conducting chemistry experiments', date: 'February 2026', photographer: 'Science Department' },
    { id: 3, category: 'academic', img: getImage(libraryImg, fallbackImages.libraryImg), title: 'School Library', description: 'Quiet study area with extensive book collection', date: 'January 2026', photographer: 'Library Staff' },
    { id: 4, category: 'academic', img: getImage(studentsImage, fallbackImages.studentsImage), title: 'Group Study Session', description: 'Students collaborating on assignments', date: 'March 2026', photographer: 'Academic Office' },
    { id: 5, category: 'academic', img: getImage(campusImage, fallbackImages.campusImage), title: 'Campus Overview', description: 'Aerial view of ESSA Nyarugunga campus', date: 'December 2025', photographer: 'Drone Photography' },
   
    { id: 7, category: 'academic', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=350&fit=crop', title: 'Reading Session', description: 'Students enjoying their reading time', date: 'January 2026', photographer: 'Library Staff' },
    { id: 8, category: 'academic', img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&h=350&fit=crop', title: 'Mathematics Class', description: 'Solving complex problems together', date: 'March 2026', photographer: 'Math Department' },

    // Sports Category
    { id: 9, category: 'sports', img: getImage(footballImg, fallbackImages.footballImg), title: 'Football Tournament', description: 'Inter-school football championship', date: 'February 2026', photographer: 'Sports Department' },
    { id: 10, category: 'sports', img: getImage(basketballImg, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=350&fit=crop'), title: 'Basketball Game', description: 'Exciting match between school teams', date: 'January 2026', photographer: 'Sports Club' },
    { id: 11, category: 'sports', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=350&fit=crop', title: 'Athletics Day', description: 'Students competing in track events', date: 'March 2026', photographer: 'PE Department' },
    { id: 12, category: 'sports', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=350&fit=crop', title: 'Volleyball Match', description: 'Students showing teamwork and skill', date: 'February 2026', photographer: 'Sports Club' },
    { id: 13, category: 'sports', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=350&fit=crop', title: 'Sports Day Celebration', description: 'Annual sports day award ceremony', date: 'March 2026', photographer: 'Sports Department' },
    { id: 14, category: 'sports', img: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=500&h=350&fit=crop', title: 'Sports Club Activity', description: 'Afternoon sports practice session', date: 'January 2026', photographer: 'Sports Club' },

    // Cultural Category
    { id: 15, category: 'cultural', img: getImage(musicImg, fallbackImages.musicImg), title: 'Music Concert', description: 'School choir performance at annual concert', date: 'December 2025', photographer: 'Music Department' },
    { id: 16, category: 'cultural', img: getImage(artImg, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=350&fit=crop'), title: 'Art Exhibition', description: 'Student artwork display', date: 'February 2026', photographer: 'Art Club' },
    { id: 17, category: 'cultural', img: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=500&h=350&fit=crop', title: 'Traditional Dance', description: 'Cultural day celebrations', date: 'January 2026', photographer: 'Cultural Club' },
    { id: 18, category: 'cultural', img: getImage(musicClubImg, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=350&fit=crop'), title: 'Music Club Practice', description: 'Students practicing for upcoming event', date: 'March 2026', photographer: 'Music Club' },
    { id: 19, category: 'cultural', img: 'https://images.unsplash.com/photo-1507676184212-d6ab0c3b64bf?w=500&h=350&fit=crop', title: 'Drama Performance', description: 'Theater club presentation', date: 'February 2026', photographer: 'Drama Club' },

    // Events Category
    { id: 20, category: 'events', img: getImage(graduationImg, fallbackImages.graduationImg), title: 'Graduation Ceremony', description: 'S6 students receiving their certificates', date: 'November 2025', photographer: 'Admin Office' },
    { id: 21, category: 'events', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=350&fit=crop', title: 'Prize Giving Day', description: 'Award ceremony for top performers', date: 'December 2025', photographer: 'Academic Office' },
    { id: 22, category: 'events', img: getImage(debateClubImg, 'https://images.unsplash.com/photo-1557425955-df376b88b5a5?w=500&h=350&fit=crop'), title: 'Debate Competition', description: 'Inter-school debate championship', date: 'February 2026', photographer: 'Debate Club' },
    { id: 23, category: 'events', img: getImage(sportsClubImg, 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=500&h=350&fit=crop'), title: 'Sports Award Ceremony', description: 'Recognizing outstanding athletes', date: 'March 2026', photographer: 'Sports Department' },
    { id: 24, category: 'events', img: 'https://images.unsplash.com/photo-1511795409674-a4600b9b2b51?w=500&h=350&fit=crop', title: 'School Festival', description: 'Annual school carnival celebration', date: 'October 2025', photographer: 'Student Council' }
  ];

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
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
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

  const handleImageDownload = (image) => {
    Swal.fire({
      title: 'Download Image',
      text: `Would you like to download "${image.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Download',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Download Started', 'Your image download will begin shortly.', 'success');
        // In a real app, you would implement actual download logic here
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
        Swal.fire('Share', 'Share link copied to clipboard!', 'success');
      }
    });
  };

  const handleImageInfo = (image) => {
    Swal.fire({
      title: image.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Description:</strong> ${image.description}</p>
          <p><strong>Date:</strong> ${image.date}</p>
          <p><strong>Photographer:</strong> ${image.photographer}</p>
          <p><strong>Category:</strong> ${image.category.toUpperCase()}</p>
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

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="gallery-hero" style={{ backgroundImage: `url(${getImage(heroBg, fallbackImages.heroBg)})` }}>
        <div className="gallery-hero-overlay"></div>
        <div className="container gallery-hero-content">
          <div className="hero-badge">
            <i className="fas fa-camera"></i> CAPTURED MOMENTS
          </div>
          <h1>Our <span className="highlight">Gallery</span></h1>
          <p>Explore memorable moments from our school life - academics, sports, cultural events, and celebrations</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{galleryItems.length}+</span>
              <span className="stat-label">Moments Captured</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">5+</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">2024-26</span>
              <span className="stat-label">Years Covered</span>
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

      {/* Gallery Grid */}
      <section className="gallery-grid-section">
        <div className="container">
          <div className="gallery-stats-bar">
            <p><i className="fas fa-images"></i> Showing {filteredItems.length} of {galleryItems.length} photos</p>
            <div className="view-options">
              <button className="view-btn active"><i className="fas fa-grid-2"></i> Grid</button>
              <button className="view-btn"><i className="fas fa-list"></i> List</button>
            </div>
          </div>
          
          <div className="gallery-masonry">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="gallery-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="gallery-image-wrapper">
                  <img 
                    src={item.img} 
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
                    <i className={categories.find(c => c.id === item.category)?.icon}></i>
                    <span>{item.category}</span>
                  </div>
                </div>
                <div className="gallery-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="gallery-meta">
                    <span><i className="fas fa-calendar-alt"></i> {item.date}</span>
                    <span><i className="fas fa-camera"></i> {item.photographer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="no-results">
              <i className="fas fa-images"></i>
              <h3>No photos found</h3>
              <p>Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

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

      {/* Testimonial Section */}
      <section className="gallery-testimonials">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-quote-left"></i> Memories from Our Community</h2>
            <div className="underline"></div>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <i className="fas fa-quote-left"></i>
              <p>The cultural events at ESSA are unforgettable. The music concert was a highlight of my school life!</p>
              <div className="testimonial-author">
                <strong>Marie Claire</strong>
                <span>Alumna 2024</span>
              </div>
            </div>
            <div className="testimonial-card">
              <i className="fas fa-quote-left"></i>
              <p>Our sports team made history winning the regional championship. Best moments captured forever!</p>
              <div className="testimonial-author">
                <strong>Eric Munezero</strong>
                <span>Sports Captain 2025</span>
              </div>
            </div>
            <div className="testimonial-card">
              <i className="fas fa-quote-left"></i>
              <p>The graduation ceremony was emotional and beautiful. A perfect ending to our journey.</p>
              <div className="testimonial-author">
                <strong>Diane Umuhoza</strong>
                <span>Graduate 2025</span>
              </div>
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
              <img src={selectedImage.img} alt={selectedImage.title} />
              <div className="lightbox-caption">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.description}</p>
                <div className="lightbox-meta">
                  <span><i className="fas fa-calendar-alt"></i> {selectedImage.date}</span>
                  <span><i className="fas fa-camera"></i> {selectedImage.photographer}</span>
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
    </>
  );
};

export default GalleryPage;