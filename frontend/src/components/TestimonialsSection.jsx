import { useEffect } from 'react';
import AOS from 'aos';

const TestimonialsSection = () => {
  useEffect(() => {
    // Refresh AOS animations when component mounts
    AOS.refresh();
  }, []);

  return (
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
  );
};

export default TestimonialsSection;
