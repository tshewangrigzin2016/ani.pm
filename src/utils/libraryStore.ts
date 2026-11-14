import type { CustomFolder, LibraryEntry, WatchHistoryEntry, WatchStatus } from '@/src/types/user';

export interface LibraryState {
  entries: Record<string, LibraryEntry>;
  folders: CustomFolder[];
  history: WatchHistoryEntry[];
  likedIds: string[];
  dislikedIds: string[];
  ratings: Record<string, number>;
  mangaBookmarkedIds: string[];
}

export const INITIAL_LIBRARY_STATE: LibraryState = {
  entries: {},
  folders: [
    { id: 'favorites', name: 'All-Time Favorites', itemIds: [], createdAt: 1700000000000 },
  ],
  history: [],
  likedIds: [],
  dislikedIds: [],
  ratings: {},
  mangaBookmarkedIds: [],
};

export function setWatchStatus(
  state: LibraryState,
  routeId: string,
  status: WatchStatus,
  now = Date.now()
): LibraryState {
  const prev = state.entries[routeId];
  return {
    ...state,
    entries: {
      ...state.entries,
      [routeId]: {
        routeId,
        status,
        progress: prev?.progress ?? 0,
        rating: prev?.rating ?? null,
        folderIds: prev?.folderIds ?? [],
        updatedAt: now,
      },
    },
  };
}

export function removeFromLibrary(state: LibraryState, routeId: string): LibraryState {
  if (!state.entries[routeId]) return state;
  const nextEntries = { ...state.entries };
  delete nextEntries[routeId];
  return {
    ...state,
    entries: nextEntries,
    folders: state.folders.map((f) => ({
      ...f,
      itemIds: f.itemIds.filter((id) => id !== routeId),
    })),
  };
}

export function toggleFolderItem(
  state: LibraryState,
  folderId: string,
  routeId: string
): LibraryState {
  return {
    ...state,
    folders: state.folders.map((f) => {
      if (f.id !== folderId) return f;
      const exists = f.itemIds.includes(routeId);
      return {
        ...f,
        itemIds: exists ? f.itemIds.filter((x) => x !== routeId) : [...f.itemIds, routeId],
      };
    }),
  };
}

export function createFolder(
  state: LibraryState,
  name: string,
  initialRouteId?: string,
  now = Date.now()
): LibraryState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const id = `folder-${now.toString(36)}`;
  const folder: CustomFolder = {
    id,
    name: trimmed,
    itemIds: initialRouteId ? [initialRouteId] : [],
    createdAt: now,
  };
  return {
    ...state,
    folders: [...state.folders, folder],
  };
}

export function recordWatchProgress(
  state: LibraryState,
  entry: Omit<WatchHistoryEntry, 'updatedAt'>,
  now = Date.now()
): LibraryState {
  const filtered = state.history.filter((h) => h.routeId !== entry.routeId);
  const nextHistory: WatchHistoryEntry[] = [
    { ...entry, updatedAt: now },
    ...filtered,
  ].slice(0, 60);

  const prevLib = state.entries[entry.routeId];
  const nextEntries = prevLib
    ? {
        ...state.entries,
        [entry.routeId]: {
          ...prevLib,
          progress: Math.max(prevLib.progress, entry.episode),
          updatedAt: now,
        },
      }
    : state.entries;

  return {
    ...state,
    history: nextHistory,
    entries: nextEntries,
  };
}

export function toggleTitleLike(state: LibraryState, routeId: string): LibraryState {
  const isLiked = state.likedIds.includes(routeId);
  return {
    ...state,
    likedIds: isLiked
      ? state.likedIds.filter((id) => id !== routeId)
      : [routeId, ...state.likedIds],
    dislikedIds: state.dislikedIds.filter((id) => id !== routeId),
  };
}

export function computeWatchTimeMinutes(state: LibraryState): number {
  const fromHistory = state.history.reduce((sum, h) => sum + Math.round(h.positionSec / 60), 0);
  const fromEntries = Object.values(state.entries).reduce(
    (sum, e) => sum + e.progress * 24,
    0
  );
  return Math.max(fromHistory, fromEntries);
}

export function parseImportedLibraryBackup(rawJson: string): Partial<LibraryState> | null {
  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;

    // Support ani.pm export format or simple MAL/AniList array export
    if (Array.isArray(parsed.entries)) {
      const nextEntries: Record<string, LibraryEntry> = {};
      for (const item of parsed.entries) {
        if (item && typeof item === 'object' && 'routeId' in item) {
          const rec = item as LibraryEntry;
          nextEntries[rec.routeId] = rec;
        }
      }
      return { entries: nextEntries };
    }
    if (parsed.entries && typeof parsed.entries === 'object') {
      return {
        entries: parsed.entries as Record<string, LibraryEntry>,
        folders: Array.isArray(parsed.folders) ? (parsed.folders as CustomFolder[]) : undefined,
        history: Array.isArray(parsed.history) ? (parsed.history as WatchHistoryEntry[]) : undefined,
        likedIds: Array.isArray(parsed.likedIds) ? (parsed.likedIds as string[]) : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}
