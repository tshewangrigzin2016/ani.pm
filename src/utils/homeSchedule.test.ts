import test from 'node:test';
import assert from 'node:assert/strict';
import type { AnimeTitle, LatestEpisode } from '@/src/types/anime';
import {
  buildTodaySchedule,
  formatUpcomingCountdown,
  parseAnimeEpQuery,
  sortUpcomingAnime,
} from './homeSchedule';

const makeAnime = (overrides: Partial<AnimeTitle>): AnimeTitle => ({
  id: 1,
  slug: 'test-show',
  routeId: 'test-show-1',
  title: 'Test Show',
  poster: '/assets/posters/sample.webp',
  banner: null,
  year: 2026,
  score: 8.2,
  rating: 'PG-13',
  duration: 24,
  status: 'Currently Airing',
  type: 'TV',
  genres: ['Action'],
  studios: ['Studio'],
  episodeCount: 12,
  subCount: 6,
  dubCount: 4,
  synopsis: 'Test synopsis',
  ...overrides,
});

test('sortUpcomingAnime puts earliest dated/airingAt titles first before undated titles', () => {
  const undated = makeAnime({ id: 1, title: 'Dandadan 3rd Season', year: 2027, airingAt: null, startDate: { year: 2027 } });
  const dec = makeAnime({ id: 2, title: 'Apothecary', year: 2026, airingAt: 1796914800, startDate: { year: 2026, month: 12, day: 11 } });
  const nov = makeAnime({ id: 3, title: 'Witch', year: 2026, airingAt: 1795100400, startDate: { year: 2026, month: 11, day: 20 } });
  const janDay = makeAnime({ id: 4, title: 'Mashle', year: 2027, airingAt: null, startDate: { year: 2027, month: 1, day: 9 } });

  const sorted = sortUpcomingAnime([undated, dec, nov, janDay]);
  assert.deepEqual(sorted.map((a) => a.title), ['Witch', 'Apothecary', 'Mashle', 'Dandadan 3rd Season']);
});

test('formatUpcomingCountdown returns date and relative countdown or Coming soon', () => {
  const dated = makeAnime({
    airingAt: 1795100400, // Nov 19, 2026 15:00 UTC -> Nov 19
    startDate: { year: 2026, month: 11, day: 19 },
  });
  const badge = formatUpcomingCountdown(dated, 1795100400 - (4 * 86400 + 6 * 3600));
  assert.equal(badge.dateLabel, 'Nov 19');
  assert.equal(badge.countdownLabel, 'in 4d 6h');

  const monthOnly = makeAnime({
    airingAt: null,
    year: 2027,
    startDate: { year: 2027, month: 1, day: null },
  });
  assert.deepEqual(formatUpcomingCountdown(monthOnly), {
    dateLabel: 'January 2027',
    countdownLabel: 'Coming soon',
  });
});

test('buildTodaySchedule generates deterministically sized 4-col schedule slots', () => {
  const catalog = [
    makeAnime({ id: 10, routeId: 'blue-box-2', title: 'Blue Box Season 2', episodeCount: 12 }),
    makeAnime({ id: 11, routeId: 'aoashi-2', title: 'Aoashi Season 2', episodeCount: 24 }),
  ];
  const latest: LatestEpisode[] = [
    {
      animeId: 10,
      routeId: 'blue-box-2',
      slug: 'blue-box-2',
      title: 'Blue Box Season 2',
      episode: 6,
      hasSub: true,
      hasDub: true,
      airedAt: '2026-11-13',
      timeAgo: '3h ago',
      thumbnail: '/assets/stills/ep6.webp',
      poster: '/assets/posters/bb.webp',
    },
  ];
  const slots = buildTodaySchedule(catalog, latest, ['/assets/stills/fallback.webp'], 8);
  assert.equal(slots.length, 8);
  assert.equal(slots[0].timeLabel, '8:00 AM');
  assert.equal(slots[0].hasSub, true);
  assert.equal(slots[1].hasDub, true);
  assert.ok(slots[0].thumbnail.startsWith('/assets/'));
});

test('parseAnimeEpQuery extracts valid positive episode numbers from ?ep= query', () => {
  assert.equal(parseAnimeEpQuery('?ep=1'), 1);
  assert.equal(parseAnimeEpQuery('ep=142&foo=bar'), 142);
  assert.equal(parseAnimeEpQuery('?ep=0'), null);
  assert.equal(parseAnimeEpQuery('?other=1'), null);
  assert.equal(parseAnimeEpQuery(''), null);
});
