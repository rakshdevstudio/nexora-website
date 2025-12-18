import { useState, useEffect, useRef } from 'react';
import '@/App.css';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Menu, X, ChevronRight, ArrowRight, Check, Send, CheckCircle } from 'lucide-react';

import nexoraLogo from "./assets/Nexora transparent.PNG";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    industry: '',
    business_type: '',
    name: '',
    city: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120,
      delay: 50
    });

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Cursor follow logic
    const cursor = document.querySelector('.custom-cursor');
    const ring = document.querySelector('.custom-cursor-ring');

    const moveCursor = (e) => {
      if (!cursor || !ring) return;
      const { clientX, clientY } = e;
      cursor.style.left = `${clientX}px`;
      cursor.style.top = `${clientY}px`;
      ring.style.left = `${clientX}px`;
      ring.style.top = `${clientY}px`;
    };

    window.addEventListener('mousemove', moveCursor);

    // Magnetic CTA logic (desktop only)
    const magneticButtons = document.querySelectorAll('.btn-primary');

    const handleMagneticMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const moveX = Math.max(-2, Math.min(2, x * 0.05));
      const moveY = Math.max(-2, Math.min(2, y * 0.05));

      e.currentTarget.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    const resetMagnetic = (e) => {
      e.currentTarget.style.transform = 'translate(0, 0)';
    };

    if (window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024) {
      magneticButtons.forEach((btn) => {
        btn.classList.add('magnetic');
        btn.addEventListener('mousemove', handleMagneticMove);
        btn.addEventListener('mouseleave', resetMagnetic);
      });
    }

    // Test API connection
    if (process.env.NODE_ENV === "production" && BACKEND_URL) {
      axios.get(`${API}/`)
        .then(res => console.log('API Connected:', res.data.message))
        .catch(err => console.error('API Connection Error:', err));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', moveCursor);
      // Magnetic CTA cleanup
      magneticButtons.forEach((btn) => {
        btn.removeEventListener('mousemove', handleMagneticMove);
        btn.removeEventListener('mouseleave', resetMagnetic);
      });
    };
  }, []);

  // === Global click glow effect ===
  useEffect(() => {
    const handleClickGlow = (e) => {
      const glow = document.createElement("span");
      glow.className = "click-glow";
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;

      document.body.appendChild(glow);

      setTimeout(() => {
        glow.remove();
      }, 700);
    };

    document.addEventListener("click", handleClickGlow);
    return () => document.removeEventListener("click", handleClickGlow);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitStatus('success');
      setFormData({
        industry: '',
        business_type: '',
        name: '',
        city: '',
        phone: '',
        email: '',
        message: ''
      });
      setTimeout(() => {
        setShowContactModal(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="app-container">
      <div className="custom-cursor"></div>
      <div className="custom-cursor-ring"></div>
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-content">
          <div className="nav-logo">
            <img
              src={nexoraLogo}
              alt="Nexora"
              className="nav-logo-image"
            />
          </div>
          
          {/* Desktop Menu */}
          <div className="nav-menu-desktop">
            <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
            <button onClick={() => scrollToSection('services')} className="nav-link">Services</button>
            <button onClick={() => scrollToSection('process')} className="nav-link">Process</button>
            <button onClick={() => scrollToSection('clients')} className="nav-link">Clients</button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="nav-cta"
              data-testid="nav-contact-button"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="nav-mobile-toggle" data-testid="mobile-menu-button">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="nav-menu-mobile" data-testid="mobile-menu">
            <button onClick={() => scrollToSection('about')} className="nav-mobile-link">About</button>
            <button onClick={() => scrollToSection('services')} className="nav-mobile-link">Services</button>
            <button onClick={() => scrollToSection('process')} className="nav-mobile-link">Process</button>
            <button onClick={() => scrollToSection('clients')} className="nav-mobile-link">Clients</button>
            <button onClick={() => setShowContactModal(true)} className="nav-mobile-cta">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="hero-light-layer" />
        <div className="hero-light-layer hero-light-layer-secondary" />
        {/* Background with subtle depth */}
        <div
          className="hero-background"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        {/* Background wordmark */}
        <div
          className="hero-wordmark"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          aria-hidden="true"
        >
          INTELLIGENCE&nbsp;REIMAGINED
        </div>

        <div className="hero-content">
          {/* Authority badge */}
          

          {/* Headline */}
          <h1
            className={`hero-title ${scrollY > 40 ? "hero-title-sharpened" : ""}`}
          >
            <span style={{ animationDelay: "0.1s" }}>Enterprise</span>{" "}
            <span
              className="nexora-emphasis"
              style={{ animationDelay: "0.25s" }}
            >
              intelligence,
            </span>{" "}
            <span
              className="nexora-emphasis"
              style={{ animationDelay: "0.4s" }}
            >
              engineered
            </span>{" "}
            <span style={{ animationDelay: "0.55s" }}>to last</span>
          </h1>

          {/* Subheadline */}
          <p className="hero-subtitle">
            Nexora designs and builds AI-native systems for organizations
            where reliability, scale, and precision are non‑negotiable.
          </p>

          {/* Primary actions */}
          <div className="hero-actions">
            <button
              onClick={() => setShowContactModal(true)}
              className="btn-primary"
              data-testid="hero-get-started-button"
            >
              Start a conversation
              <ArrowRight className="btn-icon" />
            </button>

            <button
              onClick={() => scrollToSection('services')}
              className="btn-secondary"
              data-testid="hero-learn-more-button"
            >
              Explore capabilities
            </button>
          </div>
        </div>

        {/* Proof points */}
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Production uptime</div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-value">Enterprise</div>
            <div className="stat-label">Security standards</div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-value">AI‑Native</div>
            <div className="stat-label">System architecture</div>
          </div>
        </div>
      </section>

      {/* Cinematic glow curve between hero stats and next section */}
      <div className="hero-glow-curve" />

      {/* About Section */}
      <section id="about" className="section-container" data-testid="about-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Built for the future of work</h2>
            <p className="section-subtitle">We architect intelligent systems that scale with your ambition</p>
          </div>

          <div className="about-grid">
            <div className="about-card" data-aos="fade-up" data-aos-delay="0">
              <div className="about-card-number">01</div>
              <h3 className="about-card-title">AI‑Native Foundations</h3>
              <p className="about-card-text">
                We design systems with intelligence built in from day one — not added later.
                This allows your products to think, learn, and adapt as they grow.
              </p>
            </div>

            <div className="about-card" data-aos="fade-up" data-aos-delay="100">
              <div className="about-card-number">02</div>
              <h3 className="about-card-title">Business‑First Engineering</h3>
              <p className="about-card-text">
                Every technical decision is tied to real business outcomes.
                We translate strategy into systems that drive efficiency, revenue, and long‑term advantage.
              </p>
            </div>

            <div className="about-card" data-aos="fade-up" data-aos-delay="200">
              <div className="about-card-number">03</div>
              <h3 className="about-card-title">Digital Systems & Experiences</h3>
              <p className="about-card-text">
                From high‑performance websites to internal platforms, we build fast,
                intuitive digital systems that feel effortless to use and scale cleanly.
              </p>
            </div>

            <div className="about-card" data-aos="fade-up" data-aos-delay="300">
              <div className="about-card-number">04</div>
              <h3 className="about-card-title">AI Agents & Automation</h3>
              <p className="about-card-text">
                We create intelligent agents that automate workflows, support teams,
                and make complex operations simpler, faster, and more reliable.
              </p>
            </div>

            <div className="about-card" data-aos="fade-up" data-aos-delay="400">
              <div className="about-card-number">05</div>
              <h3 className="about-card-title">Scalable System Architecture</h3>
              <p className="about-card-text">
                Our systems are built to handle growth, traffic, and data without breaking.
                Secure, resilient architecture ensures performance under real‑world pressure.
              </p>
            </div>

            <div className="about-card" data-aos="fade-up" data-aos-delay="500">
              <div className="about-card-number">06</div>
              <h3 className="about-card-title">Long‑Term Partnership</h3>
              <p className="about-card-text">
                We don’t just ship and disappear.
                Nexora works as an ongoing engineering partner, helping you evolve as your business grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-container section-dark" data-testid="services-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Core capabilities</h2>
            <p className="section-subtitle">End-to-end solutions for intelligent systems</p>
          </div>

          <div className="services-grid">
            <div className="service-card service-card-featured" data-aos="fade-up" data-aos-delay="0">
              <h3 className="service-title">AI & Machine Learning</h3>
              <p className="service-eyebrow">Flagship capability</p>
              <p className="service-description">
                Design and deployment of AI systems that operate in real production
                environments — from strategy to models to infrastructure.
              </p>
              <ul className="service-features">
                <li><Check className="feature-check" />Large Language Model Integration</li>
                <li><Check className="feature-check" />Predictive Analytics & Forecasting</li>
                <li><Check className="feature-check" />Computer Vision & NLP</li>
                <li><Check className="feature-check" />Intelligent Process Automation</li>
              </ul>
              <button onClick={() => setShowContactModal(true)} className="service-link" data-testid="ai-service-button">
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="service-card" data-aos="fade-up" data-aos-delay="100">
              <h3 className="service-title">Full-Stack Engineering</h3>
              <p className="service-description">Enterprise-grade applications built for performance, security, and scale.</p>
              <ul className="service-features">
                <li><Check className="feature-check" />Cloud-Native Architecture</li>
                <li><Check className="feature-check" />API Design & Integration</li>
                <li><Check className="feature-check" />Real-Time Data Systems</li>
                <li><Check className="feature-check" />Microservices & Orchestration</li>
              </ul>
              <button onClick={() => setShowContactModal(true)} className="service-link" data-testid="web-service-button">
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="service-card" data-aos="fade-up" data-aos-delay="200">
              <h3 className="service-title">Mobile Platforms</h3>
              <p className="service-description">Native experiences that bring intelligent capabilities to every device.</p>
              <ul className="service-features">
                <li><Check className="feature-check" />iOS & Android Development</li>
                <li><Check className="feature-check" />Cross-Platform Solutions</li>
                <li><Check className="feature-check" />Offline-First Architecture</li>
                <li><Check className="feature-check" />App Store Optimization</li>
              </ul>
              <button onClick={() => setShowContactModal(true)} className="service-link" data-testid="mobile-service-button">
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="service-card" data-aos="fade-up" data-aos-delay="300">
              <h3 className="service-title">Infrastructure & DevOps</h3>
              <p className="service-description">Reliable, scalable infrastructure that grows with your organization.</p>
              <ul className="service-features">
                <li><Check className="feature-check" />Cloud Architecture (AWS, Azure, GCP)</li>
                <li><Check className="feature-check" />Kubernetes & Container Orchestration</li>
                <li><Check className="feature-check" />CI/CD Pipeline Design</li>
                <li><Check className="feature-check" />Security & Compliance</li>
              </ul>
              <button onClick={() => setShowContactModal(true)} className="service-link" data-testid="cloud-service-button">
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-container" data-testid="tech-stack-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Technology foundation</h2>
            <p className="section-subtitle">Built with industry-leading tools and frameworks</p>
          </div>

          <div className="tech-stack-grid">
            {['React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'OpenAI', 'TensorFlow', 'Next.js'].map((tech, index) => (
              <div key={index} className="tech-item">{tech}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-container section-dark" data-testid="process-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Our approach</h2>
            <p className="section-subtitle">A proven methodology for delivering intelligent systems</p>
          </div>

          <div className="process-timeline">
            <div className="process-step" data-aos="fade-up" data-aos-delay="0">
              <div className="process-number">01</div>
              <div className="process-content">
                <h3 className="process-title">Discovery & Strategy</h3>
                <p className="process-text">Deep technical and business assessment to align on objectives, constraints, and success metrics.</p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="100">
              <div className="process-number">02</div>
              <div className="process-content">
                <h3 className="process-title">Architecture & Design</h3>
                <p className="process-text">System design with focus on scalability, security, and maintainability. Technical specifications and roadmap.</p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="200">
              <div className="process-number">03</div>
              <div className="process-content">
                <h3 className="process-title">Engineering & Testing</h3>
                <p className="process-text">Agile development with continuous integration, comprehensive testing, and regular stakeholder reviews.</p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="300">
              <div className="process-number">04</div>
              <div className="process-content">
                <h3 className="process-title">Deployment & Scale</h3>
                <p className="process-text">Production launch with monitoring, optimization, and ongoing partnership to ensure continued success.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="section-container" data-testid="clients-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Trusted by industry leaders</h2>
            <p className="section-subtitle">Delivering impact across sectors</p>
          </div>

          <div className="clients-grid">
            {[
              {
                name: 'IntelliHealth AI',
                industry: 'Healthcare Technology',
                description: 'AI-powered diagnostic platform processing 50K+ patient assessments daily with 99.9% accuracy.',
              },
              {
                name: 'FinFlow Systems',
                industry: 'Financial Technology',
                description: 'Real-time financial analytics infrastructure handling $2B+ in transactions with sub-second latency.',
              },
              {
                name: 'CloudScale Innovations',
                industry: 'Cloud Infrastructure',
                description: 'Multi-cloud orchestration platform managing 10M+ containers across global deployments.',
              }
            ].map((client, index) => (
              <div key={index} className="client-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <h3 className="client-name">{client.name}</h3>
                <div className="client-industry">{client.industry}</div>
                <p className="client-description">{client.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-container section-dark" data-testid="testimonials-section">
        <div className="section-content">
          <div className="testimonials-container">
            <div className="testimonial" data-aos="fade-up">
              <p className="testimonial-text">
                "Nexora's technical depth and strategic thinking transformed how we approach AI in healthcare. Their platform processes millions of patient interactions with reliability we didn't think was possible."
              </p>
              <div className="testimonial-author">
                <div className="author-name">Dr. Sarah Mitchell</div>
                <div className="author-title">CTO, IntelliHealth AI</div>
              </div>
            </div>

            <div className="testimonial" data-aos="fade-up" data-aos-delay="100">
              <p className="testimonial-text">
                "The infrastructure they built handles our most critical financial operations with zero downtime. Nexora operates at a level of engineering excellence that's rare to find."
              </p>
              <div className="testimonial-author">
                <div className="author-name">James Chen</div>
                <div className="author-title">VP Engineering, FinFlow Systems</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-testid="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to build the future?</h2>
          <p className="cta-text">Let's discuss how intelligent systems can transform your organization.</p>
          <button 
            onClick={() => setShowContactModal(true)}
            className="btn-primary btn-large"
            data-testid="cta-button"
          >
            Start a conversation
            <ArrowRight className="btn-icon" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <img
                  src={nexoraLogo}
                  alt="Nexora"
                  className="footer-logo-image"
                />
              </div>
              <p className="footer-tagline">Reimagined Intelligence</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">Capabilities</h4>
                <button onClick={() => scrollToSection('services')} className="footer-link">AI & Machine Learning</button>
                <button onClick={() => scrollToSection('services')} className="footer-link">Full-Stack Engineering</button>
                <button onClick={() => scrollToSection('services')} className="footer-link">Mobile Platforms</button>
                <button onClick={() => scrollToSection('services')} className="footer-link">Infrastructure</button>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Company</h4>
                <button onClick={() => scrollToSection('about')} className="footer-link">About</button>
                <button onClick={() => scrollToSection('clients')} className="footer-link">Case Studies</button>
                <button onClick={() => scrollToSection('process')} className="footer-link">Approach</button>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Contact</h4>
                <div className="footer-contact">hello@nexora.ai</div>
                <div className="footer-contact">San Francisco, CA</div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Nexora. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-backdrop" data-testid="contact-modal">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Start a conversation</h3>
              <button onClick={() => setShowContactModal(false)} className="modal-close" data-testid="close-modal-button">
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="modal-success" data-testid="success-message">
                <CheckCircle className="success-icon" />
                <h4 className="success-title">Message sent</h4>
                <p className="success-text">We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select 
                      name="industry" 
                      value={formData.industry} 
                      onChange={handleInputChange}
                      required
                      className="form-select"
                      data-testid="industry-select"
                    >
                      <option value="">Select</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Type</label>
                    <select 
                      name="business_type" 
                      value={formData.business_type} 
                      onChange={handleInputChange}
                      required
                      className="form-select"
                      data-testid="business-type-select"
                    >
                      <option value="">Select</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Your name"
                      data-testid="name-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Your city"
                      data-testid="city-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Your phone"
                      data-testid="phone-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="your@email.com"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell us about your project"
                    data-testid="message-textarea"
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="form-error" data-testid="error-message">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary btn-full"
                  data-testid="submit-button"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                  {!isSubmitting && <Send className="btn-icon" />}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;