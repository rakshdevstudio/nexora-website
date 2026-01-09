import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Menu, X, ChevronRight, ArrowRight, Check, Send, CheckCircle, Lock } from 'lucide-react';
import nexoraLogo from "../assets/Nexora transparent.PNG";
import '../App.css';

// Lazy-loaded components for non-critical sections
const ArchitectureSection = lazy(() => import('./ArchitectureSection'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const EngagementSection = lazy(() => import('./EngagementSection'));
const Footer = lazy(() => import('./Footer'));

const Home = ({ apiBaseUrl }) => {
    const [menuOpen, setMenuOpen] = useState(false);
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
    // --- Hero cinematic entry control ---
    const [heroReady, setHeroReady] = useState(false);

    // --- Hero initial cinematic delay ---
    useEffect(() => {
        const t = setTimeout(() => setHeroReady(true), 400);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        // Initialize AOS after page content renders (non-critical)
        function initAOS() {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 1000,
                    once: true,
                    easing: 'ease-out-cubic',
                    offset: 120,
                    delay: 50
                });
            }
        }

        // Use requestIdleCallback to load AOS after page renders
        if (window.requestIdleCallback) {
            requestIdleCallback(initAOS, { timeout: 2000 });
        } else {
            // Fallback: wait for DOMContentLoaded or use setTimeout
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(initAOS, 100);
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    setTimeout(initAOS, 100);
                });
            }
        }

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

        // Cursor follow logic (using transform for composited animations)
        const cursor = document.querySelector('.custom-cursor');
        const ring = document.querySelector('.custom-cursor-ring');

        const moveCursor = (e) => {
            if (!cursor || !ring) return;
            const { clientX, clientY } = e;
            // Use CSS custom properties and transform to avoid layout recalculation
            // Store position in CSS variables so hover states can add scale without conflict
            document.documentElement.style.setProperty('--cursor-x', `${clientX}px`);
            document.documentElement.style.setProperty('--cursor-y', `${clientY}px`);
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

        // Note: API check moved to specific calls or kept in App.js init

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
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await axios.post(
                `${apiBaseUrl}/contact`,
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
        <div className="app-container">
            <div className="custom-cursor"></div>
            <div className="custom-cursor-ring"></div>
            {/* Navigation */}
            <header className="nav-bar" data-nav>
                <div className="nav-content">
                    <div className="nav-logo">
                        <img
                            src={nexoraLogo}
                            alt="Nexora - Intelligence Reimagined"
                            className="nav-logo-image"
                            width="160"
                            height="80"
                            loading="eager"
                            decoding="async"
                        />
                    </div>

                    {/* Desktop Menu */}
                    <div className="nav-menu-desktop">
                        <button onClick={() => scrollToSection('about')} className="nav-link">Why Nexora</button>
                        <button onClick={() => scrollToSection('services')} className="nav-link">What We Build</button>
                        <button onClick={() => scrollToSection('process')} className="nav-link">How We Work</button>
                        <button onClick={() => scrollToSection('clients')} className="nav-link">Proof</button>
                        <Link
                            to="/admin"
                            className="nav-admin-link"
                            title="Admin Login"
                        >
                            <Lock className="nav-admin-icon" size={16} />
                            <span className="nav-admin-text">Admin</span>
                        </Link>
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="nav-cta"
                            data-testid="nav-contact-button"
                        >
                            Free Consultation
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
                        <button onClick={() => scrollToSection('about')} className="nav-mobile-link">Why Nexora</button>
                        <button onClick={() => scrollToSection('services')} className="nav-mobile-link">What We Build</button>
                        <button onClick={() => scrollToSection('process')} className="nav-mobile-link">How We Work</button>
                        <button onClick={() => scrollToSection('clients')} className="nav-mobile-link">Proof</button>
                        <Link
                            to="/admin"
                            className="nav-mobile-admin-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            <Lock className="nav-mobile-admin-icon" size={18} />
                            <span>Admin Login</span>
                        </Link>
                        <button onClick={() => setShowContactModal(true)} className="nav-mobile-cta">Free Consultation</button>
                    </div>
                )}
            </header>

            <main id="main-content">
                {/* Hero Section */}
                <section
                    className="hero-section"
                    data-testid="hero-section"
                >
                    <div className="hero-light-layer" />
                    <div className="hero-light-layer hero-light-layer-secondary" />
                    {/* Background with subtle depth */}
                    {/* Background wordmark */}
                    <div className="hero-wordmark" aria-hidden="true">
                        INTELLIGENCE&nbsp;REIMAGINED
                    </div>

                    <div className="hero-content">
                        {/* Authority badge */}
                        {/* Audience anchor */}
                        <div
                            className={`hero-audience-anchor ${heroReady ? 'hero-audience-enter' : ''}`}
                            aria-label="Target audience"
                        >
                            For Founders & Growing Businesses
                            <span></span>
                            High‑performance websites
                        </div>


                        {/* Headline */}
                        <h1 className={`hero-title ${heroReady ? 'hero-title-enter' : ''}`}>
                            <span style={{ animationDelay: "0.1s" }}>High‑performance</span>{" "}
                            <span className="nexora-emphasis" style={{ animationDelay: "0.25s" }}>
                                websites
                            </span>{" "}
                            <span className="nexora-emphasis" style={{ animationDelay: "0.4s" }}>
                                engineered
                            </span>{" "}
                            <span style={{ animationDelay: "0.55s" }}>to convert</span>
                        </h1>

                        {/* Subheadline */}
                        <p className={`hero-subtitle ${heroReady ? 'hero-subtitle-enter' : ''}`}>
                            We design and build fast, scalable, conversion‑focused websites for businesses that care about performance, credibility, and long‑term growth — not templates or throwaway designs.
                        </p>

                        <p className="hero-clarifier">
                            From landing pages and marketing sites to complex web platforms, we build websites that load fast, scale cleanly, and support real business goals.
                        </p>

                        {/* Primary actions */}
                        <div className={`hero-actions ${heroReady ? 'hero-actions-enter' : ''}`}>
                            <button
                                onClick={() => setShowContactModal(true)}
                                className="btn-primary"
                                data-testid="hero-get-started-button"
                            >
                                Get a high‑performance website
                                <ArrowRight className="btn-icon" />
                            </button>

                            <button
                                onClick={() => scrollToSection('services')}
                                className="btn-secondary"
                                data-testid="hero-learn-more-button"
                            >
                                View our approach
                            </button>
                        </div>
                        {/* Credibility strip */}
                        <div
                            className={`hero-trust-strip ${heroReady ? 'hero-trust-enter' : ''}`}
                            aria-label="Trust indicators"
                        >
                            <div className="trust-item">Production‑grade systems</div>
                            <div className="trust-divider" />
                            <div className="trust-item">Enterprise security</div>
                            <div className="trust-divider" />
                            <div className="trust-item">Long‑term architecture</div>
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
                            <h2 className="section-title">What we build</h2>
                            <p className="section-subtitle">Conversion‑focused websites and web platforms built for speed, scale, and credibility</p>
                        </div>

                        <div className="services-grid">
                            <div className="service-card service-card-featured" data-aos="fade-up" data-aos-delay="0">
                                <h3 className="service-title">High‑performance websites</h3>
                                <p className="service-eyebrow">Primary offering</p>
                                <p className="service-description">
                                    We design and engineer fast, conversion‑focused websites for businesses where performance, trust, and scalability directly impact revenue.
                                </p>
                                <ul className="service-features">
                                    <li><Check className="feature-check" />Core Web Vitals & performance optimization</li>
                                    <li><Check className="feature-check" />Conversion‑focused UX & information architecture</li>
                                    <li><Check className="feature-check" />SEO‑ready, scalable frontends</li>
                                    <li><Check className="feature-check" />Production‑grade hosting & deployment</li>
                                </ul>
                                <button onClick={() => setShowContactModal(true)} className="service-link" data-testid="ai-service-button">
                                    Learn more <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="service-card" data-aos="fade-up" data-aos-delay="100">
                                <h3 className="service-title">Web platforms & dashboards</h3>
                                <p className="service-description">
                                    Custom web platforms, internal tools, and dashboards built to support real workflows, real users, and long‑term growth.
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
                                <h3 className="service-title">Progressive web & app‑like experiences</h3>
                                <p className="service-description">
                                    App‑like web experiences designed for speed, reliability, and seamless use across devices — without unnecessary complexity.
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
                                <h3 className="service-title">Website infrastructure & reliability</h3>
                                <p className="service-description">
                                    Secure, scalable infrastructure that keeps your website fast, available, and resilient under real‑world traffic.
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

                {/* Website Proof Section */}
                <section className="website-proof-section" data-testid="website-proof-section">
                    <div className="website-proof-header">
                        <div className="website-proof-eyebrow">Website performance proof</div>
                        <h2 className="website-proof-title">
                            Websites built to convert — and scale
                        </h2>
                        <p className="website-proof-subtitle">
                            Real outcomes from production websites engineered for speed,
                            credibility, and measurable business impact.
                        </p>
                    </div>

                    <div className="website-proof-grid">
                        <div className="website-proof-card" data-aos="fade-up">
                            <div className="proof-metric">‑62%</div>
                            <div className="proof-label">Page load time</div>
                            <p className="proof-description">
                                Reduced average load time from 3.8s to 1.4s by optimizing
                                frontend architecture, assets, and deployment strategy.
                            </p>
                        </div>

                        <div className="website-proof-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="proof-metric">+41%</div>
                            <div className="proof-label">Conversion rate</div>
                            <p className="proof-description">
                                Improved lead conversion through performance tuning,
                                clearer information hierarchy, and UX refinements.
                            </p>
                        </div>

                        <div className="website-proof-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="proof-metric">99.9%</div>
                            <div className="proof-label">Uptime</div>
                            <p className="proof-description">
                                Production-grade hosting and monitoring to ensure reliability
                                under real traffic and campaign spikes.
                            </p>
                        </div>
                    </div>

                    <div className="website-proof-cta">
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="btn-primary"
                            data-testid="website-proof-cta-button"
                        >
                            Get a website performance review
                        </button>
                    </div>
                </section>

                {/* Website FAQ Section */}
                <section className="website-faq-section" data-testid="website-faq-section">
                    <div className="website-faq-header">
                        <div className="website-faq-eyebrow">Website clarity</div>
                        <h2 className="website-faq-title">
                            Common questions before building a website
                        </h2>
                        <p className="website-faq-subtitle">
                            Clear answers to what founders and businesses usually want to know
                            before investing in a high‑performance website.
                        </p>
                    </div>

                    <div className="website-faq-list">
                        <div className="website-faq-item">
                            <h3>How is Nexora different from typical web agencies?</h3>
                            <p>
                                We engineer websites like production systems — focusing on
                                performance, scalability, security, and long‑term maintainability,
                                not just visual design.
                            </p>
                        </div>

                        <div className="website-faq-item">
                            <h3>Do you work with existing websites or only new builds?</h3>
                            <p>
                                Both. We frequently redesign, optimize, and re‑architect existing
                                websites to improve speed, conversion, and reliability.
                            </p>
                        </div>

                        <div className="website-faq-item">
                            <h3>Will my website be SEO‑friendly?</h3>
                            <p>
                                Yes. Every website is built with clean architecture, fast load
                                times, and SEO‑ready structure aligned with modern search best
                                practices.
                            </p>
                        </div>

                        <div className="website-faq-item">
                            <h3>What happens after the website is launched?</h3>
                            <p>
                                We don't disappear after launch. We support iteration,
                                performance monitoring, and future enhancements as your business
                                grows.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Soft Mid-Page CTA */}
                <section className="section-container section-soft-cta">
                    <div className="section-content soft-cta-content">
                        <h2 className="soft-cta-title">Speak with a senior engineer</h2>
                        <p className="soft-cta-subtitle">
                            No sales pitch. Just a focused discussion on feasibility, risks, and system direction.
                        </p>
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="btn-secondary"
                        >
                            Schedule a free consultation
                        </button>
                    </div>
                </section>
                {/* System Architecture & Tech Stack - Lazy Loaded */}
                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                    <ArchitectureSection />
                </Suspense>

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

                {/* Execution Proof Section */}
                <section className="execution-section" data-testid="execution-section">
                    <div className="execution-header">
                        <div className="execution-eyebrow">Execution at real scale</div>
                        <h2 className="execution-title">
                            Systems engineered for production environments
                        </h2>
                        <p className="execution-subtitle">
                            Not experiments. Not demos. Architectures designed to survive
                            real traffic, real data, and real business risk.
                        </p>
                    </div>

                    <div className="execution-grid">
                        <div className="execution-card" data-aos="fade-up">
                            <div className="execution-metric">99.9%</div>
                            <div className="execution-label">Production uptime</div>
                            <p className="execution-description">
                                Mission-critical systems designed for reliability,
                                observability, and fault tolerance under real traffic.
                            </p>
                        </div>

                        <div className="execution-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="execution-metric">10M<span>+</span></div>
                            <div className="execution-label">Events processed daily</div>
                            <p className="execution-description">
                                Architectures built to handle sustained high-volume workloads
                                without performance degradation.
                            </p>
                        </div>

                        <div className="execution-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="execution-metric">Enterprise-grade</div>
                            <div className="execution-label">Security & compliance</div>
                            <p className="execution-description">
                                Secure-by-design systems following best practices for data
                                protection, access control, and compliance readiness.
                            </p>
                        </div>

                        <div className="execution-card" data-aos="fade-up" data-aos-delay="300">
                            <div className="execution-metric">Long-term</div>
                            <div className="execution-label">System ownership</div>
                            <p className="execution-description">
                                Systems designed to evolve over years — not short-lived
                                prototypes or throwaway builds.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials - Lazy Loaded */}
                <Suspense fallback={<div style={{ minHeight: '300px' }} />}>
                    <TestimonialsSection />
                </Suspense>

                {/* Engagement Clarity Section - Lazy Loaded */}
                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                    <EngagementSection />
                </Suspense>

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
                            Schedule a free consultation
                            <ArrowRight className="btn-icon" />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer - Lazy Loaded */}
            <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
                <Footer scrollToSection={scrollToSection} />
            </Suspense>

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
                                        <label htmlFor="industry" className="form-label">Industry</label>
                                        <select
                                            id="industry"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleInputChange}
                                            required
                                            className="form-select"
                                            data-testid="industry-select"
                                            autoComplete="organization-title"
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
                                        <label htmlFor="business_type" className="form-label">Business Type</label>
                                        <select
                                            id="business_type"
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
                                        <label htmlFor="name" className="form-label">Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                            placeholder="Your name"
                                            data-testid="name-input"
                                            autoComplete="name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <input
                                            id="city"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                            placeholder="Your city"
                                            data-testid="city-input"
                                            autoComplete="address-level2"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">Phone</label>

                                        <div className="phone-input-group">
                                            <select
                                                aria-label="Country Code"
                                                name="country_code"
                                                value={formData.country_code}
                                                onChange={handleInputChange}
                                                className="country-code-select"
                                                required
                                                autoComplete="tel-country-code"
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
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input phone-number-input"
                                                placeholder="Phone number"
                                                autoComplete="tel-national"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                            placeholder="your@email.com"
                                            data-testid="email-input"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">Message</label>
                                    <textarea
                                        id="message"
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
};

export default Home;
