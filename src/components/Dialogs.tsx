import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Keyboard, Mail, X } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import type { AuthProvider } from '@/src/types/user';
import { AniListMark, MyAnimeListMark } from './TrackerMarks';

export const AuthModal: React.FC = () => {
  const { authOpen, setAuthOpen, signIn } = useApp();
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!authOpen) return null;

  const providers: { id: AuthProvider; label: string; icon: React.ReactNode }[] = [
    {
      id: 'google',
      label: 'Continue with Google',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
          <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
        </svg>
      ),
    },
    {
      id: 'apple',
      label: 'Continue with Apple',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.37 1.43c0 1.14-.42 2.24-1.26 3.06-.92.92-2.06 1.42-3.28 1.32-.12-1.1.4-2.28 1.22-3.06.84-.82 2.1-1.36 3.32-1.32ZM20.5 17.17c-.53 1.18-.78 1.71-1.46 2.76-.95 1.44-2.29 3.24-3.95 3.26-1.47.02-1.85-.96-3.85-.95-2 .01-2.42.97-3.89.95-1.66-.02-2.93-1.64-3.88-3.08-2.66-4.05-2.94-8.8-1.3-11.33 1.17-1.8 3.02-2.85 4.76-2.85 1.77 0 2.88.97 4.35.97 1.42 0 2.28-.97 4.33-.97 1.54 0 3.17.84 4.33 2.29-3.8 2.08-3.18 7.52.56 8.95Z" />
        </svg>
      ),
    },
    {
      id: 'discord',
      label: 'Continue with Discord',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true">
          <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
        </svg>
      ),
    },
    {
      id: 'anilist',
      label: 'Continue with AniList',
      icon: <AniListMark size={18} />,
    },
    {
      id: 'myanimelist',
      label: 'Continue with MyAnimeList',
      icon: <MyAnimeListMark size={18} />,
    },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = email.split('@')[0]?.trim() || 'Viewer';
    signIn('email', handle);
  };

  return createPortal(
    <div
      className="ytdlg-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to ani.pm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAuthOpen(false);
      }}
    >
      <div className="ytdlg-panel" style={{ padding: '24px 26px', position: 'relative' }}>
        <button
          type="button"
          className="yt-icon-button"
          aria-label="Close sign in"
          onClick={() => setAuthOpen(false)}
          style={{ position: 'absolute', top: 14, right: 14 }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="brand-star" style={{ width: 20, height: 20 }} aria-hidden="true" />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.72)' }}>
              ani.<span style={{ color: '#c4b5fd' }}>pm</span>
            </span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>Sign in to ani.pm</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.45 }}>
            Sign in or create an account to keep your list with you.
          </p>
        </div>

        {!emailMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => signIn(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 46,
                  padding: '0 16px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 20, display: 'inline-grid', placeItems: 'center' }}>{p.icon}</span>
                  <span>{p.label}</span>
                </span>
                <ArrowRight size={14} style={{ opacity: 0.55 }} />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setEmailMode(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 40,
                marginTop: 6,
                borderRadius: 999,
                border: 0,
                background: 'transparent',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Mail size={14} />
              <span>Continue with email</span>
            </button>

            <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
              By continuing you agree to our{' '}
              <Link to="/terms" onClick={() => setAuthOpen(false)} style={{ textDecoration: 'underline', color: 'rgba(255,255,255,0.68)' }}>
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" onClick={() => setAuthOpen(false)} style={{ textDecoration: 'underline', color: 'rgba(255,255,255,0.68)' }}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
                Email or username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ani.pm"
                className="ytdlg-field"
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ytdlg-field"
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                className="watch-pill"
                style={{ height: 40, flex: 1, justifyContent: 'center' }}
                onClick={() => setEmailMode(false)}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  height: 40,
                  borderRadius: 999,
                  border: 0,
                  background: '#ffffff',
                  color: '#09090b',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export const KeyboardHelpModal: React.FC = () => {
  const { shortcutsOpen, setShortcutsOpen, shortcuts } = useApp();

  if (!shortcutsOpen) return null;

  const groups: { key: string; title: string }[] = [
    { key: 'playback', title: 'Playback' },
    { key: 'seeking', title: 'Seeking' },
    { key: 'volume', title: 'Volume' },
    { key: 'subtitles', title: 'Subtitles' },
    { key: 'navigation', title: 'Navigation' },
  ];

  return createPortal(
    <div
      className="kbdhelp__scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShortcutsOpen(false);
      }}
    >
      <div className="kbdhelp__panel" style={{ overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={18} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Keyboard shortcuts</h2>
          </div>
          <button
            type="button"
            className="yt-icon-button"
            aria-label="Close shortcuts"
            onClick={() => setShortcutsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {groups.map((grp) => {
            const list = shortcuts.filter((s) => s.group === grp.key);
            return (
              <div key={grp.key}>
                <h3
                  style={{
                    margin: '0 0 8px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.48)',
                  }}
                >
                  {grp.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {list.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <span>{s.label}</span>
                      <kbd className="sitebar__kbd">{s.currentKey}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const ReportModal: React.FC = () => {
  const { reportOpen, setReportOpen, showToast } = useApp();
  const [reason, setReason] = useState('Broken video or audio sync');
  const [details, setDetails] = useState('');

  if (!reportOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportOpen(false);
    setDetails('');
    showToast('Report submitted — thank you');
  };

  return createPortal(
    <div
      className="ytdlg-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Report a problem"
      onClick={(e) => {
        if (e.target === e.currentTarget) setReportOpen(false);
      }}
    >
      <div className="ytdlg-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Report a problem</h2>
          <button type="button" className="yt-icon-button" onClick={() => setReportOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="ytdlg-field"
          >
            <option value="Broken video or audio sync">Broken video or audio sync</option>
            <option value="Missing subtitles">Missing subtitles</option>
            <option value="Wrong episode mapping">Wrong episode mapping</option>
            <option value="UI bug or layout issue">UI bug or layout issue</option>
          </select>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe what happened (server, episode number, audio mode)..."
            className="ytdlg-field"
          />
          <button
            type="submit"
            style={{
              height: 40,
              borderRadius: 999,
              border: 0,
              background: '#ffffff',
              color: '#09090b',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Submit report
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export const RequestAnimeDialog: React.FC = () => {
  const { requestAnimeOpen, setRequestAnimeOpen, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  if (!requestAnimeOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setTitle('');
      setLink('');
      setNotes('');
      setRequestAnimeOpen(false);
      showToast('Anime request received');
    }, 900);
  };

  return createPortal(
    <div
      className="ytdlg-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Request an anime"
      onClick={(e) => {
        if (e.target === e.currentTarget) setRequestAnimeOpen(false);
      }}
    >
      <div className="ytdlg-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Request an anime</h2>
          <button type="button" className="yt-icon-button" onClick={() => setRequestAnimeOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#86efac' }}>
            <Check size={20} />
            <strong>Request queued for catalog team!</strong>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Anime title or alternate name"
              className="ytdlg-field"
              autoFocus
            />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="AniList / MyAnimeList URL (optional)"
              className="ytdlg-field"
            />
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dub audio, OVA, or special notes (optional)"
              className="ytdlg-field"
            />
            <button
              type="submit"
              style={{
                height: 40,
                borderRadius: 999,
                border: 0,
                background: '#ffffff',
                color: '#09090b',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Send request
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
