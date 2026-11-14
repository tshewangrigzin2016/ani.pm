export type RankSource = 'mal' | 'anilist';
export type TimeframeKey = 'today' | 'week' | 'month' | 'all';
export type EpisodeKind = 'canon' | 'mixed' | 'filler';

export type AnimeSortKey =
  | 'recommended'
  | 'trending'
  | 'popular'
  | 'score'
  | 'mal'
  | 'newest'
  | 'title'
  | 'episodes'
  | 'sub'
  | 'dub';

export interface AnimeTitle {
  id: number;
  source?: string;
  slug: string;
  routeId: string;
  title: string;
  native?: string;
  poster: string;
  banner: string | null;
  logo?: string | null;
  year: number | null;
  score: number | null;
  rating: string | null;
  duration: number | string | null;
  status: string;
  type: string;
  genres: string[];
  studios: string[];
  episodeCount: number;
  subCount: number;
  dubCount: number;
  synopsis: string;
  malId?: number | null;
  anilistId?: string | number | null;
  season?: string | null;
  tags?: string[];
  providerTitles?: string[];
  rank?: number;
  isAdult?: boolean;
}

export interface EpisodeItem {
  number: number;
  title: string;
  synopsis: string;
  aired: string;
  duration: string;
  durationSec: number;
  hasSub: boolean;
  hasDub: boolean;
  kind: EpisodeKind;
  arc: string;
  season: number;
  thumbnail: string | null;
}

export interface LatestEpisode {
  animeId: number;
  routeId: string;
  slug: string;
  title: string;
  episode: number;
  episodeTitle?: string | null;
  episodeLabel?: string;
  duration?: string;
  durationSec?: number;
  hasSub: boolean;
  hasDub: boolean;
  airedAt: string;
  timeAgo: string;
  thumbnail: string | null;
  poster: string;
}

export interface CommentItem {
  id: string | number;
  username: string;
  avatar: string | null;
  avatarColor?: string;
  badge?: string | null;
  isVip?: boolean;
  timeAgo: string;
  episode?: number | null;
  body: string;
  mediaUrl?: string | null;
  animeTitle: string;
  routeId: string;
  poster: string;
  likes?: number;
}

export interface BrowseFilters {
  q: string;
  sort: AnimeSortKey;
  genres: string[];
  tags: string[];
  studio: string;
  year: string;
  season: string;
  format: string;
  status: string;
  language: 'any' | 'sub' | 'dub';
  minScore: string;
  minEpisodes: string;
}

export interface FacetItem {
  name: string;
  count: number;
}

export interface FacetsData {
  genres: FacetItem[];
  tags: FacetItem[];
  studios: FacetItem[];
  dubLanguages: FacetItem[];
}

export interface MangaTitle {
  id: string;
  slug: string;
  title: string;
  native: string;
  cover: string;
  status: 'Releasing' | 'Finished';
  chapters: number;
  score: number;
  genres: string[];
  author: string;
  synopsis: string;
}
