import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Pin, Send, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/src/context/AppContext';
import { PINNED_CHAT } from '@/src/data/catalogService';
import { AvatarBadge } from './BrandMark';

export const ChatDrawer: React.FC = () => {
  const { chatOpen, setChatOpen, chatMessages, sendChatMessage, user, setAuthOpen } = useApp();
  const [draft, setDraft] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [hideGifs, setHideGifs] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatOpen, chatMessages.length]);

  if (!chatOpen) return null;

  const pinned = PINNED_CHAT[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft('');
  };

  return createPortal(
    <>
      <div className="chat-drawer-scrim" onClick={() => setChatOpen(false)} />
      <aside className="chat-drawer" aria-label="Live community chat">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#86efac',
                display: 'inline-block',
              }}
            />
            <strong style={{ fontSize: 14.5, color: '#ffffff' }}>Live chat</strong>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {chatMessages.length} recent
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link
              to="/community?tab=chat"
              className="yt-icon-button"
              title="Open full chat in Community"
              onClick={() => setChatOpen(false)}
            >
              <Maximize2 size={15} />
            </Link>
            <button
              type="button"
              className="yt-icon-button"
              aria-label="Chat preferences"
              onClick={() => setSettingsOpen((p) => !p)}
            >
              <Settings size={15} />
            </button>
            <button
              type="button"
              className="yt-icon-button"
              aria-label="Close chat"
              onClick={() => setChatOpen(false)}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {settingsOpen && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 12.5,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Show timestamps</span>
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Hide media attachments</span>
              <input
                type="checkbox"
                checked={hideGifs}
                onChange={(e) => setHideGifs(e.target.checked)}
              />
            </label>
          </div>
        )}

        {pinned && (
          <div
            style={{
              padding: '9px 14px',
              background: 'rgba(138, 196, 255, 0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 12,
            }}
          >
            <Pin size={13} style={{ color: '#9cc3ff', flexShrink: 0, marginTop: 2 }} />
            <div style={{ minWidth: 0 }}>
              <strong style={{ color: '#9cc3ff' }}>{pinned.username}: </strong>
              <span style={{ color: 'rgba(255,255,255,0.84)' }}>{pinned.body}</span>
            </div>
          </div>
        )}

        <div
          ref={listRef}
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {chatMessages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AvatarBadge
                username={msg.username}
                avatar={msg.avatar}
                color={msg.avatarColor}
                size={28}
              />
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 650, color: '#ffffff' }}>
                    {msg.username}
                  </span>
                  {msg.isVip && (
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
                  {msg.level && (
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>
                      Lv.{msg.level}
                    </span>
                  )}
                  {showTimestamps && (
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)', marginInlineStart: 'auto' }}>
                      {msg.time}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: '3px 0 0',
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: 'rgba(255,255,255,0.86)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {msg.body}
                </p>
                {!hideGifs && msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt=""
                    style={{
                      marginTop: 6,
                      maxHeight: 112,
                      borderRadius: 8,
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {!user && (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              style={{
                width: '100%',
                height: 30,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 12,
                fontWeight: 550,
                cursor: 'pointer',
              }}
            >
              Sign in to join chat — or send as Guest
            </button>
          )}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={user ? `Message as ${user.username}...` : 'Message as Guest...'}
              className="ytdlg-field"
              style={{ flex: '1 1 auto', minWidth: 0, height: 36, padding: '0 12px', borderRadius: 10 }}
            />
            <button
              type="submit"
              className="yt-icon-button"
              aria-label="Send message"
              style={{
                background: '#ffffff',
                color: '#09090b',
                width: 34,
                height: 34,
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </aside>
    </>,
    document.body
  );
};
