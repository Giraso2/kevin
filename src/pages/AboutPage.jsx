import React, { useEffect } from 'react';
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

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const leadershipTeam = [
    { 
      name: 'Dr. Jean Paul Uwimana', 
      title: 'Headmaster / Director', 
      image: campusImage,
      education: 'PhD in Educational Leadership',
      experience: '20+ years experience'
    },
    { 
      name: 'Marie Claire Uwase', 
      title: 'Deputy Headmistress', 
      image: studentsImage,
      education: 'Master\'s in Educational Management',
      experience: '15+ years experience'
    },
    { 
      name: 'Emmanuel Ndayisaba', 
      title: 'Academic Director', 
      image: graduationImg,
      education: 'Master\'s in Curriculum Development',
      experience: '12+ years experience'
    }
  ];

  const stats = [
    { number: '2006', label: 'Year Founded', icon: 'fas fa-calendar-alt' },
    { number: '1000+', label: 'Current Students', icon: 'fas fa-user-graduate' },
    { number: '40+', label: 'Qualified Teachers', icon: 'fas fa-chalkboard-user' },
    { number: '95%', label: 'Pass Rate', icon: 'fas fa-chart-line' }
  ];

  const facilities = [
    { name: 'Modern Classrooms', description: 'Spacious, well-lit classrooms with smart boards', icon: 'fas fa-chalkboard', image: classroomImg },
    { name: 'Science Laboratories', description: 'Fully equipped physics, chemistry, and biology labs', icon: 'fas fa-flask', image: scienceLabImg },
    { name: 'Computer Lab', description: 'State-of-the-art computers with high-speed internet', icon: 'fas fa-laptop-code', image: libraryImg },
    { name: 'Library', description: 'Well-stocked library with reference books and e-resources', icon: 'fas fa-book', image: libraryImg },
    { name: 'Sports Complex', description: 'Football field, basketball court, and volleyball court', icon: 'fas fa-futbol', image: footballImg },
    { name: 'Auditorium', description: '500-seat auditorium for events and assemblies', icon: 'fas fa-building', image: graduationImg }
  ];

  const handleContactClick = () => {
    Swal.fire({
      title: 'Contact Us',
      text: 'Would you like to visit our school or speak with admissions?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Call Admissions',
      cancelButtonText: 'Email Us',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Call Us',
          text: 'Call +250 788 123 456 to speak with our admissions office.',
          icon: 'info',
          confirmButtonColor: '#1e3c72'
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Email Us',
          text: 'Send an email to admissions@essanyarugunga.rw',
          icon: 'info',
          confirmButtonColor: '#1e3c72'
        });
      }
    });
  };

  const handleLeadershipClick = (leader) => {
    Swal.fire({
      title: leader.name,
      html: `
        <div style="text-align: center;">
          <strong>${leader.title}</strong><br/>
          <strong>Education:</strong> ${leader.education}<br/>
          <strong>Experience:</strong> ${leader.experience}<br/>
          <br/>
          <p>${leader.name} is dedicated to providing quality education and leadership at ESSA Nyarugunga.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#1e3c72'
    });
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="about-hero-overlay"></div>
        <div className="container about-hero-content">
          <div className="hero-badge">
            <i className="fas fa-info-circle"></i> ABOUT OUR SCHOOL
          </div>
          <h1>Excellence in <span className="highlight">Technology & Administrative</span> Education</h1>
          <p>For over 20 years, we have been shaping the future leaders of Rwanda through quality education, discipline, and holistic development.</p>
          <div className="hero-buttons">
            <button onClick={handleContactClick} className="btn btn-primary"><i className="fas fa-phone-alt"></i> Contact Admissions</button>
            <Link to="/admissions" className="btn btn-secondary"><i className="fas fa-user-graduate"></i> Apply Now</Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-history"></i> Our Story</h2>
            <div className="underline"></div>
            <p className="section-subtitle">The journey of excellence since 2006</p>
          </div>
          <div className="story-grid">
            <div className="story-text">
              <p>ESSA Nyarugunga (Ecole Secondaire Des Science et Administrative) was established in <strong>2006</strong> with a vision to provide quality secondary education in Kigali's Kicukiro District. What started as a small institution has now grown into one of the most respected secondary schools in Rwanda.</p>
              <p>Over the years, we have consistently produced outstanding graduates who have gone on to excel in top universities and various professional fields. Our commitment to <strong>academic excellence, character formation, and holistic development</strong> has made us a school of choice for parents seeking quality education for their children.</p>
              <p>Today, ESSA Nyarugunga serves over <strong>1000 students</strong> with a dedicated team of <strong>40+ qualified teachers</strong>, offering programs in Software Development, Accounting, Computer Systems, and Tourism & Hospitality.</p>
              <div className="story-highlights">
                <div className="highlight-item">
                  <i className="fas fa-trophy"></i>
                  <div>
                    <h4>National Recognition</h4>
                    <p>Ranked among top schools in Rwanda for science education</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-award"></i>
                  <div>
                    <h4>Ministry Accredited</h4>
                    <p>Fully accredited by the Ministry of Education and REB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-image">
              <img src={campusImage} alt="ESSA Nyarugunga Campus" />
              <div className="experience-badge">
                <span>20+</span>
                <p>Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values Section */}
      <section className="mission-vision">
        <div className="container">
          <div className="mvv-grid">
            <div className="mvv-card mission">
              <div className="mvv-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>To provide holistic education that nurtures intellectual curiosity, moral integrity, and leadership skills, preparing students for higher education and responsible citizenship in Rwanda and beyond.</p>
            </div>
            <div className="mvv-card vision">
              <div className="mvv-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>To be a center of excellence in science and administrative education, producing graduates who are innovative, ethical, and ready to contribute to national development.</p>
            </div>
            <div className="mvv-card values">
              <div className="mvv-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Core Values</h3>
              <ul>
                <li><i className="fas fa-check-circle"></i> Excellence - Striving for the highest standards</li>
                <li><i className="fas fa-check-circle"></i> Integrity - Upholding honesty and moral principles</li>
                <li><i className="fas fa-check-circle"></i> Community - Fostering an inclusive environment</li>
                <li><i className="fas fa-check-circle"></i> Innovation - Embracing new ideas and technologies</li>
                <li><i className="fas fa-check-circle"></i> Discipline - Building strong character and work ethic</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={stat.icon}></i>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-building"></i> Our Facilities</h2>
            <div className="underline"></div>
            <p className="section-subtitle">State-of-the-art infrastructure for modern education</p>
          </div>
          <div className="facilities-grid">
            {facilities.map((facility, index) => (
              <div key={index} className="facility-card">
                <div className="facility-image">
                  <img src={facility.image} alt={facility.name} />
                  <div className="facility-overlay">
                    <i className={facility.icon}></i>
                  </div>
                </div>
                <div className="facility-info">
                  <h4><i className={facility.icon}></i> {facility.name}</h4>
                  <p>{facility.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-users"></i> School Leadership</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Dedicated leaders committed to excellence</p>
          </div>
          <div className="leadership-grid">
            {leadershipTeam.map((leader, index) => (
              <div key={index} className="leader-card" onClick={() => handleLeadershipClick(leader)}>
                <div className="leader-image">
                  <img src={leader.image} alt={leader.name} />
                </div>
                <h4>{leader.name}</h4>
                <p className="leader-title">{leader.title}</p>
                <div className="leader-details">
                  <span><i className="fas fa-graduation-cap"></i> {leader.education}</span>
                </div>
                <button className="read-more-btn">View Profile <i className="fas fa-arrow-right"></i></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Students Life Section */}
      <section className="student-life-preview">
        <div className="container">
          <div className="student-life-grid">
            <div className="student-life-content">
              <div className="section-title left">
                <h2><i className="fas fa-users"></i> Student Life at ESSA</h2>
                <div className="underline left-underline"></div>
              </div>
              <p>At ESSA Nyarugunga, we believe education extends beyond the classroom. Our students enjoy a vibrant campus life with numerous opportunities for personal growth, leadership, and recreation.</p>
              <div className="activities-list">
                <div className="activity-item">
                  <i className="fas fa-microphone-alt"></i>
                  <div>
                    <h4>Clubs & Societies</h4>
                    <p>Debate, Music, Sports, Science, and more</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-church"></i>
                  <div>
                    <h4>Spiritual Growth</h4>
                    <p>Daily prayers, weekly services, and retreats</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-heart"></i>
                  <div>
                    <h4>Community Service</h4>
                    <p>Outreach programs and charitable activities</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-trophy"></i>
                  <div>
                    <h4>Competitions</h4>
                    <p>Academic, sports, and cultural events</p>
                  </div>
                </div>
              </div>
              <Link to="/gallery" className="btn btn-outline">View Gallery <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="student-life-image">
              <img src={studentsImage} alt="Students at ESSA" />
              <div className="floating-card">
                <i className="fas fa-smile"></i>
                <p>95% Student Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join ESSA Nyarugunga?</h2>
            <p>Take the first step towards a bright future. Applications are now open for the 2026-2027 academic year.</p>
            <div className="cta-buttons">
              <Link to="/admissions" className="btn btn-primary"><i className="fas fa-download"></i> Download Application</Link>
              <Link to="/contact" className="btn btn-secondary"><i className="fas fa-calendar-alt"></i> Schedule a Visit</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutPage;