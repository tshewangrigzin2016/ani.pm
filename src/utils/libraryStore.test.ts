import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWatchTimeMinutes,
  createFolder,
  INITIAL_LIBRARY_STATE,
  parseImportedLibraryBackup,
  recordWatchProgress,
  removeFromLibrary,
  setWatchStatus,
  toggleFolderItem,
  toggleTitleLike,
} from './libraryStore.ts';

test('setWatchStatus, folders, and removeFromLibrary maintain clean relational state', () => {
  let state = INITIAL_LIBRARY_STATE;
  state = setWatchStatus(state, 'one-piece-1642-oxbpvt', 'watching', 1000);
  assert.equal(state.entries['one-piece-1642-oxbpvt']?.status, 'watching');

  state = createFolder(state, 'Weekend Binges', 'one-piece-1642-oxbpvt', 2000);
  assert.equal(state.folders.length, 2);
  const newFolder = state.folders[1];
  assert.deepEqual(newFolder.itemIds, ['one-piece-1642-oxbpvt']);

  // Toggle out of folder
  state = toggleFolderItem(state, newFolder.id, 'one-piece-1642-oxbpvt');
  assert.deepEqual(state.folders[1].itemIds, []);

  // Re-add then remove whole title from library
  state = toggleFolderItem(state, newFolder.id, 'one-piece-1642-oxbpvt');
  state = removeFromLibrary(state, 'one-piece-1642-oxbpvt');
  assert.equal(state.entries['one-piece-1642-oxbpvt'], undefined);
  assert.deepEqual(state.folders[1].itemIds, []);
});

test('recordWatchProgress updates history and computes watch minutes', () => {
  let state = setWatchStatus(INITIAL_LIBRARY_STATE, 'one-piece-1642-oxbpvt', 'watching');
  state = recordWatchProgress(
    state,
    {
      routeId: 'one-piece-1642-oxbpvt',
      episode: 5,
      positionSec: 600,
      durationSec: 1440,
      audioMode: 'sub',
    },
    3000
  );

  assert.equal(state.history.length, 1);
  assert.equal(state.entries['one-piece-1642-oxbpvt']?.progress, 5);
  assert.equal(computeWatchTimeMinutes(state), 120);
});

test('toggleTitleLike and parseImportedLibraryBackup handle valid & invalid payloads', () => {
  const liked = toggleTitleLike(INITIAL_LIBRARY_STATE, 'one-piece-1642-oxbpvt');
  assert.deepEqual(liked.likedIds, ['one-piece-1642-oxbpvt']);

  const parsed = parseImportedLibraryBackup(
    JSON.stringify({
      entries: {
        'one-piece-1642-oxbpvt': {
          routeId: 'one-piece-1642-oxbpvt',
          status: 'completed',
          progress: 1122,
          updatedAt: 1000,
        },
      },
    })
  );
  assert.equal(parsed?.entries?.['one-piece-1642-oxbpvt']?.status, 'completed');
  assert.equal(parseImportedLibraryBackup('not json'), null);
});
