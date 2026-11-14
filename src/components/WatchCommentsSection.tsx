import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pin,
  SmilePlus,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import type { AnimeTitle } from '@/src/types/anime';
import { HOME_FEED, STILLS_POOL } from '@/src/data/catalogService';
import { buildWatchComments, type WatchCommentItem } from '@/src/utils/watchRelations';
import { useApp } from '@/src/context/AppContext';
import { AvatarBadge } from './BrandMark';

interface WatchCommentsSectionProps {
  anime: AnimeTitle;
  currentEp: number;
}

export const WatchCommentsSection: React.FC<WatchCommentsSectionProps> = ({ anime, currentEp }) => {
  const { user, showToast } = useApp();

  const [comments, setComments] = useState<WatchCommentItem[]>(() =>
    buildWatchComments(anime, currentEp, HOME_FEED.comments, STILLS_POOL)
  );
  const [episodeFilter, setEpisodeFilter] = useState<'current' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftSpoiler, setDraftSpoiler] = useState(false);

  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [dislikedIds, setDislikedIds] = useState<Record<string, boolean>>({});
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  useEffect(() => {
    setComments(buildWatchComments(anime, currentEp, HOME_FEED.comments, STILLS_POOL));
    setComposerOpen(false);
    setDraft('');
    setReplyTargetId(null);
  }, [anime, currentEp]);

  const visibleComments = useMemo(() => {
    let list =
      episodeFilter === 'current'
        ? comments.filter((c) => c.episode === currentEp || c.isPinned)
        : [...comments];

    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === 'top') return b.likes - a.likes;
      return 0;
    });
    return list;
  }, [comments, episodeFilter, sortBy, currentEp]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    const newComment: WatchCommentItem = {
      id: `local-${Date.now()}`,
      username: user?.username ?? 'Viewer',
      avatar: user?.avatar ?? null,
      avatarColor: '#4f46e5',
      level: user?.level ?? 1,
      timeAgo: 'Just now',
      episode: currentEp,
      body: clean,
      isSpoiler: draftSpoiler,
      likes: 1,
      dislikes: 0,
      replies: [],
    };
    setComments((prev) => {
      const pinned = prev.filter((c) => c.isPinned);
      const rest = prev.filter((c) => !c.isPinned);
      return [...pinned, newComment, ...rest];
    });
    setDraft('');
    setDraftSpoiler(false);
    setComposerOpen(false);
    showToast('Comment posted');
  };

  const handleSubmitReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const clean = replyDraft.trim();
    if (!clean) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `rep-${Date.now()}`,
                  username: user?.username ?? 'Viewer',
                  avatar: user?.avatar ?? null,
                  avatarColor: '#0284c7',
                  level: user?.level ?? 1,
                  timeAgo: 'Just now',
                  body: clean,
                  likes: 1,
                },
              ],
            }
          : c
      )
    );
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    setReplyDraft('');
    setReplyTargetId(null);
    showToast('Reply added');
  };

  return (
    <section className="ytc" aria-label="Comments">
      <div className="ytc__header">
        <h2 className="ytc__count">{visibleComments.length} Comments</h2>

        <div className="ytc-controls">
          <select
            className="ytc-select"
            aria-label="Filter comments by episode"
            value={episodeFilter}
            onChange={(e) => setEpisodeFilter(e.target.value as 'current' | 'all')}
          >
            <option value="all">All episodes · {comments.length}</option>
            <option value="current">Episode {currentEp}</option>
          </select>

          <select
            className="ytc-select"
            aria-label="Sort comments"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'top' | 'newest')}
          >
            <option value="top">Top comments</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
      </div>

      {/* Composer */}
      <form className="ytc-composer" onSubmit={handleSubmitComment}>
        <AvatarBadge username={user?.username ?? 'Guest'} avatar={user?.avatar} size={38} />
        <div className="ytc-composer__body">
          <input
            type="text"
            className="ytc-composer__input"
            placeholder="Add a comment..."
            value={draft}
            onFocus={() => setComposerOpen(true)}
            onChange={(e) => setDraft(e.target.value)}
          />
          {composerOpen && (
            <div className="ytc-composer__actions">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'rgb(var(--c-text2))', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={draftSpoiler}
                  onChange={(e) => setDraftSpoiler(e.target.checked)}
                />
                <span>Mark as spoiler</span>
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="watch-pill"
                  onClick={() => {
                    setComposerOpen(false);
                    setDraft('');
                    setDraftSpoiler(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="watch-pill"
                  aria-pressed="true"
                  disabled={!draft.trim()}
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Threaded Comments */}
      <div className="ytc-list">
        {visibleComments.map((c) => {
          const isLiked = Boolean(likedIds[c.id]);
          const isDisliked = Boolean(dislikedIds[c.id]);
          const likeDisplay = c.likes + (isLiked ? 1 : 0);
          const isRevealed = Boolean(revealedSpoilers[c.id]);
          const showReplies = Boolean(expandedReplies[c.id]);

          return (
            <div key={c.id} className="ytc-thread">
              <div className="ytc-row">
                <AvatarBadge username={c.username} avatar={c.avatar} size={38} />

                <div className="ytc-row__main">
                  {c.isPinned && (
                    <div className="ytc-pinned">
                      <Pin size={11} />
                      <span>Pinned by {c.pinnedBy ?? '@anipm_admin'}</span>
                    </div>
                  )}

                  <div className="ytc-head">
                    <span className={`ytc-author ${c.isAdmin ? 'is-admin' : ''}`}>
                      @{c.username}
                    </span>
                    {c.isAdmin && <span className="ytc-admin-badge">ADMIN</span>}
                    <span className="ytc-lvl">LV {c.level}</span>
                    <span className="ytc-time">{c.timeAgo}</span>
                    <span className="ytc-ep">EP {c.episode}</span>
                  </div>

                  {c.isSpoiler && !isRevealed ? (
                    <button
                      type="button"
                      className="ytc-spoiler-bar"
                      onClick={() => setRevealedSpoilers((prev) => ({ ...prev, [c.id]: true }))}
                    >
                      <AlertTriangle size={14} />
                      <span>Spoiler — tap to reveal</span>
                    </button>
                  ) : (
                    <>
                      {c.body && <p className="ytc-body">{c.body}</p>}
                      {c.mediaUrl && (
                        <div className="ytc-media">
                          <img src={c.mediaUrl} alt="" loading="lazy" />
                        </div>
                      )}
                    </>
                  )}

                  <div className="ytc-actions">
                    <button
                      type="button"
                      className={`ytc-act-btn ${isLiked ? 'is-active' : ''}`}
                      aria-label="Like comment"
                      aria-pressed={isLiked}
                      onClick={() => {
                        setLikedIds((p) => ({ ...p, [c.id]: !p[c.id] }));
                        setDislikedIds((p) => ({ ...p, [c.id]: false }));
                      }}
                    >
                      <ThumbsUp size={14} />
                      {likeDisplay > 0 && <span>{likeDisplay}</span>}
                    </button>

                    <button
                      type="button"
                      className={`ytc-act-btn ${isDisliked ? 'is-active' : ''}`}
                      aria-label="Dislike comment"
                      aria-pressed={isDisliked}
                      onClick={() => {
                        setDislikedIds((p) => ({ ...p, [c.id]: !p[c.id] }));
                        setLikedIds((p) => ({ ...p, [c.id]: false }));
                      }}
                    >
                      <ThumbsDown size={14} />
                    </button>

                    <button
                      type="button"
                      className="ytc-act-btn"
                      onClick={() => setReplyTargetId((curr) => (curr === c.id ? null : c.id))}
                    >
                      <span>Reply</span>
                    </button>
                  </div>

                  <div className="ytc-reactions">
                    {c.reactionEmoji && (
                      <button
                        type="button"
                        className="ytc-react-pill"
                        onClick={() =>
                          setComments((prev) =>
                            prev.map((item) =>
                              item.id === c.id
                                ? { ...item, reactionCount: (item.reactionCount ?? 1) + 1 }
                                : item
                            )
                          )
                        }
                      >
                        <span>{c.reactionEmoji}</span>
                        <span>{c.reactionCount ?? 1}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="ytc-act-btn"
                      aria-label="Add reaction"
                      onClick={() =>
                        setComments((prev) =>
                          prev.map((item) =>
                            item.id === c.id
                              ? {
                                  ...item,
                                  reactionEmoji: item.reactionEmoji ?? '🔥',
                                  reactionCount: (item.reactionCount ?? 0) + 1,
                                }
                              : item
                          )
                        )
                      }
                    >
                      <SmilePlus size={14} />
                    </button>
                  </div>

                  {replyTargetId === c.id && (
                    <form
                      onSubmit={(e) => handleSubmitReply(c.id, e)}
                      style={{ display: 'flex', gap: 8, marginTop: 10 }}
                    >
                      <input
                        type="text"
                        className="ytdlg-field"
                        style={{ height: 34 }}
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder={`Reply to @${c.username}...`}
                        autoFocus
                      />
                      <button type="submit" className="watch-pill" aria-pressed="true">
                        Reply
                      </button>
                    </form>
                  )}

                  {c.replies.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        className="ytc-replies-toggle"
                        onClick={() =>
                          setExpandedReplies((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                        }
                      >
                        {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>
                          {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      </button>

                      {showReplies && (
                        <div className="ytc-replies-list">
                          {c.replies.map((rep) => (
                            <div key={rep.id} className="ytc-row" style={{ marginTop: 10 }}>
                              <AvatarBadge username={rep.username} avatar={rep.avatar} size={28} />
                              <div className="ytc-row__main">
                                <div className="ytc-head">
                                  <span className="ytc-author">@{rep.username}</span>
                                  <span className="ytc-lvl">LV {rep.level}</span>
                                  <span className="ytc-time">{rep.timeAgo}</span>
                                </div>
                                <p className="ytc-body">{rep.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
