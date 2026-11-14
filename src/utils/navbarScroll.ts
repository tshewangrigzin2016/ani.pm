export interface NavbarScrollInput {
  scrollTop: number;
  prevScrollTop: number;
  wasHidden: boolean;
  isPinned: boolean;
  hasOpenMenu?: boolean;
}

export interface NavbarScrollResult {
  scrolled: boolean;
  hidden: boolean;
  nextPrevScrollTop: number;
}

const SCROLLED_THRESHOLD = 28;
const TOP_PIN_ZONE = 24;
const HIDE_AFTER_TOP = 64;
const SCROLL_DELTA_THRESHOLD = 6;

export function computeNavbarScrollState({
  scrollTop,
  prevScrollTop,
  wasHidden,
  isPinned,
  hasOpenMenu = false,
}: NavbarScrollInput): NavbarScrollResult {
  const safeTop = Math.max(0, scrollTop);
  const scrolled = safeTop > SCROLLED_THRESHOLD;

  if (isPinned || hasOpenMenu || safeTop <= TOP_PIN_ZONE) {
    return {
      scrolled,
      hidden: false,
      nextPrevScrollTop: safeTop,
    };
  }

  const delta = safeTop - prevScrollTop;

  if (delta > SCROLL_DELTA_THRESHOLD && safeTop > HIDE_AFTER_TOP) {
    return {
      scrolled,
      hidden: true,
      nextPrevScrollTop: safeTop,
    };
  }

  if (delta < -SCROLL_DELTA_THRESHOLD) {
    return {
      scrolled,
      hidden: false,
      nextPrevScrollTop: safeTop,
    };
  }

  return {
    scrolled,
    hidden: wasHidden,
    nextPrevScrollTop: prevScrollTop,
  };
}
