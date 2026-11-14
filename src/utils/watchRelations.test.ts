import test from 'node:test';
import assert from 'node:assert/strict';
import type { AnimeTitle, CommentItem } from '@/src/types/anime';
import {
  buildWatchComments,
  getRelatedAnimeForWatch,
  getWatchOrderForAnime,
} from './watchRelations';

const SAMPLE_CATALOG: AnimeTitle[] = [
  {
    id: 1,
    slug: 'attack-on-titan',
    routeId: 'attack-on-titan-1631-lgjmct',
    title: 'Attack on Titan',
    poster: '/p1.webp',
    banner: null,
    year: 2013,
    score: 8.6,
    rating: 'R',
    duration: 24,
    status: 'FINISHED',
    type: 'TV',
    genres: ['Action', 'Drama', 'Fantasy'],
    studios: ['WIT STUDIO'],
    episodeCount: 25,
    subCount: 25,
    dubCount: 25,
    synopsis: 'Humanity fights Titans.',
  },
  {
    id: 2,
    slug: 'attack-on-titan-season-2',
    routeId: 'attack-on-titan-season-2-1385',
    title: 'Attack on Titan Season 2',
    poster: '/p2.webp',
    banner: null,
    year: 2017,
    score: 8.6,
    rating: 'R',
    duration: 24,
    status: 'FINISHED',
    type: 'TV',
    genres: ['Action', 'Drama'],
    studios: ['WIT STUDIO'],
    episodeCount: 12,
    subCount: 12,
    dubCount: 12,
    synopsis: 'Season 2.',
  },
  {
    id: 3,
    slug: 'kabaneri',
    routeId: 'kabaneri-22',
    title: 'Kabaneri of the Iron Fortress',
    poster: '/p3.webp',
    banner: null,
    year: 2016,
    score: 7.4,
    rating: 'R',
    duration: 24,
    status: 'FINISHED',
    type: 'TV',
    genres: ['Action', 'Drama', 'Fantasy'],
    studios: ['WIT STUDIO'],
    episodeCount: 12,
    subCount: 12,
    dubCount: 12,
    synopsis: 'Steampunk survival.',
  },
];

test('getWatchOrderForAnime returns franchise sequence and marks current anime', () => {
  const order = getWatchOrderForAnime(SAMPLE_CATALOG[0], SAMPLE_CATALOG);
  assert.ok(order.length >= 2);
  const current = order.find((item) => item.isCurrent);
  assert.ok(current);
  assert.equal(current.badgeTopLeft, "You're here");
  const sequel = order.find((item) => item.anime.routeId === 'attack-on-titan-season-2-1385');
  assert.ok(sequel);
  assert.equal(sequel.badgeTopLeft, '2');

  const standaloneOrder = getWatchOrderForAnime(SAMPLE_CATALOG[2], SAMPLE_CATALOG);
  assert.equal(standaloneOrder.length, 1);
  assert.equal(standaloneOrder[0].isCurrent, true);
});

test('getRelatedAnimeForWatch ranks studio and genre overlaps highest', () => {
  const exclude = new Set(['attack-on-titan-season-2-1385']);
  const related = getRelatedAnimeForWatch(SAMPLE_CATALOG[0], SAMPLE_CATALOG, exclude, 4);
  assert.equal(related.length, 1);
  assert.equal(related[0].routeId, 'kabaneri-22');
});

test('buildWatchComments creates pinned admin thread, spoiler item, and preserves feed extras', () => {
  const feed: CommentItem[] = [
    {
      id: 'f1',
      username: 'Tester',
      avatar: null,
      timeAgo: '1h ago',
      episode: 2,
      body: 'Great episode!',
      animeTitle: 'Attack on Titan',
      routeId: 'attack-on-titan-1631-lgjmct',
      poster: '/p1.webp',
      likes: 3,
    },
  ];
  const comments = buildWatchComments(SAMPLE_CATALOG[0], 2, feed, ['/still1.webp']);
  assert.ok(comments.some((c) => c.isPinned && c.isAdmin));
  assert.ok(comments.some((c) => c.isSpoiler));
  assert.ok(comments.some((c) => c.username === 'Tester'));
});
