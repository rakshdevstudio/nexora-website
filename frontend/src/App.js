import { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import { Menu, X, ChevronRight, Sparkles, Zap, Code, Smartphone, Cloud, Database, Brain, Rocket, Users, Star, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
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
    // Test API connection
    axios.get(`${API}/`)
      .then(res => console.log('API Connected:', res.data.message))
      .catch(err => console.error('API Connection Error:', err));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/40 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Nexora</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('about')} className="hover:text-purple-400 transition">About</button>
              <button onClick={() => scrollToSection('services')} className="hover:text-purple-400 transition">Services</button>
              <button onClick={() => scrollToSection('process')} className="hover:text-purple-400 transition">Process</button>
              <button onClick={() => scrollToSection('clients')} className="hover:text-purple-400 transition">Clients</button>
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition"
                data-testid="nav-contact-button"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" data-testid="mobile-menu-button">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-purple-500/20" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 hover:text-purple-400">About</button>
              <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 hover:text-purple-400">Services</button>
              <button onClick={() => scrollToSection('process')} className="block w-full text-left py-2 hover:text-purple-400">Process</button>
              <button onClick={() => scrollToSection('clients')} className="block w-full text-left py-2 hover:text-purple-400">Clients</button>
              <button onClick={() => setShowContactModal(true)} className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8" data-testid="hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8 animate-pulse">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Reimagined Intelligence</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            We Build Tech That
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Transforms Futures
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            AI-First. Full-Stack First. We turn ambitious ideas into powerful digital realities that scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => setShowContactModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
              data-testid="hero-get-started-button"
            >
              Get Free Consultation
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="px-8 py-4 border-2 border-purple-500/50 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition"
              data-testid="hero-learn-more-button"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400">99%</div>
              <div className="text-sm text-gray-400 mt-1">Client Satisfaction</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400">50+</div>
              <div className="text-sm text-gray-400 mt-1">Projects Launched</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-pink-400">24/7</div>
              <div className="text-sm text-gray-400 mt-1">Support Available</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400">AI-First</div>
              <div className="text-sm text-gray-400 mt-1">Innovation Driven</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30" data-testid="about-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">About <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Nexora</span></h2>
            <p className="text-gray-400 text-lg">We're Digital Innovators Reimagining Intelligence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition">
              <Zap className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">AI-First Innovation</h3>
              <p className="text-gray-400">We integrate cutting-edge AI into every solution, pushing boundaries and creating intelligent systems that learn and adapt.</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500/60 transition">
              <Users className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Strategic Partnership</h3>
              <p className="text-gray-400">We're not just developers – we're partners invested in your success, treating your vision as our own mission.</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-900/20 to-transparent border border-pink-500/30 rounded-2xl p-8 hover:border-pink-500/60 transition">
              <Rocket className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Rapid Execution</h3>
              <p className="text-gray-400">Time is critical. We deliver production-ready solutions fast without compromising quality or innovation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Services</span></h2>
            <p className="text-gray-400 text-lg">Elevate Your Business With Reimagined Intelligence</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI & Automation */}
            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition hover:shadow-2xl hover:shadow-purple-500/20">
              <Brain className="w-16 h-16 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">AI & Intelligent Automation</h3>
              <p className="text-gray-400 mb-6">Transform your business with cutting-edge AI solutions. From machine learning models to intelligent chatbots, we build systems that think and adapt.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Custom AI Model Development & Integration</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Intelligent Chatbots & Conversational AI</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Predictive Analytics & Data Intelligence</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Process Automation & Workflow Optimization</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition flex items-center"
                data-testid="ai-service-button"
              >
                Start Your Project <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Full-Stack Web Development */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-black/50 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500/60 transition hover:shadow-2xl hover:shadow-cyan-500/20">
              <Code className="w-16 h-16 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Full-Stack Web Solutions</h3>
              <p className="text-gray-400 mb-6">Enterprise-grade web applications built for scale. We craft powerful, secure, and lightning-fast digital experiences.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Custom Web Application Architecture</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Enterprise-Grade Security & Compliance</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">API Ecosystem Design & Integration</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Real-time & Progressive Web Apps</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition flex items-center"
                data-testid="web-service-button"
              >
                Start Your Project <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Mobile Development */}
            <div className="bg-gradient-to-br from-pink-900/30 to-black/50 border border-pink-500/30 rounded-2xl p-8 hover:border-pink-500/60 transition hover:shadow-2xl hover:shadow-pink-500/20">
              <Smartphone className="w-16 h-16 text-pink-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Mobile Product Engineering</h3>
              <p className="text-gray-400 mb-6">Premium mobile experiences that users love. Native performance with cross-platform efficiency.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Native & Cross-Platform Development</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">App Store & Play Store Launch Strategy</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">UX/UI Design for Maximum Engagement</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Performance Optimization & Testing</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-pink-600 rounded-lg hover:bg-pink-700 transition flex items-center"
                data-testid="mobile-service-button"
              >
                Start Your Project <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Cloud & DevOps */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-black/50 border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-500/60 transition hover:shadow-2xl hover:shadow-indigo-500/20">
              <Cloud className="w-16 h-16 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Cloud & DevOps Solutions</h3>
              <p className="text-gray-400 mb-6">Scale without limits. We architect cloud-native solutions that grow with your ambitions.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Cloud Architecture & Migration (AWS, Azure, GCP)</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">CI/CD Pipeline & Automation</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Kubernetes & Container Orchestration</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Monitoring, Logging & Performance</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center"
                data-testid="cloud-service-button"
              >
                Start Your Project <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30" data-testid="tech-stack-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tech Stack We <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Master</span></h2>
            <p className="text-gray-400 text-lg">Cutting-edge technologies for modern solutions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'React', emoji: '⚛️' },
              { name: 'Node.js', emoji: '🟢' },
              { name: 'Python', emoji: '🐍' },
              { name: 'TypeScript', emoji: '📘' },
              { name: 'MongoDB', emoji: '🍃' },
              { name: 'PostgreSQL', emoji: '🐘' },
              { name: 'AWS', emoji: '☁️' },
              { name: 'Docker', emoji: '🐳' },
              { name: 'Kubernetes', emoji: '⎈' },
              { name: 'OpenAI', emoji: '🤖' },
              { name: 'TensorFlow', emoji: '🧠' },
              { name: 'Next.js', emoji: '▲' },
            ].map((tech, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/60 transition">
                <div className="text-4xl mb-2">{tech.emoji}</div>
                <div className="text-sm font-semibold">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 px-4 sm:px-6 lg:px-8" data-testid="process-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Process</span></h2>
            <p className="text-gray-400 text-lg">From vision to reality in four strategic phases</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/30 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-purple-400 mb-4">01</div>
                <h3 className="text-xl font-bold mb-3">Discover</h3>
                <p className="text-gray-400">We dive deep into your vision, goals, and challenges to understand what success looks like.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/30 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-4">02</div>
                <h3 className="text-xl font-bold mb-3">Design</h3>
                <p className="text-gray-400">We architect a tailored solution with cutting-edge tech and user-centric design principles.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-pink-900/30 to-transparent border border-pink-500/30 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-pink-400 mb-4">03</div>
                <h3 className="text-xl font-bold mb-3">Develop</h3>
                <p className="text-gray-400">Our experts build, test, and iterate rapidly to bring your solution to life with precision.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-900/30 to-transparent border border-indigo-500/30 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-indigo-400 mb-4">04</div>
                <h3 className="text-xl font-bold mb-3">Deploy</h3>
                <p className="text-gray-400">We launch your solution and provide ongoing support to ensure continuous growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30" data-testid="clients-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Client <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Success Stories</span></h2>
            <p className="text-gray-400 text-lg">Transforming businesses across industries</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'IntelliHealth AI',
                industry: 'Healthcare Technology',
                description: 'Built an AI-powered diagnostic platform that reduced patient wait times by 60% and improved diagnostic accuracy through machine learning models.',
                icon: '🏥'
              },
              {
                name: 'FinFlow Systems',
                industry: 'FinTech',
                description: 'Developed a secure, real-time financial analytics platform processing 100K+ transactions per second with 99.99% uptime.',
                icon: '💰'
              },
              {
                name: 'EcoLogistics Pro',
                industry: 'Supply Chain & Logistics',
                description: 'Created an AI-driven logistics optimization system that reduced delivery costs by 35% and carbon emissions by 40%.',
                icon: '🚚'
              },
              {
                name: 'EduTech Connect',
                industry: 'Education Technology',
                description: 'Launched a personalized learning platform using AI to adapt content for 50K+ students, improving engagement by 80%.',
                icon: '🎓'
              },
              {
                name: 'RetailVerse',
                industry: 'E-Commerce',
                description: 'Built an omnichannel e-commerce platform with AI-powered recommendations, increasing conversion rates by 120%.',
                icon: '🛍️'
              },
              {
                name: 'CloudScale Innovations',
                industry: 'Cloud Infrastructure',
                description: 'Architected a multi-cloud infrastructure solution that scaled seamlessly from 10K to 1M users with zero downtime.',
                icon: '☁️'
              }
            ].map((client, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="text-5xl mb-4">{client.icon}</div>
                <h3 className="text-xl font-bold mb-2">{client.name}</h3>
                <div className="text-purple-400 text-sm mb-4">{client.industry}</div>
                <p className="text-gray-400 text-sm">{client.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Clients Say</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"Nexora didn't just build our platform – they understood our vision and brought it to life with incredible AI capabilities. The intelligence they embedded into our system has transformed how we operate. Truly reimagined intelligence."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">SM</div>
                <div>
                  <div className="font-bold">Sarah Mitchell</div>
                  <div className="text-sm text-gray-400">CEO, IntelliHealth AI</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/30 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"Working with Nexora was a game-changer. Their full-stack expertise and AI-first approach gave us a competitive edge we didn't think was possible. They delivered ahead of schedule with exceptional quality."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-pink-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">JC</div>
                <div>
                  <div className="font-bold">James Chen</div>
                  <div className="text-sm text-gray-400">Founder, FinFlow Systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-cyan-900/30" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Vision?</h2>
          <p className="text-xl text-gray-300 mb-10">Let's build something extraordinary together. Schedule a free consultation and discover how we can accelerate your success.</p>
          <button 
            onClick={() => setShowContactModal(true)}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            data-testid="cta-button"
          >
            Get Free Consultation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/50 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Nexora</span>
              </div>
              <p className="text-gray-400 text-sm">Reimagined Intelligence</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('services')} className="hover:text-purple-400">AI & Automation</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-purple-400">Full-Stack Development</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-purple-400">Mobile Engineering</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-purple-400">Cloud Solutions</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-purple-400">About Us</button></li>
                <li><button onClick={() => scrollToSection('clients')} className="hover:text-purple-400">Case Studies</button></li>
                <li><button onClick={() => scrollToSection('process')} className="hover:text-purple-400">Our Process</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> hello@nexora.tech</li>
                <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +1 (555) 123-4567</li>
                <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> San Francisco, CA</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Nexora. All rights reserved. | Reimagined Intelligence</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="contact-modal">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900/50 border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Let's Build Something Amazing</h3>
              <button onClick={() => setShowContactModal(false)} className="hover:text-purple-400" data-testid="close-modal-button">
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-8" data-testid="success-message">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Message Sent Successfully!</h4>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <select 
                      name="industry" 
                      value={formData.industry} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      data-testid="industry-select"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Non-profit">Non-profit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Type *</label>
                    <select 
                      name="business_type" 
                      value={formData.business_type} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      data-testid="business-type-select"
                    >
                      <option value="">Select Business Type</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Your name"
                      data-testid="name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Your city"
                      data-testid="city-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Your phone number"
                      data-testid="phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="your@email.com"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Tell us about your project..."
                    data-testid="message-textarea"
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="text-red-400 text-sm" data-testid="error-message">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  data-testid="submit-button"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send className="w-5 h-5 ml-2" />}
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