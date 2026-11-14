import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Search, Sparkles, X } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { CATALOG } from '@/src/data/catalogService';
import { searchDescribeCatalog } from '@/src/utils/catalogFilter';
import { AnimeCard } from './AnimeCard';

export const SearchModal: React.FC = () => {
  const {
    t,
    searchOpen,
    setSearchOpen,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'titles' | 'describe'>('titles');
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setListening(false);
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 2) return [];
    if (mode === 'describe') {
      return searchDescribeCatalog(CATALOG, clean).slice(0, 24);
    }
    return CATALOG.filter((a) => {
      const hay = [
        a.title,
        a.native ?? '',
        a.slug,
        ...a.genres,
        ...a.studios,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(clean);
    }).slice(0, 24);
  }, [query, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) addRecentSearch(query.trim());
  };

  const handleVoiceDemo = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setQuery(mode === 'describe' ? 'cyberpunk neon city' : 'One Piece');
      showToast('Voice input captured');
    }, 650);
  };

  if (!searchOpen) return null;

  return createPortal(
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('search.heading')}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div className="search-overlay__inner">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 14px',
                fontSize: 'clamp(30px, 4vw, 44px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#ffffff',
              }}
            >
              {t('search.heading')}
            </h2>

            <div
              style={{
                display: 'inline-flex',
                padding: 3,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <button
                type="button"
                onClick={() => setMode('titles')}
                style={{
                  height: 30,
                  padding: '0 14px',
                  border: 0,
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: mode === 'titles' ? '#ffffff' : 'transparent',
                  color: mode === 'titles' ? '#09090b' : 'rgba(255,255,255,0.72)',
                }}
              >
                {t('search.titlesTab')}
              </button>
              <button
                type="button"
                onClick={() => setMode('describe')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  height: 30,
                  padding: '0 14px',
                  border: 0,
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: mode === 'describe' ? '#ffffff' : 'transparent',
                  color: mode === 'describe' ? '#09090b' : 'rgba(255,255,255,0.72)',
                }}
              >
                <Sparkles size={13} />
                <span>{t('search.describeTab')}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="yt-icon-button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: 'min(520px, 100%)',
              height: 48,
              padding: '0 10px 0 16px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <Search size={17} style={{ opacity: 0.7, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'describe'
                  ? 'Describe a plot, vibe, or character...'
                  : 'Search anime...'
              }
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                border: 0,
                background: 'transparent',
                color: '#ffffff',
                fontSize: 15,
                outline: 'none',
              }}
            />
            {query && (
              <button
                type="button"
                className="yt-icon-button"
                aria-label="Clear search query"
                onClick={() => setQuery('')}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              className="yt-icon-button"
              aria-label="Voice search"
              onClick={handleVoiceDemo}
              style={{
                color: listening ? '#f87171' : 'rgba(255,255,255,0.78)',
              }}
            >
              <Mic size={17} />
            </button>
          </div>
        </form>

        <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.58)' }}>
          {mode === 'describe' ? t('search.describeHint') : t('search.typeHint')}
        </p>

        {recentSearches.length > 0 && query.trim().length < 2 && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.48)' }}>
                Recent searches
              </span>
              <button
                type="button"
                onClick={clearRecentSearches}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="watch-pill"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim().length >= 2 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {results.length > 0
                ? `${results.length} matching titles`
                : `No titles matched "${query}"`}
            </p>
            {results.length > 0 && (
              <div
                className="browse-grid"
                onClick={() => {
                  addRecentSearch(query);
                  setSearchOpen(false);
                }}
              >
                {results.map((anime) => (
                  <AnimeCard key={anime.routeId} anime={anime} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
