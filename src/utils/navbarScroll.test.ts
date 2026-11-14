import test from 'node:test';
import assert from 'node:assert/strict';
import { computeNavbarScrollState } from './navbarScroll';

test('navbar stays visible near top and hides when scrolling down past threshold', () => {
  const atTop = computeNavbarScrollState({
    scrollTop: 10,
    prevScrollTop: 0,
    wasHidden: false,
    isPinned: false,
  });
  assert.equal(atTop.scrolled, false);
  assert.equal(atTop.hidden, false);

  const pastThreshold = computeNavbarScrollState({
    scrollTop: 140,
    prevScrollTop: 10,
    wasHidden: false,
    isPinned: false,
  });
  assert.equal(pastThreshold.scrolled, true);
  assert.equal(pastThreshold.hidden, true);
  assert.equal(pastThreshold.nextPrevScrollTop, 140);
});

test('navbar slides back down when scrolling up and accumulates small deltas', () => {
  const tinyJitter = computeNavbarScrollState({
    scrollTop: 144,
    prevScrollTop: 140,
    wasHidden: true,
    isPinned: false,
  });
  assert.equal(tinyJitter.hidden, true);
  assert.equal(tinyJitter.nextPrevScrollTop, 140);

  const smallUp1 = computeNavbarScrollState({
    scrollTop: 136,
    prevScrollTop: 140,
    wasHidden: true,
    isPinned: false,
  });
  assert.equal(smallUp1.hidden, true);
  assert.equal(smallUp1.nextPrevScrollTop, 140);

  const smallUp2 = computeNavbarScrollState({
    scrollTop: 130,
    prevScrollTop: smallUp1.nextPrevScrollTop,
    wasHidden: smallUp1.hidden,
    isPinned: false,
  });
  assert.equal(smallUp2.hidden, false);
  assert.equal(smallUp2.nextPrevScrollTop, 130);
});

test('navbar stays visible when pinned or when a menu is open', () => {
  const pinned = computeNavbarScrollState({
    scrollTop: 400,
    prevScrollTop: 100,
    wasHidden: false,
    isPinned: true,
  });
  assert.equal(pinned.hidden, false);

  const menuOpen = computeNavbarScrollState({
    scrollTop: 400,
    prevScrollTop: 100,
    wasHidden: false,
    isPinned: false,
    hasOpenMenu: true,
  });
  assert.equal(menuOpen.hidden, false);
});
