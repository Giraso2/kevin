import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  graduationImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop'
};

const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState('ordinary');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLearnMore = (programName) => {
    Swal.fire({
      title: programName,
      text: `For more information about ${programName}, please contact the academic office or visit the school.`,
      icon: 'info',
      confirmButtonText: 'Contact Admissions',
      confirmButtonColor: '#1e3c72'
    });
  };

  const combinations = [
    {
      id: 1,
      name: 'Software Development',
      icon: 'fas fa-code',
      subtitle: 'ICT Option',
      subjects: ['Computer Science', 'Mathematics', 'Physics', 'Several Programming Languages'],
      careerPath: 'Software Engineer, Web Developer, IT Consultant, Database Administrator',
      color: '#3498db'
    },
    {
      id: 2,
      name: 'Accounting',
      icon: 'fas fa-chart-line',
      subtitle: 'Economics Option',
      subjects: ['Accounting', 'Economics', 'Mathematics', 'Entrepreneurship'],
      careerPath: 'Accountant, Auditor, Financial Analyst, Tax Consultant, Banker',
      color: '#27ae60'
    },
    {
      id: 3,
      name: 'Computer Systems & Architecture',
      icon: 'fas fa-microchip',
      subtitle: 'ICT Option',
      subjects: ['Computer Architecture', 'Networking', 'Mathematics', 'Electronics'],
      careerPath: 'Network Engineer, Systems Administrator, Hardware Engineer, IT Support',
      color: '#9b59b6'
    },
    {
      id: 4,
      name: 'Tourism & Hospitality',
      icon: 'fas fa-umbrella-beach',
      subtitle: 'Languages Option',
      subjects: ['Tourism', 'Hospitality Management', 'French', 'English'],
      careerPath: 'Tour Operator, Hotel Manager, Travel Agent, Event Planner',
      color: '#e74c3c'
    }
  ];

  const departments = [
    { name: 'ICT Department', icon: 'fas fa-laptop-code', hod: 'Mr. Eric Nshimiyimana', teachers: 6, description: 'Programming, networking, database management, and computer maintenance.' },
    { name: 'Economics Department', icon: 'fas fa-chart-line', hod: 'Mme. Jeanne Uwimana', teachers: 5, description: 'Accounting, economics, entrepreneurship, and business studies.' },
    { name: 'Science Department', icon: 'fas fa-flask', hod: 'Dr. Claude Mugenzi', teachers: 8, description: 'Physics, Chemistry, Biology, and Mathematics.' },
    { name: 'Languages Department', icon: 'fas fa-language', hod: 'Mme. Chantal Mukamana', teachers: 5, description: 'English, French, Kinyarwanda, and Literature.' },
    { name: 'Tourism Department', icon: 'fas fa-umbrella-beach', hod: 'Mr. Jean de Dieu', teachers: 4, description: 'Tourism management, hospitality, customer service, and cultural studies.' },
    { name: 'Humanities Department', icon: 'fas fa-heart', hod: 'Mme. Alice Nyirahabimana', teachers: 4, description: 'History, Geography, Religion, and Social Studies.' }
  ];

  const calendarEvents = [
    { month: 'Jan', day: '10', title: 'Term 1 Begins', description: 'Opening ceremony and classes commence' },
    { month: 'Mar', day: '25-30', title: 'Term 1 Exams', description: 'End of term examinations' },
    { month: 'Apr', day: '10', title: 'Term 2 Begins', description: 'Start of second term' },
    { month: 'Jun', day: '20-30', title: 'Term 2 Exams', description: 'Mid-year examinations' },
    { month: 'Jul', day: '15', title: 'Term 3 Begins', description: 'Final term of the academic year' },
    { month: 'Sep', day: '15-30', title: 'National Exams', description: 'S3 & S6 National Examinations' },
    { month: 'Oct', day: '25', title: 'Graduation Day', description: 'Ceremony for S6 graduates' },
    { month: 'Nov', day: '5', title: 'Academic Year Ends', description: 'End of year closure' }
  ];

  const resources = [
    { name: 'School Library', icon: 'fas fa-book', description: 'Over 5,000 books including textbooks, references, fiction, and periodicals.', detail: 'Mon-Fri: 8AM - 5PM' },
    { name: 'Computer Labs', icon: 'fas fa-laptop', description: 'Two modern computer labs with 50+ computers and high-speed internet.', detail: '2 Labs | 50+ PCs' },
    { name: 'Science Labs', icon: 'fas fa-flask', description: 'Fully equipped Physics, Chemistry, and Biology laboratories.', detail: '3 Specialized Labs' },
    { name: 'E-Learning Platform', icon: 'fas fa-wifi', description: 'Access to online resources, digital assignments, and virtual classrooms.', detail: '24/7 Access' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Page Header */}
      <section className="academics-page-header">
        <div className="container">
          <h1><i className="fas fa-graduation-cap"></i> Academics at ESSA</h1>
          <p>Excellence in Education | Diverse Programs | Holistic Development</p>
        </div>
      </section>

      {/* Academic Overview */}
      <section className="academics-overview">
        <div className="container">
          <div className="overview-grid">
            <div className="overview-content">
              <div className="section-badge">Academic Excellence</div>
              <h2>Quality Education <span className="highlight">For Every Student</span></h2>
              <p>At ESSA Nyarugunga, we follow the Rwandan national curriculum enhanced with modern teaching methodologies. Our academic programs are designed to develop critical thinking, problem-solving skills, and practical knowledge.</p>
              <p>We offer both Ordinary Level (S1-S3) and Advanced Level (S4-S6) programs with various combinations to suit different career paths.</p>
              <div className="academic-stats">
                <div className="stat-item">
                  <span className="stat-number">85%</span>
                  <span className="stat-label">Pass Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">6+</span>
                  <span className="stat-label">Programs Offered</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">20+</span>
                  <span className="stat-label">Qualified Teachers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">6:1</span>
                  <span className="stat-label">Student-Teacher Ratio</span>
                </div>
              </div>
            </div>
            <div className="overview-image">
              <img src={fallbackImages.studentsImage} alt="Students in class" />
            </div>
          </div>
        </div>
      </section>

      {/* Academic Levels Tabs */}
      <section className="academics-levels">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-layer-group"></i> Academic Levels</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Choose your path to success</p>
          </div>
          
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'ordinary' ? 'active' : ''}`} onClick={() => setActiveTab('ordinary')}>
              Ordinary Level (S1-S3)
            </button>
            <button className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>
              Advanced Level (S4-S6)
            </button>
          </div>

          {/* Ordinary Level Content */}
          {activeTab === 'ordinary' && (
            <div className="tab-content">
              <div className="level-grid">
                <div className="level-card">
                  <i className="fas fa-book-open"></i>
                  <h3>Core Subjects</h3>
                  <ul>
                    <li><i className="fas fa-check"></i> Mathematics</li>
                    <li><i className="fas fa-check"></i> English Language</li>
                    <li><i className="fas fa-check"></i> French</li>
                    <li><i className="fas fa-check"></i> Kinyarwanda</li>
                    <li><i className="fas fa-check"></i> Sciences (Physics, Chemistry, Biology)</li>
                    <li><i className="fas fa-check"></i> Social Studies</li>
                    <li><i className="fas fa-check"></i> Computer Science</li>
                    <li><i className="fas fa-check"></i> Religion & Ethics</li>
                  </ul>
                </div>
                <div className="level-card">
                  <i className="fas fa-chart-line"></i>
                  <h3>Electives</h3>
                  <ul>
                    <li><i className="fas fa-check"></i> Entrepreneurship</li>
                    <li><i className="fas fa-check"></i> Art & Design</li>
                    <li><i className="fas fa-check"></i> Music</li>
                    <li><i className="fas fa-check"></i> Physical Education</li>
                    <li><i className="fas fa-check"></i> Agriculture</li>
                    <li><i className="fas fa-check"></i> Home Economics</li>
                  </ul>
                </div>
                <div className="level-card">
                  <i className="fas fa-clock"></i>
                  <h3>Assessment</h3>
                  <ul>
                    <li><i className="fas fa-check"></i> Continuous Assessment (30%)</li>
                    <li><i className="fas fa-check"></i> Term Exams (30%)</li>
                    <li><i className="fas fa-check"></i> National Exams - S3 (40%)</li>
                    <li><i className="fas fa-check"></i> Projects & Practicals</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Level Content */}
          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="advanced-intro">
                <p>At Advanced Level, students choose combinations based on their career aspirations. Each combination is carefully designed to prepare students for university education and professional careers.</p>
              </div>
              
              <div className="combinations-grid">
                {combinations.map(combo => (
                  <div key={combo.id} className="combination-card" style={{ borderTop: `4px solid ${combo.color}` }}>
                    <div className="combination-icon" style={{ background: combo.color }}>
                      <i className={combo.icon}></i>
                    </div>
                    <h3>{combo.name}</h3>
                    <p className="combination-subtitle">{combo.subtitle}</p>
                    <div className="subjects">
                      <h4>Subjects:</h4>
                      <ul>
                        {combo.subjects.map((subject, idx) => (
                          <li key={idx}>{subject}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="career-path">
                      <h4>Career Path:</h4>
                      <p>{combo.careerPath}</p>
                    </div>
                    <button className="learn-more" onClick={() => handleLearnMore(combo.name)}>
                      Learn More <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Academic Departments */}
      <section className="academics-departments">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-building"></i> Academic Departments</h2>
            <div className="underline"></div>
          </div>
          <div className="departments-grid">
            {departments.map((dept, index) => (
              <div key={index} className="dept-card">
                <i className={dept.icon}></i>
                <h3>{dept.name}</h3>
                <p>{dept.description}</p>
                <div className="dept-staff">
                  <span><i className="fas fa-user-tie"></i> HOD: {dept.hod}</span>
                  <span><i className="fas fa-chalkboard-user"></i> {dept.teachers} Teachers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="academics-calendar">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-calendar-alt"></i> Academic Calendar 2026</h2>
            <div className="underline"></div>
          </div>
          <div className="calendar-grid">
            {calendarEvents.map((event, index) => (
              <div key={index} className="calendar-item">
                <div className="calendar-date">
                  <span className="month">{event.month}</span>
                  <span className="day">{event.day}</span>
                </div>
                <div className="calendar-event">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="calendar-note">
            <i className="fas fa-info-circle"></i>
            <p>Dates are subject to change. Parents and students will be notified of any changes.</p>
          </div>
        </div>
      </section>

      {/* Grading System */}
      <section className="academics-grading">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-chart-simple"></i> Grading System</h2>
            <div className="underline"></div>
          </div>
          <div className="grading-grid">
            <div className="grading-card">
              <h3>Secondary Level (S1-S3)</h3>
              <table className="grading-table">
                <thead>
                  <tr><th>Grade</th><th>Percentage</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>A</td><td>80-100%</td><td>Excellent</td></tr>
                  <tr><td>B</td><td>70-79%</td><td>Very Good</td></tr>
                  <tr><td>C</td><td>60-69%</td><td>Good</td></tr>
                  <tr><td>D</td><td>50-59%</td><td>Satisfactory</td></tr>
                  <tr><td>E</td><td>40-49%</td><td>Pass</td></tr>
                  <tr><td>F</td><td>Below 40%</td><td>Fail</td></tr>
                </tbody>
              </table>
            </div>
            <div className="grading-card">
              <h3>Advanced Level (S4-S6)</h3>
              <table className="grading-table">
                <thead>
                  <tr><th>Grade</th><th>Points</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>A</td><td>6</td><td>Excellent</td></tr>
                  <tr><td>B+</td><td>5</td><td>Very Good</td></tr>
                  <tr><td>B</td><td>4</td><td>Good</td></tr>
                  <tr><td>C</td><td>3</td><td>Satisfactory</td></tr>
                  <tr><td>D</td><td>2</td><td>Pass</td></tr>
                  <tr><td>E</td><td>1</td><td>Marginal Pass</td></tr>
                  <tr><td>F</td><td>0</td><td>Fail</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Library & Resources */}
      <section className="academics-resources">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-book-open"></i> Learning Resources</h2>
            <div className="underline"></div>
          </div>
          <div className="resources-grid">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <i className={resource.icon}></i>
                <h3>{resource.name}</h3>
                <p>{resource.description}</p>
                <span className="resource-hours"><i className="fas fa-clock"></i> {resource.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Support */}
      <section className="academics-support">
        <div className="container">
          <div className="support-box">
            <div className="support-icon">
              <i className="fas fa-chalkboard-user"></i>
            </div>
            <div className="support-content">
              <h3>Academic Support & Remedial Classes</h3>
              <p>We offer extra classes, tutoring, and academic counseling to ensure every student succeeds. Remedial programs are available for students who need additional support in any subject.</p>
              <div className="support-features">
                <span><i className="fas fa-clock"></i> After-school Tutoring</span>
                <span><i className="fas fa-users"></i> Peer Mentoring</span>
                <span><i className="fas fa-chart-line"></i> Progress Tracking</span>
                <span><i className="fas fa-calendar"></i> Saturday Classes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AcademicsPage;