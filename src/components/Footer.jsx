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
              <span><i className="fas fa-check-circle"></i> RTB Accredited</span>
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
            <h4><i className="fas fa-envelope"></i>Contact Info</h4>
            <ul>
              <li><a href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477860813629!2d30.109888!3d-1.977408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca76c8d5b5b5b%3A0x8b5b5b5b5b5b5b5b!2sNyarugunga%2C%20Kigali!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw" about='blank'><i className="fas fa-map-marker-alt"></i> Nyarugunga Sector, Kicukiro District, Kigali, Rwanda</a></li>
              <li><a href="mailto:kevineniyomurinzi@gmail.com"><i className="fas fa-envelope"></i>info@essanyarugunga.rw</a></li>
              <li><a href="tel:+250737692152"><i className="fas fa-phone"></i> +250 737 693 152</a></li>
              <li><a href="#contact"><i className="fas fa-clock"></i>9:00 am - 4:00 pm</a></li>
              <li><a href="https://instagram.com/ESSA NYARUGUNGA TSS"><i className="fas fa-share-alt"></i>ESSA NYARUGUNGA TSS</a></li>
              <li><a href="https://www.essanyarugunga.rw"><i className="fas fa-globe"></i>www.essanyarugunga.rw</a></li>
              
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
              <p className="emergency-phone">+250 737 692 152 (24/7)</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2026 ESSA Nyarugunga School. All rights reserved. | Developed by <i className="fas fa-code"></i> <a href="http://wa.me/250737692152" target="_blank" rel="noopener noreferrer">Mukeshiamana Kevin</a> </p>
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