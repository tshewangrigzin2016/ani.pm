import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  getLocaleDir,
  getLocaleEntry,
  isValidLocale,
  LOCALES,
} from '@/src/i18n/locales';
import { translate } from '@/src/i18n/translations';
import type { LocaleEntry, LocaleTag, TextDir } from '@/src/types/i18n';
import type {
  CaptionSettings,
  ContentPreferences,
  PlayerPreferences,
  PrivacyPreferences,
  ShortcutBinding,
  ThemePreferences,
} from '@/src/types/settings';
import type { AuthProvider, UserProfile, WatchStatus } from '@/src/types/user';
import type { ChatMessage, ForumCategory, ForumThread, WatchRoom } from '@/src/types/community';
import {
  computeWatchTimeMinutes,
  createFolder,
  INITIAL_LIBRARY_STATE,
  LibraryState,
  parseImportedLibraryBackup,
  recordWatchProgress,
  removeFromLibrary,
  setWatchStatus,
  toggleFolderItem,
  toggleTitleLike,
} from '@/src/utils/libraryStore';
import { applyThemeToDocument } from '@/src/utils/themeUtils';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_COMMUNITY_THREADS,
  INITIAL_WATCH_ROOMS,
  CATALOG,
} from '@/src/data/catalogService';

const STORAGE_KEYS = {
  locale: 'anipm:locale:v1',
  theme: 'anipm:theme:v1',
  content: 'anipm:content:v1',
  player: 'anipm:player:v1',
  captions: 'anipm:captions:v1',
  privacy: 'anipm:privacy:v1',
  shortcuts: 'anipm:shortcuts:v1',
  library: 'anipm:library:v1',
  user: 'anipm:user:v1',
  recentSearches: 'anipm:recent-searches:v1',
};

export const DEFAULT_THEME_PREFS: ThemePreferences = {
  theme: 'graphite',
  followSystem: false,
  accentColor: '#b29ce0',
  colorPagesAfterTitle: true,
  textSize: 'medium',
  animations: true,
  backdropBlur: true,
  customColors: {
    bg: '#100e11',
    surface: '#24202b',
    accent: '#b29ce0',
    text: '#eeeaf1',
  },
};

export const DEFAULT_CONTENT_PREFS: ContentPreferences = {
  titleLanguage: 'english',
  defaultSort: 'trending',
  catalogLanguage: 'any',
  showContinueWatchingOnHome: true,
  showEpisodeThumbsOnHome: true,
  showMature18Plus: false,
};

export const DEFAULT_PLAYER_PREFS: PlayerPreferences = {
  preferredAudio: 'sub',
  defaultServer: 'default',
  autoplayNext: true,
  autoSkip: true,
  markWatchedPercent: 90,
  skipStepSec: 10,
  longSkipSec: 90,
  arrowStepSec: 5,
  controlBarSize: 70,
  videoSize: 100,
  playerSize: 100,
  toastPosition: 'top',
  toastDurationSec: 1.1,
  pauseMenu: true,
  ambientMode: true,
  lightsOffBrightness: 8,
  theaterMode: false,
  lightsOff: false,
  controlButtons: {
    volume: true,
    captions: true,
    cast: true,
    airplay: true,
    pip: true,
    fillTab: true,
    fullscreen: true,
    prevNext: true,
    autoplaySwitch: true,
  },
};

export const DEFAULT_CAPTION_PREFS: CaptionSettings = {
  fontFamily: 'default',
  fontSize: 'normal',
  fontColor: '#FFFFFF',
  fontWeight: 'bold',
  italic: false,
  uppercase: false,
  bgColor: '#000000',
  bgOpacity: 'strong',
  edgeStyle: 'drop',
  verticalPosition: 'bottom',
};

export const DEFAULT_PRIVACY_PREFS: PrivacyPreferences = {
  audienceAnalytics: false,
  playbackDiagnostics: false,
};

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  { id: 'play_pause', label: 'Play / pause', group: 'playback', defaultKey: 'K', currentKey: 'K', altKeys: ['Space'] },
  { id: 'autoplay', label: 'Toggle autoplay', group: 'playback', defaultKey: 'A', currentKey: 'A' },
  { id: 'loop', label: 'Loop', group: 'playback', defaultKey: 'O', currentKey: 'O' },
  { id: 'speed', label: 'Decrease / increase playback speed', group: 'playback', defaultKey: '< / >', currentKey: '< / >', fixed: true },
  { id: 'back_10', label: 'Back 10 seconds', group: 'seeking', defaultKey: 'J', currentKey: 'J' },
  { id: 'fwd_10', label: 'Forward 10 seconds', group: 'seeking', defaultKey: 'L', currentKey: 'L' },
  { id: 'rem_time', label: 'Toggle remaining time', group: 'seeking', defaultKey: 'R', currentKey: 'R' },
  { id: 'arrow_seek', label: 'Seek backward / forward 5 seconds', group: 'seeking', defaultKey: '← / →', currentKey: '← / →', fixed: true },
  { id: 'pct_jump', label: 'Jump to 0–90%', group: 'seeking', defaultKey: '0–9', currentKey: '0–9', fixed: true },
  { id: 'end_jump', label: 'Jump to beginning / end', group: 'seeking', defaultKey: 'HOME / END', currentKey: 'HOME / END', fixed: true },
  { id: 'frame_step', label: 'Previous / next frame while paused', group: 'seeking', defaultKey: ', / .', currentKey: ', / .', fixed: true },
  { id: 'vol_up', label: 'Volume up', group: 'volume', defaultKey: '↑', currentKey: '↑' },
  { id: 'vol_down', label: 'Volume down', group: 'volume', defaultKey: '↓', currentKey: '↓' },
  { id: 'mute', label: 'Mute / unmute', group: 'volume', defaultKey: 'M', currentKey: 'M' },
  { id: 'captions', label: 'Captions', group: 'subtitles', defaultKey: 'C', currentKey: 'C' },
  { id: 'fullscreen', label: 'Fullscreen', group: 'navigation', defaultKey: 'F', currentKey: 'F' },
  { id: 'pip', label: 'Miniplayer', group: 'navigation', defaultKey: 'I', currentKey: 'I' },
  { id: 'theater', label: 'Fill tab', group: 'navigation', defaultKey: 'T', currentKey: 'T' },
  { id: 'prev_ep', label: 'Previous episode', group: 'navigation', defaultKey: 'P', currentKey: 'P' },
  { id: 'next_ep', label: 'Next episode', group: 'navigation', defaultKey: 'N', currentKey: 'N' },
  { id: 'cast', label: 'Cast', group: 'navigation', defaultKey: 'S', currentKey: 'S' },
  { id: 'open_settings', label: 'Open settings', group: 'navigation', defaultKey: 'G', currentKey: 'G' },
  { id: 'ambient', label: 'Ambient mode', group: 'navigation', defaultKey: 'B', currentKey: 'B' },
  { id: 'escape', label: 'Exit fullscreen / close menu', group: 'navigation', defaultKey: 'Esc', currentKey: 'Esc', fixed: true },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

interface ToastMessage {
  id: number;
  text: string;
  tone?: 'info' | 'error';
}

interface AppContextValue {
  // i18n
  locale: LocaleTag;
  localeEntry: LocaleEntry;
  locales: readonly LocaleEntry[];
  dir: TextDir;
  setLocale: (tag: LocaleTag) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Preferences
  themePrefs: ThemePreferences;
  setThemePrefs: React.Dispatch<React.SetStateAction<ThemePreferences>>;
  contentPrefs: ContentPreferences;
  setContentPrefs: React.Dispatch<React.SetStateAction<ContentPreferences>>;
  playerPrefs: PlayerPreferences;
  setPlayerPrefs: React.Dispatch<React.SetStateAction<PlayerPreferences>>;
  captionPrefs: CaptionSettings;
  setCaptionPrefs: React.Dispatch<React.SetStateAction<CaptionSettings>>;
  privacyPrefs: PrivacyPreferences;
  setPrivacyPrefs: React.Dispatch<React.SetStateAction<PrivacyPreferences>>;
  shortcuts: ShortcutBinding[];
  updateShortcut: (id: string, key: string) => void;
  resetShortcuts: () => void;
  resetPlayerPrefs: () => void;

  // Auth & Profile
  user: UserProfile | null;
  signIn: (provider: AuthProvider, customName?: string) => void;
  signOut: () => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;

  // Library
  library: LibraryState;
  setAnimeStatus: (routeId: string, status: WatchStatus) => void;
  removeAnimeFromLibrary: (routeId: string) => void;
  toggleAnimeInFolder: (folderId: string, routeId: string) => void;
  addLibraryFolder: (name: string, initialRouteId?: string) => void;
  logWatchProgress: (routeId: string, episode: number, positionSec: number, durationSec: number, audioMode: 'sub' | 'dub') => void;
  toggleLikeAnime: (routeId: string) => void;
  toggleMangaBookmark: (mangaId: string) => void;
  clearHistory: () => void;
  exportStorageJson: () => string;
  importBackupJson: (raw: string) => boolean;
  resetDeviceData: () => void;
  watchTimeMinutes: number;

  // Search & Recent
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  // Social
  chatMessages: ChatMessage[];
  sendChatMessage: (body: string) => void;
  threads: ForumThread[];
  createThread: (title: string, category: ForumCategory, body: string) => ForumThread;
  replyToThread: (threadId: string, body: string) => void;
  watchRooms: WatchRoom[];
  createWatchRoom: (opts: { name: string; routeId: string; hostName: string; isPublic: boolean }) => WatchRoom;

  // Overlays & UI state
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
  reportOpen: boolean;
  setReportOpen: (v: boolean) => void;
  requestAnimeOpen: boolean;
  setRequestAnimeOpen: (v: boolean) => void;
  backupBannerDismissed: boolean;
  dismissBackupBanner: () => void;
  showToast: (text: string, tone?: 'info' | 'error') => void;
  toast: ToastMessage | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleTag>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.locale);
      if (isValidLocale(saved)) return saved;
      return detectBrowserLocale(typeof navigator !== 'undefined' ? navigator.languages : []);
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const [themePrefs, setThemePrefs] = useState<ThemePreferences>(() =>
    readJson(STORAGE_KEYS.theme, DEFAULT_THEME_PREFS)
  );
  const [contentPrefs, setContentPrefs] = useState<ContentPreferences>(() =>
    readJson(STORAGE_KEYS.content, DEFAULT_CONTENT_PREFS)
  );
  const [playerPrefs, setPlayerPrefs] = useState<PlayerPreferences>(() =>
    readJson(STORAGE_KEYS.player, DEFAULT_PLAYER_PREFS)
  );
  const [captionPrefs, setCaptionPrefs] = useState<CaptionSettings>(() =>
    readJson(STORAGE_KEYS.captions, DEFAULT_CAPTION_PREFS)
  );
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPreferences>(() =>
    readJson(STORAGE_KEYS.privacy, DEFAULT_PRIVACY_PREFS)
  );

  const [shortcuts, setShortcuts] = useState<ShortcutBinding[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.shortcuts);
      return raw ? (JSON.parse(raw) as ShortcutBinding[]) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });

  const [library, setLibrary] = useState<LibraryState>(() =>
    readJson(STORAGE_KEYS.library, INITIAL_LIBRARY_STATE)
  );

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.recentSearches);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [threads, setThreads] = useState<ForumThread[]>(INITIAL_COMMUNITY_THREADS);
  const [watchRooms, setWatchRooms] = useState<WatchRoom[]>(INITIAL_WATCH_ROOMS);

  // Overlays
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [requestAnimeOpen, setRequestAnimeOpen] = useState(false);
  const [backupBannerDismissed, setBackupBannerDismissed] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, text, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  // Apply locale & dir to <html>
  useEffect(() => {
    const dir = getLocaleDir(locale);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', dir);
    try {
      localStorage.setItem(STORAGE_KEYS.locale, locale);
    } catch {
      // ignore storage quota errors
    }
  }, [locale]);

  // Apply theme & accent to <html>
  useEffect(() => {
    applyThemeToDocument(themePrefs);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(themePrefs));
    } catch {}
  }, [themePrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(contentPrefs));
    } catch {}
  }, [contentPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.player, JSON.stringify(playerPrefs));
    } catch {}
  }, [playerPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.captions, JSON.stringify(captionPrefs));
    } catch {}
  }, [captionPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.privacy, JSON.stringify(privacyPrefs));
    } catch {}
  }, [privacyPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.shortcuts, JSON.stringify(shortcuts));
    } catch {}
  }, [shortcuts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(library));
    } catch {}
  }, [library]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.user);
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  // Global Ctrl+K / Cmd+K shortcut for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName ?? '')) {
        setShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setShortcutsOpen(false);
        setAuthOpen(false);
        setReportOpen(false);
        setRequestAnimeOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setLocale = useCallback((tag: LocaleTag) => {
    if (isValidLocale(tag)) setLocaleState(tag);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  const signIn = useCallback(
    (provider: AuthProvider, customName?: string) => {
      const displayName =
        customName?.trim() ||
        (provider === 'google'
          ? 'KuroViewer'
          : provider === 'discord'
            ? 'ZenithPM'
            : provider === 'anilist'
              ? 'AniSyncer'
              : 'Viewer');
      const profile: UserProfile = {
        id: `u-${Date.now()}`,
        username: displayName,
        handle: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatar: null,
        accentColor: '#8ac4ff',
        bannerEffect: 'sakura',
        frameStyle: 'celestial',
        bio: 'Watching subbed & dubbed anime in HD on ani.pm.',
        level: 14,
        xp: 12450,
        nextLevelXp: 15000,
        isVip: true,
        provider,
        joinedAt: '2026',
      };
      setUser(profile);
      setAuthOpen(false);
      showToast(`Signed in as ${profile.username}`);
    },
    [showToast]
  );

  const signOut = useCallback(() => {
    setUser(null);
    showToast('Signed out');
  }, [showToast]);

  const updateUserProfile = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const setAnimeStatus = useCallback(
    (routeId: string, status: WatchStatus) => {
      setLibrary((prev) => setWatchStatus(prev, routeId, status));
      showToast(`Saved to ${status.replace('_', ' ')}`);
    },
    [showToast]
  );

  const removeAnimeFromLibrary = useCallback(
    (routeId: string) => {
      setLibrary((prev) => removeFromLibrary(prev, routeId));
      showToast('Removed from library');
    },
    [showToast]
  );

  const toggleAnimeInFolder = useCallback((folderId: string, routeId: string) => {
    setLibrary((prev) => toggleFolderItem(prev, folderId, routeId));
  }, []);

  const addLibraryFolder = useCallback(
    (name: string, initialRouteId?: string) => {
      setLibrary((prev) => createFolder(prev, name, initialRouteId));
      showToast(`Folder "${name}" created`);
    },
    [showToast]
  );

  const logWatchProgress = useCallback(
    (
      routeId: string,
      episode: number,
      positionSec: number,
      durationSec: number,
      audioMode: 'sub' | 'dub'
    ) => {
      setLibrary((prev) =>
        recordWatchProgress(prev, { routeId, episode, positionSec, durationSec, audioMode })
      );
    },
    []
  );

  const toggleLikeAnime = useCallback((routeId: string) => {
    setLibrary((prev) => toggleTitleLike(prev, routeId));
  }, []);

  const toggleMangaBookmark = useCallback((mangaId: string) => {
    setLibrary((prev) => {
      const exists = prev.mangaBookmarkedIds.includes(mangaId);
      return {
        ...prev,
        mangaBookmarkedIds: exists
          ? prev.mangaBookmarkedIds.filter((id) => id !== mangaId)
          : [mangaId, ...prev.mangaBookmarkedIds],
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setLibrary((prev) => ({ ...prev, history: [] }));
    showToast('Watch history cleared');
  }, [showToast]);

  const exportStorageJson = useCallback(() => {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        ...library,
      },
      null,
      2
    );
  }, [library]);

  const importBackupJson = useCallback(
    (raw: string) => {
      const parsed = parseImportedLibraryBackup(raw);
      if (!parsed) {
        showToast('Invalid backup file', 'error');
        return false;
      }
      setLibrary((prev) => ({
        ...prev,
        entries: { ...prev.entries, ...(parsed.entries ?? {}) },
        folders: parsed.folders ?? prev.folders,
        history: parsed.history ?? prev.history,
        likedIds: parsed.likedIds ?? prev.likedIds,
      }));
      showToast('Library imported');
      return true;
    },
    [showToast]
  );

  const resetDeviceData = useCallback(() => {
    setLibrary(INITIAL_LIBRARY_STATE);
    setThemePrefs(DEFAULT_THEME_PREFS);
    setContentPrefs(DEFAULT_CONTENT_PREFS);
    setPlayerPrefs(DEFAULT_PLAYER_PREFS);
    setCaptionPrefs(DEFAULT_CAPTION_PREFS);
    setRecentSearches([]);
    showToast('Device data reset');
  }, [showToast]);

  const addRecentSearch = useCallback((q: string) => {
    const clean = q.trim();
    if (!clean) return;
    setRecentSearches((prev) => [clean, ...prev.filter((x) => x !== clean)].slice(0, 8));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const sendChatMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        username: user?.username ?? 'Guest',
        level: user?.level ?? 1,
        isVip: user?.isVip ?? false,
        time: `${hh}:${mm}`,
        body: trimmed,
      };
      setChatMessages((prev) => [...prev, msg]);
    },
    [user]
  );

  const createThread = useCallback(
    (title: string, category: ForumCategory, body: string) => {
      const thread: ForumThread = {
        id: String(Date.now()).slice(-4),
        title: title.trim(),
        preview: body.trim().slice(0, 140),
        body: body.trim(),
        category,
        author: user?.username ?? 'Guest',
        isVip: user?.isVip,
        startedAgo: 'Just now',
        replyCount: 0,
        lastReplyAuthor: user?.username ?? 'Guest',
        lastReplyAgo: 'Just now',
        replies: [],
      };
      setThreads((prev) => [thread, ...prev]);
      showToast('Thread posted');
      return thread;
    },
    [user, showToast]
  );

  const replyToThread = useCallback(
    (threadId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      setThreads((prev) =>
        prev.map((th) => {
          if (th.id !== threadId) return th;
          return {
            ...th,
            replyCount: th.replyCount + 1,
            lastReplyAuthor: user?.username ?? 'Guest',
            lastReplyAgo: 'Just now',
            replies: [
              ...th.replies,
              {
                id: `rep-${Date.now()}`,
                author: user?.username ?? 'Guest',
                isVip: user?.isVip,
                timeAgo: 'Just now',
                body: trimmed,
              },
            ],
          };
        })
      );
    },
    [user]
  );

  const createWatchRoom = useCallback(
    (opts: { name: string; routeId: string; hostName: string; isPublic: boolean }) => {
      const anime = CATALOG.find((a) => a.routeId === opts.routeId) ?? CATALOG[0];
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const room: WatchRoom = {
        code,
        name: opts.name.trim() || `${opts.hostName.trim() || 'Guest'}'s room`,
        routeId: anime.routeId,
        animeTitle: anime.title,
        poster: anime.poster,
        episode: 1,
        audioMode: 'sub',
        hostName: opts.hostName.trim() || user?.username || 'Guest',
        watchingCount: 1,
        isPlaying: false,
        isPublic: opts.isPublic,
        positionSec: 0,
        messages: [
          {
            id: `wm-${Date.now()}`,
            username: opts.hostName.trim() || 'Host',
            time: 'Just now',
            body: `Room created for ${anime.title}. Share code ${code} to watch together!`,
          },
        ],
      };
      setWatchRooms((prev) => [room, ...prev]);
      return room;
    },
    [user]
  );

  const updateShortcut = useCallback((id: string, key: string) => {
    setShortcuts((prev) => prev.map((s) => (s.id === id ? { ...s, currentKey: key } : s)));
  }, []);

  const resetShortcuts = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS);
    showToast('Shortcuts reset');
  }, [showToast]);

  const resetPlayerPrefs = useCallback(() => {
    setPlayerPrefs(DEFAULT_PLAYER_PREFS);
    setShortcuts(DEFAULT_SHORTCUTS);
    showToast('Player preferences reset');
  }, [showToast]);

  const watchTimeMinutes = useMemo(() => computeWatchTimeMinutes(library), [library]);

  const value: AppContextValue = {
    locale,
    localeEntry: getLocaleEntry(locale),
    locales: LOCALES,
    dir: getLocaleDir(locale),
    setLocale,
    t,
    themePrefs,
    setThemePrefs,
    contentPrefs,
    setContentPrefs,
    playerPrefs,
    setPlayerPrefs,
    captionPrefs,
    setCaptionPrefs,
    privacyPrefs,
    setPrivacyPrefs,
    shortcuts,
    updateShortcut,
    resetShortcuts,
    resetPlayerPrefs,
    user,
    signIn,
    signOut,
    updateUserProfile,
    library,
    setAnimeStatus,
    removeAnimeFromLibrary,
    toggleAnimeInFolder,
    addLibraryFolder,
    logWatchProgress,
    toggleLikeAnime,
    toggleMangaBookmark,
    clearHistory,
    exportStorageJson,
    importBackupJson,
    resetDeviceData,
    watchTimeMinutes,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    chatMessages,
    sendChatMessage,
    threads,
    createThread,
    replyToThread,
    watchRooms,
    createWatchRoom,
    searchOpen,
    setSearchOpen,
    chatOpen,
    setChatOpen,
    authOpen,
    setAuthOpen,
    shortcutsOpen,
    setShortcutsOpen,
    reportOpen,
    setReportOpen,
    requestAnimeOpen,
    setRequestAnimeOpen,
    backupBannerDismissed,
    dismissBackupBanner: () => setBackupBannerDismissed(true),
    showToast,
    toast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
