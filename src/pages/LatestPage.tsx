import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Captions, Mic, Search } from 'lucide-react';
import { LATEST_EPISODES } from '@/src/data/catalogService';
import { filterLatestEpisodes } from '@/src/utils/catalogFilter';
import { useApp } from '@/src/context/AppContext';

export const LatestPage: React.FC = () => {
  const { t, contentPrefs } = useApp();
  const [mode, setMode] = useState<'all' | 'sub' | 'dub'>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => filterLatestEpisodes(LATEST_EPISODES, mode, query),
    [mode, query]
  );

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('home.latestEpisodes')}</h1>
          <span className="page-subtitle">{items.length} recent drops</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div className="watch-audio-switch">
            {(['all', 'sub', 'dub'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="browse-search-pill" style={{ width: 220, height: 34 }}>
            <Search size={14} style={{ opacity: 0.6 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter latest..."
            />
          </div>
        </div>
      </div>

      <div className="latest-grid-4">
        {items.map((ep) => (
          <Link
            key={`${ep.routeId}-${ep.episode}`}
            to={`/anime/${ep.routeId}/${ep.episode}`}
            className="cw"
          >
            <div className="cw-thumb">
              {contentPrefs.showEpisodeThumbsOnHome && ep.thumbnail ? (
                <img src={ep.thumbnail} alt={ep.title} loading="lazy" />
              ) : (
                <div className="cw-placeholder">
                  <span className="cw-placeholder-number">
                    {String(ep.episode).padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="cw-shade" />
              <div className="cw-badges-tl">
                {ep.hasSub && (
                  <span className="cw-badge">
                    <Captions size={11} />
                    <span>SUB</span>
                  </span>
                )}
                {ep.hasDub && (
                  <span className="cw-badge">
                    <Mic size={11} />
                    <span>DUB</span>
                  </span>
                )}
              </div>
              <span className="cw-duration">{ep.duration ?? '24:00'}</span>
              <div className="cw-inside">
                <div className="cw-title">{ep.title}</div>
                <div className="cw-detail">
                  Episode {ep.episode} · {ep.timeAgo}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
