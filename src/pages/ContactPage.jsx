import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import images from assets folder
import heroBg from '../assets/hero-bg.jpg';
import campusImage from '../assets/campus.png';

// Fallback image URLs
const fallbackImages = {
  heroBg: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=800&fit=crop',
  campusImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=450&fit=crop'
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 // In ContactPage.js, update handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.fullName || !formData.email || !formData.message) {
    Swal.fire({
      title: 'Incomplete Form',
      text: 'Please fill in all required fields.',
      icon: 'error',
      confirmButtonColor: '#1e3c72'
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Swal.fire({
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
      icon: 'error',
      confirmButtonColor: '#1e3c72'
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      Swal.fire({
        title: 'Message Sent!',
        html: `Thank you <strong>${formData.fullName}</strong> for contacting us.<br/><br/>${result.message}`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e3c72'
      });
      
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.message || 'Failed to send message. Please try again.',
      icon: 'error',
      confirmButtonColor: '#1e3c72'
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const handleCallClick = () => {
    Swal.fire({
      title: 'Call Us',
      text: 'Click OK to call +250 788 123 456',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Call Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#27ae60'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'tel:+250788123456';
      }
    });
  };

  const handleEmailClick = () => {
    Swal.fire({
      title: 'Email Us',
      text: 'Click OK to send an email to info@essanyarugunga.rw',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Send Email',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3498db'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'mailto:info@essanyarugunga.rw';
      }
    });
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/250788123456?text=Hello%20ESSA%20Nyarugunga%2C%20I%20have%20a%20question%20about', '_blank');
  };

  const handleDirectionClick = () => {
    Swal.fire({
      title: 'Get Directions',
      text: 'Open Google Maps for directions to ESSA Nyarugunga?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Open Maps',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('https://maps.google.com/?q=Nyarugunga+Sector+Kicukiro+District+Kigali+Rwanda', '_blank');
      }
    });
  };

  const contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Visit Us',
      details: ['Nyarugunga Sector, Kicukiro District', 'Kigali, Rwanda'],
      action: 'Get Directions',
      actionHandler: handleDirectionClick,
      color: '#e74c3c'
    },
    {
      icon: 'fas fa-phone-alt',
      title: 'Call Us',
      details: ['+250 788 123 456', '+250 788 123 457'],
      action: 'Call Now',
      actionHandler: handleCallClick,
      color: '#27ae60'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email Us',
      details: ['info@essanyarugunga.rw', 'admissions@essanyarugunga.rw'],
      action: 'Send Email',
      actionHandler: handleEmailClick,
      color: '#3498db'
    },
    {
      icon: 'fas fa-clock',
      title: 'Office Hours',
      details: ['Mon-Fri: 8:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 12:00 PM'],
      action: 'Schedule Appointment',
      actionHandler: () => {
        Swal.fire({
          title: 'Schedule Appointment',
          html: `
            <input type="text" id="name" class="swal2-input" placeholder="Your Name">
            <input type="email" id="email" class="swal2-input" placeholder="Your Email">
            <input type="date" id="date" class="swal2-input">
            <select id="time" class="swal2-select">
              <option value="">Select Time</option>
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
            </select>
          `,
          confirmButtonText: 'Request Appointment',
          confirmButtonColor: '#1e3c72',
          preConfirm: () => {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            if (!name || !email || !date || !time) {
              Swal.showValidationMessage('Please fill all fields');
              return false;
            }
            return { name, email, date, time };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Appointment Requested!', `We will confirm your appointment for ${result.value.date} at ${result.value.time}.`, 'success');
          }
        });
      },
      color: '#9b59b6'
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://facebook.com', color: '#1877f2' },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com', color: '#1da1f2' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com', color: '#e4405f' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://linkedin.com', color: '#0077b5' },
    { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com', color: '#ff0000' },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', url: 'https://wa.me/250788123456', color: '#25D366' }
  ];

  const faqs = [
    { q: 'How can I apply for admission?', a: 'You can apply online through our admissions portal or download the application form from the Admissions page.' },
    { q: 'When is the application deadline?', a: 'The application deadline for the 2026-2027 academic year is September 30, 2026.' },
    { q: 'Is there an entrance examination?', a: 'Yes, entrance examinations are held weekly on Saturdays. Please contact the admissions office to schedule.' },
    { q: 'Do you offer scholarships?', a: 'Yes, we offer merit-based and need-based scholarships. Visit our Admissions page for more information.' },
    { q: 'What are the school hours?', a: 'School runs from 7:45 AM to 4:00 PM, Monday through Friday.' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="contact-hero" style={{ backgroundImage: `url(${heroBg || fallbackImages.heroBg})` }}>
        <div className="contact-hero-overlay"></div>
        <div className="container contact-hero-content">
          <div className="hero-badge">
            <i className="fas fa-envelope"></i> GET IN TOUCH
          </div>
          <h1>Contact <span className="highlight">Us</span></h1>
          <p>We'd love to hear from you. Reach out with any questions, feedback, or inquiries.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card" style={{ borderBottomColor: info.color }}>
                <div className="info-icon" style={{ background: info.color }}>
                  <i className={info.icon}></i>
                </div>
                <h3>{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx}>{detail}</p>
                ))}
                <button onClick={info.actionHandler} className="info-action-btn" style={{ color: info.color }}>
                  {info.action} <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-map-grid">
            {/* Contact Form */}
            <div className="contact-form-container">
              <div className="form-header">
                <h2><i className="fas fa-paper-plane"></i> Send Us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <div className="input-icon">
                      <i className="fas fa-user"></i>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <div className="input-icon">
                      <i className="fas fa-envelope"></i>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-icon">
                      <i className="fas fa-phone"></i>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <div className="input-icon">
                      <i className="fas fa-tag"></i>
                      <select name="subject" value={formData.subject} onChange={handleInputChange}>
                        <option value="">Select a subject</option>
                        <option>General Inquiry</option>
                        <option>Admissions Question</option>
                        <option>Academic Support</option>
                        <option>Complaint/Suggestion</option>
                        <option>Partnership Opportunity</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message <span className="required">*</span></label>
                  <div className="input-icon textarea-icon">
                    <i className="fas fa-comment"></i>
                    <textarea 
                      name="message" 
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Write your message here..."
                      required
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Google Map */}
            <div className="map-container">
              <div className="map-card">
                <h3><i className="fas fa-map-marked-alt"></i> Find Us</h3>
                <div className="map-wrapper">
                  <iframe
                    title="ESSA Nyarugunga Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4756!2d30.0935!3d-1.9444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca76c8d1e2e5b%3A0x4f5c7e3b2a1d8e9f!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setMapLoaded(true)}
                  ></iframe>
                  {!mapLoaded && (
                    <div className="map-loading">
                      <i className="fas fa-spinner fa-spin"></i> Loading map...
                    </div>
                  )}
                </div>
                <div className="map-address">
                  <p><i className="fas fa-location-dot"></i> Nyarugunga Sector, Kicukiro District, Kigali, Rwanda</p>
                  <button onClick={handleDirectionClick} className="directions-btn">
                    <i className="fas fa-directions"></i> Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="social-section">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-share-alt"></i> Connect With Us</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Follow us on social media for updates and news</p>
          </div>
          <div className="social-grid">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
                style={{ '--social-color': social.color }}
              >
                <div className="social-icon" style={{ background: social.color }}>
                  <i className={social.icon}></i>
                </div>
                <h3>{social.name}</h3>
                <p>Follow us on {social.name}</p>
                <span className="follow-btn">Follow <i className="fas fa-arrow-right"></i></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <div className="container">
          <div className="faq-header">
            <i className="fas fa-question-circle"></i>
            <h2>Frequently Asked Questions</h2>
            <p>Find quick answers to common questions</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <div className="faq-question">
                  <i className="fas fa-question"></i>
                  <h3>{faq.q}</h3>
                </div>
                <div className="faq-answer">
                  <i className="fas fa-reply"></i>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="faq-more">
            <p>Still have questions? <Link to="/portal/login">Contact our support team</Link></p>
          </div>
        </div>
      </section>

      {/* Emergency Contact Banner */}
      <section className="emergency-banner">
        <div className="container">
          <div className="emergency-content">
            <i className="fas fa-phone-alt"></i>
            <div className="emergency-text">
              <h3>Emergency Contact</h3>
              <p>For urgent matters outside office hours, please call our emergency hotline</p>
            </div>
            <div className="emergency-number">
              <span>+250 788 123 456</span>
              <small>Available 24/7</small>
            </div>
            <button onClick={handleCallClick} className="emergency-btn">
              <i className="fas fa-phone"></i> Call Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactPage;