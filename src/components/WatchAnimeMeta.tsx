import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Captions,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Mic,
  Play,
  Star,
  ThumbsDown,
  ThumbsUp,
  Tv,
  X,
} from 'lucide-react';
import type { AnimeTitle } from '@/src/types/anime';
import type { WatchOrderItem } from '@/src/utils/watchRelations';
import { useApp } from '@/src/context/AppContext';
import { LibraryStatusTrigger } from './LibraryStatusTrigger';
import { AniListMark, MyAnimeListMark } from './TrackerMarks';

interface WatchAnimeMetaProps {
  anime: AnimeTitle;
  watchOrder: WatchOrderItem[];
}

export const WatchAnimeMeta: React.FC<WatchAnimeMetaProps> = ({ anime, watchOrder }) => {
  const navigate = useNavigate();
  const { createWatchRoom, user, showToast } = useApp();

  const [notifyOn, setNotifyOn] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [synExpanded, setSynExpanded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const shelfRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!trailerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTrailerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [trailerOpen]);

  const baseLikes = 230 + (anime.id % 97);
  const baseDislikes = 3 + (anime.id % 5);
  const likesCount = baseLikes + (vote === 'up' ? 1 : 0);
  const dislikesCount = baseDislikes + (vote === 'down' ? 1 : 0);

  const estimatedViews = (anime.id * 94321 + Math.max(12, anime.episodeCount) * 1842).toLocaleString();
  const airedLabel = anime.year ? `${anime.season ? `${anime.season} ` : ''}${anime.year}` : '2026';
  const tagsList = Array.from(new Set([...anime.genres, ...(anime.tags ?? [])])).slice(0, 18);

  const handleStartWatchTogether = () => {
    const room = createWatchRoom({
      name: `${anime.title} watch party`,
      routeId: anime.routeId,
      hostName: user?.username ?? 'Host',
      isPublic: true,
    });
    navigate(`/watch-together/${room.code}`);
  };

  const scrollShelf = (dir: -1 | 1) => {
    shelfRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="ytw-ab">
      {/* Series Metadata Hero Card */}
      <div className="ytw-ab-hero">
        <div className="ytw-ab-aside">
          <Link to={`/anime/${anime.routeId}`} className="ytw-ab-cover">
            <img src={anime.poster} alt={anime.title} />
            {anime.score !== null && (
              <span className="ytw-ab-cover__score">
                <Star size={11} fill="#ffd35a" color="#ffd35a" />
                <span>{anime.score.toFixed(1)}</span>
              </span>
            )}
          </Link>

          <a
            href={`https://anilist.co/anime/${anime.anilistId ?? ''}`}
            target="_blank"
            rel="noreferrer"
            className="ytw-ab-ext-btn"
          >
            <AniListMark size={20} />
            <span>AniList</span>
          </a>

          <a
            href={`https://myanimelist.net/anime/${anime.malId ?? ''}`}
            target="_blank"
            rel="noreferrer"
            className="ytw-ab-ext-btn"
          >
            <MyAnimeListMark size={20} />
            <span>MAL</span>
          </a>

          <button
            type="button"
            className="ytw-ab-ext-btn"
            onClick={() => setTrailerOpen(true)}
          >
            <Play size={13} />
            <span>Trailer</span>
          </button>
        </div>

        <div className="ytw-ab-main">
          <div>
            <Link to={`/anime/${anime.routeId}`} className="ytw-ab-title">
              {anime.title}
            </Link>
            {anime.native && <div className="ytw-ab-native">{anime.native}</div>}
            <div className="ytw-ab-stats">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Play size={11} fill="currentColor" />
                <span>{estimatedViews} views</span>
              </span>
              <span>·</span>
              <span>{anime.type}</span>
              <span>·</span>
              <span>{airedLabel}</span>
              <span>·</span>
              <span>{anime.episodeCount || 12} episodes</span>
            </div>
          </div>

          <div className="ytw-ab-actions">
            <LibraryStatusTrigger
              routeId={anime.routeId}
              variant="inline"
              label="Add to library"
              className="ytw-ab-lib-pill"
            />

            <button
              type="button"
              className="ytw-ab-icon-btn"
              aria-pressed={notifyOn}
              aria-label="Episode alerts"
              title={notifyOn ? 'Alerts enabled' : 'Notify on new episodes'}
              onClick={() => {
                setNotifyOn((p) => !p);
                showToast(notifyOn ? 'Episode alerts turned off' : 'Episode alerts enabled');
              }}
            >
              <Bell size={15} />
            </button>

            <div className="ytw-ab-vote" role="group" aria-label={`Like or dislike ${anime.title}`}>
              <button
                type="button"
                aria-pressed={vote === 'up'}
                onClick={() => setVote((v) => (v === 'up' ? null : 'up'))}
              >
                <ThumbsUp size={14} fill={vote === 'up' ? 'currentColor' : 'none'} />
                <span>{likesCount}</span>
              </button>
              <span className="ytw-ab-vote__sep" aria-hidden="true" />
              <button
                type="button"
                aria-pressed={vote === 'down'}
                onClick={() => setVote((v) => (v === 'down' ? null : 'down'))}
              >
                <ThumbsDown size={14} fill={vote === 'down' ? 'currentColor' : 'none'} />
                <span>{dislikesCount}</span>
              </button>
            </div>

            <button
              type="button"
              className="watch-pill"
              onClick={handleStartWatchTogether}
              style={{ height: 34, padding: '0 14px' }}
            >
              <Tv size={14} />
              <span>Watch together</span>
            </button>
          </div>

          <div>
            <div className="ytw-ab-about-label">About the series</div>
            <p className={`ytw-ab-synopsis ${synExpanded ? 'is-expanded' : ''}`}>
              {anime.synopsis}
            </p>
            {anime.synopsis.length > 260 && (
              <button
                type="button"
                className="ytw-ab-more-btn"
                onClick={() => setSynExpanded((p) => !p)}
              >
                {synExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Information Metadata Grid */}
      <section className="ytw-ab__sec ytw-ab__sec--info" aria-label="Information">
        <header className="ytw-ab__sechead">
          <Info size={18} style={{ opacity: 0.85 }} />
          <h3>Information</h3>
        </header>

        <dl className="ytw-ab-info">
          <div className="ytw-ab-info__row">
            <dt className="ytw-ab-info__k">Season</dt>
            <dd className="ytw-ab-info__v">
              <Link
                to={`/anime?season=${encodeURIComponent((anime.season ?? 'fall').toLowerCase())}`}
                className="ytw-ab__link ytw-ab__link--acc"
              >
                {anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1).toLowerCase() : 'Fall'}
              </Link>
            </dd>
          </div>

          <div className="ytw-ab-info__row">
            <dt className="ytw-ab-info__k">Status</dt>
            <dd className="ytw-ab-info__v">
              <Link
                to={`/anime?status=${encodeURIComponent(anime.status.toUpperCase())}`}
                className="ytw-ab__link ytw-ab__link--acc"
              >
                {anime.status.toLowerCase().includes('finish') ? 'Finished' : 'Releasing'}
              </Link>
            </dd>
          </div>

          <div className="ytw-ab-info__row">
            <dt className="ytw-ab-info__k">Studio</dt>
            <dd className="ytw-ab-info__v">
              {anime.studios.length > 0 ? (
                <Link
                  to={`/anime?studio=${encodeURIComponent(anime.studios[0])}`}
                  className="ytw-ab__link ytw-ab__link--acc"
                >
                  {anime.studios.join(', ')}
                </Link>
              ) : (
                <span>Independent</span>
              )}
            </dd>
          </div>

          <div className="ytw-ab-info__row">
            <dt className="ytw-ab-info__k">Rated</dt>
            <dd className="ytw-ab-info__v">{anime.rating ?? 'PG-13'}</dd>
          </div>

          <div className="ytw-ab-info__row ytw-ab-info__row--wide">
            <dt className="ytw-ab-info__k">Watch on</dt>
            <dd className="ytw-ab-info__v">
              <div className="ytw-ab-run">
                <a
                  href={`https://anilist.co/anime/${anime.anilistId ?? ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ytw-ab__link ytw-ab__link--acc"
                >
                  Official Site <ExternalLink size={11} />
                </a>
                <a
                  href={`https://myanimelist.net/anime/${anime.malId ?? ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ytw-ab__link ytw-ab__link--acc"
                >
                  MyAnimeList <ExternalLink size={11} />
                </a>
                <Link to="/watch-together" className="ytw-ab__link ytw-ab__link--acc">
                  Watch Party <ExternalLink size={11} />
                </Link>
              </div>
            </dd>
          </div>

          <div className="ytw-ab-info__row ytw-ab-info__row--wide">
            <dt className="ytw-ab-info__k">Tags</dt>
            <dd className="ytw-ab-info__v">
              <div className="ytw-ab-run">
                {tagsList.map((tag) => (
                  <Link
                    key={tag}
                    to={`/anime?genre=${encodeURIComponent(tag)}`}
                    className="ytw-ab__link ytw-ab__link--acc"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </dd>
          </div>
        </dl>
      </section>

      {/* Watch Order Shelf */}
      {watchOrder.length > 0 && (
        <section className="ytw-ab__sec ytw-ab__sec--shelf" aria-label="Watch order">
          <div className="ytw-order-head">
            <h3 className="ytw-order-title">Watch order</h3>
            {watchOrder.length > 3 && (
              <div className="ytw-order-arrows">
                <button
                  type="button"
                  className="ytw-ab-icon-btn"
                  aria-label="Scroll watch order left"
                  onClick={() => scrollShelf(-1)}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  className="ytw-ab-icon-btn"
                  aria-label="Scroll watch order right"
                  onClick={() => scrollShelf(1)}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          <div ref={shelfRef} className="ytw-order-shelf">
            {watchOrder.map((entry) => (
              <Link
                key={entry.anime.routeId}
                to={`/anime/${entry.anime.routeId}/1`}
                className={`ytw-order-card ${entry.isCurrent ? 'is-current' : ''}`}
              >
                <img src={entry.anime.poster} alt={entry.anime.title} />
                <div className="ytw-order-card__scrim" />

                <div className="ytw-order-card__badges">
                  <span className={`ytw-order-pill ${entry.isCurrent ? 'is-here' : ''}`}>
                    {entry.badgeTopLeft}
                  </span>
                  {entry.badgeOptional && (
                    <span className="ytw-order-pill">{entry.badgeOptional}</span>
                  )}
                </div>

                <div className="ytw-order-card__foot">
                  <div className="ytw-order-card__name">{entry.anime.title}</div>
                  <div className="ytw-order-card__meta">
                    {entry.anime.genres[0] && <span>{entry.anime.genres[0]}</span>}
                    <span className="ytw-order-card__counts">
                      <Captions size={10} /> {entry.anime.subCount || entry.anime.episodeCount}
                    </span>
                    {entry.anime.dubCount > 0 && (
                      <span className="ytw-order-card__counts">
                        <Mic size={10} /> {entry.anime.dubCount}
                      </span>
                    )}
                    {entry.anime.score !== null && (
                      <span className="ytw-order-card__score">
                        {entry.anime.score.toFixed(1)}
                        <Star size={9} fill="#ffd35a" color="#ffd35a" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Toonkotsu Banner */}
      <Link
        to="/manga"
        className="tk-promo"
        aria-label="Toonkotsu: read manga, manhwa and manhua free"
      >
        <picture>
          <source type="image/avif" srcSet="/assets/misc/toonkotsu-banner-1000x124-kCVs7T0w.avif" />
          <source type="image/webp" srcSet="/assets/misc/toonkotsu-banner-1000x124-BHfg1slQ.webp" />
          <img
            src="/assets/misc/toonkotsu-banner-1000x124-BHfg1slQ.webp"
            alt="Toonkotsu — Read Manga, Manhwa & Manhua Free"
          />
        </picture>
      </Link>

      {/* Inline Trailer Preview Dialog */}
      {trailerOpen && (
        <div
          className="ytdlg-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${anime.title} trailer`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setTrailerOpen(false);
          }}
        >
          <div className="ytdlg-panel" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{anime.title} — Official PV</h3>
              <button
                type="button"
                className="yt-icon-button"
                aria-label="Close trailer"
                onClick={() => setTrailerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <video
              src="/assets/media/sample-episode.mp4"
              poster={anime.banner ?? anime.poster}
              controls
              preload="metadata"
              playsInline
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: 12,
                background: '#050507',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
