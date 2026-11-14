import type { AnimeTitle, CommentItem, MangaTitle } from '@/src/types/anime';

export interface WatchOrderItem {
  anime: AnimeTitle;
  badgeTopLeft: string;
  badgeOptional?: string;
  isCurrent: boolean;
}

export interface WatchCommentReply {
  id: string;
  username: string;
  avatar: string | null;
  avatarColor?: string;
  level: number;
  isAdmin?: boolean;
  isVip?: boolean;
  timeAgo: string;
  body: string;
  likes: number;
}

export interface WatchCommentItem {
  id: string;
  username: string;
  avatar: string | null;
  avatarColor: string;
  level: number;
  isAdmin?: boolean;
  isVip?: boolean;
  isPinned?: boolean;
  pinnedBy?: string;
  timeAgo: string;
  episode: number;
  body: string;
  mediaUrl?: string | null;
  isSpoiler?: boolean;
  likes: number;
  dislikes: number;
  reactionEmoji?: string;
  reactionCount?: number;
  replies: WatchCommentReply[];
}

function getFranchiseStem(title: string): string {
  return title
    .toLowerCase()
    .replace(/^the last:\s*/i, '')
    .replace(/-kimetsu no yaiba-/i, '')
    .replace(/\b(season|part|cour|movie|film|ova|special|final season|the final chapters|\d+(?:st|nd|rd|th)\s+season)\b.*$/i, '')
    .replace(/[:\-–—].*$/, '')
    .replace(/\s+\d+$/, '')
    .trim();
}

export function getWatchOrderForAnime(
  anime: AnimeTitle,
  catalog: AnimeTitle[]
): WatchOrderItem[] {
  const stem = getFranchiseStem(anime.title);
  const siblings = catalog.filter((item) => {
    if (item.routeId === anime.routeId) return true;
    const itemStem = getFranchiseStem(item.title);
    if (stem.length >= 4 && itemStem === stem) return true;
    if (stem.length >= 5 && item.title.toLowerCase().startsWith(stem)) return true;
    return false;
  });

  const ordered = [...siblings].sort((a, b) => (a.year ?? 2025) - (b.year ?? 2025));

  const seen = new Set<string>();
  const deduped: AnimeTitle[] = [];
  for (const item of ordered) {
    if (!seen.has(item.routeId)) {
      seen.add(item.routeId);
      deduped.push(item);
    }
  }

  let seasonCounter = 1;
  return deduped.slice(0, 12).map((item) => {
    const isCurrent = item.routeId === anime.routeId;
    const upperType = item.type.toUpperCase();
    let badgeTopLeft = upperType;
    let badgeOptional: string | undefined;

    if (isCurrent) {
      badgeTopLeft = "You're here";
      if (upperType === 'TV') {
        seasonCounter = Math.max(seasonCounter + 1, 2);
      }
    } else if (upperType === 'MOVIE' || upperType === 'OVA' || upperType === 'SPECIAL') {
      badgeTopLeft = upperType;
      badgeOptional = 'Optional';
    } else if (upperType === 'ONA') {
      badgeTopLeft = 'ONA';
      badgeOptional = 'Optional';
    } else {
      const seasonMatch =
        item.title.match(/(?:season|series)\s*(\d+)/i) ??
        item.title.match(/\b(\d+)(?:nd|rd|th)\s+season\b/i);
      if (seasonMatch) {
        badgeTopLeft = seasonMatch[1];
        seasonCounter = Math.max(seasonCounter, Number(seasonMatch[1]) + 1);
      } else if (/final\s+season/i.test(item.title)) {
        badgeTopLeft = 'Final';
      } else {
        badgeTopLeft = String(seasonCounter);
        seasonCounter += 1;
      }
    }

    return {
      anime: item,
      badgeTopLeft,
      badgeOptional,
      isCurrent,
    };
  });
}

export function getRelatedAnimeForWatch(
  anime: AnimeTitle,
  catalog: AnimeTitle[],
  excludeRouteIds: Set<string> = new Set(),
  limit = 6
): AnimeTitle[] {
  const genreSet = new Set(anime.genres);
  const studioSet = new Set(anime.studios);

  return catalog
    .filter((item) => item.routeId !== anime.routeId && !excludeRouteIds.has(item.routeId))
    .map((item) => {
      const genreOverlap = item.genres.filter((g) => genreSet.has(g)).length;
      const studioMatch = item.studios.some((s) => studioSet.has(s)) ? 3 : 0;
      const scoreWeight = (item.score ?? 7.0) * 0.25;
      return { item, weight: genreOverlap * 2 + studioMatch + scoreWeight };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function getRelatedMangaForWatch(
  anime: AnimeTitle,
  mangaList: MangaTitle[],
  limit = 6
): MangaTitle[] {
  const stem = getFranchiseStem(anime.title);
  const genreSet = new Set(anime.genres);
  return [...mangaList]
    .sort((a, b) => {
      const aDirect = a.title.toLowerCase().includes(stem) ? 10 : 0;
      const bDirect = b.title.toLowerCase().includes(stem) ? 10 : 0;
      const aGenres = a.genres.filter((g) => genreSet.has(g)).length;
      const bGenres = b.genres.filter((g) => genreSet.has(g)).length;
      return bDirect + bGenres - (aDirect + aGenres);
    })
    .slice(0, limit);
}

export function buildWatchComments(
  anime: AnimeTitle,
  currentEp: number,
  feedComments: CommentItem[],
  stills: string[]
): WatchCommentItem[] {
  const stillImg = stills[anime.id % Math.max(1, stills.length)] ?? null;
  const seed: WatchCommentItem[] = [
    {
      id: `pinned-${anime.routeId}`,
      username: 'anipm_admin',
      avatar: null,
      avatarColor: '#1f2937',
      level: 29,
      isAdmin: true,
      isPinned: true,
      pinnedBy: '@anipm_admin',
      timeAgo: '3 weeks ago',
      episode: currentEp,
      body: `Beta server now carries dual-audio & 50+ soft subtitle tracks for ${anime.title}. Drop timestamps below if anything needs resyncing!`,
      likes: 14,
      dislikes: 0,
      reactionEmoji: '🔥',
      reactionCount: 2,
      replies: [
        {
          id: `rep-1-${anime.routeId}`,
          username: 'Aratabte',
          avatar: feedComments[0]?.avatar ?? null,
          avatarColor: '#4338ca',
          level: 14,
          isVip: true,
          timeAgo: '2 weeks ago',
          body: 'Sub timing on Beta server is dead-on for this episode.',
          likes: 4,
        },
        {
          id: `rep-2-${anime.routeId}`,
          username: 'SideCharacter',
          avatar: null,
          avatarColor: '#0f766e',
          level: 8,
          timeAgo: '5 days ago',
          body: 'Auto-skip intro + ambient glow feels awesome on desktop and mobile.',
          likes: 2,
        },
      ],
    },
    {
      id: `cmt-1-${anime.routeId}`,
      username: 'Avexio',
      avatar: feedComments[1]?.avatar ?? null,
      avatarColor: '#0284c7',
      level: 6,
      timeAgo: '3 days ago',
      episode: currentEp,
      body: `okay, time to finish ${anime.title} too. it's been on my list for so long because of finals lol`,
      likes: 7,
      dislikes: 0,
      replies: [],
    },
    {
      id: `cmt-2-${anime.routeId}`,
      username: 'TopazTengu284',
      avatar: null,
      avatarColor: '#b91c1c',
      level: 1,
      timeAgo: '2 weeks ago',
      episode: currentEp,
      body: '',
      mediaUrl: stillImg,
      likes: 5,
      dislikes: 0,
      replies: [],
    },
    {
      id: `cmt-3-${anime.routeId}`,
      username: 'caelum',
      avatar: feedComments[2]?.avatar ?? null,
      avatarColor: '#db2777',
      level: 5,
      timeAgo: '2 weeks ago',
      episode: currentEp,
      body: 'animation direction in the second half goes crazy',
      likes: 4,
      dislikes: 0,
      replies: [],
    },
    {
      id: `cmt-4-${anime.routeId}`,
      username: 'DreamyRaven251',
      avatar: feedComments[3]?.avatar ?? null,
      avatarColor: '#6d28d9',
      level: 16,
      timeAgo: '3 weeks ago',
      episode: currentEp,
      body: `Wait until the mid-season twist around episode ${Math.min(anime.episodeCount || 12, currentEp + 3)} — completely reframes the opening scene!`,
      isSpoiler: true,
      likes: 3,
      dislikes: 0,
      replies: [],
    },
    {
      id: `cmt-5-${anime.routeId}`,
      username: 'GreaterUser',
      avatar: null,
      avatarColor: '#9f1239',
      level: 7,
      timeAgo: '3 weeks ago',
      episode: Math.max(1, currentEp === 1 ? 1 : currentEp - 1),
      body: 'peak soundtrack choices right here',
      likes: 2,
      dislikes: 0,
      replies: [],
    },
    {
      id: `cmt-6-${anime.routeId}`,
      username: 'StarryMoth157',
      avatar: feedComments[4]?.avatar ?? null,
      avatarColor: '#047857',
      level: 5,
      timeAgo: '3 weeks ago',
      episode: currentEp,
      body: 'We need more eps ASAP',
      likes: 2,
      dislikes: 0,
      replies: [],
    },
  ];

  // Append catalog feed comments mapped onto other episodes so "All episodes" count is rich
  const extra: WatchCommentItem[] = feedComments.slice(0, 6).map((c, idx) => ({
    id: `feed-${c.id}-${idx}`,
    username: c.username,
    avatar: c.avatar,
    avatarColor: c.avatarColor ?? '#43465a',
    level: 3 + ((idx * 5) % 14),
    isVip: c.isVip,
    timeAgo: c.timeAgo,
    episode: c.episode ?? ((idx % Math.max(1, Math.min(12, anime.episodeCount || 12))) + 1),
    body: c.body,
    mediaUrl: c.mediaUrl ?? null,
    likes: c.likes ?? (idx + 1),
    dislikes: 0,
    replies: [],
  }));

  return [...seed, ...extra];
}
