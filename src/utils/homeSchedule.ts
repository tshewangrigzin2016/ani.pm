import type { AnimeTitle, LatestEpisode } from '@/src/types/anime';

export interface UpcomingBadgeInfo {
  dateLabel: string;
  countdownLabel: string;
}

export interface ScheduleSlot {
  anime: AnimeTitle;
  episode: number;
  totalEpisodes: number | null;
  timeLabel: string;
  relativeLabel: string;
  hasSub: boolean;
  hasDub: boolean;
  thumbnail: string;
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SCHEDULE_SLOTS: Array<{ timeLabel: string; relativeLabel: string; dubChance: boolean }> = [
  { timeLabel: '8:00 AM', relativeLabel: 'Coming soon', dubChance: false },
  { timeLabel: '8:00 AM', relativeLabel: 'Coming soon', dubChance: true },
  { timeLabel: '8:30 AM', relativeLabel: 'Coming soon', dubChance: false },
  { timeLabel: '9:00 AM', relativeLabel: 'in 7m', dubChance: false },
  { timeLabel: '9:00 AM', relativeLabel: 'in 7m', dubChance: false },
  { timeLabel: '9:01 AM', relativeLabel: 'in 8m', dubChance: false },
  { timeLabel: '9:30 AM', relativeLabel: 'in 37m', dubChance: false },
  { timeLabel: '10:00 AM', relativeLabel: 'in 1h 7m', dubChance: true },
  { timeLabel: '1:30 PM', relativeLabel: 'in 4h 37m', dubChance: false },
  { timeLabel: '2:00 PM', relativeLabel: 'in 5h 7m', dubChance: false },
  { timeLabel: '2:00 PM', relativeLabel: 'in 5h 7m', dubChance: true },
  { timeLabel: '2:30 PM', relativeLabel: 'in 5h 37m', dubChance: false },
];

function getTimestampSec(anime: AnimeTitle): number | null {
  if (typeof anime.airingAt === 'number' && anime.airingAt > 0) {
    return anime.airingAt;
  }
  const sd = anime.startDate;
  if (sd?.year && sd?.month && sd?.day) {
    return Math.floor(Date.UTC(sd.year, sd.month - 1, sd.day, 12, 0, 0) / 1000);
  }
  return null;
}

export function sortUpcomingAnime(list: AnimeTitle[]): AnimeTitle[] {
  return [...list].sort((a, b) => {
    const tsA = getTimestampSec(a);
    const tsB = getTimestampSec(b);
    if (tsA !== null && tsB !== null) return tsA - tsB;
    if (tsA !== null) return -1;
    if (tsB !== null) return 1;
    const yA = a.startDate?.year ?? a.year ?? 2099;
    const yB = b.startDate?.year ?? b.year ?? 2099;
    if (yA !== yB) return yA - yB;
    const mA = a.startDate?.month ?? 99;
    const mB = b.startDate?.month ?? 99;
    if (mA !== mB) return mA - mB;
    return a.title.localeCompare(b.title);
  });
}

export function formatUpcomingCountdown(
  anime: AnimeTitle,
  referenceEpochSec = 1794730000
): UpcomingBadgeInfo {
  const ts = getTimestampSec(anime);
  const sd = anime.startDate;

  if (ts !== null) {
    const dt = new Date(ts * 1000);
    const month = MONTH_SHORT[dt.getUTCMonth()] ?? 'Jan';
    const day = dt.getUTCDate();
    const dateLabel = `${month} ${day}`;

    const diffSec = Math.max(0, ts - referenceEpochSec);
    const totalHours = Math.max(1, Math.floor(diffSec / 3600));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let countdownLabel = 'Coming soon';
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remDays = days % 30;
      countdownLabel = remDays > 0 ? `in ${months}mo ${remDays}d` : `in ${months}mo`;
    } else if (days >= 1) {
      countdownLabel = hours > 0 ? `in ${days}d ${hours}h` : `in ${days}d`;
    } else {
      countdownLabel = `in ${totalHours}h`;
    }

    return { dateLabel, countdownLabel };
  }

  if (sd?.year && sd?.month) {
    const monthName = MONTH_LONG[sd.month - 1] ?? 'TBA';
    return {
      dateLabel: `${monthName} ${sd.year}`,
      countdownLabel: 'Coming soon',
    };
  }

  if (anime.year) {
    return {
      dateLabel: String(anime.year),
      countdownLabel: 'Coming soon',
    };
  }

  return {
    dateLabel: 'TBA',
    countdownLabel: 'Coming soon',
  };
}

export function buildTodaySchedule(
  catalog: AnimeTitle[],
  latestEpisodes: LatestEpisode[],
  stillsPool: readonly string[],
  limit = 12
): ScheduleSlot[] {
  const airing = catalog.filter(
    (a) =>
      a.status.toLowerCase().includes('air') ||
      a.status.toLowerCase().includes('releas')
  );
  const pool: AnimeTitle[] = [];
  const seenIds = new Set<string>();

  for (const ep of latestEpisodes) {
    const match = catalog.find((a) => a.routeId === ep.routeId);
    if (match && !seenIds.has(match.routeId)) {
      seenIds.add(match.routeId);
      pool.push(match);
    }
  }
  for (const item of airing) {
    if (!seenIds.has(item.routeId)) {
      seenIds.add(item.routeId);
      pool.push(item);
    }
  }
  for (const item of catalog) {
    if (pool.length >= limit) break;
    if (!seenIds.has(item.routeId)) {
      seenIds.add(item.routeId);
      pool.push(item);
    }
  }

  const effectivePool = pool.length > 0 ? pool : catalog;
  const slots: ScheduleSlot[] = [];

  for (let i = 0; i < limit; i++) {
    const template = SCHEDULE_SLOTS[i % SCHEDULE_SLOTS.length];
    const sourceAnime = effectivePool[i % effectivePool.length];
    if (!sourceAnime) continue;

    const latestMatch = latestEpisodes.find((ep) => ep.routeId === sourceAnime.routeId);
    const nextEp = latestMatch ? latestMatch.episode : Math.max(1, Math.min(sourceAnime.episodeCount || 12, 6 + (i % 7)));
    const totalEp = sourceAnime.episodeCount > 0 && sourceAnime.episodeCount <= 100 ? sourceAnime.episodeCount : null;
    const stillThumb =
      latestMatch?.thumbnail ??
      sourceAnime.banner ??
      stillsPool[(sourceAnime.id + i) % Math.max(1, stillsPool.length)] ??
      sourceAnime.poster;

    slots.push({
      anime: sourceAnime,
      episode: nextEp,
      totalEpisodes: totalEp,
      timeLabel: template.timeLabel,
      relativeLabel: template.relativeLabel,
      hasSub: !template.dubChance,
      hasDub: template.dubChance,
      thumbnail: stillThumb,
    });
  }

  return slots;
}

export function parseAnimeEpQuery(search: string): number | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const raw = params.get('ep');
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}
