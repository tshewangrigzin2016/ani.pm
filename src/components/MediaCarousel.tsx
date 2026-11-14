import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/src/context/AppContext';

interface MediaCarouselProps {
  title: React.ReactNode;
  viewAllTo?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  viewAllTo,
  headerRight,
  children,
  className = '',
}) => {
  const { t } = useApp();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 12);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncButtons();
    el.addEventListener('scroll', syncButtons, { passive: true });
    window.addEventListener('resize', syncButtons);
    return () => {
      el.removeEventListener('scroll', syncButtons);
      window.removeEventListener('resize', syncButtons);
    };
  }, [syncButtons, children]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(320, el.clientWidth * 0.82);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className={`row centered-carousel ${className}`}>
      <div className="row-head">
        <div className="row-head-title">{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {headerRight}
          {viewAllTo && (
            <Link to={viewAllTo} className="row-view-all">
              <span>{t('home.viewAll')}</span>
              <ChevronRight size={15} />
            </Link>
          )}
        </div>
      </div>

      <div className="carousel-shell">
        <div ref={trackRef} className="row-track embla-viewport native-shelf">
          {children}
        </div>
        <div className="carousel-edge-nav" aria-hidden="true">
          {canPrev && (
            <button
              type="button"
              className="carousel-edge-prev"
              aria-label="Scroll left"
              onClick={() => scrollByPage(-1)}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {canNext && (
            <button
              type="button"
              className="carousel-edge-next"
              aria-label="Scroll right"
              onClick={() => scrollByPage(1)}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
