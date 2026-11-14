import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { LEADERBOARD_ENTRIES } from '@/src/data/catalogService';
import { AvatarBadge } from '@/src/components/BrandMark';

export const LeaderboardPage: React.FC = () => {
  const { t } = useApp();
  const podium = LEADERBOARD_ENTRIES.slice(0, 3);
  const rest = LEADERBOARD_ENTRIES.slice(3);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('lb.title')}</h1>
          <span className="page-subtitle">{t('lb.sub')}</span>
        </div>
      </div>

      <div className="lb-podium">
        {podium.map((entry, idx) => {
          const rankColor = idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : '#f59e0b';
          return (
            <div key={entry.rank} className="lb-podium-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <AvatarBadge
                  username={entry.username}
                  avatar={entry.avatar}
                  color={entry.avatarColor}
                  size={56}
                  frameStyle={idx === 0 ? 'crown' : idx === 1 ? 'celestial' : 'crimson'}
                />
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: rankColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {entry.rank}
                </span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: entry.nameColor || 'rgb(var(--c-text))',
                  }}
                >
                  {entry.username}
                </span>
                {entry.isVip && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'rgb(var(--c-text2))',
                    }}
                  >
                    <Sparkles size={10} />
                    <span>VIP</span>
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 12, color: 'rgb(var(--c-text2))', fontWeight: 500 }}>
                  Level {entry.level}
                </span>
                <span
                  style={{
                    fontSize: 23,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'rgb(var(--c-text))',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {entry.xp.toLocaleString()}{' '}
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgb(var(--c-text2))' }}>XP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lb-table-grid">
        {rest.map((entry) => (
          <div key={entry.rank} className="genre-row" style={{ gap: 12, padding: '12px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span
                style={{
                  width: 24,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'rgb(var(--c-text2))',
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {entry.rank}
              </span>
              <AvatarBadge
                username={entry.username}
                avatar={entry.avatar}
                color={entry.avatarColor}
                size={30}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 650,
                      color: entry.nameColor || 'rgb(var(--c-text))',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.username}
                  </span>
                  {entry.isVip && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, color: 'rgb(var(--c-text2))' }}>
                      <Sparkles size={9} />
                      <span>VIP</span>
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))' }}>Level {entry.level}</div>
              </div>
            </div>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: 'rgb(var(--c-text))',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.xp.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
