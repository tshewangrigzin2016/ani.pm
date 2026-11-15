import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDownUp,
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronDown,
  Clock,
  Download,
  Eye,
  EyeOff,
  Film,
  Grid,
  List,
  MessageSquare,
  Mic,
  Play,
  Search,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import {
  CATALOG,
  HOME_FEED,
  MANGA_CATALOG,
  STILLS_POOL,
  findAnimeByParam,
  getDisplayTitle,
} from '@/src/data/catalogService';
import { buildEpisodesForAnime } from '@/src/utils/episodes';
import { filterEpisodeList } from '@/src/utils/catalogFilter';
import { AnimeCard } from '@/src/components/AnimeCard';
import { LibraryStatusTrigger } from '@/src/components/LibraryStatusTrigger';
import { AniListMark, MyAnimeListMark } from '@/src/components/TrackerMarks';
import { AvatarBadge } from '@/src/components/BrandMark';

type DetailTab = 'episodes' | 'related' | 'manga' | 'similar' | 'comments' | 'downloads';

export const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, contentPrefs, library, toggleLikeAnime, showToast } = useApp();

  const anime = useMemo(() => findAnimeByParam(id) ?? CATALOG[0], [id]);
  const allEpisodes = useMemo(() => buildEpisodesForAnime(anime, STILLS_POOL), [anime]);

  const [activeTab, setActiveTab] = useState<DetailTab>('episodes');
  const [expandedSyn, setExpandedSyn] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);
  const [epSearch, setEpSearch] = useState('');
  const [arcFilter, setArcFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');
  const [hideFiller, setHideFiller] = useState(false);
  const [skipFiller, setSkipFiller] = useState(false);
  const [hideSpoilerThumbs, setHideSpoilerThumbs] = useState(false);
  const [gridView, setGridView] = useState(false);
  const [audioFilter, setAudioFilter] = useState<'all' | 'sub' | 'dub'>('all');
  const [epLimit, setEpLimit] = useState(60);
  const [showAllTags, setShowAllTags] = useState(false);
  const [comments, setComments] = useState(HOME_FEED.comments.slice(0, 6));
  const [commentDraft, setCommentDraft] = useState('');

  useEffect(() => {
    setEpLimit(60);
  }, [id, arcFilter, epSearch, hideFiller, audioFilter]);

  const arcs = useMemo(() => Array.from(new Set(allEpisodes.map((e) => e.arc))), [allEpisodes]);
  const fillerCount = useMemo(() => allEpisodes.filter((e) => e.kind === 'filler').length, [allEpisodes]);

  const filteredEpisodes = useMemo(
    () =>
      filterEpisodeList(allEpisodes, {
        arc: arcFilter,
        query: epSearch,
        sortOrder,
        hideFiller,
        audioFilter,
      }),
    [allEpisodes, arcFilter, epSearch, sortOrder, hideFiller, audioFilter]
  );

  const similarTitles = useMemo(() => {
    const genreSet = new Set(anime.genres);
    return CATALOG.filter(
      (c) => c.routeId !== anime.routeId && c.genres.some((g) => genreSet.has(g))
    ).slice(0, 12);
  }, [anime]);

  const relatedTitles = useMemo(() => CATALOG.filter((c) => c.routeId !== anime.routeId).slice(0, 6), [anime]);
  const displayTitle = getDisplayTitle(anime, contentPrefs.titleLanguage === 'original');
  const isLiked = library.likedIds.includes(anime.routeId);
  const isOngoing = anime.status.toLowerCase().includes('releas') || anime.status.toLowerCase().includes('air');
  const estimatedViews = (anime.id * 94321 + anime.episodeCount * 1842).toLocaleString();

  const kindColor = (kind: 'canon' | 'mixed' | 'filler') => {
    if (kind === 'canon') return '#4ade80';
    if (kind === 'mixed') return '#facc15';
    return '#fb7185';
  };

  return (
    <div>
      <section className="detail-hero">
        <div className="detail-hero__bg">
          <img src={anime.banner ?? anime.poster} alt="" />
        </div>

        <div className="app-content-frame" style={{ position: 'relative', zIndex: 2, marginBottom: 14 }}>
          <button
            type="button"
            className="detail-back-circle"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="detail-layout">
          <div className="detail-aside-col">
            <div className="detail-poster">
              <img src={anime.poster} alt={displayTitle} />
            </div>

            <div className="detail-sidebar-meta">
              <div>
                <div className="detail-sidebar-row__label">Format</div>
                <div className="detail-sidebar-row__val">{anime.type}</div>
              </div>
              <div>
                <div className="detail-sidebar-row__label">Episodes</div>
                <div className="detail-sidebar-row__val">{anime.episodeCount || '?'}</div>
              </div>
              <div>
                <div className="detail-sidebar-row__label">Duration</div>
                <div className="detail-sidebar-row__val">
                  {anime.duration ? `${anime.duration} min per episode` : '24 min per episode'}
                </div>
              </div>
              <div>
                <div className="detail-sidebar-row__label">Aired</div>
                <div className="detail-sidebar-row__val">
                  {anime.season ? `${anime.season} ` : ''}
                  {anime.year ?? '—'}
                </div>
              </div>
              {anime.score !== null && (
                <div>
                  <div className="detail-sidebar-row__label">Score</div>
                  <div className="detail-sidebar-row__val" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Star size={13} fill="#ffd35a" color="#ffd35a" />
                    <span>{anime.score.toFixed(1)}</span>
                  </div>
                </div>
              )}
              <div>
                <div className="detail-sidebar-row__label">Views</div>
                <div className="detail-sidebar-row__val" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} style={{ opacity: 0.7 }} />
                  <span>{estimatedViews}</span>
                </div>
              </div>
              <div>
                <div className="detail-sidebar-row__label">Studios</div>
                <div className="detail-sidebar-row__val">
                  {anime.studios.length ? anime.studios.join(', ') : 'Independent'}
                </div>
              </div>
              {anime.season && (
                <div>
                  <div className="detail-sidebar-row__label">Season</div>
                  <div className="detail-sidebar-row__val">
                    {anime.season} {anime.year ?? ''}
                  </div>
                </div>
              )}
              <div>
                <div className="detail-sidebar-row__label">Status</div>
                <div className="detail-sidebar-row__val">
                  {isOngoing ? 'Airing' : 'Finished'}
                </div>
              </div>
              <div>
                <div className="detail-sidebar-row__label">Audio</div>
                <div className="detail-sidebar-row__val">
                  {anime.subCount} sub · {anime.dubCount} dub
                </div>
              </div>
              {anime.rating && (
                <div>
                  <div className="detail-sidebar-row__label">Rated</div>
                  <div className="detail-sidebar-row__val">{anime.rating}</div>
                </div>
              )}
              {anime.native && (
                <div>
                  <div className="detail-sidebar-row__label">Native title</div>
                  <div className="detail-sidebar-row__val">{anime.native}</div>
                </div>
              )}
              {anime.tags && anime.tags.length > 0 && (
                <div>
                  <div className="detail-sidebar-row__label">Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                    {(showAllTags ? anime.tags : anime.tags.slice(0, 4)).map((tg) => (
                      <Link
                        key={tg}
                        to={`/anime?tag=${encodeURIComponent(tg)}`}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          fontSize: 11.5,
                          color: 'rgba(255,255,255,0.86)',
                        }}
                      >
                        {tg}
                      </Link>
                    ))}
                    {anime.tags.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTags((s) => !s)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'transparent',
                          color: '#9cc3ff',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {showAllTags ? 'Less' : `+${anime.tags.length - 4} more`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="detail-main-col" style={{ minWidth: 0 }}>
            {anime.logo ? (
              <img
                src={anime.logo}
                alt={displayTitle}
                className="spot-logo"
                style={{ height: 110, marginBottom: 14 }}
              />
            ) : (
              <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 3.6vw, 46px)', fontWeight: 700, lineHeight: 1.05 }}>
                {displayTitle}
              </h1>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {anime.score !== null && (
                <span className="spot-meta-frost score">
                  <Star size={13} />
                  <span>{anime.score.toFixed(1)}</span>
                </span>
              )}
              {anime.year && <span className="spot-meta-frost">{anime.year}</span>}
              {anime.episodeCount > 0 && (
                <span className="spot-meta-frost">{anime.episodeCount} Episodes</span>
              )}
              {isOngoing && (
                <span className="spot-meta-frost" style={{ color: '#9cc3ff' }}>
                  <Clock size={12} />
                  <span>Next ep in 3d 14h</span>
                </span>
              )}
              {anime.type && <span className="spot-meta-frost">{anime.type}</span>}
              {anime.genres.slice(0, 3).map((g) => (
                <Link
                  key={g}
                  to={`/anime?genre=${encodeURIComponent(g)}`}
                  className="spot-meta-frost"
                >
                  {g}
                </Link>
              ))}
            </div>

            <p
              style={{
                maxWidth: 740,
                margin: 0,
                fontSize: 15,
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.88)',
                display: expandedSyn ? 'block' : '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: expandedSyn ? undefined : 3,
                overflow: 'hidden',
              }}
            >
              {anime.synopsis}
            </p>
            {anime.synopsis.length > 160 && (
              <button
                type="button"
                onClick={() => setExpandedSyn((p) => !p)}
                style={{
                  marginTop: 6,
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {expandedSyn ? 'Show less' : 'More'}
              </button>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 20 }}>
              <Link
                to={`/anime/${anime.routeId}?ep=1`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#09090b',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                <Play size={17} fill="currentColor" />
                <span>{t('detail.watchNow')}</span>
              </Link>

              <LibraryStatusTrigger routeId={anime.routeId} variant="hero" className="detail-action-circle" />

              <button
                type="button"
                className="detail-action-circle"
                aria-pressed={notifyOn}
                aria-label="Episode notifications"
                title={notifyOn ? 'Notifying' : 'Notify'}
                onClick={() => {
                  setNotifyOn((p) => !p);
                  showToast(notifyOn ? 'Episode alerts off' : 'Episode alerts enabled');
                }}
              >
                <Bell size={17} />
              </button>

              <button
                type="button"
                className="detail-action-circle"
                aria-label="Share anime"
                title="Share"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  showToast('Link copied to clipboard');
                }}
              >
                <Share2 size={17} />
              </button>

              <a
                href={`https://anilist.co/anime/${anime.anilistId ?? ''}`}
                target="_blank"
                rel="noreferrer"
                className="detail-action-circle"
                aria-label="View on AniList"
                title="AniList"
              >
                <AniListMark size={20} />
              </a>

              <a
                href={`https://myanimelist.net/anime/${anime.malId ?? ''}`}
                target="_blank"
                rel="noreferrer"
                className="detail-action-circle"
                aria-label="View on MyAnimeList"
                title="MyAnimeList"
              >
                <MyAnimeListMark size={20} />
              </a>

              <button
                type="button"
                className="detail-action-circle"
                aria-pressed={isLiked}
                aria-label="Add to Liked"
                title="Favorite / Like"
                onClick={() => {
                  toggleLikeAnime(anime.routeId);
                  showToast(isLiked ? 'Removed like' : 'Added to Liked');
                }}
              >
                <Star size={17} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Detail Underline Tabs */}
            <div className="underline-tabs" style={{ marginTop: 24 }}>
              {(
                [
                  { id: 'episodes', label: t('detail.episodes'), count: allEpisodes.length, icon: <List size={14} /> },
                  { id: 'related', label: t('detail.related'), count: relatedTitles.length, icon: <Film size={14} /> },
                  { id: 'manga', label: t('detail.manga'), count: 6, icon: <BookOpen size={14} /> },
                  { id: 'similar', label: t('detail.moreLikeThis'), icon: <Sparkles size={14} /> },
                  { id: 'comments', label: t('detail.comments'), count: comments.length || undefined, icon: <MessageSquare size={14} /> },
                  { id: 'downloads', label: t('detail.downloads'), icon: <Download size={14} /> },
                ] as { id: DetailTab; label: string; count?: number; icon: React.ReactNode }[]
              ).map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  className={`underline-tab ${activeTab === tb.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tb.id)}
                >
                  {tb.icon}
                  <span>{tb.label}</span>
                  {tb.count !== undefined && (
                    <span className="underline-tab__count">{tb.count.toLocaleString()}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'episodes' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {arcs.length > 1 && (
                    <div className="watch-select-wrap">
                      <BookOpen size={14} className="watch-select-wrap__icon" />
                      <select
                        className="watch-panel__select watch-panel__select--icon"
                        value={arcFilter}
                        onChange={(e) => setArcFilter(e.target.value)}
                        aria-label="Filter by story arc"
                      >
                        <option value="all">{t('detail.allArcs')}</option>
                        {arcs.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="watch-select-wrap__chev" />
                    </div>
                  )}

                  <div className="browse-search-pill" style={{ width: '100%', height: 38, borderRadius: 12 }}>
                    <Search size={14} style={{ opacity: 0.6 }} />
                    <input
                      type="text"
                      value={epSearch}
                      onChange={(e) => setEpSearch(e.target.value)}
                      placeholder={t('detail.searchEpisodes')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="watch-pill"
                      onClick={() => setSortOrder((p) => (p === 'oldest' ? 'newest' : 'oldest'))}
                    >
                      <ArrowDownUp size={13} />
                      <span>{sortOrder === 'oldest' ? t('detail.oldest') : t('detail.newest')}</span>
                    </button>

                    <button
                      type="button"
                      className="watch-pill"
                      aria-pressed={gridView}
                      aria-label="Toggle compact number grid"
                      onClick={() => setGridView((p) => !p)}
                      style={{ padding: '0 10px' }}
                    >
                      {gridView ? <List size={14} /> : <Grid size={14} />}
                    </button>

                    <button
                      type="button"
                      className="watch-pill"
                      aria-pressed={hideSpoilerThumbs}
                      aria-label="Toggle spoiler thumbnails"
                      onClick={() => setHideSpoilerThumbs((p) => !p)}
                      style={{ padding: '0 10px' }}
                    >
                      {hideSpoilerThumbs ? <EyeOff size={14} /> : <Eye size={14} />}
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
                      aria-pressed={audioFilter === 'sub'}
                      onClick={() => setAudioFilter((p) => (p === 'sub' ? 'all' : 'sub'))}
                    >
                      <span>{t('detail.subOnly')}</span>
                      <span style={{ opacity: 0.65 }}>{anime.subCount.toLocaleString()}</span>
                    </button>

                    <button
                      type="button"
                      className="watch-pill"
                      aria-pressed={audioFilter === 'dub'}
                      onClick={() => setAudioFilter((p) => (p === 'dub' ? 'all' : 'dub'))}
                    >
                      <span>{t('detail.dubOnly')}</span>
                      <span style={{ opacity: 0.65 }}>{anime.dubCount.toLocaleString()}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11.5, color: 'rgb(var(--c-text2))', paddingTop: 2 }}>
                    <span>
                      <i style={{ color: '#4ade80' }}>●</i> Canon: Main story
                    </span>
                    <span>
                      <i style={{ color: '#facc15' }}>●</i> Mixed: Canon + filler
                    </span>
                    <span>
                      <i style={{ color: '#fb7185' }}>●</i> Filler: Anime-original
                    </span>
                  </div>
                </div>

                {gridView ? (
                  <div className="ep-num-grid ep-num-grid--detail">
                    {filteredEpisodes.slice(0, epLimit * 2).map((ep) => (
                      <Link
                        key={ep.number}
                        to={`/anime/${anime.routeId}?ep=${ep.number}`}
                        className="ep-num-btn"
                        aria-label={`Episode ${ep.number}`}
                      >
                        <span>{ep.number}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="detail-ep-grid">
                    {filteredEpisodes.slice(0, epLimit).map((ep) => (
                      <Link
                        key={ep.number}
                        to={`/anime/${anime.routeId}?ep=${ep.number}`}
                        className="detail-ep-card"
                      >
                        <div className="detail-ep-thumb">
                          {!hideSpoilerThumbs && ep.thumbnail ? (
                            <img
                              src={ep.thumbnail}
                              alt={ep.title}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span className="cw-placeholder-number" style={{ fontSize: 28 }}>
                              {String(ep.number).padStart(2, '0')}
                            </span>
                          )}
                          <span className="detail-ep-badge-tl">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: kindColor(ep.kind) }} />
                            <span>Episode {ep.number}</span>
                          </span>
                          {ep.hasDub && (
                            <span className="detail-ep-badge-bl">
                              <Mic size={10} />
                              <span>DUB</span>
                            </span>
                          )}
                          <span className="detail-ep-duration">{ep.duration}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.3 }}>{ep.title}</div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: 'rgb(var(--c-text2))',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                            }}
                          >
                            {ep.synopsis}
                          </p>
                          <div style={{ marginTop: 'auto', fontSize: 11.5, color: 'rgb(var(--c-text3))' }}>
                            {ep.aired}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {filteredEpisodes.length > (gridView ? epLimit * 2 : epLimit) && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    <button
                      type="button"
                      className="watch-pill"
                      onClick={() => setEpLimit((n) => n + 60)}
                      style={{ height: 40, padding: '0 20px' }}
                    >
                      <span>
                        Load more episodes (
                        {(filteredEpisodes.length - (gridView ? epLimit * 2 : epLimit)).toLocaleString()} remaining)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'related' && (
              <div className="browse-grid" style={{ marginTop: 18 }}>
                {relatedTitles.map((r) => (
                  <AnimeCard key={r.routeId} anime={r} variant="grid" />
                ))}
              </div>
            )}

            {activeTab === 'manga' && (
              <div className="settings-card" style={{ marginTop: 18 }}>
                <h3 style={{ margin: '0 0 8px' }}>Read source manga</h3>
                <p style={{ margin: '0 0 14px', color: 'rgb(var(--c-text2))', fontSize: 13.5 }}>
                  Jump right into the manga adaptation chapters in the built-in Toonkotsu reader.
                </p>
                <Link
                  to={`/manga/${(MANGA_CATALOG[0]?.slug ?? anime.slug)}/1`}
                  className="watch-pill"
                  aria-pressed="true"
                >
                  Open Manga Reader
                </Link>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="browse-grid" style={{ marginTop: 18 }}>
                {similarTitles.map((s) => (
                  <AnimeCard key={s.routeId} anime={s} variant="grid" />
                ))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentDraft.trim()) return;
                    setComments((prev) => [
                      {
                        id: `c-${Date.now()}`,
                        username: 'You',
                        avatar: null,
                        timeAgo: 'Just now',
                        episode: 1,
                        body: commentDraft.trim(),
                        animeTitle: anime.title,
                        routeId: anime.routeId,
                        poster: anime.poster,
                      },
                      ...prev,
                    ]);
                    setCommentDraft('');
                  }}
                  style={{ display: 'flex', gap: 10 }}
                >
                  <input
                    type="text"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder={`Comment on ${anime.title}...`}
                    className="ytdlg-field"
                  />
                  <button type="submit" className="watch-pill" aria-pressed="true" style={{ height: 40, padding: '0 18px' }}>
                    Post
                  </button>
                </form>

                {comments.map((c) => (
                  <div key={c.id} className="settings-card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AvatarBadge username={c.username} avatar={c.avatar} size={24} />
                      <strong style={{ fontSize: 13 }}>{c.username}</strong>
                      <span style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))' }}>{c.timeAgo}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5 }}>{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="settings-card" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Direct offline episode packages</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'rgb(var(--c-text2))' }}>
                  Select a stream encode for offline playback.
                </p>
                {filteredEpisodes.slice(0, 5).map((ep) => (
                  <div
                    key={ep.number}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                      EP {ep.number} — {ep.title} (1080p MP4)
                    </span>
                    <a
                      href="/assets/media/sample-episode.mp4"
                      download={`${anime.slug}-ep-${ep.number}.mp4`}
                      className="watch-pill"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
