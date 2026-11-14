import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { CATALOG, FACETS } from '@/src/data/catalogService';
import type { AnimeSortKey, BrowseFilters } from '@/src/types/anime';
import { filterBrowseCatalog } from '@/src/utils/catalogFilter';
import { AnimeCard } from '@/src/components/AnimeCard';

const SORT_OPTIONS: { value: AnimeSortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Most popular' },
  { value: 'score', label: 'Highest score' },
  { value: 'mal', label: 'MAL score' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'episodes', label: 'Episode count' },
  { value: 'sub', label: 'Most subbed' },
  { value: 'dub', label: 'Most dubbed' },
];

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const FORMATS = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'];
const STATUSES = ['Airing', 'Finished', 'Upcoming'];

export const BrowsePage: React.FC = () => {
  const { t, contentPrefs } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filters: BrowseFilters = useMemo(() => {
    const genreParam = searchParams.get('genre');
    const sortParam = searchParams.get('sort') as AnimeSortKey | null;
    const formatParam = searchParams.get('format') ?? '';
    return {
      q: searchParams.get('q') ?? '',
      sort: sortParam ?? contentPrefs.defaultSort,
      genres: genreParam ? genreParam.split(',').filter(Boolean) : [],
      tags: (searchParams.get('tag') ?? '').split(',').filter(Boolean),
      studio: searchParams.get('studio') ?? '',
      year: searchParams.get('year') ?? '',
      season: searchParams.get('season') ?? '',
      format: formatParam,
      status: searchParams.get('status') ?? '',
      language: ((searchParams.get('lang') as 'any' | 'sub' | 'dub' | null) ?? contentPrefs.catalogLanguage),
      minScore: searchParams.get('minScore') ?? '',
      minEpisodes: searchParams.get('minEp') ?? '',
    };
  }, [searchParams, contentPrefs.defaultSort, contentPrefs.catalogLanguage]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const toggleMulti = (key: string, current: string[], item: string) => {
    const exists = current.includes(item);
    const updated = exists ? current.filter((x) => x !== item) : [...current, item];
    setParam(key, updated.length ? updated.join(',') : null);
  };

  const years = useMemo(() => {
    const uniq = Array.from(new Set(CATALOG.map((a) => a.year).filter((y): y is number => y !== null)));
    return uniq.sort((a, b) => b - a).slice(0, 25);
  }, []);

  const results = useMemo(
    () => filterBrowseCatalog(CATALOG, filters, contentPrefs.showMature18Plus),
    [filters, contentPrefs.showMature18Plus]
  );

  const hasActiveFilters =
    filters.q ||
    filters.genres.length > 0 ||
    filters.tags.length > 0 ||
    filters.studio ||
    filters.year ||
    filters.season ||
    filters.format ||
    filters.status ||
    filters.language !== 'any' ||
    filters.minScore ||
    filters.minEpisodes;

  const sortLabel = SORT_OPTIONS.find((s) => s.value === filters.sort)?.label ?? 'Trending';

  return (
    <div className="page-shell" onClick={() => setOpenMenu(null)}>
      {openMenu !== null && (
        <div
          className="sheet-mobile-scrim"
          style={{ zIndex: 2340 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(null);
          }}
        />
      )}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('browse.title')}</h1>
          <span className="page-subtitle">
            {t('browse.catalogued', { count: results.length.toLocaleString() })}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="watch-pill"
            onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
          >
            <X size={13} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      <div className="browse-filters" onClick={(e) => e.stopPropagation()}>
        <div className="browse-search-pill">
          <Search size={15} style={{ opacity: 0.65 }} />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setParam('q', e.target.value || null)}
            placeholder={t('browse.searchPlaceholder')}
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => setParam('q', null)}
              style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="browse-facet-btn"
            onClick={() => setOpenMenu((m) => (m === 'sort' ? null : 'sort'))}
          >
            <span>{sortLabel}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'sort' && (
            <div className="facet-popover">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`row-inline-opt ${filters.sort === opt.value ? 'active' : ''}`}
                  onClick={() => {
                    setParam('sort', opt.value);
                    setOpenMenu(null);
                  }}
                >
                  <span>{opt.label}</span>
                  {filters.sort === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Genres */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.genres.length ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'genres' ? null : 'genres'))}
          >
            <span>
              {filters.genres.length ? `${t('browse.genres')} (${filters.genres.length})` : t('browse.genres')}
            </span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'genres' && (
            <div className="facet-popover">
              {FACETS.genres.slice(0, 30).map((g) => {
                const active = filters.genres.includes(g.name);
                return (
                  <button
                    key={g.name}
                    type="button"
                    className={`row-inline-opt ${active ? 'active' : ''}`}
                    onClick={() => toggleMulti('genre', filters.genres, g.name)}
                  >
                    <span>{g.name}</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.tags.length ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'tags' ? null : 'tags'))}
          >
            <span>{filters.tags.length ? `${t('browse.tags')} (${filters.tags.length})` : t('browse.tags')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'tags' && (
            <div className="facet-popover">
              {FACETS.tags.slice(0, 30).map((tg) => {
                const active = filters.tags.includes(tg.name);
                return (
                  <button
                    key={tg.name}
                    type="button"
                    className={`row-inline-opt ${active ? 'active' : ''}`}
                    onClick={() => toggleMulti('tag', filters.tags, tg.name)}
                  >
                    <span>{tg.name}</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Studio */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.studio ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'studio' ? null : 'studio'))}
          >
            <span>{filters.studio || t('browse.studio')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'studio' && (
            <div className="facet-popover">
              <button
                type="button"
                className={`row-inline-opt ${!filters.studio ? 'active' : ''}`}
                onClick={() => {
                  setParam('studio', null);
                  setOpenMenu(null);
                }}
              >
                Any studio
              </button>
              {FACETS.studios.slice(0, 30).map((st) => (
                <button
                  key={st.name}
                  type="button"
                  className={`row-inline-opt ${filters.studio === st.name ? 'active' : ''}`}
                  onClick={() => {
                    setParam('studio', st.name);
                    setOpenMenu(null);
                  }}
                >
                  <span>{st.name}</span>
                  {filters.studio === st.name && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.year ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'year' ? null : 'year'))}
          >
            <span>{filters.year || t('browse.year')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'year' && (
            <div className="facet-popover">
              <button
                type="button"
                className="row-inline-opt"
                onClick={() => {
                  setParam('year', null);
                  setOpenMenu(null);
                }}
              >
                Any year
              </button>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`row-inline-opt ${filters.year === String(y) ? 'active' : ''}`}
                  onClick={() => {
                    setParam('year', String(y));
                    setOpenMenu(null);
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Season */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.season ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'season' ? null : 'season'))}
          >
            <span>{filters.season || t('browse.season')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'season' && (
            <div className="facet-popover">
              <button
                type="button"
                className="row-inline-opt"
                onClick={() => {
                  setParam('season', null);
                  setOpenMenu(null);
                }}
              >
                Any season
              </button>
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`row-inline-opt ${filters.season === s ? 'active' : ''}`}
                  onClick={() => {
                    setParam('season', s);
                    setOpenMenu(null);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Format */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.format ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'format' ? null : 'format'))}
          >
            <span>{filters.format || t('browse.format')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'format' && (
            <div className="facet-popover">
              <button
                type="button"
                className="row-inline-opt"
                onClick={() => {
                  setParam('format', null);
                  setOpenMenu(null);
                }}
              >
                Any format
              </button>
              {FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`row-inline-opt ${filters.format.toUpperCase() === f ? 'active' : ''}`}
                  onClick={() => {
                    setParam('format', f);
                    setOpenMenu(null);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.status ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'status' ? null : 'status'))}
          >
            <span>{filters.status || t('browse.status')}</span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'status' && (
            <div className="facet-popover">
              <button
                type="button"
                className="row-inline-opt"
                onClick={() => {
                  setParam('status', null);
                  setOpenMenu(null);
                }}
              >
                Any status
              </button>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`row-inline-opt ${filters.status.toLowerCase() === st.toLowerCase() ? 'active' : ''}`}
                  onClick={() => {
                    setParam('status', st.toLowerCase());
                    setOpenMenu(null);
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`browse-facet-btn is-plain ${filters.language !== 'any' ? 'has-value' : ''}`}
            onClick={() => setOpenMenu((m) => (m === 'lang' ? null : 'lang'))}
          >
            <span>
              {filters.language === 'sub'
                ? 'Subtitled'
                : filters.language === 'dub'
                  ? 'Dubbed'
                  : t('browse.language')}
            </span>
            <ChevronDown size={14} />
          </button>
          {openMenu === 'lang' && (
            <div className="facet-popover">
              {[
                { v: 'any', l: 'Any language' },
                { v: 'sub', l: 'Subtitled (CC)' },
                { v: 'dub', l: 'Dubbed' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  className={`row-inline-opt ${filters.language === opt.v ? 'active' : ''}`}
                  onClick={() => {
                    setParam('lang', opt.v === 'any' ? null : opt.v);
                    setOpenMenu(null);
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="browse-facet-btn is-plain"
          onClick={() => setShowAdvanced((p) => !p)}
        >
          <SlidersHorizontal size={13} />
          <span>{t('browse.advanced')}</span>
        </button>
      </div>

      {showAdvanced && (
        <div
          className="settings-card"
          style={{
            marginBottom: 22,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>Min score:</span>
            <select
              className="watch-panel__select"
              style={{ width: 110 }}
              value={filters.minScore}
              onChange={(e) => setParam('minScore', e.target.value || null)}
            >
              <option value="">Any</option>
              <option value="7">7.0+</option>
              <option value="7.5">7.5+</option>
              <option value="8">8.0+</option>
              <option value="8.5">8.5+</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>Min episodes:</span>
            <select
              className="watch-panel__select"
              style={{ width: 120 }}
              value={filters.minEpisodes}
              onChange={(e) => setParam('minEp', e.target.value || null)}
            >
              <option value="">Any</option>
              <option value="12">12+</option>
              <option value="24">24+</option>
              <option value="50">50+</option>
              <option value="100">100+</option>
            </select>
          </label>
        </div>
      )}

      {results.length === 0 ? (
        <div className="settings-card" style={{ textAlign: 'center', padding: 48 }}>
          <h3 style={{ margin: '0 0 8px' }}>No matching anime found</h3>
          <p style={{ margin: '0 0 18px', color: 'rgb(var(--c-text2))' }}>
            Try removing one or more filters or clearing your search query.
          </p>
          <button
            type="button"
            className="watch-pill"
            onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="browse-grid">
          {results.map((anime) => (
            <AnimeCard key={anime.routeId} anime={anime} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};
