export type ForumCategory = 'General' | 'Anime' | 'Bugs' | 'Suggestions';

export interface ForumReply {
  id: string;
  author: string;
  avatar?: string | null;
  badge?: string | null;
  isVip?: boolean;
  isAdmin?: boolean;
  timeAgo: string;
  body: string;
}

export interface ForumThread {
  id: string;
  title: string;
  preview: string;
  body: string;
  category: ForumCategory;
  author: string;
  avatar?: string | null;
  isPinned?: boolean;
  isAdmin?: boolean;
  isVip?: boolean;
  startedAgo: string;
  replyCount: number;
  lastReplyAuthor: string;
  lastReplyAgo: string;
  replies: ForumReply[];
}

export interface ChatMessage {
  id: string | number;
  username: string;
  avatar?: string | null;
  avatarColor?: string;
  level?: number;
  isVip?: boolean;
  isAdmin?: boolean;
  time: string;
  body: string;
  mediaUrl?: string | null;
  replyTo?: {
    username: string;
    body: string;
  } | null;
}

export interface WatchRoom {
  code: string;
  name: string;
  routeId: string;
  animeTitle: string;
  poster: string;
  episode: number;
  audioMode: 'sub' | 'dub';
  hostName: string;
  watchingCount: number;
  isPlaying: boolean;
  isPublic: boolean;
  positionSec: number;
  messages: ChatMessage[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string | null;
  avatarColor?: string;
  level: number;
  xp: number;
  isVip?: boolean;
  nameColor?: string;
  frame?: string;
}
