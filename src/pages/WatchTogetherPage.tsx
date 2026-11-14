import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Copy, Play, Radio, Send, Users } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { CATALOG, findAnimeByParam } from '@/src/data/catalogService';
import { buildEpisodesForAnime } from '@/src/utils/episodes';
import { STILLS_POOL } from '@/src/data/catalogService';
import { GlassPlayer } from '@/src/components/GlassPlayer';
import { AvatarBadge } from '@/src/components/BrandMark';

export const WatchTogetherPage: React.FC = () => {
  const { code: roomCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { t, watchRooms, createWatchRoom, user, showToast } = useApp();

  const [hostName, setHostName] = useState(user?.username ?? '');
  const [roomName, setRoomName] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState(CATALOG[0]?.routeId ?? 'one-piece-1642-oxbpvt');
  const [hasSelectedAnime, setHasSelectedAnime] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [roomMsgDraft, setRoomMsgDraft] = useState('');
  const [localMessages, setLocalMessages] = useState<{ id: string; username: string; time: string; body: string }[]>([]);
  const [animeQuery, setAnimeQuery] = useState('');
  const [animePickerOpen, setAnimePickerOpen] = useState(false);

  const selectedAnime = useMemo(() => findAnimeByParam(selectedRouteId) ?? CATALOG[0], [selectedRouteId]);
  const animeMatches = useMemo(() => {
    const q = animeQuery.trim().toLowerCase();
    if (!q) return CATALOG.slice(0, 8);
    return CATALOG.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 8);
  }, [animeQuery]);

  const activeRoom = useMemo(() => {
    if (!roomCode) return null;
    return watchRooms.find((r) => r.code.toLowerCase() === roomCode.toLowerCase()) ?? watchRooms[0];
  }, [roomCode, watchRooms]);

  // Inside Room (/watch-together/:code)
  if (roomCode && activeRoom) {
    const anime = findAnimeByParam(activeRoom.routeId) ?? CATALOG[0];
    const episodes = buildEpisodesForAnime(anime, STILLS_POOL);
    const ep = episodes.find((e) => e.number === activeRoom.episode) ?? episodes[0];
    const allMsgs = [...activeRoom.messages, ...localMessages];

    return (
      <div className="page-shell">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/watch-together" className="watch-pill">
              <ChevronLeft size={14} />
              <span>Rooms</span>
            </Link>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{activeRoom.name}</h1>
              <span style={{ fontSize: 12.5, color: 'rgb(var(--c-text2))' }}>
                Host: {activeRoom.hostName} · {activeRoom.animeTitle} · EP {activeRoom.episode}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="watch-pill"
            onClick={() => {
              navigator.clipboard?.writeText(activeRoom.code).catch(() => {});
              showToast(`Copied invite code: ${activeRoom.code}`);
            }}
          >
            <Copy size={13} />
            <span>Code: {activeRoom.code}</span>
          </button>
        </div>

        <div className="watch-grid">
          <GlassPlayer
            anime={anime}
            episode={ep}
            audioMode={activeRoom.audioMode}
            server="default"
            hasPrev={false}
            hasNext={false}
          />

          <aside className="settings-card" style={{ display: 'flex', flexDirection: 'column', height: 480, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Room chat</strong>
              <span style={{ fontSize: 12, color: 'rgb(var(--c-text2))', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Users size={13} />
                <span>{activeRoom.watchingCount} watching</span>
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allMsgs.map((m) => (
                <div key={m.id} style={{ display: 'flex', gap: 8 }}>
                  <AvatarBadge username={m.username} size={24} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 650 }}>
                      {m.username}{' '}
                      <span style={{ fontWeight: 400, color: 'rgb(var(--c-text2))', marginLeft: 4 }}>
                        {m.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{m.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!roomMsgDraft.trim()) return;
                setLocalMessages((prev) => [
                  ...prev,
                  {
                    id: `rm-${Date.now()}`,
                    username: user?.username ?? hostName ?? 'Guest',
                    time: 'Just now',
                    body: roomMsgDraft.trim(),
                  },
                ]);
                setRoomMsgDraft('');
              }}
              style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                value={roomMsgDraft}
                onChange={(e) => setRoomMsgDraft(e.target.value)}
                placeholder="Say something to the room..."
                className="ytdlg-field"
                style={{ height: 36 }}
              />
              <button type="submit" className="yt-icon-button" style={{ background: '#ffffff', color: '#09090b' }}>
                <Send size={14} />
              </button>
            </form>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('wt.title')}</h1>
        </div>
      </div>

      <div className="wt-top-grid">
        <form
          className="settings-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          onSubmit={(e) => {
            e.preventDefault();
            const created = createWatchRoom({
              name: roomName,
              routeId: selectedRouteId,
              hostName: hostName || 'Host',
              isPublic,
            });
            navigate(`/watch-together/${created.code}`);
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('wt.startRoom')}</h2>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={animePickerOpen ? animeQuery : hasSelectedAnime ? animeQuery || selectedAnime?.title || '' : ''}
              onFocus={() => {
                setAnimePickerOpen(true);
                if (!hasSelectedAnime) setAnimeQuery('');
              }}
              onBlur={() => setTimeout(() => setAnimePickerOpen(false), 160)}
              onChange={(e) => {
                setAnimeQuery(e.target.value);
                setAnimePickerOpen(true);
              }}
              placeholder="Search anime"
              className="ytdlg-field"
              aria-label="Search anime"
            />
            {animePickerOpen && animeMatches.length > 0 && (
              <div className="facet-popover" style={{ width: '100%', maxWidth: '100%', top: 'calc(100% + 6px)' }}>
                {animeMatches.map((a) => (
                  <button
                    key={a.routeId}
                    type="button"
                    className={`row-inline-opt ${selectedRouteId === a.routeId ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelectedRouteId(a.routeId);
                      setHasSelectedAnime(true);
                      setAnimeQuery(a.title);
                      setAnimePickerOpen(false);
                    }}
                  >
                    <span>{a.title}</span>
                    <span style={{ opacity: 0.6, fontSize: 11.5 }}>{a.episodeCount} eps</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'rgb(var(--c-text2))', marginBottom: 6 }}>
              Room name (optional)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder=""
              className="ytdlg-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'rgb(var(--c-text2))', marginBottom: 6 }}>
              Your name
            </label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="How others will see you"
              className="ytdlg-field"
            />
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>List this room under Live rooms</span>
          </label>

          <div>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 36,
                padding: '0 18px',
                borderRadius: 999,
                border: 0,
                background: 'rgba(255,255,255,0.58)',
                color: '#09090b',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <span>{t('wt.createRoom')}</span>
            </button>
          </div>
        </form>

        <form
          className="settings-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!joinCode.trim()) return;
            const clean = joinCode.trim().split('/').pop() ?? joinCode.trim();
            navigate(`/watch-together/${clean.toUpperCase()}`);
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('wt.joinRoom')}</h2>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'rgb(var(--c-text2))', marginBottom: 6 }}>
              Room code or link
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Paste a link or type the 8-letter code"
              className="ytdlg-field"
            />
          </div>
          <div>
            <button
              type="submit"
              style={{
                height: 36,
                padding: '0 18px',
                borderRadius: 999,
                border: 0,
                background: 'rgba(255,255,255,0.58)',
                color: '#09090b',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {t('wt.join')}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ margin: '28px 0 14px', fontSize: 19, fontWeight: 700 }}>
        {t('wt.liveRooms')} ({watchRooms.length})
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {watchRooms.map((room) => (
          <Link
            key={room.code}
            to={`/watch-together/${room.code}`}
            className="settings-card"
            style={{ display: 'flex', gap: 14, padding: 14, alignItems: 'center' }}
          >
            <img
              src={room.poster}
              alt={room.animeTitle}
              style={{ width: 64, height: 92, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#86efac' }}>
                <Radio size={12} />
                <span>{room.isPlaying ? 'Playing' : 'Paused'} · {room.audioMode.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 3 }}>{room.name}</div>
              <div style={{ fontSize: 13, color: 'rgb(var(--c-text2))', marginTop: 2 }}>
                {room.animeTitle} · EP {room.episode}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))', marginTop: 6, display: 'flex', gap: 12 }}>
                <span>Host: {room.hostName}</span>
                <span>{room.watchingCount} watching</span>
              </div>
            </div>
            <Play size={18} style={{ opacity: 0.7 }} />
          </Link>
        ))}
      </div>
    </div>
  );
};
