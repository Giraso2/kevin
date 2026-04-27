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

const AdmissionsPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: 'Rwandan',
    nationalId: '',
    email: '',
    phone: '',
    address: '',
    level: '',
    previousSchool: '',
    lastAverage: '',
    achievements: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    applyScholarship: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.level) {
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        icon: 'error',
        confirmButtonColor: '#1e3c72'
      });
      return;
    }

    Swal.fire({
      title: 'Application Submitted!',
      html: `Thank you <strong>${formData.fullName}</strong> for applying to ESSA Nyarugunga.<br/><br/>We have received your application and will contact you within 3-5 business days.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1e3c72'
    });
    
    // Reset form
    setFormData({
      fullName: '',
      dateOfBirth: '',
      nationality: 'Rwandan',
      nationalId: '',
      email: '',
      phone: '',
      address: '',
      level: '',
      previousSchool: '',
      lastAverage: '',
      achievements: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      parentOccupation: '',
      applyScholarship: false
    });
  };

  const handleScholarshipApply = () => {
    Swal.fire({
      title: 'Scholarship Application',
      text: 'Please complete the online application form below to apply for a scholarship.',
      icon: 'info',
      confirmButtonText: 'Continue to Form',
      confirmButtonColor: '#1e3c72'
    });
    // Scroll to form
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: 'When does the application process start?', a: 'Applications open on January 10, 2026 and close on September 30, 2026. We encourage early application as seats are limited.' },
    { q: 'Is there an entrance examination?', a: 'Yes, entrance examinations are held weekly on Saturdays. The exam covers English, Mathematics, and General Knowledge.' },
    { q: 'Can I pay fees in installments?', a: 'Yes, we offer flexible payment plans. Please contact the finance office to discuss an installment plan that works for your family.' },
    { q: 'Is accommodation available?', a: 'Yes, we offer boarding facilities for students who live far from the school. Limited spaces available.' },
    { q: 'What is the school uniform policy?', a: 'All students are required to wear the official ESSA Nyarugunga uniform. Uniforms can be purchased from the school store.' },
    { q: 'How do I check my application status?', a: 'You can check your application status by contacting the admissions office via phone or email with your application reference number.' }
  ];

  const feeStructures = [
    { level: 'Ordinary Level', grades: 'S1 - S3', amount: '304,000', features: ['Tuition', 'Library Access', 'Computer Lab', 'Science Lab Materials', 'Sports Activities'], popular: false, note: '* Additional: Uniform (30,000 RWF) one-time' },
    { level: 'Advanced Level - ICT', grades: 'L3 - L5 SOD and CSA', amount: '349,000', features: ['Tuition', 'Library Access', 'Advanced Computer Labs', 'Internship Placement', 'Career Guidance', 'Certification Prep'], popular: true, note: '* ICT students get laptop learning access' },
    { level: 'Advanced Level - Others', grades: 'Accounting, Tourism, Food and Beverages Operation', amount: '400,000', features: ['Tuition', 'Library Access', 'Laboratory Access', 'Field Trips', 'Study Materials'], popular: false, note: '* Payment plans available upon request' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="admissions-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="admissions-hero-overlay"></div>
        <div className="container admissions-hero-content">
          <div className="hero-badge">
            <i className="fas fa-door-open"></i> BEGIN YOUR JOURNEY
          </div>
          <h1>Begin Your Journey to <span className="highlight">Excellence</span> at ESSA Nyarugunga</h1>
          <div className="hero-notice">
            <i className="fas fa-exclamation-triangle"></i> Limited Seats Available - Apply Early!
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-card">
            <h2><i className="fas fa-star-of-life"></i> Welcome Future Leaders!</h2>
            <p>We are delighted that you are considering ESSA Nyarugunga for your secondary education. Our admissions process is designed to be simple, transparent, and accessible to all qualified students. We look forward to welcoming you to our family!</p>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="application-process">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-clipboard-list"></i> Application Process</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Follow these simple steps to join ESSA Nyarugunga</p>
          </div>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Get Application Form</h3>
                <p>Download the form from our website or collect it from the school administration office.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Fill & Submit</h3>
                <p>Complete the application form with accurate information and attach required documents.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Entrance Assessment</h3>
                <p>Take the entrance examination (English, Mathematics, General Knowledge).</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Admission Decision</h3>
                <p>Receive admission notification within 7-10 working days.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Enrollment</h3>
                <p>Complete registration, pay fees, and join our academic community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Grid */}
      <section className="requirements-section">
        <div className="container">
          <div className="requirements-grid">
            <div className="requirement-card">
              <i className="fas fa-graduation-cap"></i>
              <h3>Academic Requirements</h3>
              <ul>
                <li><i className="fas fa-check"></i> Completion of Primary 6 (for O-Level)</li>
                <li><i className="fas fa-check"></i> Completion of S3 (for A-Level)</li>
                <li><i className="fas fa-check"></i> Minimum 70% average in previous year</li>
                <li><i className="fas fa-check"></i> Passing score on entrance exam</li>
              </ul>
            </div>
            <div className="requirement-card">
              <i className="fas fa-file-alt"></i>
              <h3>Required Documents</h3>
              <ul>
                <li><i className="fas fa-check"></i> Birth Certificate (2 copies)</li>
                <li><i className="fas fa-check"></i> Last 2 years' Report Cards</li>
                <li><i className="fas fa-check"></i> 4 Passport Photos</li>
                <li><i className="fas fa-check"></i> Medical Certificate</li>
                <li><i className="fas fa-check"></i> Parent/Guardian ID copies</li>
              </ul>
            </div>
            <div className="requirement-card">
              <i className="fas fa-calendar-alt"></i>
              <h3>Important Dates</h3>
              <ul>
                <li><i className="fas fa-check"></i> Applications Open: January 10, 2026</li>
                <li><i className="fas fa-check"></i> Deadline: September 30, 2026</li>
                <li><i className="fas fa-check"></i> Entrance Exams: Weekly on Saturdays</li>
                <li><i className="fas fa-check"></i> Classes Begin: October 15, 2026</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="fee-structure">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-money-bill-wave"></i> Fee Structure</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Affordable quality education - 2026 Academic Year</p>
          </div>
          <div className="fee-grid">
            {feeStructures.map((fee, index) => (
              <div key={index} className={`fee-card ${fee.popular ? 'popular' : ''}`}>
                {fee.popular && <div className="popular-badge">Most Popular</div>}
                <div className="fee-header">
                  <h3>{fee.level}</h3>
                  <p className="fee-grades">{fee.grades}</p>
                  <div className="fee-amount">
                    <span className="currency">RWF</span>
                    <span className="amount">{fee.amount}</span>
                    <span className="period">per term</span>
                  </div>
                </div>
                <div className="fee-features">
                  <ul>
                    {fee.features.map((feature, idx) => (
                      <li key={idx}><i className="fas fa-check-circle"></i> {feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="fee-note">
                  <p>{fee.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="payment-methods">
            <p><i className="fas fa-university"></i> Bank Transfer: Bank of Kigali</p>
            <p><i className="fas fa-mobile-alt"></i> Mobile Money: Airtel Money | MoMo Pay</p>
          </div>
        </div>
      </section>

      {/* Financial Aid */}
      <section className="financial-aid">
        <div className="container">
          <div className="aid-header">
            <i className="fas fa-hand-holding-heart"></i>
            <h2>Scholarships & Financial Aid</h2>
            <p>ESSA Nyarugunga believes that every talented student deserves access to quality education regardless of financial background.</p>
          </div>
          <div className="aid-grid">
            <div className="aid-card">
              <i className="fas fa-trophy"></i>
              <h3>Merit Scholarship</h3>
              <p>For top-performing students</p>
              <span className="aid-percent">50-100% fee waiver</span>
            </div>
            <div className="aid-card">
              <i className="fas fa-heart"></i>
              <h3>Need-Based Scholarship</h3>
              <p>For students from low-income families</p>
              <span className="aid-percent">25-75% fee waiver</span>
            </div>
            <div className="aid-card">
              <i className="fas fa-futbol"></i>
              <h3>Sports & Talent Scholarship</h3>
              <p>For exceptional athletes and artists</p>
              <span className="aid-percent">30% fee waiver</span>
            </div>
          </div>
          <div className="aid-action">
            <button onClick={handleScholarshipApply} className="btn btn-primary">
              <i className="fas fa-graduation-cap"></i> Apply for Scholarship
            </button>
            <p className="scholarship-note">* Limited scholarships available per academic year</p>
          </div>
        </div>
      </section>

      {/* Online Application Form */}
      <section id="application-form" className="online-application">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-globe"></i> Online Application</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Apply online using the form below</p>
          </div>
          <div className="application-form-container">
            <form onSubmit={handleSubmit} className="application-form">
              <h3><i className="fas fa-user-graduate"></i> Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Date of Birth <span className="required">*</span></label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nationality <span className="required">*</span></label>
                  <select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                    <option>Rwandan</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>National ID (if available)</label>
                  <input type="text" name="nationalId" value={formData.nationalId} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Current Address <span className="required">*</span></label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Applying for Level <span className="required">*</span></label>
                  <select name="level" value={formData.level} onChange={handleInputChange} required>
                    <option value="">Select Level</option>
                    <option>Ordinary Level (S1-S3)</option>
                    <option>Advanced Level - Software Development</option>
                    <option>Advanced Level - Accounting</option>
                    <option>Advanced Level - Computer Systems</option>
                    <option>Advanced Level - Tourism</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Previous School <span className="required">*</span></label>
                  <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Last Year Average (%) <span className="required">*</span></label>
                  <input type="number" name="lastAverage" value={formData.lastAverage} onChange={handleInputChange} step="0.1" min="0" max="100" required />
                </div>
                <div className="form-group">
                  <label>Achievements/Awards</label>
                  <textarea name="achievements" value={formData.achievements} onChange={handleInputChange} rows="2" placeholder="List any academic, sports, or other achievements"></textarea>
                </div>
              </div>

              <h3><i className="fas fa-users"></i> Parent/Guardian Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Parent/Guardian Name <span className="required">*</span></label>
                  <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Parent Phone <span className="required">*</span></label>
                  <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Parent Email</label>
                  <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Parent Occupation</label>
                  <input type="text" name="parentOccupation" value={formData.parentOccupation} onChange={handleInputChange} />
                </div>
              </div>

              <h3><i className="fas fa-upload"></i> Upload Documents</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Last Report Card <span className="required">*</span></label>
                  <input type="file" accept=".pdf,.jpg,.png" required />
                  <small>PDF or Image (Max 5MB)</small>
                </div>
                <div className="form-group">
                  <label>Birth Certificate <span className="required">*</span></label>
                  <input type="file" accept=".pdf,.jpg,.png" required />
                  <small>PDF or Image (Max 5MB)</small>
                </div>
              </div>
              <div className="form-group">
                <label>Student Photo <span className="required">*</span></label>
                <input type="file" accept="image/*" required />
                <small>Passport size photo (Max 2MB)</small>
              </div>

              <div className="form-checkbox">
                <label>
                  <input type="checkbox" name="applyScholarship" checked={formData.applyScholarship} onChange={handleInputChange} />
                  I wish to apply for a scholarship
                </label>
              </div>
              <div className="form-checkbox">
                <label>
                  <input type="checkbox" required />
                  I confirm that the information provided is accurate and I agree to the terms and conditions.
                </label>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">
                <i className="fas fa-paper-plane"></i> Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-question-circle"></i> Frequently Asked Questions</h2>
            <div className="underline"></div>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question" onClick={() => toggleFaq(index)}>
                  <h3>{faq.q}</h3>
                  <i className={`fas fa-chevron-${activeFaq === index ? 'up' : 'down'}`}></i>
                </div>
                <div className={`faq-answer ${activeFaq === index ? 'active' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="support-section">
        <div className="container">
          <div className="support-card">
            <i className="fas fa-headset"></i>
            <h3>Need Help with Your Application?</h3>
            <p>Contact our admissions office for assistance. We're here to help you every step of the way.</p>
            <div className="support-contact">
              <div><i className="fas fa-phone-alt"></i> +250 788 123 456</div>
              <div><i className="fas fa-envelope"></i> admissions@essanyarugunga.rw</div>
              <div><i className="fas fa-clock"></i> Mon-Fri: 8AM - 5PM</div>
            </div>
            <Link to="/contact" className="btn btn-primary">Contact Us <i className="fas fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AdmissionsPage;