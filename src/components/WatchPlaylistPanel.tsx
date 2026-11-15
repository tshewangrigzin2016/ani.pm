import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, BookOpen, ChevronDown, Eye, EyeOff, Grid, Layers, List, Mic, Play, Search } from 'lucide-react';
import type { EpisodeItem } from '@/src/types/anime';
import { filterEpisodeList } from '@/src/utils/catalogFilter';
import { useApp } from '@/src/context/AppContext';

interface WatchPlaylistPanelProps {
  episodes: EpisodeItem[];
  currentEp: number;
  onSelectEpisode: (epNumber: number) => void;
}

export const WatchPlaylistPanel: React.FC<WatchPlaylistPanelProps> = ({
  episodes,
  currentEp,
  onSelectEpisode,
}) => {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [selectedArc, setSelectedArc] = useState('All arcs');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [oldestFirst, setOldestFirst] = useState(true);
  const [hideFiller, setHideFiller] = useState(false);
  const [skipFiller, setSkipFiller] = useState(false);
  const [subOnly, setSubOnly] = useState(false);
  const [dubOnly, setDubOnly] = useState(false);
  const [hideThumbs, setHideThumbs] = useState(false);
  const [gridView, setGridView] = useState(false);
  const [epLimit, setEpLimit] = useState(() => Math.max(60, currentEp + 20));

  useEffect(() => {
    setEpLimit((prev) => Math.max(prev, currentEp + 20));
  }, [currentEp]);

  useEffect(() => {
    setEpLimit(Math.max(60, currentEp + 20));
  }, [search, selectedArc, selectedSeason, hideFiller, subOnly, dubOnly, oldestFirst]);

  const seasons = useMemo(() => {
    const uniq = Array.from(new Set(episodes.map((e) => e.season))).sort((a, b) => a - b);
    return uniq;
  }, [episodes]);

  const arcs = useMemo(() => {
    const uniq = Array.from(new Set(episodes.map((e) => e.arc)));
    return ['All arcs', ...uniq];
  }, [episodes]);

  const fillerCount = useMemo(() => episodes.filter((e) => e.kind === 'filler').length, [episodes]);
  const subCount = useMemo(() => episodes.filter((e) => e.hasSub).length, [episodes]);
  const dubCount = useMemo(() => episodes.filter((e) => e.hasDub).length, [episodes]);

  const filtered = useMemo(() => {
    const audioFilter: 'all' | 'sub' | 'dub' = subOnly ? 'sub' : dubOnly ? 'dub' : 'all';
    let list = filterEpisodeList(episodes, {
      query: search,
      arc: selectedArc === 'All arcs' ? 'all' : selectedArc,
      hideFiller,
      audioFilter,
      sortOrder: oldestFirst ? 'oldest' : 'newest',
    });
    if (selectedSeason !== 'all') {
      list = list.filter((e) => e.season === Number(selectedSeason));
    }
    return list;
  }, [episodes, search, selectedArc, hideFiller, subOnly, dubOnly, oldestFirst, selectedSeason]);

  const kindColor = (kind: EpisodeItem['kind']) => {
    if (kind === 'canon') return '#4ade80';
    if (kind === 'mixed') return '#facc15';
    return '#fb7185';
  };

  return (
    <aside className="watch-panel" aria-label="Episodes playlist">
      <div className="watch-select-wrap">
        <Layers size={14} className="watch-select-wrap__icon" />
        <select
          className="watch-panel__select watch-panel__select--icon"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          aria-label="Filter by season"
        >
          <option value="all">Season 1 · {episodes.length.toLocaleString()} eps</option>
          {seasons.map((s) => (
            <option key={s} value={String(s)}>
              Season {s}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="watch-select-wrap__chev" />
      </div>

      {arcs.length > 2 && (
        <div className="watch-select-wrap">
          <BookOpen size={14} className="watch-select-wrap__icon" />
          <select
            className="watch-panel__select watch-panel__select--icon"
            value={selectedArc}
            onChange={(e) => setSelectedArc(e.target.value)}
            aria-label="Filter by story arc"
          >
            {arcs.map((arc) => (
              <option key={arc} value={arc}>
                {arc}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="watch-select-wrap__chev" />
        </div>
      )}

      <div className="browse-search-pill" style={{ width: '100%', height: 36, borderRadius: 12 }}>
        <Search size={14} style={{ opacity: 0.6 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('detail.searchEpisodes')}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          className="watch-pill"
          onClick={() => setOldestFirst((p) => !p)}
          title="Toggle order"
        >
          <ArrowDownUp size={13} />
          <span>{oldestFirst ? t('detail.oldest') : t('detail.newest')}</span>
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={gridView}
          style={{ padding: '0 10px' }}
          onClick={() => setGridView((p) => !p)}
          aria-label="Toggle grid or list view"
        >
          {gridView ? <List size={14} /> : <Grid size={14} />}
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={hideThumbs}
          style={{ padding: '0 10px' }}
          onClick={() => setHideThumbs((p) => !p)}
          aria-label="Toggle spoiler thumbnails"
        >
          {hideThumbs ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={hideFiller}
          onClick={() => setHideFiller((p) => !p)}
        >
          <span>{t('detail.hideFiller')}</span>
          {fillerCount > 0 && <span style={{ opacity: 0.65 }}>{fillerCount}</span>}
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={skipFiller}
          onClick={() => setSkipFiller((p) => !p)}
        >
          <span>{t('detail.skipFiller')}</span>
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={subOnly}
          onClick={() => {
            setSubOnly((p) => !p);
            if (!subOnly) setDubOnly(false);
          }}
        >
          <span>{t('detail.subOnly')}</span>
          <span style={{ opacity: 0.65 }}>{subCount.toLocaleString()}</span>
        </button>

        <button
          type="button"
          className="watch-pill"
          aria-pressed={dubOnly}
          onClick={() => {
            setDubOnly((p) => !p);
            if (!dubOnly) setSubOnly(false);
          }}
        >
          <span>{t('detail.dubOnly')}</span>
          <span style={{ opacity: 0.65 }}>{dubCount.toLocaleString()}</span>
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.52)',
          paddingInline: 2,
        }}
      >
        <span>{filtered.length} episodes</span>
        <span style={{ display: 'inline-flex', gap: 10 }}>
          <span>
            <i style={{ color: '#4ade80' }}>●</i> Canon
          </span>
          <span>
            <i style={{ color: '#facc15' }}>●</i> Mixed
          </span>
          <span>
            <i style={{ color: '#fb7185' }}>●</i> Filler
          </span>
        </span>
      </div>

      {gridView ? (
        <div className="ep-num-grid ep-num-grid--panel">
          {filtered.slice(0, gridView ? epLimit * 2 : epLimit).map((ep) => {
            const active = ep.number === currentEp;
            return (
              <button
                key={ep.number}
                type="button"
                onClick={() => onSelectEpisode(ep.number)}
                className={`ep-num-btn ${active ? 'is-active' : ''}`}
                aria-label={`Episode ${ep.number}`}
              >
                <span>{ep.number}</span>
              </button>
            );
          })}
          {filtered.length > epLimit * 2 && (
            <button
              type="button"
              className="watch-pill"
              onClick={() => setEpLimit((n) => n + 60)}
              style={{ gridColumn: '1 / -1', justifyContent: 'center', height: 36, marginTop: 4 }}
            >
              Show more episodes ({(filtered.length - epLimit * 2).toLocaleString()} more)
            </button>
          )}
        </div>
      ) : (
        <div className="watch-panel__list">
                  {filtered.slice(0, epLimit).map((ep, epIdx) => {
            const active = ep.number === currentEp;
            return (
              <button
                key={ep.number}
                type="button"
                onClick={() => onSelectEpisode(ep.number)}
                className={`watch-ep-row ${active ? 'is-active' : ''}`}
                style={{ textAlign: 'start' }}
              >
                {!hideThumbs && (
                  <div className="watch-ep-row__thumb">
                    {ep.thumbnail ? (
                      <img src={ep.thumbnail} alt="" loading={epIdx < 10 ? 'eager' : 'lazy'} />
                    ) : (
                      <div className="cw-placeholder">
                        <span className="cw-placeholder-number" style={{ fontSize: 22 }}>
                          {ep.number}
                        </span>
                      </div>
                    )}
                    <span className="watch-ep-row__epbadge">
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: kindColor(ep.kind),
                          flexShrink: 0,
                        }}
                      />
                      <span>Episode {ep.number}</span>
                    </span>
                    {active && (
                      <span className="watch-ep-row__now">
                        <Play size={10} fill="currentColor" style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        Now playing
                      </span>
                    )}
                    {ep.hasDub && (
                      <span className="detail-ep-badge-bl">
                        <Mic size={10} />
                        <span>DUB</span>
                      </span>
                    )}
                    <span className="detail-ep-duration">{ep.duration}</span>
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 650,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ep.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      lineHeight: 1.35,
                      color: 'rgba(255,255,255,0.62)',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {ep.synopsis}
                  </div>
                  <div style={{ marginTop: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.46)' }}>
                    {ep.aired}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length > epLimit && (
            <button
              type="button"
              className="watch-pill"
              onClick={() => setEpLimit((n) => n + 60)}
              style={{ width: '100%', justifyContent: 'center', height: 38, marginTop: 4 }}
            >
              Show more episodes ({(filtered.length - epLimit).toLocaleString()} more)
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
