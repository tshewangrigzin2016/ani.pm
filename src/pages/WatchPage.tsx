import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lightbulb,
  Maximize2,
  Mic,
  Monitor,
  Server,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import {
  CATALOG,
  MANGA_CATALOG,
  STILLS_POOL,
  findAnimeByParam,
} from '@/src/data/catalogService';
import { buildEpisodesForAnime } from '@/src/utils/episodes';
import {
  getRelatedAnimeForWatch,
  getRelatedMangaForWatch,
  getWatchOrderForAnime,
} from '@/src/utils/watchRelations';
import { GlassPlayer } from '@/src/components/GlassPlayer';
import { WatchPlaylistPanel } from '@/src/components/WatchPlaylistPanel';
import { LibraryStatusTrigger } from '@/src/components/LibraryStatusTrigger';
import { WatchAnimeMeta } from '@/src/components/WatchAnimeMeta';
import { WatchCommentsSection } from '@/src/components/WatchCommentsSection';
import { WatchSidebarExtras } from '@/src/components/WatchSidebarExtras';

export const WatchPage: React.FC = () => {
  const { id, episode: epParam } = useParams<{ id: string; episode: string }>();
  const navigate = useNavigate();

  const {
    t,
    playerPrefs,
    setPlayerPrefs,
    setReportOpen,
    showToast,
  } = useApp();

  const anime = useMemo(() => findAnimeByParam(id) ?? CATALOG[0], [id]);
  const episodes = useMemo(() => buildEpisodesForAnime(anime, STILLS_POOL), [anime]);
  const epNum = Math.max(1, Number.parseInt(epParam ?? '1', 10) || 1);
  const currentEpisode = useMemo(
    () => episodes.find((e) => e.number === epNum) ?? episodes[0],
    [episodes, epNum]
  );

  const [audioMode, setAudioMode] = useState<'sub' | 'dub'>(
    anime.dubCount >= epNum && playerPrefs.preferredAudio === 'dub' ? 'dub' : 'sub'
  );
  const [subMode, setSubMode] = useState<'soft' | 'hard'>('soft');
  const [server, setServer] = useState<'default' | 'beta'>(playerPrefs.defaultServer);
  const [backupNoticeDismissed, setBackupNoticeDismissed] = useState(false);
  const [sizePopover, setSizePopover] = useState(false);
  const [synExpanded, setSynExpanded] = useState(false);

  const watchOrder = useMemo(() => getWatchOrderForAnime(anime, CATALOG), [anime]);
  const relatedAnime = useMemo(() => {
    const orderIds = new Set(watchOrder.map((w) => w.anime.routeId));
    return getRelatedAnimeForWatch(anime, CATALOG, orderIds, 6);
  }, [anime, watchOrder]);
  const relatedManga = useMemo(
    () => getRelatedMangaForWatch(anime, MANGA_CATALOG, 6),
    [anime]
  );

  useEffect(() => {
    if (audioMode === 'dub' && !currentEpisode.hasDub && currentEpisode.hasSub) {
      setAudioMode('sub');
    }
  }, [audioMode, currentEpisode]);

  const goToEpisode = (n: number) => {
    navigate(`/anime/${anime.routeId}/${n}`);
  };

  const hasPrev = currentEpisode.number > 1;
  const hasNext = currentEpisode.number < episodes.length;

  return (
    <div className="watch-shell">
      {playerPrefs.lightsOff && (
        <div
          className="watch-lights-backdrop"
          style={{ opacity: 1 - playerPrefs.lightsOffBrightness / 100 }}
          onClick={() => setPlayerPrefs((p) => ({ ...p, lightsOff: false }))}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgb(var(--c-text2))' }}>
          <Link to={`/anime/${anime.routeId}`} className="watch-pill">
            <ChevronLeft size={14} />
            <span>{anime.title}</span>
          </Link>
          <span>Episode {currentEpisode.number}</span>
        </div>
        <LibraryStatusTrigger routeId={anime.routeId} variant="inline" />
      </div>

      <div className={`watch-grid ${playerPrefs.theaterMode ? 'is-theater' : ''}`}>
        <div>
          <GlassPlayer
            anime={anime}
            episode={currentEpisode}
            audioMode={audioMode}
            server={server}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrevEpisode={() => hasPrev && goToEpisode(currentEpisode.number - 1)}
            onNextEpisode={() => hasNext && goToEpisode(currentEpisode.number + 1)}
          />

          {/* Player Controls Toolbar */}
          <div className="watch-toolbar">
            <div className="watch-toolbar__pills">
              <button
                type="button"
                className="watch-pill"
                aria-pressed={playerPrefs.autoplayNext}
                onClick={() => setPlayerPrefs((p) => ({ ...p, autoplayNext: !p.autoplayNext }))}
              >
                <span>{t('watch.autoplay')}</span>
              </button>
              <button
                type="button"
                className="watch-pill"
                aria-pressed={playerPrefs.autoSkip}
                onClick={() => setPlayerPrefs((p) => ({ ...p, autoSkip: !p.autoSkip }))}
              >
                <span>{t('watch.autoskip')}</span>
              </button>
              <button
                type="button"
                className="watch-pill"
                aria-pressed={playerPrefs.theaterMode}
                onClick={() => setPlayerPrefs((p) => ({ ...p, theaterMode: !p.theaterMode }))}
              >
                <Monitor size={13} />
                <span>{t('watch.theater')}</span>
              </button>
              <button
                type="button"
                className="watch-pill"
                aria-pressed={playerPrefs.lightsOff}
                onClick={() => setPlayerPrefs((p) => ({ ...p, lightsOff: !p.lightsOff }))}
              >
                <Lightbulb size={13} />
                <span>{t('watch.lightsOff')}</span>
              </button>
              <button
                type="button"
                className="watch-pill"
                aria-pressed={playerPrefs.ambientMode}
                onClick={() => setPlayerPrefs((p) => ({ ...p, ambientMode: !p.ambientMode }))}
              >
                <Sparkles size={13} />
                <span>{t('watch.ambient')}</span>
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="watch-pill"
                  onClick={() => setSizePopover((p) => !p)}
                >
                  <Sliders size={13} />
                  <span>{t('watch.playerSize')} ({playerPrefs.playerSize}%)</span>
                </button>
                {sizePopover && (
                  <div
                    className="facet-popover"
                    style={{ padding: 12, width: 220, bottom: 'calc(100% + 8px)', top: 'auto' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span>Player width</span>
                      <strong>{playerPrefs.playerSize}%</strong>
                    </div>
                    <input
                      type="range"
                      min={65}
                      max={100}
                      value={playerPrefs.playerSize}
                      onChange={(e) =>
                        setPlayerPrefs((p) => ({ ...p, playerSize: Number(e.target.value) }))
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="watch-pill"
                onClick={() => {
                  const el = document.querySelector('.glassplayer') as HTMLElement | null;
                  el?.requestFullscreen?.().catch(() => {});
                }}
              >
                <Maximize2 size={13} />
                <span>Fullscreen</span>
              </button>
            </div>

            <div className="watch-toolbar__pills">
              <button
                type="button"
                className="watch-pill"
                disabled={!hasPrev}
                aria-label="Previous episode"
                onClick={() => hasPrev && goToEpisode(currentEpisode.number - 1)}
                style={{ opacity: hasPrev ? 1 : 0.4 }}
              >
                <ChevronLeft size={14} />
                <span className="player-dock__full">Previous episode</span>
              </button>
              <button
                type="button"
                className="watch-pill"
                disabled={!hasNext}
                aria-label="Next episode"
                onClick={() => hasNext && goToEpisode(currentEpisode.number + 1)}
                style={{ opacity: hasNext ? 1 : 0.4 }}
              >
                <ChevronRight size={14} />
                <span className="player-dock__full">Next episode</span>
              </button>
            </div>
          </div>

          {/* Episode Title & Synopsis */}
          <div style={{ marginTop: 18 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 21, fontWeight: 700 }}>
              {currentEpisode.number}. {currentEpisode.title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.5,
                color: 'rgb(var(--c-text2))',
                display: synExpanded ? 'block' : '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: synExpanded ? undefined : 2,
                overflow: 'hidden',
              }}
            >
              {currentEpisode.synopsis}
            </p>
            <button
              type="button"
              onClick={() => setSynExpanded((p) => !p)}
              style={{
                marginTop: 4,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: '#9cc3ff',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {synExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>

          {/* Server Notice Banner */}
          {!backupNoticeDismissed && (
            <div className="watch-server-notice">
              <span>
                Tip: If playback buffers or subtitles desync, switch between <strong>Backup server</strong> and{' '}
                <strong>Beta server</strong> (multi-audio + 50 subtitle tracks).
              </span>
              <button
                type="button"
                className="yt-icon-button"
                aria-label="Dismiss tip"
                onClick={() => setBackupNoticeDismissed(true)}
                style={{ width: 26, height: 26 }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Audio Mode & Server Picker */}
          <div className="watch-server-row">
            <div className="watch-audio-switch">
              <button
                type="button"
                aria-pressed={audioMode === 'sub'}
                onClick={() => setAudioMode('sub')}
              >
                <Captions size={13} />
                <span>SUB</span>
              </button>
              <button
                type="button"
                aria-pressed={audioMode === 'dub'}
                disabled={!currentEpisode.hasDub}
                style={{ opacity: currentEpisode.hasDub ? 1 : 0.4 }}
                onClick={() => currentEpisode.hasDub && setAudioMode('dub')}
              >
                <Mic size={13} />
                <span>DUB</span>
              </button>
              <span className="watch-audio-switch__sep" aria-hidden="true" />
              <button
                type="button"
                aria-pressed={subMode === 'soft'}
                onClick={() => setSubMode('soft')}
              >
                <span>SOFT</span>
              </button>
              <button
                type="button"
                aria-pressed={subMode === 'hard'}
                onClick={() => setSubMode('hard')}
              >
                <span>HARD</span>
              </button>
            </div>

            <button
              type="button"
              className="watch-pill"
              onClick={() => {
                setServer('default');
                showToast('Switched to Backup server');
              }}
            >
              <span className="ani-switch" data-checked={server === 'default' ? 'true' : 'false'} />
              <span>Backup server</span>
            </button>

            <button
              type="button"
              className="watch-pill"
              onClick={() => {
                setServer('beta');
                showToast('Switched to Beta server');
              }}
            >
              <span className="ani-switch" data-checked={server === 'beta' ? 'true' : 'false'} />
              <span>Beta server</span>
            </button>

            <button
              type="button"
              className="watch-pill"
              onClick={() => {
                setServer((s) => (s === 'beta' ? 'default' : 'beta'));
                showToast(server === 'beta' ? 'Switched to Backup server' : 'Switched to Beta server');
              }}
            >
              <Server size={13} />
              <span>Player</span>
            </button>

            <button
              type="button"
              className="watch-pill"
              style={{ marginInlineStart: 'auto' }}
              onClick={() => setReportOpen(true)}
            >
              <Flag size={13} />
              <span>{t('watch.reportProblem')}</span>
            </button>
          </div>

          <WatchAnimeMeta anime={anime} watchOrder={watchOrder} />

          {playerPrefs.theaterMode && (
            <div style={{ marginTop: 28 }}>
              <WatchPlaylistPanel
                episodes={episodes}
                currentEp={currentEpisode.number}
                onSelectEpisode={goToEpisode}
              />
              <WatchSidebarExtras relatedAnime={relatedAnime} relatedManga={relatedManga} />
            </div>
          )}
        </div>

        {!playerPrefs.theaterMode && (
          <div className="watch-aside">
            <WatchPlaylistPanel
              episodes={episodes}
              currentEp={currentEpisode.number}
              onSelectEpisode={goToEpisode}
            />
            <WatchSidebarExtras relatedAnime={relatedAnime} relatedManga={relatedManga} />
          </div>
        )}

        <div className="watch-comments-slot">
          <WatchCommentsSection anime={anime} currentEp={currentEpisode.number} />
        </div>
      </div>
    </div>
  );
};
