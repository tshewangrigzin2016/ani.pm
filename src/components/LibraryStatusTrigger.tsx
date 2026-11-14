import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, FolderPlus, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import type { WatchStatus } from '@/src/types/user';

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'plan', label: 'Plan to watch' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'dropped', label: 'Dropped' },
];

interface LibraryStatusTriggerProps {
  routeId: string;
  variant?: 'card' | 'hero' | 'inline';
  label?: string;
  className?: string;
}

export const LibraryStatusTrigger: React.FC<LibraryStatusTriggerProps> = ({
  routeId,
  variant = 'card',
  label,
  className = '',
}) => {
  const {
    library,
    setAnimeStatus,
    removeAnimeFromLibrary,
    toggleAnimeInFolder,
    addLibraryFolder,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const entry = library.entries[routeId];
  const inLibrary = Boolean(entry);

  const updatePosition = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 204;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    const top = Math.min(window.innerHeight - 310, rect.bottom + 8);
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setCreatingFolder(false);
    };
    const onScroll = () => updatePosition();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = folderName.trim();
    if (!clean) return;
    addLibraryFolder(clean, routeId);
    setFolderName('');
    setCreatingFolder(false);
  };

  const triggerClass = [
    'library-status-trigger',
    variant === 'card' ? 'cov-add' : '',
    variant === 'hero' ? 'hero-library-status-trigger' : '',
    inLibrary ? 'in' : '',
    open ? 'library-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-label={inLibrary ? 'Edit library list' : 'Add to library list'}
        onClick={handleTriggerClick}
      >
        {inLibrary ? <Check size={variant === 'hero' ? 20 : 15} strokeWidth={2.5} /> : <Plus size={variant === 'hero' ? 20 : 15} strokeWidth={2.3} />}
        {label && <span>{inLibrary ? 'In library' : label}</span>}
      </button>

      {open &&
        createPortal(
          <>
            <div
              className="sheet-mobile-scrim"
              style={{ zIndex: 2390 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                setCreatingFolder(false);
              }}
            />
            <div
              ref={panelRef}
              className="library-status-picker"
              style={{ top: pos.top, left: pos.left, width: 204 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="library-status-header">Add to list</div>
              {STATUS_OPTIONS.map((opt) => {
                const selected = entry?.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`library-status-option ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      setAnimeStatus(routeId, opt.value);
                      setOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={14} className="library-status-check" />}
                  </button>
                );
              })}

              {library.folders.length > 0 && <span className="library-status-divider" />}
              {library.folders.map((folder) => {
                const inFolder = folder.itemIds.includes(routeId);
                return (
                  <button
                    key={folder.id}
                    type="button"
                    className={`library-status-option ${inFolder ? 'selected' : ''}`}
                    onClick={() => toggleAnimeInFolder(folder.id, routeId)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
                    {inFolder && <Check size={14} className="library-status-check" />}
                  </button>
                );
              })}

              <span className="library-status-divider" />
              {creatingFolder ? (
                <form className="library-status-new" onSubmit={handleCreateFolder}>
                  <input
                    type="text"
                    className="library-status-new__input"
                    placeholder="Folder name..."
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="library-status-new__go">
                    Add
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="library-status-option"
                  onClick={() => setCreatingFolder(true)}
                >
                  <FolderPlus size={14} />
                  <span>Create folder</span>
                </button>
              )}

              {inLibrary && (
                <>
                  <span className="library-status-divider" />
                  <button
                    type="button"
                    className="library-status-option remove"
                    onClick={() => {
                      removeAnimeFromLibrary(routeId);
                      setOpen(false);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Remove from list</span>
                  </button>
                </>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
};
