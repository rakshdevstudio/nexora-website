import { useState, useEffect, useRef } from 'react';
import '@/App.css';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Menu, X, ChevronRight, ArrowRight, Check, Send, CheckCircle } from 'lucide-react';

import nexoraLogo from "./assets/Nexora transparent.PNG";

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : process.env.REACT_APP_BACKEND_URL;

const API = `${BACKEND_URL}/api`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  // --- Admin state ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('dev-admin-token');
  const [adminData, setAdminData] = useState({
    contacts: [],
    inquiries: [],
    stats: null
  });
  // --- Admin: status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // --- Enterprise drill-down: selected contact state
  const [selectedContact, setSelectedContact] = useState(null);
  // --- Admin: internal notes state
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  // --- Admin: notes saved visual state
  const [notesSaved, setNotesSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  // --- Admin filters and search ---
  const [contactFilter, setContactFilter] = useState("new");
  const [contactSearch, setContactSearch] = useState("");
  // --- Admin filtered contacts (scalable pattern) ---
  const filteredContacts = adminData.contacts
    .filter((c) => (contactFilter === "all" ? true : (c.status || "new") === contactFilter))
    .filter((c) =>
      `${c.name} ${c.email}`.toLowerCase().includes(contactSearch.toLowerCase())
    );
  const [showContactModal, setShowContactModal] = useState(false);
  const scrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const [formData, setFormData] = useState({
  industry: '',
  business_type: '',
  name: '',
  city: '',
  country_code: '+1',
  phone: '',
  email: '',
  message: ''
});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --- Detect /admin route ---
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdmin(true);
      document.body.classList.add('admin-mode');
    }
  }, []);

  // --- Auto-load admin data when token is present ---
  useEffect(() => {
    if (isAdmin && adminToken) {
      loadAdminData();
    }
  }, [isAdmin]);

  // --- Admin data loader ---
  const loadAdminData = async () => {
    if (!adminToken) {
      alert("Please enter admin token");
      return;
    }
    console.log("Admin API base:", API);
    try {
      const [contacts, inquiries, stats] = await Promise.all([
        axios.get(`${API}/admin/contacts?admin_token=${adminToken}`),
        axios.get(`${API}/admin/service-inquiries?admin_token=${adminToken}`),
        axios.get(`${API}/admin/stats?admin_token=${adminToken}`)
      ]);

      setAdminData({
        contacts: contacts.data.map((c) => ({
          ...c,
          status: c.status || "new"
          // notes field is preserved if provided by backend
        })),
        inquiries: inquiries.data,
        stats: stats.data
      });
    } catch (err) {
      console.error("Admin API error:", err);
      alert("Admin login failed. Check token and backend connection.");
    }
  };
  // --- Sync internal notes when a contact is selected ---
  useEffect(() => {
    if (selectedContact) {
      setInternalNotes(selectedContact.notes || "");
      setNotesSaved(false);
      setLastSavedAt(null);
    }
  }, [selectedContact]);

  // --- Admin: Update contact status ---
  const updateContactStatus = async (contactId, nextStatus) => {
    if (!contactId) return;

    try {
      setUpdatingStatus(true);

      await axios.post(
        `${API}/admin/contacts/${contactId}/status`,
        { status: nextStatus },
        { params: { admin_token: adminToken } }
      );

      // Update list immediately
      setAdminData((prev) => ({
        ...prev,
        contacts: prev.contacts.map((c) =>
          c.id === contactId ? { ...c, status: nextStatus } : c
        )
      }));

      // Update open detail panel
      setSelectedContact((prev) =>
        prev ? { ...prev, status: nextStatus } : prev
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please retry.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    console.log("Using backend:", BACKEND_URL);
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120,
      delay: 50
    });

    // --- Enhanced scroll observer ---
    const lastScrollY = { current: window.scrollY };
    const lastTime = { current: Date.now() };

    const handleScroll = () => {
      if (tickingRef.current) return;

      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        // Scroll-started signal (for cinematic UI fades)
        if (currentY > 50) {
          document.body.classList.add('scroll-started');
        } else {
          document.body.classList.remove('scroll-started');
        }
        scrollYRef.current = currentY;

        const now = Date.now();
        const deltaY = Math.abs(currentY - lastScrollY.current);
        const deltaTime = now - lastTime.current;
        const speed = deltaTime > 0 ? deltaY / deltaTime : 0;

        if (speed > 1.2) {
          document.body.classList.add('scroll-fast');
          document.body.classList.remove('scroll-slow');
        } else {
          document.body.classList.add('scroll-slow');
          document.body.classList.remove('scroll-fast');
        }

        const nav = document.querySelector('[data-nav]');
if (nav) {
  if (currentY > 24) {
    nav.classList.add('nav-elevated');
  } else {
    nav.classList.remove('nav-elevated');
  }

  if (speed > 1.2) {
    nav.classList.add('nav-compressed');
  } else {
    nav.classList.remove('nav-compressed');
  }
}

        const parallaxOffset = Math.min(currentY * 0.015, 2);
        document.documentElement.style.setProperty(
          '--hero-parallax',
          `${parallaxOffset}px`
        );

        lastScrollY.current = currentY;
        lastTime.current = now;
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

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

  // --- Low-frequency hero title sharpening effect ---
  useEffect(() => {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    const interval = setInterval(() => {
      if (scrollYRef.current > 40) {
        title.classList.add('hero-title-sharpened');
      } else {
        title.classList.remove('hero-title-sharpened');
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // --- Hero exit awareness (nav + dim) ---
  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const exited = !entry.isIntersecting;
        document.body.classList.toggle('hero-exited', exited);
        document.body.classList.toggle('nav-solid', exited);
      },
      { threshold: 0.15 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
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
      await axios.post(
        `${API}/contact`,
        {
          industry: formData.industry,
          business_type: formData.business_type,
          name: formData.name,
          city: formData.city,
          email: formData.email,
          message: formData.message,
          phone: `${formData.country_code} ${formData.phone}`
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setSubmitStatus('success');
      setFormData({
        industry: '',
        business_type: '',
        name: '',
        city: '',
        country_code: '+1',
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
    <>
      {isAdmin && (
        <div className="admin-container">
          {!adminData.stats ? (
            <div className="admin-login">
              <h2>Admin Access</h2>
              <input
                type="password"
                placeholder="Admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
              <button className="btn-primary" onClick={loadAdminData}>
                Enter
              </button>
            </div>
          ) : (
            <>
              {/* LEFT COLUMN */}
              <div className="admin-dashboard">
                <h1>Nexora Admin</h1>

                <div className="admin-stats">
                  <div>Total Contacts: <strong>{adminData.stats?.contacts ?? 0}</strong></div>
                  <div>Service Inquiries: <strong>{adminData.stats?.service_inquiries ?? 0}</strong></div>
                  <div>Subscribers: <strong>{adminData.stats?.newsletter ?? 0}</strong></div>
                </div>

                <h3>Contacts</h3>

                <div className="admin-status-tabs">
                  {["new", "contacted", "qualified", "archived"].map((status) => (
                    <div
                      key={status}
                      className={`admin-status-tab ${contactFilter === status ? "active" : ""}`}
                      onClick={() => setContactFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  ))}
                </div>

                <div className="admin-search">
                  <input
                    type="search"
                    placeholder="Search by name or email…"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                  />
                </div>

                {adminData.contacts.length === 0 && (
                  <div className="admin-empty">
                    No contacts yet. New submissions will appear here.
                  </div>
                )}

                <div className="admin-table">
                  {filteredContacts.map((c) => (
                    <div
                      key={c.id}
                      className={`admin-row ${selectedContact?.id === c.id ? 'active' : ''}`}
                      onClick={() =>
                        setSelectedContact((prev) =>
                          prev && prev.id === c.id ? null : c
                        )
                      }
                    >
                      <div className="admin-row-main">
                        <strong>{c.name}</strong>
                        <span className="admin-contact-email">{c.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div
                className={`admin-detail-panel ${
                  selectedContact ? '' : 'is-collapsed'
                }`}
              >
                {selectedContact && (
                  <>
                    <div className="admin-detail-header">
                      <div>
                        <h2>{selectedContact.name}</h2>
                        <p className="admin-detail-email">{selectedContact.email}</p>
                      </div>

                      <div className="admin-status-control">
                        <label>Status</label>
                        <select
                          value={selectedContact.status || "new"}
                          disabled={updatingStatus}
                          onChange={(e) =>
                            updateContactStatus(selectedContact.id, e.target.value)
                          }
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-detail-grid">
                      <div>
                        <label>Industry</label>
                        <div>{selectedContact.industry || "—"}</div>
                      </div>

                      <div>
                        <label>Business Type</label>
                        <div>{selectedContact.business_type || "—"}</div>
                      </div>

                      <div>
                        <label>City</label>
                        <div>{selectedContact.city || "—"}</div>
                      </div>

                      <div>
                        <label>Phone</label>
                        <div>{selectedContact.phone && selectedContact.phone !== "undefined"
                          ? selectedContact.phone
                          : "—"}</div>
                      </div>
                    </div>

                    <div className="admin-detail-message">
                      <label>Message</label>
                      <p>{selectedContact.message || "No message provided."}</p>
                    </div>
                    <div className="admin-internal-notes">
                      <label>Internal Notes</label>

                      <textarea
                        placeholder="Add private notes for internal tracking…"
                        value={internalNotes}
                        onChange={(e) => {
                          setInternalNotes(e.target.value);
                          setNotesSaved(false);
                        }}
                      />
                      {notesSaved && (
                        <div className="notes-confirmation">
                          Notes saved successfully.
                        </div>
                      )}

                      <div className="notes-actions">
                        {notesSaved && lastSavedAt && (
                          <span className="notes-saved-indicator">
                            Saved ✓ <em>{lastSavedAt.toLocaleTimeString()}</em>
                          </span>
                        )}
                        <button
                          className={`notes-save-btn ${notesSaved ? 'saved' : ''}`}
                          onClick={async () => {
                            if (!selectedContact?.id) return;
                            try {
                              setSavingNotes(true);

                              await axios.post(
                                `${API}/admin/contacts/${selectedContact.id}/notes`,
                                { notes: internalNotes },
                                { params: { admin_token: adminToken } }
                              );
                              setSelectedContact((prev) =>
                                prev ? { ...prev, notes: internalNotes } : prev
                              );
                              setAdminData((prev) => ({
                                ...prev,
                                contacts: prev.contacts.map((c) =>
                                  c.id === selectedContact.id ? { ...c, notes: internalNotes } : c
                                )
                              }));
                              setNotesSaved(true);
                              setLastSavedAt(new Date());
                              setTimeout(() => {
                                setNotesSaved(false);
                              }, 2000);
                            } catch (e) {
                              alert("Failed to save notes");
                            } finally {
                              setSavingNotes(false);
                            }
                          }}
                          disabled={savingNotes}
                        >
                          {savingNotes ? "Saving…" : notesSaved ? "Saved" : "Save Notes"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {!isAdmin && (
        <div className="app-container">
          <div className="custom-cursor"></div>
          <div className="custom-cursor-ring"></div>
          {/* Navigation */}
          <nav className="nav-bar" data-nav>
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
        <div className="hero-background"></div>
        {/* Background wordmark */}
        <div className="hero-wordmark" aria-hidden="true">
          INTELLIGENCE&nbsp;REIMAGINED
        </div>

        <div className="hero-content">
          {/* Authority badge */}
          

          {/* Headline */}
          <h1 className="hero-title">
            <span style={{ animationDelay: "0.1s" }}>Enterprise</span>{" "}
            <span
              className="nexora-emphasis"
              style={{ animationDelay: "0.25s" }}
            >
              Intelligence.
            </span>{" "}
            <span
              className="nexora-emphasis"
              style={{ animationDelay: "0.4s" }}
            >
              Engineered
            </span>{" "}
            <span style={{ animationDelay: "0.55s" }}>to last</span>
          </h1>

          {/* Subheadline */}
          <p className="hero-subtitle">
            Nexora is an AI-first, full-stack technology company designing and engineering
            production-grade systems built to scale.
          </p>

          <p className="hero-clarifier">
  AI systems, full-stack platforms, and digital infrastructure — <strong>built for real-world scale</strong>.
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
          {/* Scroll indicator */}
          <div className="hero-scroll-indicator" aria-hidden="true">
            <div className="scroll-label">Scroll</div>
            <div className="scroll-line" />
          </div>
        </div>

        {/* Proof points */}
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">99.9% Uptime</div>
            <div className="stat-label">Production reliability</div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-value">Enterprise-grade</div>
            <div className="stat-label">Security & compliance</div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-value">AI‑Native</div>
            <div className="stat-label">System architecture</div>
          </div>
        </div>
        {/* Cinematic glow curve (visual only, no layout spacing) */}
        <div className="hero-glow-curve hero-glow-curve-inside" />
      </section>

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
                We build AI systems that work reliably in real production — helping teams automate decisions, improve outcomes, and scale intelligence across the organization.
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
              <p className="service-description">
                We design and build complete software systems that are fast, secure, and built to scale with real users and real demand.
              </p>
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
              <p className="service-description">
                High‑quality mobile applications that bring intelligent experiences directly to users, built for reliability and performance.
              </p>
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
              <p className="service-description">
                Resilient cloud infrastructure and deployment systems that keep your products secure, scalable, and always available.
              </p>
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

      {/* Soft Mid-Page CTA */}
      <section className="section-container section-soft-cta">
        <div className="section-content soft-cta-content">
          <h3 className="soft-cta-title">Talk to an architect</h3>
          <p className="soft-cta-subtitle">
            No sales. Just a technical conversation about your systems, constraints, and goals.
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="btn-secondary"
          >
            Start a technical conversation 
          </button>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-container" data-testid="tech-stack-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Technology foundation</h2>
            <p className="section-subtitle">Built with industry-leading tools and frameworks</p>
          </div>
        <div className="tech-stack-wrapper">
          <div className="tech-stack-grid">
            {[
              'React',
              'Node.js',
              'Python',
              'TypeScript',
              'MongoDB',
              'PostgreSQL',
              'AWS',
              'Docker',
              'Kubernetes',
              'OpenAI',
              'TensorFlow',
              'Next.js',
              // duplicate for infinite loop
              'React',
              'Node.js',
              'Python',
              'TypeScript',
              'MongoDB',
              'PostgreSQL',
              'AWS',
              'Docker',
              'Kubernetes',
              'OpenAI',
              'TensorFlow',
              'Next.js'
            ].map((tech, index) => (
              <div key={index} className="tech-item">{tech}</div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-container section-dark" data-testid="process-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Our approach</h2>
            <p className="section-subtitle">A disciplined method for building systems that last</p>
          </div>

          <div className="process-timeline">
            <div className="process-step" data-aos="fade-up" data-aos-delay="0">
              <div className="process-number">01</div>
              <div className="process-content">
                <h3 className="process-title">Discovery & Alignment</h3>
                <p className="process-text">
                  We work closely with leadership and technical teams to understand goals, constraints, and success criteria—before a single decision is made.
                </p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="100">
              <div className="process-number">02</div>
              <div className="process-content">
                <h3 className="process-title">Architecture & Design</h3>
                <p className="process-text">
                  We design secure, scalable system architectures with a clear technical roadmap—built for long-term reliability, not short-term demos.
                </p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="200">
              <div className="process-number">03</div>
              <div className="process-content">
                <h3 className="process-title">Engineering & Testing</h3>
                <p className="process-text">
                  Focused, iterative development with rigorous testing, continuous integration, and transparent progress at every stage.
                </p>
              </div>
            </div>

            <div className="process-step" data-aos="fade-up" data-aos-delay="300">
              <div className="process-number">04</div>
              <div className="process-content">
                <h3 className="process-title">Deployment & Scale</h3>
                <p className="process-text">
                  Production deployment followed by monitoring, optimization, and long-term partnership as systems scale and mature.
                </p>
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
            <p className="section-subtitle">Where mission‑critical systems meet real‑world scale</p>
          </div>

          <div className="clients-grid">
            {[
              {
                name: 'IntelliHealth AI',
                industry: 'Healthcare Technology',
                description: 'AI‑driven diagnostic infrastructure supporting clinical decisions at scale — processing over 50,000 patient assessments daily with enterprise‑grade reliability.',
              },
              {
                name: 'FinFlow Systems',
                industry: 'Financial Technology',
                description: 'High‑performance financial intelligence platform delivering real‑time insights across more than $2B in transaction volume — engineered for speed, accuracy, and zero downtime.',
              },
              {
                name: 'CloudScale Innovations',
                industry: 'Cloud Infrastructure',
                description: 'Global multi‑cloud orchestration system managing over 10 million containers — designed for resilience, security, and continuous operation at massive scale.',
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
                "Nexora brought a level of technical depth and strategic clarity that fundamentally changed how we deploy AI in healthcare. Their systems operate reliably at a scale we previously thought was unrealistic."
              </p>
              <div className="testimonial-author">
                <div className="author-name">Dr. Sarah Mitchell</div>
                <div className="author-title">CTO, IntelliHealth AI</div>
              </div>
            </div>

            <div className="testimonial" data-aos="fade-up" data-aos-delay="100">
              <p className="testimonial-text">
                "Nexora engineered infrastructure we trust with our most critical financial operations. The system runs with zero downtime and a level of reliability that is exceptionally difficult to achieve."
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
      <section
        className="section-container cta-section"
        data-aos="fade-up"
        data-testid="cta-section"
      >
        <div className="cta-content">
          <h2 className="cta-title">
  Ready to build{" "}
  <span className="cta-emphasis">systems that last?</span>
</h2>
          <p className="cta-text">
            We design and engineer AI-native, full-stack systems — from intelligent backends to production-ready web and mobile experiences — built for scale, security, and long-term reliability.
          </p>
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
              <p className="footer-tagline">Intelligence Reimagined</p>
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

  <div className="phone-input-group">
    <select
      name="country_code"
      value={formData.country_code}
      onChange={handleInputChange}
      className="country-code-select"
      required
    >
      <option value="+1">🇺🇸 +1 (USA)</option>
      <option value="+44">🇬🇧 +44 (UK)</option>
      <option value="+91">🇮🇳 +91 (India)</option>
      <option value="+61">🇦🇺 +61 (Australia)</option>
      <option value="+49">🇩🇪 +49 (Germany)</option>
      <option value="+33">🇫🇷 +33 (France)</option>
      <option value="+971">🇦🇪 +971 (UAE)</option>
      <option value="+65">🇸🇬 +65 (Singapore)</option>
      <option value="+81">🇯🇵 +81 (Japan)</option>
    </select>

    <input
      type="tel"
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      required
      className="form-input phone-number-input"
      placeholder="Phone number"
    />
  </div>
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
      )}
    </>
  );
}

export default App;