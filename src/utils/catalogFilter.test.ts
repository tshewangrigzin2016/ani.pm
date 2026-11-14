import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterBrowseCatalog,
  filterEpisodeList,
  filterLatestEpisodes,
  searchDescribeCatalog,
} from './catalogFilter.ts';
import type { AnimeTitle, BrowseFilters, EpisodeItem, LatestEpisode } from '../types/anime.ts';

const MOCK_CATALOG: AnimeTitle[] = [
  {
    id: 1,
    slug: 'one-piece',
    routeId: 'one-piece-1642-oxbpvt',
    title: 'One Piece',
    poster: '/p1.webp',
    banner: '/b1.webp',
    year: 1999,
    score: 8.8,
    rating: 'PG-13',
    duration: 24,
    status: 'RELEASING',
    type: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    studios: ['Toei Animation'],
    episodeCount: 1122,
    subCount: 1122,
    dubCount: 1090,
    synopsis: 'A young pirate captain sails across the Grand Line in search of treasure.',
    tags: ['Pirates', 'Ensemble Cast'],
    rank: 10,
  },
  {
    id: 2,
    slug: 'cyberpunk-edgerunners-2',
    routeId: 'cyberpunk-edgerunners-2',
    title: 'Cyberpunk: Edgerunners 2',
    poster: '/p2.webp',
    banner: '/b2.webp',
    year: 2026,
    score: 8.6,
    rating: 'R',
    duration: 24,
    status: 'RELEASING',
    type: 'ONA',
    genres: ['Action', 'Sci-Fi', 'Drama'],
    studios: ['Trigger'],
    episodeCount: 10,
    subCount: 10,
    dubCount: 0,
    synopsis: 'Neon mercenaries fight to survive in the dystopian Night City underworld.',
    tags: ['Cyberpunk', 'Gore'],
    rank: 4,
  },
  {
    id: 3,
    slug: 'sample-adult',
    routeId: 'sample-adult',
    title: 'Mature Show',
    poster: '/p3.webp',
    banner: null,
    year: 2022,
    score: 6.4,
    rating: 'Rx',
    duration: 24,
    status: 'FINISHED',
    type: 'OVA',
    genres: ['Hentai'],
    studios: ['Studio X'],
    episodeCount: 2,
    subCount: 2,
    dubCount: 0,
    synopsis: 'Adult rated title.',
    isAdult: true,
    rank: 200,
  },
];

const DEFAULT_FILTERS: BrowseFilters = {
  q: '',
  sort: 'trending',
  genres: [],
  tags: [],
  studio: '',
  year: '',
  season: '',
  format: '',
  status: '',
  language: 'any',
  minScore: '',
  minEpisodes: '',
};

test('filterBrowseCatalog hides mature titles unless opted in', () => {
  const safe = filterBrowseCatalog(MOCK_CATALOG, DEFAULT_FILTERS, false);
  assert.equal(safe.length, 2);
  const all = filterBrowseCatalog(MOCK_CATALOG, DEFAULT_FILTERS, true);
  assert.equal(all.length, 3);
});

test('filterBrowseCatalog filters by genre, format, studio, and language', () => {
  const dubOnly = filterBrowseCatalog(MOCK_CATALOG, { ...DEFAULT_FILTERS, language: 'dub' });
  assert.deepEqual(dubOnly.map((a) => a.slug), ['one-piece']);

  const triggerSciFi = filterBrowseCatalog(MOCK_CATALOG, {
    ...DEFAULT_FILTERS,
    genres: ['Sci-Fi'],
    studio: 'Trigger',
  });
  assert.deepEqual(triggerSciFi.map((a) => a.slug), ['cyberpunk-edgerunners-2']);
});

test('searchDescribeCatalog ranks semantic plot matches accurately', () => {
  const res = searchDescribeCatalog(MOCK_CATALOG, 'neon mercenaries night city');
  assert.equal(res[0]?.slug, 'cyberpunk-edgerunners-2');
});

test('filterLatestEpisodes filters by sub/dub and search string', () => {
  const eps: LatestEpisode[] = [
    {
      animeId: 1,
      routeId: 'one-piece-1642-oxbpvt',
      slug: 'one-piece',
      title: 'One Piece',
      episode: 1122,
      hasSub: true,
      hasDub: true,
      airedAt: '2026',
      timeAgo: '1h ago',
      thumbnail: null,
      poster: '/p1.webp',
    },
    {
      animeId: 2,
      routeId: 'cyberpunk-edgerunners-2',
      slug: 'cyberpunk-edgerunners-2',
      title: 'Cyberpunk',
      episode: 2,
      hasSub: true,
      hasDub: false,
      airedAt: '2026',
      timeAgo: '2h ago',
      thumbnail: null,
      poster: '/p2.webp',
    },
  ];
  assert.equal(filterLatestEpisodes(eps, 'dub', '').length, 1);
  assert.equal(filterLatestEpisodes(eps, 'all', 'cyber').length, 1);
});

test('filterEpisodeList filters filler and reverses sort order', () => {
  const eps: EpisodeItem[] = [
    {
      number: 1,
      title: 'Ep 1',
      synopsis: '',
      aired: '1999',
      duration: '24:00',
      durationSec: 1440,
      hasSub: true,
      hasDub: true,
      kind: 'canon',
      arc: 'East Blue',
      season: 1,
      thumbnail: null,
    },
    {
      number: 2,
      title: 'Filler Ep',
      synopsis: '',
      aired: '1999',
      duration: '24:00',
      durationSec: 1440,
      hasSub: true,
      hasDub: false,
      kind: 'filler',
      arc: 'East Blue',
      season: 1,
      thumbnail: null,
    },
  ];

  const cleanNewest = filterEpisodeList(eps, {
    arc: 'all',
    query: '',
    sortOrder: 'newest',
    hideFiller: true,
    audioFilter: 'all',
  });
  assert.deepEqual(cleanNewest.map((e) => e.number), [1]);
});
