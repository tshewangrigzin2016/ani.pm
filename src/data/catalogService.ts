import catalogRaw from './catalog.json';
import spotlightRaw from './spotlight.json';
import homeFeedRaw from './homeFeed.json';
import latestRaw from './latestEpisodes.json';
import facetsRaw from './facets.json';
import socialRaw from './social.json';
import assetManifestRaw from './asset-manifest.json';
import type {
  AnimeTitle,
  CommentItem,
  FacetsData,
  LatestEpisode,
  MangaTitle,
} from '@/src/types/anime';
import type {
  ChatMessage,
  ForumThread,
  LeaderboardEntry,
  WatchRoom,
} from '@/src/types/community';

const ASSET_MAP = assetManifestRaw as Record<string, string>;

export function resolveLocalAsset(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/assets/')) return url;
  if (ASSET_MAP[url]) return ASSET_MAP[url];
  const baseKey = url.split('&')[0];
  if (ASSET_MAP[baseKey]) return ASSET_MAP[baseKey];
  if (url.startsWith('/api/')) return null;
  return url;
}

function normalizeAnime(raw: Record<string, unknown>): AnimeTitle {
  return {
    id: Number(raw.id ?? 0),
    source: typeof raw.source === 'string' ? raw.source : undefined,
    slug: String(raw.slug ?? ''),
    routeId: String(raw.routeId ?? raw.slug ?? raw.id ?? ''),
    title: String(raw.title ?? 'Untitled'),
    native: typeof raw.native === 'string' ? raw.native : undefined,
    poster: resolveLocalAsset(raw.poster as string) ?? '/assets/posters/f382e8b3b01044cf55c0.webp',
    banner: resolveLocalAsset(raw.banner as string | null),
    logo: resolveLocalAsset(raw.logo as string | null),
    year: typeof raw.year === 'number' ? raw.year : null,
    score: typeof raw.score === 'number' ? raw.score : null,
    rating: typeof raw.rating === 'string' ? raw.rating : null,
    duration: typeof raw.duration === 'number' || typeof raw.duration === 'string' ? raw.duration : null,
    status: String(raw.status ?? 'RELEASING'),
    type: String(raw.type ?? 'TV'),
    genres: Array.isArray(raw.genres) ? (raw.genres as string[]) : [],
    studios: Array.isArray(raw.studios) ? (raw.studios as string[]) : [],
    episodeCount: Number(raw.episodeCount ?? 12),
    subCount: Number(raw.subCount ?? 0),
    dubCount: Number(raw.dubCount ?? 0),
    synopsis: String(raw.synopsis ?? ''),
    malId: typeof raw.malId === 'number' ? raw.malId : null,
    anilistId: (raw.anilistId as string | number | null) ?? null,
    season: typeof raw.season === 'string' ? raw.season : null,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined,
    providerTitles: Array.isArray(raw.providerTitles) ? (raw.providerTitles as string[]) : undefined,
    rank: typeof raw.rank === 'number' ? raw.rank : undefined,
    isAdult: Boolean(raw.isAdult),
    airingAt: typeof raw.airingAt === 'number' ? raw.airingAt : null,
    startDate:
      raw.startDate && typeof raw.startDate === 'object'
        ? (raw.startDate as { year?: number | null; month?: number | null; day?: number | null })
        : null,
  };
}

export const CATALOG: AnimeTitle[] = (catalogRaw as Record<string, unknown>[]).map(normalizeAnime);

export const SPOTLIGHT_ITEMS: AnimeTitle[] = (
  (spotlightRaw as { spotlight: Record<string, unknown>[] }).spotlight ?? []
).map(normalizeAnime);

export const HERO_ITEMS: AnimeTitle[] = (
  (spotlightRaw as { hero: Record<string, unknown>[] }).hero ?? []
).map(normalizeAnime);

function formatRelativeTime(tsOrIso: number | string | undefined): string {
  if (!tsOrIso) return 'Recently';
  if (typeof tsOrIso === 'string' && !/^\d+$/.test(tsOrIso)) {
    const parsed = Date.parse(tsOrIso);
    if (!Number.isNaN(parsed)) {
      const diffHours = Math.max(1, Math.round(Math.abs(Date.now() - parsed) / 36e5));
      return diffHours < 24 ? `${diffHours}h ago` : `${Math.round(diffHours / 24)}d ago`;
    }
    return tsOrIso;
  }
  const num = Number(tsOrIso);
  const diffMin = Math.max(1, Math.round(Math.abs(Date.now() - num) / 60000) % 180);
  return `${diffMin}m ago`;
}

function formatSecClock(sec: number | undefined): string {
  const s = Math.max(60, sec ?? 1440);
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

const rawHome = homeFeedRaw as {
  trending: Record<string, unknown>[];
  top: Record<string, unknown>[];
  homeRails: Record<string, Record<string, unknown>[]>;
  upcoming: Record<string, unknown>[];
  comments: Record<string, unknown>[];
};

const normalizedRails: Record<string, AnimeTitle[]> = {};
for (const [k, list] of Object.entries(rawHome.homeRails ?? {})) {
  normalizedRails[k] = list.map(normalizeAnime);
}

const normalizedComments: CommentItem[] = (rawHome.comments ?? []).map((c) => {
  const u = (c.user as Record<string, unknown> | undefined) ?? {};
  const titleName = String(c.title ?? c.animeTitle ?? 'Anime');
  const titleId = String(c.titleId ?? '');
  const numericAni = titleId.includes(':') ? titleId.split(':')[1] : '';
  const catalogMatch =
    CATALOG.find((a) => String(a.anilistId ?? '') === numericAni) ??
    CATALOG.find((a) => a.title.toLowerCase() === titleName.toLowerCase());
  const posterResolved =
    resolveLocalAsset((c.poster as string | null) ?? (c.cover as string | null)) ??
    catalogMatch?.poster ??
    CATALOG[0].poster;

  return {
    id: (c.id as string | number) ?? Math.random().toString(36),
    username: String(c.username ?? u.username ?? u.name ?? 'Viewer'),
    avatar: resolveLocalAsset((c.avatar as string | null) ?? (u.avatarUrl as string | null)),
    avatarColor: String(u.avatarColor ?? '#43465a'),
    isVip: Boolean(u.isVip),
    timeAgo: String(c.timeAgo ?? formatRelativeTime(c.createdAt as number)),
    episode: typeof c.episode === 'number' ? c.episode : null,
    body: String(c.body ?? ''),
    mediaUrl: resolveLocalAsset((c.mediaUrl as string | null) ?? (c.imageUrl as string | null)),
    animeTitle: titleName,
    routeId: String(c.routeId ?? catalogMatch?.routeId ?? CATALOG[0].routeId),
    poster: posterResolved,
    likes: typeof c.likes === 'number' ? c.likes : 0,
  };
});

export const HOME_FEED = {
  trending: (rawHome.trending ?? []).map(normalizeAnime),
  top: (rawHome.top ?? []).map(normalizeAnime),
  homeRails: normalizedRails,
  upcoming: (rawHome.upcoming ?? []).map(normalizeAnime),
  comments: normalizedComments,
};

const RAW_STILLS_POOL: string[] = Array.from(
  new Set(Object.values(ASSET_MAP).filter((p) => p.startsWith('/assets/stills/')))
);

export const LATEST_EPISODES: LatestEpisode[] = (latestRaw as Record<string, unknown>[]).map((e, idx) => {
  const routeId = String(e.routeId ?? '');
  const catalogMatch = CATALOG.find((a) => a.routeId === routeId);
  const epNum = Number(e.episode ?? e.epNumber ?? 1);
  const explicitThumb = resolveLocalAsset(
    (e.thumbnail as string | null) ?? (e.still as string | null) ?? (e.banner as string | null)
  );
  const fallbackStill =
    RAW_STILLS_POOL.length > 0 ? RAW_STILLS_POOL[idx % RAW_STILLS_POOL.length] : null;
  return {
    animeId: Number(e.animeId ?? e.id ?? 0),
    routeId,
    slug: String(e.slug ?? catalogMatch?.slug ?? routeId),
    title: String(e.title ?? catalogMatch?.title ?? 'Episode'),
    episode: epNum,
    episodeTitle: typeof e.epTitle === 'string' ? e.epTitle : typeof e.episodeTitle === 'string' ? e.episodeTitle : null,
    duration: typeof e.duration === 'string' ? e.duration : formatSecClock(e.runtimeSeconds as number | undefined),
    durationSec: Number(e.durationSec ?? e.runtimeSeconds ?? 1440),
    hasSub: Boolean(e.hasSub ?? e.sub ?? true),
    hasDub: Boolean(e.hasDub ?? e.dub ?? false),
    airedAt: String(e.airedAt ?? e.aired ?? ''),
    timeAgo: String(e.timeAgo ?? formatRelativeTime(e.aired as string | undefined)),
    thumbnail: explicitThumb ?? catalogMatch?.banner ?? fallbackStill,
    poster: resolveLocalAsset(e.poster as string | null) ?? catalogMatch?.poster ?? CATALOG[0].poster,
  };
});

export const FACETS = facetsRaw as FacetsData;

const rawSocial = socialRaw as {
  leaderboard: Record<string, unknown>[];
  chatMessages: Record<string, unknown>[];
  pinnedChat: Record<string, unknown>[];
};

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = (rawSocial.leaderboard ?? []).map((item) => ({
  rank: Number(item.rank ?? 1),
  username: String(item.username ?? item.name ?? 'Member'),
  avatar: resolveLocalAsset((item.avatar as string | null) ?? (item.avatarUrl as string | null)),
  avatarColor: typeof item.avatarColor === 'string' ? item.avatarColor : '#5865F2',
  level: Number(item.level ?? 1),
  xp: Number(item.xp ?? 0),
  isVip: Boolean(item.isVip),
  nameColor: typeof item.nameGlow === 'string' ? item.nameGlow : undefined,
  frame: typeof item.avatarDecoration === 'string' ? item.avatarDecoration : undefined,
}));

function normalizeChatMessage(raw: Record<string, unknown>): ChatMessage {
  const u = (raw.user as Record<string, unknown> | undefined) ?? {};
  const rep = raw.replyTo as Record<string, unknown> | null | undefined;
  return {
    id: (raw.id as string | number) ?? Math.random().toString(36),
    username: String(raw.username ?? u.username ?? u.name ?? 'Member'),
    avatar: resolveLocalAsset((raw.avatar as string | null) ?? (u.avatarUrl as string | null)),
    avatarColor: typeof u.avatarColor === 'string' ? u.avatarColor : '#4c4f69',
    level: Number(raw.level ?? u.level ?? 1),
    isVip: Boolean(raw.isVip ?? u.isVip),
    isAdmin: Boolean(raw.isAdmin ?? u.isAdmin),
    time: String(raw.time ?? formatRelativeTime(raw.createdAt as number | undefined)),
    body: String(raw.body ?? ''),
    mediaUrl: resolveLocalAsset((raw.mediaUrl as string | null) ?? (raw.imageUrl as string | null)),
    replyTo: rep
      ? {
          username: String(rep.username ?? rep.name ?? ''),
          body: String(rep.snippet ?? rep.body ?? ''),
        }
      : null,
  };
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = (rawSocial.chatMessages ?? []).map(normalizeChatMessage);

export const PINNED_CHAT: ChatMessage[] = (rawSocial.pinnedChat ?? []).map(normalizeChatMessage);

export const STILLS_POOL: string[] = Array.from(
  new Set([
    ...LATEST_EPISODES.map((e) => e.thumbnail).filter(
      (t): t is string => typeof t === 'string' && t.length > 0
    ),
    ...RAW_STILLS_POOL,
  ])
);

export function findAnimeByParam(idOrSlug: string | undefined): AnimeTitle | undefined {
  if (!idOrSlug) return CATALOG[0];
  const norm = decodeURIComponent(idOrSlug).trim().toLowerCase();
  const pool: AnimeTitle[] = [
    ...CATALOG,
    ...SPOTLIGHT_ITEMS,
    ...HOME_FEED.upcoming,
    ...HOME_FEED.trending,
    ...HOME_FEED.top,
  ];
  return (
    pool.find((a) => a.routeId.toLowerCase() === norm) ??
    pool.find((a) => a.slug.toLowerCase() === norm) ??
    pool.find((a) => String(a.id) === norm) ??
    pool.find((a) => String(a.anilistId ?? '') === norm) ??
    pool.find((a) => String(a.malId ?? '') === norm) ??
    pool.find((a) => a.routeId.toLowerCase().includes(norm))
  );
}

export function getDisplayTitle(anime: AnimeTitle, preferOriginal: boolean): string {
  if (preferOriginal && anime.native) return anime.native;
  return anime.title;
}

export const INITIAL_COMMUNITY_THREADS: ForumThread[] = [
  {
    id: '61',
    title: 'New server all with encodes fully made by us, Multi audio, Subtitle',
    preview: '+ supports multi audio, German, french, italian and much more ( varies from anime to anime can support upto 12 languages + 50 subtitles Country Support + consistent multi qualit...',
    body: 'We rolled out our new Beta server with custom in-house encodes, multi-audio switching (up to 12 languages where available), soft ASS/VTT subtitles across 50+ languages, and instant quality switching without re-buffering.\n\nTry toggling Beta server below the player and share any feedback in this thread!',
    category: 'General',
    author: 'ani.pm admin',
    isPinned: true,
    isAdmin: true,
    startedAgo: '2 weeks ago',
    replyCount: 6,
    lastReplyAuthor: 'Side Character',
    lastReplyAgo: '3 minutes ago',
    replies: [
      {
        id: 'r1',
        author: 'Aratabte',
        isVip: true,
        timeAgo: '20 hours ago',
        body: 'The bitrate and subtitle rendering on the Beta server look insanely crisp on 1440p monitors.',
      },
      {
        id: 'r2',
        author: 'Side Character',
        timeAgo: '3 minutes ago',
        body: 'Agreed! Auto-skip intro + dub captions work seamlessly now.',
      },
    ],
  },
  {
    id: '73',
    title: 'Major ANIME NEWS from Today! 🥀🔥 <November 1)>',
    preview: 'Here! ↓ ★ BLACKPINK’s Jisoo has cosplayed Lucy from Cyberpunk: Edgerunners for Halloween! 👀 ★ “Neon Genesis Evangelion”...',
    body: 'Weekly anime news roundup:\n• Cyberpunk: Edgerunners 2 enters final 10-episode countdown with studio Trigger.\n• Black Clover Season 2 Spade Kingdom arc continues weekly simulcast.\n• Bleach: Thousand-Year Blood War - The Calamity confirms extended episode run.',
    category: 'General',
    author: 'Yujio',
    startedAgo: '1 week ago',
    replyCount: 16,
    lastReplyAuthor: '슬픈왕',
    lastReplyAgo: '10 hours ago',
    replies: [
      {
        id: 'r3',
        author: '슬픈왕',
        isVip: true,
        timeAgo: '10 hours ago',
        body: 'Edgerunners 2 hype is unreal right now.',
      },
    ],
  },
  {
    id: '91',
    title: 'suggestions what to add',
    preview: 'advanced search where you can search up a scene of the character was in Or you can just make the advanced search AI-Generated',
    body: 'Could we expand the "Describe it" tab inside Ctrl+K Search so we can search by specific scene tropes, character archetypes, or studios?',
    category: 'Suggestions',
    author: 'pain',
    startedAgo: '4 days ago',
    replyCount: 3,
    lastReplyAuthor: 'pain',
    lastReplyAgo: '15 hours ago',
    replies: [
      {
        id: 'r4',
        author: 'frzaddy',
        timeAgo: '1 day ago',
        body: 'Describe it already matches synopsis + tags + studios! Works great for finding shows by premise.',
      },
    ],
  },
  {
    id: '92',
    title: 'naruto beats luffy',
    preview: 'prove me wrong',
    body: 'Gear 5 vs Baryon Mode — speed, AP, and stamina breakdown. Prove me wrong in the replies.',
    category: 'Anime',
    author: 'RXQ8K',
    startedAgo: '3 days ago',
    replyCount: 3,
    lastReplyAuthor: 'pain',
    lastReplyAgo: '15 hours ago',
    replies: [
      {
        id: 'r5',
        author: 'pain',
        timeAgo: '15 hours ago',
        body: 'Luffy toon force outlasts the 2 minute timer easily.',
      },
    ],
  },
  {
    id: '93',
    title: 'RTX Video Enhancements Compatibility',
    preview: 'The player doesn’t seem to be compatible with RTX Video Enhancements like VSR and HDR and I think it would be nice if it did.',
    body: 'Hardware-accelerated canvas scaling works smoothly when Ambient mode is toggled off on Chromium browsers.',
    category: 'Suggestions',
    author: 'TRIPLEAAA',
    startedAgo: '2 days ago',
    replyCount: 3,
    lastReplyAuthor: 'frzaddy',
    lastReplyAgo: '19 hours ago',
    replies: [],
  },
  {
    id: '94',
    title: 'Vidstack Player Bug',
    preview: 'The Vidstack player has a grey outline around it even while full screen and it’s very distracting while watching content.',
    body: 'Fixed in the latest GlassPlayer update by removing focus-ring border in fullscreen mode.',
    category: 'Bugs',
    author: 'TRIPLEAAA',
    startedAgo: '2 days ago',
    replyCount: 1,
    lastReplyAuthor: 'frzaddy',
    lastReplyAgo: '2 days ago',
    replies: [],
  },
  {
    id: '51',
    title: '🏆 Complete ani.pm Badge Requirements (20 Total)',
    preview: '🍿 Watch & Tracking Milestones: First Steps (COMMON): Watch your first episode • Getting Hooked: Track 10 episodes • Binge Mode: Track 50 episodes...',
    body: 'Full community guide to all 20 unlockable profile badges, avatar frames, and animated banner effects as you level up XP by watching episodes and participating in discussions.',
    category: 'General',
    author: 'OreoBiskoot',
    isVip: true,
    startedAgo: '3 weeks ago',
    replyCount: 2,
    lastReplyAuthor: 'frzaddy',
    lastReplyAgo: '5 days ago',
    replies: [],
  },
  {
    id: '57',
    title: 'About design & everything.',
    preview: 'Hello, this website looks cool in PC. I would like to see better in mobile phone also. It’s great but not as good as PC. Thank you.',
    body: 'Love the frosted glass controls and custom theme selector — Snow & Obsidian auto-switching with system theme is super clean.',
    category: 'Suggestions',
    author: 'Son_Goku',
    startedAgo: '2 weeks ago',
    replyCount: 1,
    lastReplyAuthor: 'frzaddy',
    lastReplyAgo: '5 days ago',
    replies: [],
  },
];

export const INITIAL_WATCH_ROOMS: WatchRoom[] = [
  {
    code: 'OP128XPM',
    name: "Caleb's room",
    routeId: 'one-piece-1642-oxbpvt',
    animeTitle: 'One Piece',
    poster: CATALOG[0]?.poster ?? '/assets/posters/f382e8b3b01044cf55c0.webp',
    episode: 128,
    audioMode: 'dub',
    hostName: 'Ejay',
    watchingCount: 1,
    isPlaying: true,
    isPublic: true,
    positionSec: 8,
    messages: [
      { id: 'wm1', username: 'Ejay', time: 'Just now', body: 'Alabasta banquet episode — hop in!' },
    ],
  },
  {
    code: 'LOM04FLL',
    name: "The Fool's room",
    routeId: CATALOG[4]?.routeId ?? CATALOG[0]?.routeId ?? 'one-piece-1642-oxbpvt',
    animeTitle: 'Lord of Mysteries',
    poster: CATALOG[4]?.poster ?? CATALOG[1]?.poster ?? '/assets/posters/a3127db186749176ea9a.webp',
    episode: 4,
    audioMode: 'dub',
    hostName: 'The Fool',
    watchingCount: 1,
    isPlaying: false,
    isPublic: true,
    positionSec: 4,
    messages: [
      { id: 'wm2', username: 'The Fool', time: '2m ago', body: 'Waiting for 1 more before pressing play.' },
    ],
  },
];

export const MANGA_CATALOG: MangaTitle[] = CATALOG.slice(0, 24).map((anime, idx) => ({
  id: `manga-${anime.id}`,
  slug: anime.slug,
  title: anime.title,
  native: anime.native ?? anime.title,
  cover: anime.poster,
  status: anime.status.toLowerCase().includes('finish') ? 'Finished' : 'Releasing',
  chapters: Math.max(24, Math.min(1150, (anime.episodeCount || 12) * 3 + idx * 7)),
  score: anime.score ?? 8.4,
  genres: anime.genres,
  author: anime.studios[0] ?? 'Toonkotsu Press',
  synopsis: anime.synopsis,
}));
