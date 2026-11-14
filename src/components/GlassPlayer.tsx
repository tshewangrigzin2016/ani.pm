import React, { useEffect, useRef, useState } from 'react';
import {
  Captions,
  FastForward,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { AnimeTitle, EpisodeItem } from '@/src/types/anime';
import { useApp } from '@/src/context/AppContext';
import { formatTimeSec } from './BrandMark';

interface GlassPlayerProps {
  anime: AnimeTitle;
  episode: EpisodeItem;
  audioMode: 'sub' | 'dub';
  server: 'default' | 'beta';
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const SAMPLE_CAPTIONS = [
  { start: 0.5, end: 4.5, text: 'The Grand Line awaits beyond Reverse Mountain.' },
  { start: 4.6, end: 9.2, text: 'Set your sails — our next adventure begins right now!' },
  { start: 9.4, end: 14.2, text: 'Even against impossible odds, a promise made to a friend never breaks.' },
  { start: 14.4, end: 19.8, text: 'Stay locked in — new horizons are waiting just ahead.' },
  { start: 20.0, end: 24.5, text: 'To be continued in the next episode...' },
];

export const GlassPlayer: React.FC<GlassPlayerProps> = ({
  anime,
  episode,
  audioMode,
  server,
  onPrevEpisode,
  onNextEpisode,
  hasPrev,
  hasNext,
}) => {
  const { playerPrefs, setPlayerPrefs, captionPrefs, logWatchProgress } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [rate, setRate] = useState(1);
  const [quality, setQuality] = useState<'1080p' | '720p' | 'Auto'>('1080p');
  const [settingsMenu, setSettingsMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [osd, setOsd] = useState<string | null>(null);
  const [hoverTime, setHoverTime] = useState<{ pct: number; sec: number } | null>(null);

  const flashOsd = (label: string) => {
    setOsd(label);
    setTimeout(() => setOsd((curr) => (curr === label ? null : curr)), playerPrefs.toastDurationSec * 1000);
  };

  useEffect(() => {
    setCurrentTime(0);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [anime.routeId, episode.number, server, audioMode]);

  useEffect(() => {
    const onFsChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      flashOsd('Play');
    } else {
      v.pause();
      setPlaying(false);
      flashOsd('Pause');
    }
  };

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.max(0, Math.min(duration, v.currentTime + delta));
    v.currentTime = next;
    setCurrentTime(next);
    flashOsd(`${delta > 0 ? '+' : ''}${delta}s`);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture();
      }
    } catch {
      flashOsd('PiP unavailable');
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration && !Number.isNaN(v.duration)) {
      setDuration(v.duration);
    }
    if (Math.floor(v.currentTime) % 3 === 0) {
      logWatchProgress(anime.routeId, episode.number, v.currentTime, duration, audioMode);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    logWatchProgress(anime.routeId, episode.number, duration, duration, audioMode);
    if (playerPrefs.autoplayNext && hasNext && onNextEpisode) {
      onNextEpisode();
    }
  };

  const showSkipIntro = currentTime >= 2 && currentTime <= 10;
  const activeCue = captionsOn
    ? SAMPLE_CAPTIONS.find((c) => currentTime >= c.start && currentTime <= c.end)
    : undefined;

  const captionBgAlpha =
    captionPrefs.bgOpacity === 'none'
      ? 0
      : captionPrefs.bgOpacity === 'subtle'
        ? 0.35
        : captionPrefs.bgOpacity === 'medium'
          ? 0.62
          : 0.85;

  const captionFontSize =
    captionPrefs.fontSize === 'small'
      ? 14
      : captionPrefs.fontSize === 'large'
        ? 22
        : captionPrefs.fontSize === 'xlarge'
          ? 27
          : 18;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const heroArt = anime.banner ?? episode.thumbnail ?? anime.poster;

  return (
    <div
      className="glassplayer-wrap"
      style={{ width: `${playerPrefs.playerSize}%`, maxWidth: '100%', marginInline: 'auto' }}
    >
      {playerPrefs.ambientMode && (
        <div
          className="glassplayer-ambient"
          style={{
            backgroundImage: `url(${heroArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className={`glassplayer ${playerPrefs.theaterMode ? 'is-theater' : ''}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key.toLowerCase() === 'k') {
            e.preventDefault();
            togglePlay();
          } else if (e.key.toLowerCase() === 'j' || e.key === 'ArrowLeft') {
            e.preventDefault();
            seekBy(e.key === 'ArrowLeft' ? -playerPrefs.arrowStepSec : -playerPrefs.skipStepSec);
          } else if (e.key.toLowerCase() === 'l' || e.key === 'ArrowRight') {
            e.preventDefault();
            seekBy(e.key === 'ArrowRight' ? playerPrefs.arrowStepSec : playerPrefs.skipStepSec);
          } else if (e.key.toLowerCase() === 'f') {
            toggleFullscreen();
          } else if (e.key.toLowerCase() === 'c') {
            setCaptionsOn((p) => !p);
          } else if (e.key.toLowerCase() === 'm') {
            setMuted((p) => !p);
          }
        }}
      >
        <video
          ref={videoRef}
          className="glassplayer__video"
          src="/assets/media/sample-episode.mp4"
          poster={episode.thumbnail ?? anime.banner ?? anime.poster}
          playsInline
          muted={muted}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current?.duration) setDuration(videoRef.current.duration);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
        />

        {!playing && (
          <div
            className="glassplayer__poster-layer"
            style={{ backgroundImage: `url(${heroArt})` }}
            aria-hidden="true"
          />
        )}

        {!playing && playerPrefs.pauseMenu && (
          <div className="glassplayer__pause-overlay">
            <span className="glassplayer__pause-eyebrow">
              {anime.title} · Episode {episode.number} · {audioMode.toUpperCase()} ({server})
            </span>
            <h2 className="glassplayer__pause-title">{episode.title}</h2>
            <p className="glassplayer__pause-sub">{episode.synopsis}</p>
          </div>
        )}

        {!playing && (
          <button
            type="button"
            className="glassplayer__center-play"
            aria-label="Play episode"
            onClick={togglePlay}
          >
            <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />
          </button>
        )}

        {showSkipIntro && (
          <button
            type="button"
            className="glassplayer__skip-pill"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 12;
                setCurrentTime(12);
                flashOsd('Skipped intro');
              }
            }}
          >
            <FastForward size={14} />
            <span>Skip intro</span>
          </button>
        )}

        {activeCue && (
          <div
            className={`glassplayer__captions ${captionPrefs.verticalPosition === 'lifted' ? 'is-lifted' : ''}`}
            style={{
              fontFamily:
                captionPrefs.fontFamily === 'serif'
                  ? 'Georgia, serif'
                  : captionPrefs.fontFamily === 'mono'
                    ? 'monospace'
                    : 'var(--font-sans)',
              fontSize: captionFontSize,
              color: captionPrefs.fontColor,
              fontWeight: captionPrefs.fontWeight === 'bold' ? 700 : 400,
              fontStyle: captionPrefs.italic ? 'italic' : 'normal',
              textTransform: captionPrefs.uppercase ? 'uppercase' : 'none',
              backgroundColor: `rgba(0,0,0,${captionBgAlpha})`,
              textShadow:
                captionPrefs.edgeStyle === 'none'
                  ? 'none'
                  : '0 2px 6px rgba(0,0,0,0.95)',
            }}
          >
            {activeCue.text}
          </div>
        )}

        {osd && (
          <div
            className={`glassplayer__osd ${
              playerPrefs.toastPosition === 'center' ? 'glassplayer__osd--center' : 'glassplayer__osd--top'
            }`}
          >
            {osd}
          </div>
        )}

        {settingsMenu && (
          <div className="glassplayer__menu">
            <div style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', color: 'rgba(255,255,255,0.55)' }}>
              Quality
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '4px 8px 10px' }}>
              {(['Auto', '1080p', '720p'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setQuality(q);
                    flashOsd(`Quality: ${q}`);
                  }}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 7,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: quality === q ? '#ffffff' : 'rgba(255,255,255,0.06)',
                    color: quality === q ? '#09090b' : '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', color: 'rgba(255,255,255,0.55)' }}>
              Speed
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '4px 8px' }}>
              {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => {
                    setRate(sp);
                    if (videoRef.current) videoRef.current.playbackRate = sp;
                    flashOsd(`${sp}x`);
                  }}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 7,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: rate === sp ? '#ffffff' : 'rgba(255,255,255,0.06)',
                    color: rate === sp ? '#09090b' : '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glassplayer__controls">
          <div
            className="glassplayer__progress"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoverTime({ pct: pct * 100, sec: pct * duration });
            }}
            onMouseLeave={() => setHoverTime(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const next = pct * duration;
              if (videoRef.current) videoRef.current.currentTime = next;
              setCurrentTime(next);
            }}
          >
            <div className="glassplayer__progress-track">
              <div className="glassplayer__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {hoverTime && (
              <div className="glassplayer__progress-hover" style={{ left: `${hoverTime.pct}%` }}>
                {formatTimeSec(hoverTime.sec)}
              </div>
            )}
          </div>

          <div className="glassplayer__bar">
            <div className="glassplayer__group">
              {playerPrefs.controlButtons.prevNext && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label="Previous episode"
                  disabled={!hasPrev}
                  onClick={onPrevEpisode}
                  style={{ opacity: hasPrev ? 1 : 0.35 }}
                >
                  <SkipBack size={16} />
                </button>
              )}

              <button
                type="button"
                className="glassplayer__btn"
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={togglePlay}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>

              {playerPrefs.controlButtons.prevNext && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label="Next episode"
                  disabled={!hasNext}
                  onClick={onNextEpisode}
                  style={{ opacity: hasNext ? 1 : 0.35 }}
                >
                  <SkipForward size={16} />
                </button>
              )}

              <button
                type="button"
                className="glassplayer__btn"
                aria-label={`Back ${playerPrefs.skipStepSec} seconds`}
                onClick={() => seekBy(-playerPrefs.skipStepSec)}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="glassplayer__btn"
                aria-label={`Forward ${playerPrefs.skipStepSec} seconds`}
                onClick={() => seekBy(playerPrefs.skipStepSec)}
              >
                <RotateCw size={15} />
              </button>

              {playerPrefs.controlButtons.volume && (
                <div className="glassplayer__vol">
                  <button
                    type="button"
                    className="glassplayer__btn"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    onClick={() => setMuted((p) => !p)}
                  >
                    {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVolume(val);
                      setMuted(val === 0);
                      if (videoRef.current) videoRef.current.volume = val;
                    }}
                    aria-label="Volume"
                  />
                </div>
              )}

              <span className="glassplayer__time">
                {formatTimeSec(currentTime)} / {formatTimeSec(duration)}
              </span>
            </div>

            <div className="glassplayer__group">
              {playerPrefs.controlButtons.captions && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label="Toggle captions"
                  aria-pressed={captionsOn}
                  onClick={() => setCaptionsOn((p) => !p)}
                >
                  <Captions size={17} />
                </button>
              )}

              <button
                type="button"
                className="glassplayer__btn"
                aria-label="Player quality & speed"
                aria-pressed={settingsMenu}
                onClick={() => setSettingsMenu((p) => !p)}
              >
                <Settings size={16} />
              </button>

              {playerPrefs.controlButtons.pip && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label="Picture in picture"
                  onClick={togglePiP}
                >
                  <PictureInPicture2 size={16} />
                </button>
              )}

              {playerPrefs.controlButtons.fillTab && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label="Theater mode"
                  aria-pressed={playerPrefs.theaterMode}
                  onClick={() =>
                    setPlayerPrefs((p) => ({ ...p, theaterMode: !p.theaterMode }))
                  }
                >
                  <Minimize size={16} />
                </button>
              )}

              {playerPrefs.controlButtons.fullscreen && (
                <button
                  type="button"
                  className="glassplayer__btn"
                  aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  onClick={toggleFullscreen}
                >
                  <Maximize size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
