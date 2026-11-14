export type WatchStatus =
  | 'watching'
  | 'plan'
  | 'completed'
  | 'on_hold'
  | 'dropped';

export type AuthProvider =
  | 'google'
  | 'apple'
  | 'discord'
  | 'anilist'
  | 'myanimelist'
  | 'email';

export interface LibraryEntry {
  routeId: string;
  status: WatchStatus;
  progress: number;
  rating?: number | null;
  updatedAt: number;
  folderIds?: string[];
}

export interface CustomFolder {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
}

export interface WatchHistoryEntry {
  routeId: string;
  episode: number;
  positionSec: number;
  durationSec: number;
  audioMode: 'sub' | 'dub';
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  handle: string;
  avatar: string | null;
  accentColor: string;
  bannerEffect: 'none' | 'sakura' | 'snow' | 'stars' | 'aurora' | 'embers';
  frameStyle: 'none' | 'crown' | 'celestial' | 'crimson' | 'neon';
  bio: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  isVip: boolean;
  provider: AuthProvider;
  joinedAt: string;
}
