import nexoraLogo from "../assets/Nexora transparent.PNG";

const Footer = ({ scrollToSection }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={nexoraLogo}
                alt="Nexora"
                className="footer-logo-image"
                width="56"
                height="28"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="footer-tagline">Intelligence Reimagined</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-heading">Capabilities</h3>
              <button onClick={() => scrollToSection('services')} className="footer-link">
                High‑performance websites
              </button>
              <button onClick={() => scrollToSection('services')} className="footer-link">
                Full‑stack web platforms
              </button>
              <button onClick={() => scrollToSection('services')} className="footer-link">
                AI‑powered automation
              </button>
              <button onClick={() => scrollToSection('services')} className="footer-link">
                Scalable infrastructure
              </button>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <button onClick={() => scrollToSection('about')} className="footer-link">About</button>
              <button onClick={() => scrollToSection('clients')} className="footer-link">Case Studies</button>
              <button onClick={() => scrollToSection('process')} className="footer-link">Approach</button>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Contact</h3>
              <div className="footer-contact">info@nexorair.com</div>
              <div className="footer-contact">Bengaluru, India</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2022 Nexora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
