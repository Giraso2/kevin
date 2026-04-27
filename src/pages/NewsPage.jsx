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

// Fallback image URLs
const fallbackImages = {
  heroBg: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=800&fit=crop',
  campusImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=450&fit=crop',
  studentsImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=350&fit=crop',
  classroomImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
  libraryImg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop',
  scienceLabImg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
  footballImg: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=250&fit=crop',
  musicImg: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=250&fit=crop',
  graduationImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
  newsPlaceholder: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop'
};

// Helper function to get image with fallback
const getImage = (localImg, fallbackUrl) => {
  return localImg || fallbackUrl;
};

const NewsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // News categories
  const categories = [
    { id: 'all', name: 'All News', icon: 'fas fa-newspaper', color: '#1a3a5c' },
    { id: 'achievement', name: 'Achievements', icon: 'fas fa-trophy', color: '#27ae60' },
    { id: 'announcement', name: 'Announcements', icon: 'fas fa-bullhorn', color: '#e74c3c' },
    { id: 'event', name: 'Events', icon: 'fas fa-calendar-alt', color: '#3498db' },
    { id: 'academic', name: 'Academic', icon: 'fas fa-graduation-cap', color: '#9b59b6' },
    { id: 'sports', name: 'Sports', icon: 'fas fa-futbol', color: '#f39c12' }
  ];

  // News data with local images and fallbacks
  const newsItems = [
    {
      id: 1,
      title: 'ESSA Nyarugunga Wins National Science Competition',
      category: 'achievement',
      date: 'March 15, 2026',
      author: 'Science Department',
      image: getImage(scienceLabImg, fallbackImages.scienceLabImg),
      summary: 'Our students won first place in the National Science Fair with their innovative water purification project. The team of S5 students developed a cost-effective water filtration system that can remove up to 99% of contaminants.',
      content: `The National Science Competition brought together over 50 schools from across Rwanda. ESSA Nyarugunga's team, consisting of three S5 students, presented their innovative water purification project that uses locally available materials to create an affordable filtration system.

The project impressed the judges with its practicality and potential impact on rural communities. The students spent three months developing and testing their prototype under the guidance of their physics teacher.

"We are incredibly proud of our students' achievement," said the Headmaster. "This demonstrates the quality of science education at ESSA and our students' ability to apply theoretical knowledge to real-world problems."

The winning team will represent Rwanda at the East African Science Competition later this year.`,
      tags: ['Science', 'Competition', 'Innovation'],
      views: 1245,
      likes: 89
    },
    {
      id: 2,
      title: 'New Computer Laboratory Inaugurated',
      category: 'announcement',
      date: 'February 28, 2026',
      author: 'ICT Department',
      image: getImage(studentsImage, fallbackImages.studentsImage),
      summary: 'State-of-the-art computer lab with 50 new computers was officially opened by the District Mayor. The facility will enhance ICT education for all students.',
      content: `The new computer laboratory, funded by a partnership with the Rwanda ICT Chamber, features 50 high-performance computers, high-speed internet, and modern teaching equipment. The facility will serve students from both Ordinary and Advanced levels.

The inauguration ceremony was attended by district officials, parents, and community members. The Mayor praised ESSA for its commitment to technology education.

"This lab will enable our students to develop crucial digital skills needed for the 21st-century workforce," said the Head of ICT Department. "We plan to offer evening classes for community members as well."`,
      tags: ['ICT', 'Infrastructure', 'Technology'],
      views: 892,
      likes: 67
    },
    {
      id: 3,
      title: 'Annual Parent-Teacher Conference Announced',
      category: 'announcement',
      date: 'February 10, 2026',
      author: 'Administration',
      image: getImage(classroomImg, fallbackImages.classroomImg),
      summary: 'Annual parent-teacher conferences will be held on March 5-6, 2026. Parents are invited to discuss student progress and academic performance.',
      content: `The annual parent-teacher conference is scheduled for March 5-6, 2026. This important event allows parents to meet with teachers, discuss their children's progress, and address any concerns.

Each session will last 15 minutes per teacher. Parents are encouraged to schedule appointments in advance through the school portal. Report cards will be distributed during these meetings.

"We value the partnership between school and home," said the Deputy Headmistress. "These conferences are crucial for ensuring student success."`,
      tags: ['Parents', 'Conference', 'Academic'],
      views: 567,
      likes: 45
    },
    {
      id: 4,
      title: 'Cultural Day Celebration 2026',
      category: 'event',
      date: 'January 20, 2026',
      author: 'Cultural Club',
      image: getImage(musicImg, fallbackImages.musicImg),
      summary: 'Students showcased Rwandan culture through music, dance, and art. The event was a great success with participation from all grades.',
      content: `The annual Cultural Day celebration transformed the school into a vibrant showcase of Rwandan heritage. Students performed traditional dances, displayed artwork, and presented cultural artifacts.

Special guest performers from the National Ballet also entertained the audience. Parents and community members were invited to participate in the festivities.

"The event promotes cultural pride and unity among our students," said the Cultural Club patron. "It's wonderful to see our young people embracing their heritage."`,
      tags: ['Culture', 'Event', 'Arts'],
      views: 2341,
      likes: 156
    },
    {
      id: 5,
      title: 'Scholarship Opportunities Announced',
      category: 'announcement',
      date: 'January 5, 2026',
      author: 'Admissions Office',
      image: getImage(studentsImage, fallbackImages.studentsImage),
      summary: 'Merit-based scholarships available for outstanding students. Apply before March 31, 2026 for consideration.',
      content: `ESSA Nyarugunga is pleased to announce scholarship opportunities for the 2026-2027 academic year. The scholarships are available for students with exceptional academic performance, leadership qualities, or special talents.

Five full scholarships and ten partial scholarships will be awarded. Applicants must submit their academic records, recommendation letters, and a personal statement.

"We believe every talented student deserves access to quality education regardless of financial background," said the Headmaster.`,
      tags: ['Scholarships', 'Opportunities', 'Admissions'],
      views: 3120,
      likes: 203
    },
    {
      id: 6,
      title: 'Inter-School Debate Championship Victory',
      category: 'achievement',
      date: 'December 10, 2025',
      author: 'Debate Club',
      image: getImage(debateClubImg, 'https://images.unsplash.com/photo-1557425955-df376b88b5a5?w=600&h=400&fit=crop'),
      summary: 'Our debate team emerged champions in the regional competition, defeating 15 other schools.',
      content: `ESSA Nyarugunga's debate team won first place at the Regional Inter-School Debate Championship. The team argued for the motion "Technology is more beneficial than harmful to society" and impressed the judges with their reasoning and presentation skills.

The team captain received the Best Speaker award. This is the third consecutive year our school has reached the finals.

"We are immensely proud of our debaters," said the Debate Club patron. "Their critical thinking and public speaking skills have improved tremendously."`,
      tags: ['Debate', 'Achievement', 'Competition'],
      views: 978,
      likes: 72
    },
    {
      id: 7,
      title: 'Sports Day 2026 - Record Breaking Performances',
      category: 'sports',
      date: 'March 20, 2026',
      author: 'Sports Department',
      image: getImage(footballImg, fallbackImages.footballImg),
      summary: 'Annual Sports Day saw three school records broken in athletics. Students competed in various sports disciplines.',
      content: `The 2026 Sports Day was a resounding success with outstanding performances across all disciplines. Three school records were broken in track events, including the 100m sprint and long jump.

The event featured football, basketball, volleyball, athletics, and traditional games. The Blue House emerged as the overall champion.

"Sports develop teamwork, discipline, and physical fitness," said the Sports Director. "We're seeing improved participation every year."`,
      tags: ['Sports', 'Athletics', 'Records'],
      views: 1543,
      likes: 98
    },
    {
      id: 8,
      title: 'Computer Science Week Celebrated',
      category: 'academic',
      date: 'December 5, 2025',
      author: 'ICT Department',
      image: getImage(studentsImage, fallbackImages.studentsImage),
      summary: 'Students participated in coding workshops, robotics demonstrations, and cybersecurity awareness sessions.',
      content: `Computer Science Week featured a series of engaging activities designed to spark interest in technology fields. Students learned basic programming, built simple robots, and participated in a cybersecurity quiz.

Guest speakers from local tech companies shared career insights. The week concluded with a coding competition.

"We want to prepare our students for the digital economy," said the ICT teacher. "These skills are essential for their future careers."`,
      tags: ['Computer Science', 'Technology', 'Workshops'],
      views: 678,
      likes: 54
    },
    {
      id: 9,
      title: 'Graduation Ceremony 2025',
      category: 'event',
      date: 'November 25, 2025',
      author: 'Administration',
      image: getImage(graduationImg, fallbackImages.graduationImg),
      summary: '150 students graduated with flying colors. The ceremony was graced by the District Mayor.',
      content: `The graduation ceremony for the 2025 cohort was a memorable event. 150 students received their certificates, with 25 achieving distinctions.

The guest of honor, the District Mayor, encouraged graduates to pursue higher education and contribute to national development. Top-performing students received special awards.

"We wish our graduates success in their future endeavors," said the Headmaster. "They will always be part of the ESSA family."`,
      tags: ['Graduation', 'Event', 'Achievement'],
      views: 2456,
      likes: 189
    }
  ];

  // Filter news based on category and search
  const filteredNews = newsItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      Swal.fire({
        title: 'Subscribed!',
        text: 'You have successfully subscribed to our newsletter.',
        icon: 'success',
        confirmButtonColor: '#1e3c72'
      });
      e.target.reset();
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

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="news-hero" style={{ backgroundImage: `url(${getImage(heroBg, fallbackImages.heroBg)})` }}>
        <div className="news-hero-overlay"></div>
        <div className="container news-hero-content">
          <div className="hero-badge">
            <i className="fas fa-newspaper"></i> STAY INFORMED
          </div>
          <h1>News & <span className="highlight">Events</span></h1>
          <p>Stay updated with the latest happenings, achievements, and announcements from ESSA Nyarugunga</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{newsItems.length}+</span>
              <span className="stat-label">Articles Published</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">5+</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Total Views</span>
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

      {/* Featured News Section */}
      {activeCategory === 'all' && searchTerm === '' && (
        <section className="featured-news">
          <div className="container">
            <div className="featured-card">
              <div className="featured-image">
                <img src={newsItems[0].image} alt={newsItems[0].title} />
                <div className="featured-badge">
                  <i className={getCategoryIcon(newsItems[0].category)}></i>
                  Featured Story
                </div>
              </div>
              <div className="featured-content">
                <div className="news-category" style={{ background: getCategoryColor(newsItems[0].category) }}>
                  <i className={getCategoryIcon(newsItems[0].category)}></i>
                  {newsItems[0].category.toUpperCase()}
                </div>
                <h2>{newsItems[0].title}</h2>
                <div className="news-meta">
                  <span><i className="fas fa-calendar-alt"></i> {newsItems[0].date}</span>
                  <span><i className="fas fa-user"></i> {newsItems[0].author}</span>
                  <span><i className="fas fa-eye"></i> {newsItems[0].views} views</span>
                </div>
                <p>{newsItems[0].summary}</p>
                <button onClick={() => handleNewsClick(newsItems[0])} className="read-more-btn">
                  Read Full Story <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
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
                    key={news.id} 
                    className="news-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="news-image-wrapper">
                      <img src={news.image} alt={news.title} />
                      <div className="news-category-tag" style={{ background: getCategoryColor(news.category) }}>
                        <i className={getCategoryIcon(news.category)}></i>
                        {news.category}
                      </div>
                    </div>
                    <div className="news-card-content">
                      <div className="news-date">
                        <i className="fas fa-calendar-alt"></i> {news.date}
                      </div>
                      <h3>{news.title}</h3>
                      <p>{news.summary.substring(0, 120)}...</p>
                      <div className="news-tags">
                        {news.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="news-tag">#{tag}</span>
                        ))}
                      </div>
                      <div className="news-card-footer">
                        <div className="news-stats">
                          <span><i className="fas fa-eye"></i> {news.views}</span>
                          <span><i className="fas fa-heart"></i> {news.likes}</span>
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

      {/* Upcoming Events Section */}
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
            <div className="event-item">
              <div className="event-date">
                <span className="event-day">25</span>
                <span className="event-month">JUN</span>
              </div>
              <div className="event-details">
                <h3>Sports Day 2026</h3>
                <p><i className="fas fa-clock"></i> 8:00 AM - 4:00 PM</p>
                <p><i className="fas fa-map-marker-alt"></i> School Playground</p>
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
              <img src={selectedNews.image} alt={selectedNews.title} />
              <div className="modal-category" style={{ background: getCategoryColor(selectedNews.category) }}>
                <i className={getCategoryIcon(selectedNews.category)}></i>
                {selectedNews.category.toUpperCase()}
              </div>
            </div>
            <div className="modal-body">
              <h2>{selectedNews.title}</h2>
              <div className="modal-meta">
                <span><i className="fas fa-calendar-alt"></i> {selectedNews.date}</span>
                <span><i className="fas fa-user"></i> {selectedNews.author}</span>
                <span><i className="fas fa-eye"></i> {selectedNews.views} views</span>
              </div>
              <div className="modal-content-text">
                <p>{selectedNews.content}</p>
              </div>
              <div className="modal-tags">
                {selectedNews.tags.map((tag, idx) => (
                  <span key={idx} className="modal-tag">#{tag}</span>
                ))}
              </div>
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
    </>
  );
};

export default NewsPage;