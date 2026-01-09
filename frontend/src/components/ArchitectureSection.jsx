import { useEffect } from 'react';
import AOS from 'aos';

const ArchitectureSection = () => {
  useEffect(() => {
    // Refresh AOS animations when component mounts (non-critical)
    function refreshAOS() {
      if (typeof AOS !== 'undefined' && AOS.refresh) {
        AOS.refresh();
      }
    }
    
    // Wait for AOS to be initialized if needed
    if (typeof AOS !== 'undefined' && AOS.refresh) {
      refreshAOS();
    } else {
      // Retry after a short delay if AOS isn't ready yet
      const retryTimer = setTimeout(() => {
        refreshAOS();
      }, 500);
      return () => clearTimeout(retryTimer);
    }
  }, []);

  return (
    <>
      {/* System Architecture Section */}
      <section className="architecture-section" data-testid="architecture-section">
        <div className="architecture-header">
          <div className="architecture-eyebrow">System architecture</div>
          <h2 className="architecture-title">
            How Nexora builds production AI systems
          </h2>
          <p className="architecture-subtitle">
            A layered, battle-tested architecture designed for reliability,
            security, and long-term evolution.
          </p>
        </div>

        <div className="architecture-stack">
          <div className="architecture-layer">
            <span className="layer-label">Experience Layer</span>
            <span className="layer-desc">Web apps · Mobile apps · Dashboards</span>
          </div>

          <div className="architecture-layer">
            <span className="layer-label">Application Layer</span>
            <span className="layer-desc">APIs · Business logic · Workflow engines</span>
          </div>

          <div className="architecture-layer architecture-layer-highlight">
            <span className="layer-label">Intelligence Layer</span>
            <span className="layer-desc">LLMs · AI agents · Decision systems</span>
          </div>

          <div className="architecture-layer">
            <span className="layer-label">Data Layer</span>
            <span className="layer-desc">Databases · Vector stores · Event streams</span>
          </div>

          <div className="architecture-layer">
            <span className="layer-label">Infrastructure Layer</span>
            <span className="layer-desc">Cloud · Security · Observability · CI/CD</span>
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
    </>
  );
};

export default ArchitectureSection;
