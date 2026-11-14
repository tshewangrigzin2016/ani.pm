import React, { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  Folder,
  FolderPlus,
  Heart,
  History,
  BookOpen,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { MANGA_CATALOG, findAnimeByParam } from '@/src/data/catalogService';
import type { WatchStatus } from '@/src/types/user';
import { AnimeCard } from '@/src/components/AnimeCard';
import { formatTimeSec } from '@/src/components/BrandMark';

type LibraryTab = 'watchlist' | 'manga' | 'folders' | 'history' | 'liked' | 'watch_time' | 'import';

const STATUS_META: { status: WatchStatus; label: string }[] = [
  { status: 'watching', label: 'Watching' },
  { status: 'plan', label: 'Plan to watch' },
  { status: 'completed', label: 'Completed' },
  { status: 'on_hold', label: 'On hold' },
  { status: 'dropped', label: 'Dropped' },
];

export const LibraryPage: React.FC = () => {
  const {
    t,
    library,
    addLibraryFolder,
    clearHistory,
    importBackupJson,
    exportStorageJson,
    watchTimeMinutes,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as LibraryTab | null) ?? 'watchlist';
  const [newFolderName, setNewFolderName] = useState('');
  const [importText, setImportText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const setTab = (tab: LibraryTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'watchlist') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const entriesList = useMemo(() => Object.values(library.entries), [library.entries]);
  const likedAnimes = useMemo(
    () => library.likedIds.map((id) => findAnimeByParam(id)).filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [library.likedIds]
  );
  const bookmarkedManga = useMemo(
    () => MANGA_CATALOG.filter((m) => library.mangaBookmarkedIds.includes(m.id)),
    [library.mangaBookmarkedIds]
  );

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addLibraryFolder(newFolderName.trim());
    setNewFolderName('');
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([exportStorageJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anipm-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  };

  const tabs: { key: LibraryTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'watchlist', label: t('library.watchlist'), icon: <Bookmark size={14} /> },
    { key: 'manga', label: t('library.manga'), count: bookmarkedManga.length || undefined, icon: <BookOpen size={14} /> },
    { key: 'folders', label: t('library.folders'), count: library.folders.length || undefined, icon: <Folder size={14} /> },
    { key: 'history', label: t('library.history'), count: library.history.length || undefined, icon: <History size={14} /> },
    { key: 'liked', label: t('library.liked'), count: likedAnimes.length || undefined, icon: <Heart size={14} /> },
    { key: 'watch_time', label: t('library.watchTime'), icon: <Clock size={14} /> },
  ];

  return (
    <div className="page-shell">
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div className="page-header__left">
          <h1 className="page-title">{t('library.title')}</h1>
        </div>
      </div>

      <div className="underline-tabs" style={{ marginBottom: 24 }} role="tablist" aria-label="Library sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`underline-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="underline-tab__count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'watchlist' && (
        <div className="library-split">
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              type="button"
              onClick={() => setTab('import')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                height: 44,
                padding: '0 18px',
                border: 0,
                borderRadius: 999,
                background: '#ffffff',
                color: '#09090b',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              <span>Import backup or MAL list</span>
            </button>

            {entriesList.length > 0 && (
              <div className="settings-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUS_META.map((grp) => {
                  const count = entriesList.filter((e) => e.status === grp.status).length;
                  return (
                    <div
                      key={grp.status}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: count > 0 ? 'rgb(var(--c-text))' : 'rgb(var(--c-text2))',
                      }}
                    >
                      <span>{grp.label}</span>
                      <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          <div>
            {entriesList.length === 0 ? (
              <div className="library-empty-card">
                <Bookmark size={30} style={{ opacity: 0.45, marginBottom: 14 }} />
                <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{t('library.emptyTitle')}</h2>
                <p
                  style={{
                    margin: '0 auto 22px',
                    maxWidth: 420,
                    fontSize: 13.5,
                    color: 'rgb(var(--c-text2))',
                    lineHeight: 1.5,
                  }}
                >
                  {t('library.emptyBody')}
                </p>
                <Link
                  to="/anime"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 40,
                    padding: '0 22px',
                    borderRadius: 999,
                    background: '#ffffff',
                    color: '#09090b',
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  {t('library.browseCta')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {STATUS_META.map((grp) => {
                  const items = entriesList
                    .filter((e) => e.status === grp.status)
                    .map((e) => findAnimeByParam(e.routeId))
                    .filter((a): a is NonNullable<typeof a> => Boolean(a));
                  if (items.length === 0) return null;
                  return (
                    <section key={grp.status}>
                      <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 650 }}>
                        {grp.label} ({items.length})
                      </h2>
                      <div className="browse-grid">
                        {items.map((anime) => (
                          <AnimeCard key={anime.routeId} anime={anime} variant="grid" />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manga' && (
        <div>
          {bookmarkedManga.length === 0 ? (
            <div className="settings-card" style={{ textAlign: 'center', padding: 48 }}>
              <h3 style={{ margin: '0 0 8px' }}>No bookmarked manga</h3>
              <p style={{ margin: '0 0 16px', color: 'rgb(var(--c-text2))' }}>
                Explore manga series and bookmark favorites to pick up reading quickly.
              </p>
              <Link to="/manga" className="watch-pill">
                Browse Manga
              </Link>
            </div>
          ) : (
            <div className="browse-grid">
              {bookmarkedManga.map((m) => (
                <Link key={m.id} to={`/manga/${m.slug}`} className="ac" style={{ width: '100%' }}>
                  <div className="ac-poster">
                    <div className="poster-clip">
                      <img src={m.cover} alt={m.title} />
                      <div className="ac-fade" />
                      <div className="cov-cap">
                        <span className="cov-title">{m.title}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'folders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name..."
              className="ytdlg-field"
            />
            <button type="submit" className="watch-pill" style={{ height: 42, padding: '0 16px' }}>
              <FolderPlus size={15} />
              <span>Create</span>
            </button>
          </form>

          {library.folders.map((folder) => {
            const folderAnimes = folder.itemIds
              .map((id) => findAnimeByParam(id))
              .filter((a): a is NonNullable<typeof a> => Boolean(a));
            return (
              <div key={folder.id} className="settings-card">
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>
                  {folder.name} ({folderAnimes.length})
                </h3>
                {folderAnimes.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'rgb(var(--c-text2))' }}>
                    Empty folder — open any title’s + menu to assign it here.
                  </p>
                ) : (
                  <div className="browse-grid">
                    {folderAnimes.map((a) => (
                      <AnimeCard key={a.routeId} anime={a} variant="grid" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {library.history.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button type="button" className="watch-pill" onClick={clearHistory}>
                <Trash2 size={14} />
                <span>Clear history</span>
              </button>
            </div>
          )}
          {library.history.length === 0 ? (
            <div className="settings-card" style={{ textAlign: 'center', padding: 48 }}>
              <h3 style={{ margin: '0 0 8px' }}>No watch history yet</h3>
              <p style={{ margin: 0, color: 'rgb(var(--c-text2))' }}>
                Episodes you start watching will appear here with your resume timestamp.
              </p>
            </div>
          ) : (
            <div className="latest-grid-4">
              {library.history.map((h) => {
                const anime = findAnimeByParam(h.routeId);
                if (!anime) return null;
                return (
                  <Link key={`${h.routeId}-${h.episode}`} to={`/anime/${h.routeId}/${h.episode}`} className="cw">
                    <div className="cw-thumb">
                      <img src={anime.banner ?? anime.poster} alt={anime.title} />
                      <div className="cw-shade" />
                      <div className="cw-badges-tl">
                        <span className="cw-badge">EP {h.episode}</span>
                        <span className="cw-badge">{h.audioMode.toUpperCase()}</span>
                      </div>
                      <span className="cw-duration">{formatTimeSec(h.positionSec)}</span>
                      <div className="cw-inside">
                        <div className="cw-title">{anime.title}</div>
                        <div className="cw-detail">Resumes at {formatTimeSec(h.positionSec)}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'liked' && (
        <div>
          {likedAnimes.length === 0 ? (
            <div className="settings-card" style={{ textAlign: 'center', padding: 48 }}>
              <h3 style={{ margin: '0 0 8px' }}>No liked titles yet</h3>
              <p style={{ margin: 0, color: 'rgb(var(--c-text2))' }}>
                Tap the heart button on any anime detail page to save your favorites here.
              </p>
            </div>
          ) : (
            <div className="browse-grid">
              {likedAnimes.map((a) => (
                <AnimeCard key={a.routeId} anime={a} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'watch_time' && (
        <div className="settings-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
          <div>
            <div className="detail-sidebar-row__label">Total watch time</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {Math.floor(watchTimeMinutes / 60)}h {watchTimeMinutes % 60}m
            </div>
          </div>
          <div>
            <div className="detail-sidebar-row__label">Titles tracked</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{entriesList.length}</div>
          </div>
          <div>
            <div className="detail-sidebar-row__label">Completed titles</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {entriesList.filter((e) => e.status === 'completed').length}
            </div>
          </div>
          <div>
            <div className="detail-sidebar-row__label">Custom folders</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{library.folders.length}</div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="settings-card" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0 }}>Import or Export Backup JSON</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgb(var(--c-text2))' }}>
            Upload an ani.pm JSON backup or paste exported JSON to restore your watchlist, folders, and history.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                file.text().then((txt) => importBackupJson(txt));
              }}
            />
            <button type="button" className="watch-pill" onClick={() => fileRef.current?.click()}>
              <Upload size={14} />
              <span>Choose JSON file</span>
            </button>
            <button type="button" className="watch-pill" onClick={handleDownloadBackup}>
              <span>Export current backup</span>
            </button>
          </div>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"entries": {...}}'
            className="ytdlg-field"
          />
          <div>
            <button
              type="button"
              className="watch-pill"
              aria-pressed="true"
              onClick={() => {
                if (importBackupJson(importText)) setImportText('');
              }}
            >
              Import pasted JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
