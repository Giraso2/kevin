import React from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '../assets/logo-white.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-placeholder-small">
                <img src={logoWhite} alt="ESSA Logo" />
              </div>
              <h3>ESSA Nyarugunga</h3>
            </div>
            <p className="footer-description">
              École Secondaire Des Science et Administrative (ESSA) NYARUGUNGA - Committed to excellence in education, character formation, and holistic development.
            </p>
            <div className="footer-badges">
              <span><i className="fas fa-check-circle"></i> Ministry of Education</span>
              <span><i className="fas fa-check-circle"></i> REB Accredited</span>
            </div>
          </div>

          <div className="footer-section">
            <h4><i className="fas fa-link"></i> Quick Links</h4>
            <ul>
              <li><Link to="/"><i className="fas fa-chevron-right"></i> Home</Link></li>
              <li><Link to="/about"><i className="fas fa-chevron-right"></i> About Us</Link></li>
              <li><Link to="/academics"><i className="fas fa-chevron-right"></i> Academics</Link></li>
              <li><Link to="/admissions"><i className="fas fa-chevron-right"></i> Admissions</Link></li>
              <li><Link to="/news"><i className="fas fa-chevron-right"></i> News</Link></li>
              <li><Link to="/gallery"><i className="fas fa-chevron-right"></i> Gallery</Link></li>
              <li><Link to="/contact"><i className="fas fa-chevron-right"></i> Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4><i className="fas fa-folder-open"></i> Resources</h4>
            <ul>
              <li><a href="#"><i className="fas fa-file-pdf"></i> School Calendar</a></li>
              <li><a href="#"><i className="fas fa-file-pdf"></i> Academic Handbook</a></li>
              <li><a href="#"><i className="fas fa-file-pdf"></i> Fee Structure</a></li>
              <li><a href="#"><i className="fas fa-file-pdf"></i> Uniform Policy</a></li>
              <li><a href="#"><i className="fas fa-question-circle"></i> FAQs</a></li>
              <li><a href="#"><i className="fas fa-blog"></i> School Blog</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4><i className="fas fa-newspaper"></i> Newsletter</h4>
            <p>Subscribe for updates on events, results, and news.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button><i className="fas fa-paper-plane"></i></button>
            </div>
            <div className="emergency-contact">
              <h4><i className="fas fa-phone-alt"></i> Emergency Contact</h4>
              <p className="emergency-phone">+250 788 123 456 (24/7)</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2026 ESSA Nyarugunga School. All rights reserved. | Designed with <i className="fas fa-heart"></i> for excellence</p>
          </div>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;