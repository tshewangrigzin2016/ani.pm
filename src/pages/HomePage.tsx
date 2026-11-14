import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Captions,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
  Mic,
  Play,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import {
  CATALOG,
  FACETS,
  HOME_FEED,
  LATEST_EPISODES,
  SPOTLIGHT_ITEMS,
  findAnimeByParam,
  getDisplayTitle,
} from '@/src/data/catalogService';
import type { AnimeTitle, RankSource, TimeframeKey } from '@/src/types/anime';
import { AnimeCard } from '@/src/components/AnimeCard';
import { LibraryStatusTrigger } from '@/src/components/LibraryStatusTrigger';
import { MediaCarousel } from '@/src/components/MediaCarousel';
import { AvatarBadge, formatTimeSec } from '@/src/components/BrandMark';
import { AniListMark, MyAnimeListMark } from '@/src/components/TrackerMarks';

const TIMEFRAMES: { key: TimeframeKey; labelKey: string }[] = [
  { key: 'today', labelKey: 'home.today' },
  { key: 'week', labelKey: 'home.weekly' },
  { key: 'month', labelKey: 'home.monthly' },
  { key: 'all', labelKey: 'home.allTime' },
];

export const HomePage: React.FC = () => {
  const {
    t,
    dir,
    contentPrefs,
    library,
    chatMessages,
    setChatOpen,
    backupBannerDismissed,
    dismissBackupBanner,
  } = useApp();

  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Rail selectors
  const [animeTf, setAnimeTf] = useState<TimeframeKey>('week');
  const [animeTfOpen, setAnimeTfOpen] = useState(false);
  const [animeSource, setAnimeSource] = useState<RankSource>('anilist');

  const [movieTf, setMovieTf] = useState<TimeframeKey>('week');
  const [movieTfOpen, setMovieTfOpen] = useState(false);
  const [movieSource, setMovieSource] = useState<RankSource>('anilist');

  const [selectedGenre, setSelectedGenre] = useState<string>('Romance');
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [genreSource, setGenreSource] = useState<RankSource>('anilist');

  const [newFormat, setNewFormat] = useState<'Animes' | 'Movies' | 'OVAs'>('Animes');
  const [newFormatOpen, setNewFormatOpen] = useState(false);

  const [commentTab, setCommentTab] = useState<'newest' | 'top'>('newest');
  const [tickerIdx, setTickerIdx] = useState(0);

  const slides = SPOTLIGHT_ITEMS.length > 0 ? SPOTLIGHT_ITEMS : CATALOG.slice(0, 6);
  const activeSlide = slides[slideIdx] ?? slides[0];

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  useEffect(() => {
    if (chatMessages.length <= 1) return;
    const id = window.setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % chatMessages.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [chatMessages.length]);

  const sortBySource = (list: AnimeTitle[], src: RankSource) => {
    const copy = [...list];
    if (src === 'mal') {
      return copy.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return copy;
  };

  const topAnimes = useMemo(() => {
    const key = `/anime/top-watched?range=${animeTf}&view=rail`;
    const base = HOME_FEED.homeRails[key] ?? HOME_FEED.top ?? CATALOG.slice(0, 18);
    return sortBySource(base, animeSource);
  }, [animeTf, animeSource]);

  const topMovies = useMemo(() => {
    const key = `/anime/top-watched?range=${movieTf}&format=MOVIE&view=rail`;
    const fallbackMovies = CATALOG.filter((a) => a.type.toUpperCase() === 'MOVIE').slice(0, 18);
    const base = HOME_FEED.homeRails[key] ?? fallbackMovies;
    return sortBySource(base, movieSource);
  }, [movieTf, movieSource]);

  const topByGenre = useMemo(() => {
    let base: AnimeTitle[];
    if (selectedGenre === 'Romance') {
      const pre = HOME_FEED.homeRails['/anime/top-watched?range=month&genre=Romance&view=rail'];
      base = pre?.length
        ? pre
        : CATALOG.filter((a) => a.genres.some((g) => g.toLowerCase() === 'romance')).slice(0, 18);
    } else {
      const matches = CATALOG.filter((a) =>
        a.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
      base = (matches.length ? matches : CATALOG).slice(0, 18);
    }
    return sortBySource(base, genreSource);
  }, [selectedGenre, genreSource]);

  const newAnimes = useMemo(() => {
    const base =
      HOME_FEED.homeRails['/anime/catalog?sort=newest&year=2026&avail=sourced&page=1&view=rail'] ??
      HOME_FEED.homeRails['/anime/catalog?sort=newest&status=RELEASING&avail=sourced&page=1&view=rail'] ??
      CATALOG.slice(0, 18);
    if (newFormat === 'Movies') {
      const mov = CATALOG.filter((a) => a.type.toUpperCase() === 'MOVIE').slice(0, 18);
      return mov.length ? mov : base;
    }
    if (newFormat === 'OVAs') {
      const ova = CATALOG.filter((a) => ['OVA', 'ONA', 'SPECIAL'].includes(a.type.toUpperCase())).slice(0, 18);
      return ova.length ? ova : base;
    }
    return base;
  }, [newFormat]);

  const commentsToShow = useMemo(() => {
    const base = [...(HOME_FEED.comments ?? [])];
    if (commentTab === 'top') {
      base.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }
    return base.slice(0, 6);
  }, [commentTab]);

  const liveMsg = chatMessages[tickerIdx % Math.max(1, chatMessages.length)];
  const currentBanner = activeSlide?.banner ?? activeSlide?.poster;

  const prevSlide = () => setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setSlideIdx((prev) => (prev + 1) % slides.length);

  return (
    <div className="home">
      {!backupBannerDismissed && (
        <div className="backup-domain">
          <div className="backup-domain__bar">
            <span className="backup-domain__text">
              <a href="https://ani.nz" target="_blank" rel="noreferrer" className="backup-domain__link">
                ani.nz
              </a>{' '}
              {t('home.backupDomain')}
            </span>
            <button
              type="button"
              className="backup-domain__close"
              aria-label="Dismiss backup domain notice"
              onClick={dismissBackupBanner}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Spotlight Carousel */}
      <section
        className="spot"
        aria-label="Featured spotlight"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prevSlide();
          if (e.key === 'ArrowRight') nextSlide();
        }}
        tabIndex={0}
      >
        <div className="spot-visual">
          {currentBanner && (
            <div className="spot-ambient">
              <img src={currentBanner} alt="" className="spot-ambient-image" />
            </div>
          )}

          <div className="spot-stage">
            <div
              className="spot-track"
              style={{
                transform: `translateX(${dir === 'rtl' ? slideIdx * 100 : -slideIdx * 100}%)`,
              }}
            >
              {slides.map((slide) => {
                const displayTitle = getDisplayTitle(
                  slide,
                  contentPrefs.titleLanguage === 'original'
                );
                return (
                  <div key={slide.routeId} className="spot-slide">
                    <div className="spot-visual-art">
                      <img src={slide.banner ?? slide.poster} alt={displayTitle} />
                      <div className="spot-cinematic-grade" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {activeSlide && (
          <div className="spot-body">
            <div className="spot-copy">
              {activeSlide.logo ? (
                <img
                  src={activeSlide.logo}
                  alt={getDisplayTitle(activeSlide, contentPrefs.titleLanguage === 'original')}
                  className="spot-logo"
                />
              ) : (
                <h1
                  className="spot-title"
                  data-long={activeSlide.title.length > 26 ? 'true' : 'false'}
                >
                  {getDisplayTitle(activeSlide, contentPrefs.titleLanguage === 'original')}
                </h1>
              )}

              <div className="meta">
                {activeSlide.score !== null && activeSlide.score > 0 && (
                  <span className="spot-meta-frost score">
                    <Star size={13} />
                    <span>{activeSlide.score.toFixed(1)}</span>
                  </span>
                )}
                {activeSlide.year && <span className="spot-meta-frost">{activeSlide.year}</span>}
                {activeSlide.episodeCount > 0 && (
                  <span className="spot-meta-frost">{activeSlide.episodeCount} Episodes</span>
                )}
                {activeSlide.type && <span className="spot-meta-frost">{activeSlide.type}</span>}
                {activeSlide.genres.slice(0, 3).map((g) => (
                  <Link
                    key={g}
                    to={`/anime?genre=${encodeURIComponent(g)}`}
                    className="spot-meta-frost"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              <p className="spot-syn">{activeSlide.synopsis}</p>

              <div className="actions">
                <Link to={`/anime/${activeSlide.routeId}/1`} className="btn btn-play">
                  <Play size={18} fill="currentColor" />
                  <span>{t('home.play')}</span>
                </Link>
                <LibraryStatusTrigger routeId={activeSlide.routeId} variant="hero" />
                <Link
                  to={`/anime/${activeSlide.routeId}`}
                  className="btn btn-ghost"
                  aria-label="Title info & episodes"
                >
                  <Info size={20} />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="spot-nav">
          <button
            type="button"
            className="spot-nav-btn"
            aria-label="Previous spotlight"
            onClick={prevSlide}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="spot-nav-btn"
            aria-label="Next spotlight"
            onClick={nextSlide}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </section>

      {/* Main Content Rails */}
      <div className="rows">
        {/* Site Activity Floating Pill */}
        <div className="home-activity-pill spot-meta-frost">
          <div className="home-activity-pill__counts">
            <span className="home-activity-pill__stat">
              <span className="home-activity-pill__dot" />
              <strong>23,303</strong> {t('home.watching')}
            </span>
            <span className="home-activity-pill__stat-divider" />
            <span className="home-activity-pill__stat">
              <strong>87,375</strong> {t('home.online')}
            </span>
          </div>

          <span className="home-activity-pill__chat-divider" />

          <button
            type="button"
            className="home-activity-pill__chat"
            onClick={() => setChatOpen(true)}
            title="Open live community chat"
          >
            <MessageSquare size={12} style={{ flexShrink: 0, opacity: 0.78 }} />
            {liveMsg && (
              <span className="home-activity-pill__message">
                <span className="home-activity-pill__name">{liveMsg.username}:</span>
                <span className="home-activity-pill__body">{liveMsg.body}</span>
              </span>
            )}
          </button>

          <span className="home-activity-pill__chat-divider" />

          <span className="home-activity-pill__mirrors">
            <Bookmark size={12} style={{ opacity: 0.72 }} />
            <span>{t('home.bookmark')}</span>
            <Link to="/" className="home-activity-pill__mirror">
              ani.pm
            </Link>
            <span>&amp;</span>
            <a
              href="https://ani.nz"
              target="_blank"
              rel="noreferrer"
              className="home-activity-pill__mirror"
            >
              ani.nz
            </a>
          </span>
        </div>

        {/* Continue Watching Rail */}
        {contentPrefs.showContinueWatchingOnHome && library.history.length > 0 && (
          <MediaCarousel
            title={<h2 className="row-h">{t('home.continueWatching')}</h2>}
            viewAllTo="/library?tab=history"
          >
            {library.history.map((item) => {
              const anime = findAnimeByParam(item.routeId);
              if (!anime) return null;
              const pct = item.durationSec > 0 ? Math.min(100, (item.positionSec / item.durationSec) * 100) : 0;
              return (
                <Link
                  key={`${item.routeId}-${item.episode}`}
                  to={`/anime/${anime.routeId}/${item.episode}`}
                  className="cw"
                  style={{ flex: '0 0 288px', width: 288 }}
                >
                  <div className="cw-thumb">
                    <img src={anime.banner ?? anime.poster} alt={anime.title} loading="lazy" />
                    <div className="cw-shade" />
                    <div className="cw-badges-tl">
                      <span className="cw-badge">EP {item.episode}</span>
                      <span className="cw-badge">{item.audioMode.toUpperCase()}</span>
                    </div>
                    <span className="cw-duration">{formatTimeSec(item.positionSec)}</span>
                    <div className="cw-inside">
                      <div className="cw-title">{anime.title}</div>
                      <div className="cw-detail">Continue episode {item.episode}</div>
                    </div>
                    <div className="cw-prog">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </MediaCarousel>
        )}

        {/* Top [Timeframe] Animes */}
        <MediaCarousel
          title={
            <>
              <h2 className="row-h">
                <span>{t('home.top')}</span>
                <span style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="row-inline-trigger"
                    onClick={() => setAnimeTfOpen((p) => !p)}
                  >
                    <span>
                      {t(TIMEFRAMES.find((x) => x.key === animeTf)?.labelKey ?? 'home.weekly')}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {animeTfOpen && (
                    <div className="row-inline-dropdown">
                      {TIMEFRAMES.map((tf) => (
                        <button
                          key={tf.key}
                          type="button"
                          className={`row-inline-opt ${animeTf === tf.key ? 'active' : ''}`}
                          onClick={() => {
                            setAnimeTf(tf.key);
                            setAnimeTfOpen(false);
                          }}
                        >
                          <span>{t(tf.labelKey)}</span>
                          {animeTf === tf.key && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </span>
                <span>{t('home.animes')}</span>
              </h2>

              <div className="top-source">
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={animeSource === 'mal'}
                  onClick={() => setAnimeSource('mal')}
                >
                  <MyAnimeListMark size={20} />
                  <span>MAL</span>
                </button>
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={animeSource === 'anilist'}
                  onClick={() => setAnimeSource('anilist')}
                >
                  <AniListMark size={20} />
                  <span>AniList</span>
                </button>
              </div>
            </>
          }
          viewAllTo="/anime?sort=popular"
        >
          {topAnimes.map((anime) => (
            <AnimeCard key={`top-${anime.routeId}`} anime={anime} variant="rail" />
          ))}
        </MediaCarousel>

        {/* Top [Timeframe] Movies */}
        <MediaCarousel
          title={
            <>
              <h2 className="row-h">
                <span>{t('home.top')}</span>
                <span style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="row-inline-trigger"
                    onClick={() => setMovieTfOpen((p) => !p)}
                  >
                    <span>
                      {t(TIMEFRAMES.find((x) => x.key === movieTf)?.labelKey ?? 'home.weekly')}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {movieTfOpen && (
                    <div className="row-inline-dropdown">
                      {TIMEFRAMES.map((tf) => (
                        <button
                          key={tf.key}
                          type="button"
                          className={`row-inline-opt ${movieTf === tf.key ? 'active' : ''}`}
                          onClick={() => {
                            setMovieTf(tf.key);
                            setMovieTfOpen(false);
                          }}
                        >
                          <span>{t(tf.labelKey)}</span>
                          {movieTf === tf.key && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </span>
                <span>{t('home.movies')}</span>
              </h2>

              <div className="top-source">
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={movieSource === 'mal'}
                  onClick={() => setMovieSource('mal')}
                >
                  <MyAnimeListMark size={20} />
                  <span>MAL</span>
                </button>
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={movieSource === 'anilist'}
                  onClick={() => setMovieSource('anilist')}
                >
                  <AniListMark size={20} />
                  <span>AniList</span>
                </button>
              </div>
            </>
          }
          viewAllTo="/anime?format=MOVIE"
        >
          {topMovies.map((anime) => (
            <AnimeCard key={`mov-${anime.routeId}`} anime={anime} variant="rail" />
          ))}
        </MediaCarousel>

        {/* Top [Genre] Animes */}
        <MediaCarousel
          title={
            <>
              <h2 className="row-h">
                <span>{t('home.top')}</span>
                <span style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="row-inline-trigger"
                    onClick={() => setGenreMenuOpen((p) => !p)}
                  >
                    <span>{selectedGenre}</span>
                    <ChevronDown size={16} />
                  </button>
                  {genreMenuOpen && (
                    <div className="row-inline-dropdown">
                      {FACETS.genres.slice(0, 18).map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          className={`row-inline-opt ${selectedGenre === g.name ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedGenre(g.name);
                            setGenreMenuOpen(false);
                          }}
                        >
                          <span>{g.name}</span>
                          {selectedGenre === g.name && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </span>
                <span>{t('home.animes')}</span>
              </h2>

              <div className="top-source">
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={genreSource === 'mal'}
                  onClick={() => setGenreSource('mal')}
                >
                  <MyAnimeListMark size={20} />
                  <span>MAL</span>
                </button>
                <button
                  type="button"
                  className="top-source__btn"
                  aria-pressed={genreSource === 'anilist'}
                  onClick={() => setGenreSource('anilist')}
                >
                  <AniListMark size={20} />
                  <span>AniList</span>
                </button>
              </div>
            </>
          }
          viewAllTo={`/anime?genre=${encodeURIComponent(selectedGenre)}`}
        >
          {topByGenre.map((anime) => (
            <AnimeCard key={`gen-${anime.routeId}`} anime={anime} variant="rail" />
          ))}
        </MediaCarousel>

        {/* New Animes / Movies / OVAs */}
        <MediaCarousel
          title={
            <h2 className="row-h">
              <span>New</span>
              <span style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="row-inline-trigger"
                  onClick={() => setNewFormatOpen((p) => !p)}
                >
                  <span>{newFormat}</span>
                  <ChevronDown size={16} />
                </button>
                {newFormatOpen && (
                  <div className="row-inline-dropdown">
                    {(['Animes', 'Movies', 'OVAs'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        className={`row-inline-opt ${newFormat === fmt ? 'active' : ''}`}
                        onClick={() => {
                          setNewFormat(fmt);
                          setNewFormatOpen(false);
                        }}
                      >
                        <span>{fmt}</span>
                        {newFormat === fmt && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </span>
            </h2>
          }
          viewAllTo={newFormat === 'Movies' ? '/anime?sort=newest&format=MOVIE' : '/anime?sort=newest'}
        >
          {newAnimes.map((anime) => (
            <AnimeCard key={`new-${anime.routeId}`} anime={anime} variant="rail" />
          ))}
        </MediaCarousel>

        {/* Toonkotsu Manga Promo Banner */}
        <div className="app-content-frame">
          <Link to="/manga" className="tk-promo" aria-label="Read manga on Toonkotsu">
            <picture>
              <source srcSet="/assets/misc/toonkotsu-banner-1000x124-kCVs7T0w.avif" type="image/avif" />
              <img
                src="/assets/misc/toonkotsu-banner-1000x124-BHfg1slQ.webp"
                alt="Read manga cleanly in full resolution"
              />
            </picture>
          </Link>
        </div>

        {/* Comments Section */}
        <section className="community-section">
          <div className="row-head">
            <div className="row-head-title">
              <h2 className="row-h">
                <span style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="row-inline-trigger"
                    onClick={() => setCommentTab((p) => (p === 'newest' ? 'top' : 'newest'))}
                  >
                    <span>{commentTab === 'newest' ? t('home.newest') : t('home.topRated')}</span>
                    <ChevronDown size={16} />
                  </button>
                </span>
                <span>{t('home.comments')}</span>
              </h2>
            </div>
            <Link to="/community" className="row-view-all">
              <span>{t('home.viewAll')}</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="home-comments-grid">
            {commentsToShow.map((c) => (
              <article key={c.id} className="home-comment-card">
                <Link to={`/anime/${c.routeId}`} className="home-comment-card__poster">
                  <img src={c.poster} alt={c.animeTitle} loading="lazy" />
                </Link>
                <div className="home-comment-card__body">
                  <div className="home-comment-card__user">
                    <AvatarBadge
                      username={c.username}
                      avatar={c.avatar}
                      color={c.avatarColor}
                      size={20}
                    />
                    <span className="home-comment-card__name">{c.username}</span>
                    {c.isVip && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(138,196,255,0.18)',
                          color: '#9fd0ff',
                        }}
                      >
                        VIP
                      </span>
                    )}
                    <span className="home-comment-card__time">{c.timeAgo}</span>
                    {c.episode && (
                      <span className="home-comment-card__ep">EP {c.episode}</span>
                    )}
                  </div>
                  <p className="home-comment-card__text">{c.body}</p>
                  {c.mediaUrl && (
                    <img src={c.mediaUrl} alt="" className="home-comment-card__media" loading="lazy" />
                  )}
                  <Link to={`/anime/${c.routeId}`} className="home-comment-card__anime">
                    {c.animeTitle}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Latest Episodes Grid */}
        <section className="home-latest-feed">
          <div className="row-head">
            <h2 className="row-h">{t('home.latestEpisodes')}</h2>
            <Link to="/latest" className="row-view-all">
              <span>{t('home.viewAll')}</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="latest-grid-4">
            {LATEST_EPISODES.slice(0, 12).map((ep) => (
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
        </section>
      </div>
    </div>
  );
};
