import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CornerDownRight, Pin, Send, Settings, X } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { PINNED_CHAT } from '@/src/data/catalogService';
import { AvatarBadge } from './BrandMark';

const RENDER_PINNED_TEXT = (body: string) => {
  const parts = body.split(/(https?:\/\/\S+)/g);
  return parts.map((part, idx) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={idx}
        href={part}
        target="_blank"
        rel="noreferrer"
        style={{ color: '#60a5fa', textDecoration: 'none' }}
      >
        {part.replace(/^https?:\/\//, '')}
      </a>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
};

export const ChatDrawer: React.FC = () => {
  const { chatOpen, setChatOpen, chatMessages, sendChatMessage, user, setAuthOpen } = useApp();
  const [draft, setDraft] = useState('');
  const [guestMode, setGuestMode] = useState(false);
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
  const canCompose = Boolean(user) || guestMode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft('');
  };

  return createPortal(
    <>
      <div className="chat-drawer-scrim" onClick={() => setChatOpen(false)} />
      <aside className="chat-drawer" aria-label="Community chat">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ fontSize: 14.5, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Community chat
            </strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.58)' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#4ade80',
                  display: 'inline-block',
                }}
              />
              <span>2 chatting now</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              type="button"
              className="yt-icon-button"
              aria-label="Chat preferences"
              onClick={() => setSettingsOpen((p) => !p)}
            >
              <Settings size={16} />
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
              background: 'rgba(59, 130, 246, 0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            <Pin size={12} style={{ color: '#60a5fa', flexShrink: 0 }} />
            <div style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#2dd4bf', fontWeight: 650 }}>{pinned.username}</strong>{' '}
              <span style={{ color: 'rgba(255,255,255,0.86)' }}>{RENDER_PINNED_TEXT(pinned.body)}</span>
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
            gap: 13,
          }}
        >
          {chatMessages.map((msg) => {
            const nameColor = msg.isAdmin
              ? '#2dd4bf'
              : msg.isVip
                ? '#f472b6'
                : msg.avatarColor || '#d8b4fe';
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AvatarBadge
                  username={msg.username}
                  avatar={msg.avatar}
                  color={msg.avatarColor}
                  size={28}
                />
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  {msg.replyTo && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.48)',
                        marginBottom: 2,
                      }}
                    >
                      <CornerDownRight size={10} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>@{msg.replyTo.username}</span>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {msg.replyTo.body}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 650, color: nameColor }}>
                      {msg.username}
                    </span>
                    {msg.level && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.44)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        LV {msg.level}
                      </span>
                    )}
                    {showTimestamps && (
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>
                        {msg.time}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: 13,
                      lineHeight: 1.4,
                      color: 'rgba(255,255,255,0.9)',
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
                        maxHeight: 108,
                        borderRadius: 10,
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: '11px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {canCompose ? (
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
          ) : (
            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.62)' }}>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                style={{
                  border: 0,
                  padding: 0,
                  background: 'transparent',
                  color: '#60a5fa',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>{' '}
              <span>to join the conversation</span>
              <span style={{ marginInline: 6, opacity: 0.4 }}>·</span>
              <button
                type="button"
                onClick={() => setGuestMode(true)}
                style={{
                  border: 0,
                  padding: 0,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.52)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Guest
              </button>
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};
