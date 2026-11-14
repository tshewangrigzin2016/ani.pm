import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Search, Star } from 'lucide-react';
import { MANGA_CATALOG, STILLS_POOL } from '@/src/data/catalogService';
import { useApp } from '@/src/context/AppContext';

export const MangaPage: React.FC = () => {
  const { title: slugParam, chapter: chapterParam } = useParams<{
    title?: string;
    chapter?: string;
  }>();
  const { library, toggleMangaBookmark, showToast } = useApp();
  const [query, setQuery] = useState('');

  const selectedManga = useMemo(() => {
    if (!slugParam) return null;
    return MANGA_CATALOG.find((m) => m.slug === slugParam || m.id === slugParam) ?? MANGA_CATALOG[0];
  }, [slugParam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MANGA_CATALOG;
    return MANGA_CATALOG.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [query]);

  // Reader View (/manga/:title/:chapter)
  if (selectedManga && chapterParam) {
    const chNum = Math.max(1, Number.parseInt(chapterParam, 10) || 1);
    const pages = Array.from({ length: 6 }, (_, i) => {
      const still = STILLS_POOL[(chNum + i) % Math.max(1, STILLS_POOL.length)];
      return { page: i + 1, image: still || selectedManga.cover };
    });

    return (
      <div className="page-shell" style={{ maxWidth: 940 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to={`/manga/${selectedManga.slug}`} className="watch-pill">
              <ChevronLeft size={14} />
              <span>{selectedManga.title}</span>
            </Link>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Chapter {chNum}</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {chNum > 1 && (
              <Link to={`/manga/${selectedManga.slug}/${chNum - 1}`} className="watch-pill">
                <ChevronLeft size={14} />
                <span>Prev</span>
              </Link>
            )}
            <Link to={`/manga/${selectedManga.slug}/${chNum + 1}`} className="watch-pill">
              <span>Next chapter</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pages.map((p) => (
            <figure
              key={p.page}
              style={{
                margin: 0,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#0c0c10',
              }}
            >
              <img
                src={p.image}
                alt={`${selectedManga.title} Ch.${chNum} Page ${p.page}`}
                style={{ width: '100%', display: 'block', maxHeight: 540, objectFit: 'cover' }}
              />
              <figcaption
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {selectedManga.title} — Chapter {chNum}
                </span>
                <span>Page {p.page} / {pages.length}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  // Manga Detail View (/manga/:title)
  if (selectedManga) {
    const bookmarked = library.mangaBookmarkedIds.includes(selectedManga.id);
    const chapterNums = Array.from({ length: Math.min(24, selectedManga.chapters) }, (_, i) => i + 1);

    return (
      <div className="page-shell">
        <Link to="/manga" className="watch-pill" style={{ marginBottom: 18 }}>
          <ChevronLeft size={14} />
          <span>All manga</span>
        </Link>

        <div className="detail-layout" style={{ paddingInline: 0 }}>
          <div>
            <div className="detail-poster">
              <img src={selectedManga.cover} alt={selectedManga.title} />
            </div>
          </div>

          <div>
            <h1 className="page-title" style={{ marginBottom: 8 }}>{selectedManga.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <span className="spot-meta-frost score">
                <Star size={13} />
                <span>{selectedManga.score.toFixed(1)}</span>
              </span>
              <span className="spot-meta-frost">{selectedManga.status}</span>
              <span className="spot-meta-frost">{selectedManga.chapters} Chapters</span>
              {selectedManga.genres.slice(0, 3).map((g) => (
                <span key={g} className="spot-meta-frost">{g}</span>
              ))}
            </div>
            <p style={{ maxWidth: 680, color: 'rgb(var(--c-text2))', lineHeight: 1.55 }}>
              {selectedManga.synopsis}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Link
                to={`/manga/${selectedManga.slug}/1`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 42,
                  padding: '0 24px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#09090b',
                  fontWeight: 700,
                }}
              >
                <BookOpen size={16} />
                <span>Read Chapter 1</span>
              </Link>
              <button
                type="button"
                className="watch-pill"
                style={{ height: 42, padding: '0 18px' }}
                aria-pressed={bookmarked}
                onClick={() => {
                  toggleMangaBookmark(selectedManga.id);
                  showToast(bookmarked ? 'Removed manga bookmark' : 'Bookmarked manga');
                }}
              >
                <Bookmark size={15} />
                <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <h3 style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>Chapters</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 8,
              }}
            >
              {chapterNums.map((n) => (
                <Link
                  key={n}
                  to={`/manga/${selectedManga.slug}/${n}`}
                  className="settings-card"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  <span>Chapter {n}</span>
                  <ChevronRight size={14} style={{ opacity: 0.55 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manga Catalog (/manga)
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Toonkotsu Manga</h1>
          <span className="page-subtitle">{filtered.length} series ready to read</span>
        </div>

        <div className="browse-search-pill" style={{ width: 250 }}>
          <Search size={14} style={{ opacity: 0.6 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manga..."
          />
        </div>
      </div>

      <div className="browse-grid">
        {filtered.map((manga) => (
          <Link key={manga.id} to={`/manga/${manga.slug}`} className="ac" style={{ width: '100%' }}>
            <div className="ac-poster">
              <div className="poster-clip">
                <img src={manga.cover} alt={manga.title} loading="lazy" />
                <div className="ac-fade" />
                <div className="cov-cap">
                  <span className="cov-title-clip">
                    <span className="cov-title">{manga.title}</span>
                  </span>
                  <div className="cov-meta">
                    <span className="cov-genre">{manga.genres[0] ?? 'Manga'}</span>
                    <span className="cov-language-n">{manga.chapters} ch</span>
                    <span className="cov-score">
                      <Star size={10} />
                      <span>{manga.score.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
