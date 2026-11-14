import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  MessageSquare,
  Pin,
  Plus,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { LEADERBOARD_ENTRIES } from '@/src/data/catalogService';
import type { ForumCategory } from '@/src/types/community';
import { AvatarBadge } from '@/src/components/BrandMark';

const CATEGORIES: ('All' | ForumCategory)[] = ['All', 'General', 'Anime', 'Bugs', 'Suggestions'];

const CATEGORY_DOT: Record<ForumCategory, string> = {
  General: '#e4e4e7',
  Anime: '#a855f7',
  Bugs: '#fb7185',
  Suggestions: '#60a5fa',
};

export const CommunityPage: React.FC = () => {
  const { id: threadId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    t,
    threads,
    createThread,
    replyToThread,
    chatMessages,
    sendChatMessage,
    user,
  } = useApp();

  const tab = searchParams.get('tab') === 'chat' ? 'chat' : 'forum';
  const [category, setCategory] = useState<'All' | ForumCategory>('All');
  const [sortBy, setSortBy] = useState<'activity' | 'replies' | 'newest'>('activity');
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ForumCategory>('General');
  const [newBody, setNewBody] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [chatDraft, setChatDraft] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<'All' | ForumCategory, number> = {
      All: threads.length,
      General: 0,
      Anime: 0,
      Bugs: 0,
      Suggestions: 0,
    };
    for (const th of threads) {
      counts[th.category] = (counts[th.category] ?? 0) + 1;
    }
    return counts;
  }, [threads]);

  const filteredThreads = useMemo(() => {
    const base = category === 'All' ? [...threads] : threads.filter((th) => th.category === category);
    if (sortBy === 'replies') {
      return base.sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned) || b.replyCount - a.replyCount);
    }
    if (sortBy === 'newest') {
      return base.sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned) || b.id.localeCompare(a.id));
    }
    return base;
  }, [threads, category, sortBy]);

  const activeThread = useMemo(() => {
    if (!threadId) return null;
    return threads.find((th) => th.id === threadId) ?? null;
  }, [threads, threadId]);

  // Thread Detail View (/community/t/:id)
  if (threadId && activeThread) {
    return (
      <div className="page-shell">
        <Link to="/community" className="watch-pill" style={{ marginBottom: 18 }}>
          <ChevronLeft size={14} />
          <span>Back to Community</span>
        </Link>

        <div className="community-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <article className="settings-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {activeThread.isPinned && <Pin size={14} style={{ color: '#9cc3ff' }} />}
                <span className="cw-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {activeThread.category}
                </span>
                <span style={{ fontSize: 12.5, color: 'rgb(var(--c-text2))' }}>
                  {activeThread.author} · {activeThread.startedAgo}
                </span>
              </div>
              <h1 style={{ margin: '0 0 12px', fontSize: 22 }}>{activeThread.title}</h1>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: 'rgb(var(--c-text2))' }}>
                {activeThread.body}
              </p>
            </article>

            <h3 style={{ margin: '6px 0 0', fontSize: 15 }}>
              Replies ({activeThread.replies.length})
            </h3>

            {activeThread.replies.map((rep) => (
              <div key={rep.id} className="settings-card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AvatarBadge username={rep.author} size={24} />
                  <strong style={{ fontSize: 13 }}>{rep.author}</strong>
                  {rep.isVip && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(138,196,255,0.2)', color: '#9fd0ff' }}>
                      VIP
                    </span>
                  )}
                  <span style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))', marginInlineStart: 'auto' }}>
                    {rep.timeAgo}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>{rep.body}</p>
              </div>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyDraft.trim()) return;
                replyToThread(activeThread.id, replyDraft);
                setReplyDraft('');
              }}
              className="settings-card"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <textarea
                rows={3}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder={user ? `Reply as ${user.username}...` : 'Write a reply...'}
                className="ytdlg-field"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    height: 36,
                    padding: '0 18px',
                    borderRadius: 999,
                    border: 0,
                    background: '#ffffff',
                    color: '#09090b',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Post reply
                </button>
              </div>
            </form>
          </div>

          <aside className="settings-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>{t('community.topMembers')}</h3>
              <Link to="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12.5, color: 'rgb(var(--c-text2))' }}>
                <span>Leaderboard</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LEADERBOARD_ENTRIES.slice(0, 5).map((m, idx) => (
                <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 14,
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#f59e0b' : 'rgb(var(--c-text2))',
                    }}
                  >
                    {m.rank}
                  </span>
                  <AvatarBadge
                    username={m.username}
                    avatar={m.avatar}
                    color={m.avatarColor}
                    size={32}
                    frameStyle={idx === 0 ? 'crown' : idx === 1 ? 'celestial' : idx === 2 ? 'crimson' : 'none'}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: m.nameColor || 'rgb(var(--c-text))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.username}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))' }}>Level {m.level}</div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgb(var(--c-text2))', fontVariantNumeric: 'tabular-nums' }}>
                    {m.xp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header" style={{ marginBottom: 10 }}>
        <div className="page-header__left">
          <h1 className="page-title">{t('community.title')}</h1>
        </div>
      </div>

      <div className="underline-tabs" role="tablist" style={{ marginBottom: 18 }}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'forum'}
          className={`underline-tab ${tab === 'forum' ? 'is-active' : ''}`}
          onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
        >
          <List size={15} />
          <span>{t('community.forum')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'chat'}
          className={`underline-tab ${tab === 'chat' ? 'is-active' : ''}`}
          onClick={() => setSearchParams({ tab: 'chat' }, { replace: true })}
        >
          <MessageSquare size={15} />
          <span>{t('community.liveChat')}</span>
        </button>
      </div>

      {composerOpen && (
        <div
          className="ytdlg-scrim"
          onClick={(e) => {
            if (e.target === e.currentTarget) setComposerOpen(false);
          }}
        >
          <div className="ytdlg-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Start a new thread</h2>
              <button type="button" className="yt-icon-button" onClick={() => setComposerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim() || !newBody.trim()) return;
                const created = createThread(newTitle, newCategory, newBody);
                setNewTitle('');
                setNewBody('');
                setComposerOpen(false);
                navigate(`/community/t/${created.id}`);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Thread title..."
                className="ytdlg-field"
                autoFocus
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ForumCategory)}
                className="ytdlg-field"
              >
                <option value="General">General</option>
                <option value="Anime">Anime</option>
                <option value="Suggestions">Suggestions</option>
                <option value="Bugs">Bugs</option>
              </select>
              <textarea
                required
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Share your thoughts..."
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
                Publish thread
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'forum' ? (
        <div className="community-layout">
          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="watch-pill"
                    aria-pressed={category === cat}
                    onClick={() => setCategory(cat)}
                  >
                    <span>{cat}</span>
                    <span style={{ opacity: 0.65, fontSize: 11.5 }}>{categoryCounts[cat]}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="watch-pill"
                  onClick={() =>
                    setSortBy((s) => (s === 'activity' ? 'replies' : s === 'replies' ? 'newest' : 'activity'))
                  }
                >
                  <span>
                    {sortBy === 'activity' ? 'Latest activity' : sortBy === 'replies' ? 'Most replies' : 'Newest'}
                  </span>
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 36,
                    padding: '0 16px',
                    borderRadius: 999,
                    border: 0,
                    background: '#ffffff',
                    color: '#09090b',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  onClick={() => setComposerOpen(true)}
                >
                  <Plus size={15} />
                  <span>{t('community.newThread')}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredThreads.map((th) => (
                <Link
                  key={th.id}
                  to={`/community/t/${th.id}`}
                  className="community-thread-row"
                >
                  <AvatarBadge username={th.author} avatar={th.avatar} size={44} />

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'rgb(var(--c-text))' }}>
                      {th.title}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.45,
                        color: 'rgb(var(--c-text2))',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                      }}
                    >
                      {th.preview}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'rgb(var(--c-text2))', marginTop: 2 }}>
                      {th.isPinned && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <Pin size={10} />
                          <span>Pinned</span>
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: CATEGORY_DOT[th.category] }} />
                        <span>{th.category}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: th.isAdmin ? '#2dd4bf' : '#e879f9' }}>
                        {th.author}
                      </span>
                      {th.isAdmin && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '1px 6px',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.2)',
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          <ShieldCheck size={10} />
                          <span>ADMIN</span>
                        </span>
                      )}
                      <span>Started {th.startedAgo}</span>
                    </div>
                  </div>

                  <div className="community-thread-row__replies">
                    <div style={{ fontSize: 16, fontWeight: 750, color: 'rgb(var(--c-text))', fontVariantNumeric: 'tabular-nums' }}>
                      {th.replyCount}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))' }}>replies</div>
                  </div>

                  <div className="community-thread-row__last">
                    <AvatarBadge username={th.lastReplyAuthor} size={26} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#f472b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {th.lastReplyAuthor}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgb(var(--c-text2))' }}>{th.lastReplyAgo}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="settings-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{t('community.topMembers')}</h3>
              <Link
                to="/leaderboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12.5, color: 'rgb(var(--c-text2))' }}
              >
                <span>Leaderboard</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {LEADERBOARD_ENTRIES.slice(0, 5).map((m, idx) => (
                <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 14,
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#f59e0b' : 'rgb(var(--c-text2))',
                    }}
                  >
                    {m.rank}
                  </span>
                  <AvatarBadge
                    username={m.username}
                    avatar={m.avatar}
                    color={m.avatarColor}
                    size={32}
                    frameStyle={idx === 0 ? 'crown' : idx === 1 ? 'celestial' : idx === 2 ? 'crimson' : 'none'}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: m.nameColor || 'rgb(var(--c-text))',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.username}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgb(var(--c-text2))' }}>
                      Level {m.level}
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgb(var(--c-text2))', fontVariantNumeric: 'tabular-nums' }}>
                    {m.xp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', height: 580, padding: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
                <AvatarBadge username={msg.username} avatar={msg.avatar} color={msg.avatarColor} size={30} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13 }}>{msg.username}</strong>
                    <span style={{ fontSize: 11, color: 'rgb(var(--c-text2))' }}>{msg.time}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 13.5 }}>{msg.body}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatDraft.trim()) return;
              sendChatMessage(chatDraft);
              setChatDraft('');
            }}
            style={{
              padding: 12,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: 10,
            }}
          >
            <input
              type="text"
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Write a message to global chat..."
              className="ytdlg-field"
            />
            <button type="submit" className="watch-pill" aria-pressed="true" style={{ height: 40, padding: '0 18px' }}>
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
