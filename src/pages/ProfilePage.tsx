import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Clock, Sparkles } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { findAnimeByParam } from '@/src/data/catalogService';
import { AvatarBadge } from '@/src/components/BrandMark';
import { AnimeCard } from '@/src/components/AnimeCard';
import type { UserProfile } from '@/src/types/user';

const BANNER_EFFECTS: UserProfile['bannerEffect'][] = ['none', 'sakura', 'snow', 'stars', 'embers'];
const FRAME_STYLES: UserProfile['frameStyle'][] = ['none', 'crown', 'celestial', 'crimson', 'neon'];

const PARTICLE_VARS = [
  { x: '8%', y: '22%', dx: '26px', d: '7.5s', delay: '-1s', s: '9px' },
  { x: '22%', y: '60%', dx: '-18px', d: '9s', delay: '-3s', s: '7px' },
  { x: '37%', y: '35%', dx: '32px', d: '6.8s', delay: '-2s', s: '10px' },
  { x: '54%', y: '50%', dx: '-28px', d: '8.2s', delay: '-4s', s: '8px' },
  { x: '68%', y: '18%', dx: '22px', d: '7s', delay: '-1.5s', s: '9px' },
  { x: '82%', y: '44%', dx: '-24px', d: '9.4s', delay: '-5s', s: '7px' },
  { x: '91%', y: '70%', dx: '18px', d: '8s', delay: '-2.5s', s: '10px' },
];

export const ProfilePage: React.FC = () => {
  const { username: routeUser } = useParams<{ username?: string }>();
  const { user, setAuthOpen, updateUserProfile, library, watchTimeMinutes } = useApp();

  if (!user && !routeUser) {
    return (
      <div className="page-shell" style={{ maxWidth: 640, textAlign: 'center', paddingTop: 120 }}>
        <h1 className="page-title" style={{ marginBottom: 10 }}>Sign in to view your profile</h1>
        <p style={{ color: 'rgb(var(--c-text2))', marginBottom: 24 }}>
          Unlock XP levels, animated banner effects, avatar frames, and synced watchlists.
        </p>
        <button
          type="button"
          className="watch-pill"
          aria-pressed="true"
          style={{ height: 42, padding: '0 24px', fontSize: 14 }}
          onClick={() => setAuthOpen(true)}
        >
          Sign in to ani.pm
        </button>
      </div>
    );
  }

  const profile: UserProfile = routeUser && routeUser !== user?.username
    ? {
        id: 'public',
        username: routeUser,
        handle: `@${routeUser.toLowerCase()}`,
        avatar: null,
        accentColor: '#8ac4ff',
        bannerEffect: 'stars',
        frameStyle: 'celestial',
        bio: 'Member of the ani.pm community.',
        level: 22,
        xp: 48200,
        nextLevelXp: 55000,
        isVip: true,
        provider: 'anilist',
        joinedAt: '2025',
      }
    : (user as UserProfile);

  const isOwn = !routeUser || routeUser === user?.username;
  const savedAnimes = Object.values(library.entries)
    .map((e) => findAnimeByParam(e.routeId))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="page-shell">
      {/* Banner Header with Animated Particle Effects */}
      <div
        className="settings-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '32px 28px',
          background: `linear-gradient(135deg, ${profile.accentColor}28, rgba(20,21,28,0.92))`,
          marginBottom: 24,
        }}
      >
        {profile.bannerEffect !== 'none' && (
          <div className={`bfx bfx--${profile.bannerEffect}`} aria-hidden="true">
            {PARTICLE_VARS.map((p, idx) => (
              <i
                key={idx}
                style={{
                  ['--x' as string]: p.x,
                  ['--y' as string]: p.y,
                  ['--dx' as string]: p.dx,
                  ['--d' as string]: p.d,
                  ['--delay' as string]: p.delay,
                  ['--s' as string]: p.s,
                }}
              />
            ))}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <AvatarBadge
            username={profile.username}
            avatar={profile.avatar}
            color={profile.accentColor}
            size={84}
            frameStyle={profile.frameStyle}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{profile.username}</h1>
              {profile.isVip && (
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(138,196,255,0.2)', color: '#9fd0ff' }}>
                  VIP
                </span>
              )}
            </div>
            <div style={{ fontSize: 13.5, color: 'rgb(var(--c-text2))', marginTop: 2 }}>
              {profile.handle} · Joined {profile.joinedAt}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 14, maxWidth: 520 }}>{profile.bio}</p>
          </div>

          <div style={{ minWidth: 210 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 650, marginBottom: 6 }}>
              <span>Level {profile.level}</span>
              <span>{profile.xp.toLocaleString()} / {profile.nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="yt-pmenu__level-track" style={{ height: 7 }}>
              <span
                className="yt-pmenu__level-fill"
                style={{ width: `${Math.min(100, (profile.xp / profile.nextLevelXp) * 100)}%` }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: 12, color: 'rgb(var(--c-text2))' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {Math.floor(watchTimeMinutes / 60)}h watched
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Award size={13} /> 4 badges
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOwn && (
        <div className="settings-card" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgb(var(--c-text2))', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={13} /> Banner effect
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {BANNER_EFFECTS.map((eff) => (
                <button
                  key={eff}
                  type="button"
                  className="watch-pill"
                  aria-pressed={profile.bannerEffect === eff}
                  onClick={() => updateUserProfile({ bannerEffect: eff })}
                >
                  {eff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'rgb(var(--c-text2))', marginBottom: 6 }}>Avatar frame</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FRAME_STYLES.map((fr) => (
                <button
                  key={fr}
                  type="button"
                  className="watch-pill"
                  aria-pressed={profile.frameStyle === fr}
                  onClick={() => updateUserProfile({ frameStyle: fr })}
                >
                  {fr}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Recent Watchlist ({savedAnimes.length})</h2>
      {savedAnimes.length === 0 ? (
        <div className="settings-card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', color: 'rgb(var(--c-text2))' }}>No saved anime in watchlist yet.</p>
          <Link to="/anime" className="watch-pill">Browse catalog</Link>
        </div>
      ) : (
        <div className="browse-grid">
          {savedAnimes.map((a) => (
            <AnimeCard key={a.routeId} anime={a} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};
