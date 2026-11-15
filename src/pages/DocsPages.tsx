import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Code2, Mic, Play, Search, X } from 'lucide-react';
import { CATALOG } from '@/src/data/catalogService';
import { AnimeCard } from '@/src/components/AnimeCard';
import { searchDescribeCatalog } from '@/src/utils/catalogFilter';

export const AboutPage: React.FC = () => (
  <div className="doc-shell">
    <h1 className="page-title">About ani.pm</h1>
    <p style={{ color: 'rgb(var(--c-text2))', maxWidth: 680, lineHeight: 1.65 }}>
      ani.pm is a fast, distraction-free anime streaming and tracking workspace designed to sync seamlessly across desktop, mobile, and connected trackers.
    </p>
    <div className="doc-grid">
      <nav className="doc-toc" aria-label="On this page">
        <a href="#mission" className="is-active">Our mission</a>
        <a href="#player">GlassPlayer engine</a>
        <a href="#privacy">Local-first sync</a>
        <a href="#mirrors">Backup domains</a>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, lineHeight: 1.7 }}>
        <section id="mission">
          <h2>Our mission</h2>
          <p style={{ color: 'rgb(var(--c-text2))' }}>
            Every surface on ani.pm — from the 19 supported interface languages and RTL layouts to customizable GlassPlayer controls — is engineered for effortless discovery and marathon viewing.
          </p>
        </section>
        <section id="player">
          <h2>GlassPlayer engine</h2>
          <p style={{ color: 'rgb(var(--c-text2))' }}>
            Built with multi-audio Sub &amp; Dub stream switching, custom ASS/VTT subtitle styling, keyboard shortcuts, Theater mode, Lights off dimming, and Ambient glow backlighting.
          </p>
        </section>
        <section id="privacy">
          <h2>Local-first sync</h2>
          <p style={{ color: 'rgb(var(--c-text2))' }}>
            Your lists, custom folders, watch timestamps, and theme preferences persist locally immediately with zero mandatory sign-up required.
          </p>
        </section>
        <section id="mirrors">
          <h2>Backup domains</h2>
          <p style={{ color: 'rgb(var(--c-text2))' }}>
            Bookmark both <strong>ani.pm</strong> and our mirror domain <strong>ani.nz</strong> for uninterrupted access.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="doc-shell">
    <h1 className="page-title">Terms of Service</h1>
    <p style={{ color: 'rgb(var(--c-text2))' }}>Last updated: November 2026</p>
    <div className="doc-grid">
      <nav className="doc-toc">
        <a href="#acceptance" className="is-active">Acceptance of Terms</a>
        <a href="#content">Third-Party Indexer</a>
        <a href="#accounts">Accounts & Conduct</a>
        <a href="#dmca">DMCA & Removal</a>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, lineHeight: 1.7, color: 'rgb(var(--c-text2))' }}>
        <section id="acceptance">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>1. Acceptance of Terms</h2>
          <p>By accessing ani.pm, you agree to abide by these terms of service, community guidelines, and applicable laws.</p>
        </section>
        <section id="content">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>2. Third-Party Media Indexer</h2>
          <p>ani.pm does not host or store video files on its own servers. All media embeds and streams are indexed from non-affiliated external providers.</p>
        </section>
        <section id="accounts">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>3. Community Conduct</h2>
          <p>Respect fellow members in forum threads, watch-together rooms, and live chat. Harassment, spam, and automated abuse are prohibited.</p>
        </section>
        <section id="dmca">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>4. Copyright Inquiries</h2>
          <p>Rights holders may contact external source hosts or reach out with valid notice documentation for index review.</p>
        </section>
      </div>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="doc-shell">
    <h1 className="page-title">Privacy Policy</h1>
    <p style={{ color: 'rgb(var(--c-text2))' }}>Last updated: November 2026</p>
    <div className="doc-grid">
      <nav className="doc-toc">
        <a href="#storage" className="is-active">Browser Storage</a>
        <a href="#telemetry">Opt-In Diagnostics</a>
        <a href="#export">Data Portability</a>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, lineHeight: 1.7, color: 'rgb(var(--c-text2))' }}>
        <section id="storage">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>1. Browser Storage</h2>
          <p>Preferences, library lists, recent searches, and episode resume timestamps are stored locally on your device by default.</p>
        </section>
        <section id="telemetry">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>2. Opt-In Diagnostics</h2>
          <p>Audience analytics and playback diagnostics are disabled by default and configurable anytime under Settings → Notifications &amp; Privacy.</p>
        </section>
        <section id="export">
          <h2 style={{ color: 'rgb(var(--c-text))' }}>3. Full Data Control</h2>
          <p>You can export your complete JSON storage snapshot or wipe all device data at any time from Settings → Your data.</p>
        </section>
      </div>
    </div>
  </div>
);

export const DevelopersPage: React.FC = () => {
  const [slug, setSlug] = useState('one-piece-1642-oxbpvt');
  const [output, setOutput] = useState<string>('');

  const runSample = () => {
    const found = CATALOG.find((a) => a.routeId === slug) ?? CATALOG[0];
    setOutput(
      JSON.stringify(
        {
          id: found.id,
          routeId: found.routeId,
          title: found.title,
          type: found.type,
          score: found.score,
          episodes: found.episodeCount,
          subCount: found.subCount,
          dubCount: found.dubCount,
        },
        null,
        2
      )
    );
  };

  return (
    <div className="doc-shell">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Code2 size={24} />
        <h1 className="page-title">Developers &amp; Public API</h1>
      </div>
      <p style={{ color: 'rgb(var(--c-text2))', maxWidth: 680 }}>
        Build companion browser extensions, tracker bridges, and custom rich presence clients using ani.pm catalog endpoints.
      </p>

      <div className="settings-card" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9cc3ff' }}>Interactive Endpoint Tester</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="ytdlg-field" style={{ flex: 1 }}>
            {CATALOG.slice(0, 15).map((a) => (
              <option key={a.routeId} value={a.routeId}>
                GET /api/anime/{a.routeId}
              </option>
            ))}
          </select>
          <button type="button" className="watch-pill" aria-pressed="true" onClick={runSample}>
            <Play size={13} />
            <span>Run request</span>
          </button>
        </div>
        {output && (
          <pre
            style={{
              margin: 0,
              padding: 14,
              borderRadius: 10,
              background: '#0a0b0f',
              color: '#a7f3d0',
              fontSize: 12.5,
              overflowX: 'auto',
            }}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );
};

export const SearchPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [q, setQ] = useState(initial);
  const [mode, setMode] = useState<'titles' | 'describe'>('titles');

  const matches = useMemo(() => {
    const clean = q.trim().toLowerCase();
    if (clean.length < 2) return [];
    if (mode === 'describe') return searchDescribeCatalog(CATALOG, clean).slice(0, 36);
    return CATALOG.filter((a) => {
      const hay = [a.title, a.native ?? '', a.slug, ...a.genres, ...a.studios]
        .join(' ')
        .toLowerCase();
      return hay.includes(clean);
    }).slice(0, 36);
  }, [q, mode]);

  return (
    <div className="page-shell">
      <div style={{ maxWidth: 1040, paddingTop: 28 }}>
        <h1
          style={{
            margin: '0 0 18px',
            fontSize: 'clamp(34px, 4.5vw, 52px)',
            fontWeight: 650,
            letterSpacing: '-0.03em',
            lineHeight: 1.04,
            color: '#ffffff',
          }}
        >
          Search Ani.pm
        </h1>

        <div
          style={{
            display: 'inline-flex',
            padding: 3,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => setMode('titles')}
            style={{
              height: 30,
              padding: '0 16px',
              border: 0,
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: mode === 'titles' ? '#ffffff' : 'transparent',
              color: mode === 'titles' ? '#09090b' : 'rgba(255,255,255,0.72)',
            }}
          >
            Titles
          </button>
          <button
            type="button"
            onClick={() => setMode('describe')}
            style={{
              height: 30,
              padding: '0 16px',
              border: 0,
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: mode === 'describe' ? '#ffffff' : 'transparent',
              color: mode === 'describe' ? '#09090b' : 'rgba(255,255,255,0.72)',
            }}
          >
            Describe it
          </button>
        </div>

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
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setParams(e.target.value ? { q: e.target.value } : new URLSearchParams(), { replace: true });
            }}
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
          {q && (
            <button
              type="button"
              className="yt-icon-button"
              aria-label="Clear search query"
              onClick={() => {
                setQ('');
                setParams(new URLSearchParams(), { replace: true });
              }}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            className="yt-icon-button"
            aria-label="Voice search"
            onClick={() => {
              setQ('One Piece');
              setParams({ q: 'One Piece' }, { replace: true });
            }}
          >
            <Mic size={17} />
          </button>
        </div>

        <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.58)' }}>
          {mode === 'describe'
            ? 'Describe the plot, scene, aesthetic, or studio you have in mind.'
            : 'Type at least two characters to search.'}
        </p>

        {q.trim().length >= 2 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {matches.length > 0
                ? `${matches.length} matching titles`
                : `No titles matched "${q}"`}
            </p>
            {matches.length > 0 && (
              <div className="browse-grid">
                {matches.map((a) => (
                  <AnimeCard key={a.routeId} anime={a} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => (
  <div className="page-shell" style={{ textAlign: 'center', paddingTop: 120 }}>
    <h1 className="page-title" style={{ marginBottom: 8 }}>404 — Page not found</h1>
    <p style={{ color: 'rgb(var(--c-text2))', marginBottom: 22 }}>
      The anime or page you’re looking for isn’t at this URL.
    </p>
    <Link to="/" className="watch-pill" aria-pressed="true">
      Back to Home
    </Link>
  </div>
);
