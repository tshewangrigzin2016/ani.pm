import type { AnimeTitle, BrowseFilters, EpisodeItem, LatestEpisode } from '@/src/types/anime';

export function filterBrowseCatalog(
  catalog: readonly AnimeTitle[],
  filters: BrowseFilters,
  includeAdult = false
): AnimeTitle[] {
  const q = filters.q.trim().toLowerCase();
  const minScore = filters.minScore ? Number(filters.minScore) : 0;
  const minEpisodes = filters.minEpisodes ? Number(filters.minEpisodes) : 0;

  const filtered = catalog.filter((item) => {
    if (!includeAdult && (item.isAdult || item.genres.includes('Hentai'))) {
      return false;
    }

    if (q) {
      const hay = [
        item.title,
        item.native ?? '',
        ...(item.providerTitles ?? []),
        ...item.genres,
        ...(item.tags ?? []),
        ...item.studios,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (filters.genres.length > 0) {
      const itemGenres = new Set(item.genres.map((g) => g.toLowerCase()));
      for (const g of filters.genres) {
        if (!itemGenres.has(g.toLowerCase())) return false;
      }
    }

    if (filters.tags.length > 0) {
      const itemTags = new Set((item.tags ?? []).map((t) => t.toLowerCase()));
      for (const t of filters.tags) {
        if (!itemTags.has(t.toLowerCase())) return false;
      }
    }

    if (filters.studio) {
      const hasStudio = item.studios.some(
        (s) => s.toLowerCase() === filters.studio.toLowerCase()
      );
      if (!hasStudio) return false;
    }

    if (filters.year && String(item.year ?? '') !== filters.year) {
      return false;
    }

    if (
      filters.season &&
      (item.season ?? '').toLowerCase() !== filters.season.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.format &&
      item.type.toLowerCase() !== filters.format.toLowerCase()
    ) {
      return false;
    }

    if (filters.status) {
      const s = item.status.toLowerCase();
      const target = filters.status.toLowerCase();
      if (target === 'airing' && !s.includes('air') && !s.includes('releas')) return false;
      if (target === 'finished' && !s.includes('finish')) return false;
      if (target === 'upcoming' && !s.includes('upcoming') && !s.includes('not yet')) return false;
    }

    if (filters.language === 'sub' && item.subCount <= 0) return false;
    if (filters.language === 'dub' && item.dubCount <= 0) return false;

    if (minScore > 0 && (item.score ?? 0) < minScore) return false;
    if (minEpisodes > 0 && item.episodeCount < minEpisodes) return false;

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case 'score':
      case 'mal':
        return (b.score ?? 0) - (a.score ?? 0);
      case 'newest':
        return (b.year ?? 0) - (a.year ?? 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'episodes':
        return b.episodeCount - a.episodeCount;
      case 'sub':
        return b.subCount - a.subCount;
      case 'dub':
        return b.dubCount - a.dubCount;
      case 'popular':
        return (a.rank ?? 99999) - (b.rank ?? 99999);
      case 'recommended':
      case 'trending':
      default:
        return (b.score ?? 0) * 10 + (b.episodeCount > 0 ? 5 : 0) - ((a.score ?? 0) * 10 + (a.episodeCount > 0 ? 5 : 0));
    }
  });

  return sorted;
}

export function searchDescribeCatalog(
  catalog: readonly AnimeTitle[],
  query: string
): AnimeTitle[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
  if (tokens.length === 0) return [];

  const scored = catalog
    .map((item) => {
      const corpus = [
        item.title,
        item.synopsis,
        ...item.genres,
        ...(item.tags ?? []),
        ...item.studios,
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (item.title.toLowerCase().includes(t)) score += 6;
        if (item.genres.some((g) => g.toLowerCase().includes(t))) score += 4;
        if ((item.tags ?? []).some((tag) => tag.toLowerCase().includes(t))) score += 4;
        if (corpus.includes(t)) score += 2;
      }
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.item);
}

export function filterLatestEpisodes(
  episodes: readonly LatestEpisode[],
  mode: 'all' | 'sub' | 'dub',
  query: string
): LatestEpisode[] {
  const q = query.trim().toLowerCase();
  return episodes.filter((ep) => {
    if (mode === 'sub' && !ep.hasSub) return false;
    if (mode === 'dub' && !ep.hasDub) return false;
    if (q) {
      const hay = `${ep.title} ${ep.episodeTitle ?? ''} episode ${ep.episode}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface EpisodeFilterOpts {
  arc: string;
  query: string;
  sortOrder: 'oldest' | 'newest';
  hideFiller: boolean;
  audioFilter: 'all' | 'sub' | 'dub';
}

export function filterEpisodeList(
  episodes: readonly EpisodeItem[],
  opts: EpisodeFilterOpts
): EpisodeItem[] {
  const q = opts.query.trim().toLowerCase();
  const list = episodes.filter((ep) => {
    if (opts.arc !== 'all' && ep.arc !== opts.arc) return false;
    if (opts.hideFiller && ep.kind === 'filler') return false;
    if (opts.audioFilter === 'sub' && !ep.hasSub) return false;
    if (opts.audioFilter === 'dub' && !ep.hasDub) return false;
    if (q) {
      const hay = `episode ${ep.number} ${ep.title} ${ep.arc}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (opts.sortOrder === 'newest') {
    return [...list].sort((a, b) => b.number - a.number);
  }
  return list;
}
