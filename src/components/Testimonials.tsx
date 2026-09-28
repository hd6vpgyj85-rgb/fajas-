import { useEffect, useRef, useState } from "react";
import { useReviews } from "../context/ReviewsContext";
import StarRating from "./StarRating";
import Reveal from "./Reveal";
import "./Testimonials.css";

const AUTOPLAY_MS = 6000;

function usePerPage() {
  const query = "(min-width: 768px)";
  const [perPage, setPerPage] = useState(() => (window.matchMedia(query).matches ? 2 : 1));

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setPerPage(media.matches ? 2 : 1);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return perPage;
}

export default function Testimonials() {
  const { approvedReviews } = useReviews();
  const perPage = usePerPage();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const slides: (typeof approvedReviews)[] = [];
  for (let i = 0; i < approvedReviews.length; i += perPage) {
    slides.push(approvedReviews.slice(i, i + perPage));
  }

  const total = slides.length;
  const current = total > 0 ? Math.min(slide, total - 1) : 0;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setTimeout(() => setSlide((current + 1) % total), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, total, paused]);

  if (total === 0) return null;

  const go = (direction: 1 | -1) => setSlide((current + direction + total) % total);

  return (
    <section
      className="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container">
        <Reveal className="testimonials-heading">
          <span className="section-eyebrow">Reseñas reales</span>
          <h2>Lo que dicen nuestras clientas</h2>
        </Reveal>

        <div
          className="testimonials-stage"
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
          }}
        >
          <div className="testimonials-slide" key={`${current}-${perPage}`}>
            {slides[current].map((review, i) => (
              <figure className="testimonial-card" key={review.id} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="testimonial-quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <StarRating rating={review.rating} />
                <blockquote>{review.quote}</blockquote>
                <figcaption>
                  {review.image ? (
                    <img src={review.image} alt="" loading="lazy" />
                  ) : (
                    <span className="testimonial-avatar">{review.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span>{review.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {total > 1 && (
          <div className="testimonials-controls">
            <button className="testimonials-arrow" onClick={() => go(-1)} aria-label="Reseñas anteriores">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="testimonials-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`testimonials-dot ${i === current ? "is-active" : ""} ${paused ? "is-paused" : ""}`}
                  onClick={() => setSlide(i)}
                  aria-label={`Ver reseñas ${i + 1}`}
                  aria-current={i === current}
                >
                  {i === current && <span style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />}
                </button>
              ))}
            </div>
            <button className="testimonials-arrow" onClick={() => go(1)} aria-label="Siguientes reseñas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
