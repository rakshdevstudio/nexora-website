import { useEffect } from 'react';
import AOS from 'aos';

const EngagementSection = () => {
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
    <section className="engagement-section" data-testid="engagement-section">
      <div className="engagement-header">
        <div className="engagement-eyebrow">How engagement starts</div>
        <h2 className="engagement-title">
          A conversation — not a sales call
        </h2>
        <p className="engagement-subtitle">
          We start with a focused technical discussion to understand your system,
          constraints, and goals. No pitches. No pressure.
        </p>
      </div>

      <div className="engagement-steps">
        <div className="engagement-step">
          <div className="step-number">01</div>
          <div className="step-content">
            <h3>Initial technical conversation</h3>
            <p>
              A senior engineer discusses your problem space, architecture,
              and business context — confidentially.
            </p>
          </div>
        </div>

        <div className="engagement-step">
          <div className="step-number">02</div>
          <div className="step-content">
            <h3>Feasibility & system direction</h3>
            <p>
              We outline possible architectures, risks, and trade-offs —
              even if we don't work together.
            </p>
          </div>
        </div>

        <div className="engagement-step">
          <div className="step-number">03</div>
          <div className="step-content">
            <h3>Clear next steps</h3>
            <p>
              You leave with clarity: technical direction, scope,
              and whether Nexora is the right partner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngagementSection;
